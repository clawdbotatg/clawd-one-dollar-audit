import { SITE_URL } from "@/lib/contracts";

/**
 * OpenAPI discovery document for agent-payment registries (x402scan /
 * AgentCash). Shape follows agentcash.dev/merchants.md "Branch E": every
 * payable operation carries x-payment-info (display price in USD units) +
 * a 402 response + full request/response schemas; free routes carry no
 * x-payment-info. Runtime truth: the 402 challenge on POST /api/audit
 * quotes accepts[].amount in USDC atomic units ("1000000" = $1.00).
 */

const jobStatusSchema = {
  type: "object",
  description: "Live job state, read from the LeftClawServicesV2 contract on Base.",
  properties: {
    jobId: { type: "integer" },
    status: {
      type: "string",
      enum: ["pending", "in_progress", "complete", "declined", "cancelled", "reassigned"],
    },
    statusLabel: { type: "string" },
    stage: {
      type: ["string", "null"],
      description: "Human-readable progress stage while the audit runs.",
    },
    description: { type: "string", description: "The audit request as posted on-chain." },
    createdAt: { type: ["string", "null"], format: "date-time" },
    startedAt: { type: ["string", "null"], format: "date-time" },
    completedAt: { type: ["string", "null"], format: "date-time" },
    report: { type: ["string", "null"], description: "Raw report CID/URL once complete." },
    reportUrl: {
      type: ["string", "null"],
      description: "Resolvable URL of the delivered report (IPFS gateway) once status is 'complete'.",
    },
    reportHtmlUrl: {
      type: ["string", "null"],
      description: "Formatted HTML rendering of the report, when available.",
    },
    estimatedCompletionSeconds: {
      type: ["integer", "null"],
      description: "Rough ETA; absent once the job is done, null past the typical hour.",
    },
    pollIntervalSeconds: { type: "integer", description: "Suggested polling interval." },
    trackUrl: { type: "string", description: "Human tracking page for this job." },
    contract: {
      type: "object",
      properties: { address: { type: "string" }, chainId: { type: "integer" } },
    },
  },
  required: ["jobId", "status", "description", "trackUrl"],
};

const openapi = {
  openapi: "3.1.0",
  info: {
    title: "One Dollar Audit",
    version: "1.0.0",
    description:
      "AI smart-contract security audits for $1, paid per request with x402 (USDC on Base, gasless EIP-3009 — no account, no API key). Submit a verified contract address or Solidity source; receive a written security review with severity-rated findings and fix recommendations, delivered on IPFS.",
    "x-guidance":
      "To buy an audit: POST /api/audit with JSON body {\"description\": \"<verified contract address (chain + short context) or pasted Solidity source>\"}. An unpaid call returns HTTP 402 with an x402 v2 challenge in the base64 PAYMENT-REQUIRED response header — sign the quoted $1.00 USDC EIP-3009 authorization (amount \"1000000\" atomic units, Base / eip155:8453, gasless) and retry with the PAYMENT-SIGNATURE request header; @x402/fetch automates the whole exchange. The 200 response contains a jobId — persist it, then poll GET /api/jobs/{jobId} (free, no auth) until status is \"complete\" and fetch reportUrl; or include an optional \"callbackUrl\" in the POST body to have {jobId, status, reportUrl, statusUrl} POSTed to you when the audit finishes. Full agent instructions: https://onedollaraudit.com/skill.md",
    contact: {
      name: "One Dollar Audit",
      email: "clawd@buidlguidl.com",
      url: SITE_URL,
    },
  },
  servers: [{ url: SITE_URL }],
  paths: {
    "/api/audit": {
      post: {
        operationId: "commissionAudit",
        summary: "Commission a $1 smart-contract security audit (x402)",
        description:
          "Creates an audit job on-chain. Payment is x402 v2: an unpaid request returns a 402 challenge (PAYMENT-REQUIRED header); retry with a signed PAYMENT-SIGNATURE header. Price is $1.00 in USDC on Base, settled gaslessly via EIP-3009. One contract (or one tight system) per engagement; the description is public on-chain, so no secrets.",
        "x-payment-info": {
          price: { mode: "fixed", currency: "USD", amount: "1.000000" },
          protocols: [{ x402: {} }],
        },
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  description: {
                    type: "string",
                    minLength: 10,
                    description:
                      "What to audit: a contract address verified on Basescan/Etherscan (include the chain and a line of context) or pasted Solidity source code.",
                  },
                  context: {
                    type: "string",
                    description: "Optional additional context or focus areas (e.g. \"focus on reentrancy\").",
                  },
                  callbackUrl: {
                    type: "string",
                    format: "uri",
                    description:
                      "Optional https webhook — when the audit finishes, {jobId, status, reportUrl, statusUrl} is POSTed to it. Polling GET /api/jobs/{jobId} works regardless.",
                  },
                },
                required: ["description"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Payment settled and audit job created on-chain.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    jobId: { type: "integer", description: "Persist this — it is the only handle on the job." },
                    jobUrl: { type: "string", format: "uri", description: "Human tracking page." },
                    statusUrl: {
                      type: "string",
                      format: "uri",
                      description: "JSON status endpoint (GET /api/jobs/{jobId}) to poll until complete.",
                    },
                    estimatedCompletionSeconds: { type: "integer" },
                    message: { type: "string" },
                    callbackRegistered: {
                      type: "boolean",
                      description: "Present when a callbackUrl was accepted.",
                    },
                  },
                  required: ["jobId"],
                },
              },
            },
          },
          "402": {
            description:
              "Payment Required — x402 v2 challenge. The base64 PAYMENT-REQUIRED response header quotes accepts[] with amount \"1000000\" (USDC atomic units, 6 decimals = $1.00) on Base (eip155:8453). Sign the EIP-3009 TransferWithAuthorization and retry with the PAYMENT-SIGNATURE request header.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { error: { type: "string" }, detail: { type: "string" } },
                },
              },
            },
          },
          "400": {
            description: "Invalid input (e.g. description shorter than 10 characters) after payment checks.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { error: { type: "string" }, detail: { type: "string" } },
                },
              },
            },
          },
        },
      },
    },
    "/api/jobs/{jobId}": {
      get: {
        operationId: "getAuditJob",
        summary: "Poll audit job status / retrieve the report (free, no auth)",
        security: [],
        description:
          "Reads the job live from the on-chain contract — works from any machine, any time, no session. When status is \"complete\", reportUrl links the delivered report. A 404 right after paying means the block hasn't landed; honor Retry-After and retry.",
        parameters: [
          {
            name: "jobId",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 0 },
            description: "The jobId returned by POST /api/audit.",
          },
        ],
        responses: {
          "200": {
            description: "Current job state.",
            content: { "application/json": { schema: jobStatusSchema } },
          },
          "404": {
            description:
              "No job under this id yet — if just paid, the transaction may not have landed; retry after Retry-After seconds.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                    detail: { type: "string" },
                    trackUrl: { type: "string" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Job id is not a positive integer.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { error: { type: "string" }, detail: { type: "string" } },
                },
              },
            },
          },
        },
      },
    },
  },
};

export async function GET(req: Request) {
  // Serve the document with servers[] pointing at the origin it was fetched
  // from, so discovery validators probing a dev server hit the dev server's
  // own payable route instead of production.
  const origin = new URL(req.url).origin;
  const doc = origin.startsWith("http://localhost") || origin.startsWith("http://127.")
    ? { ...openapi, servers: [{ url: origin }] }
    : openapi;

  return Response.json(doc, {
    headers: {
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
