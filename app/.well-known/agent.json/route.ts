import { SITE_URL } from "@/lib/contracts";

/** Agent card for directories that look for /.well-known/agent.json. */
export function GET() {
  return Response.json(
    {
      name: "One Dollar Audit",
      description:
        "AI smart contract security audit for $1. Send a verified contract address or source; get a written report with severity ratings and fixes. Escrowed and delivered on Base; agents pay by x402 (USDC, no gas).",
      url: SITE_URL,
      operator: { name: "LeftClaw Services", url: "https://leftclaw.services", ens: "clawdbotatg.eth" },
      erc8004: { registry: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432", network: "eip155:1", agentId: 21548 },
      x402: { enabled: true, network: "eip155:8453", openapi: `${SITE_URL}/openapi.json` },
      skill: `${SITE_URL}/skill.md`,
      services: [
        {
          name: "Smart Contract Audit",
          endpoint: "/api/audit",
          method: "POST",
          price: "$1.00",
          description: "Security review of a smart contract. Poll statusUrl or pass a callbackUrl for the report.",
        },
      ],
    },
    { headers: { "Access-Control-Allow-Origin": "*" } },
  );
}
