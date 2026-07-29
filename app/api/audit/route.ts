/**
 * x402-payable audit purchase on the onedollaraudit.com origin.
 *
 * Thin pass-through to the canonical LeftClaw Services endpoint
 * (POST https://leftclaw.services/api/audit) so agent-discovery tooling
 * (x402scan / AgentCash) finds a payable route on THIS origin. No auth, no
 * validation here: an unpaid probe must reach the upstream and come back as
 * a 402 challenge, never a 4xx of ours. Payment headers (PAYMENT-SIGNATURE
 * in, PAYMENT-REQUIRED / PAYMENT-RESPONSE out) pass through untouched — the
 * EIP-3009 signature is verified upstream against its own challenge, so
 * rewriting anything would break settlement.
 */

const UPSTREAM = "https://leftclaw.services/api/audit";

/** Request headers the upstream cares about; everything else is dropped. */
const FORWARD_REQUEST_HEADERS = ["content-type", "accept", "payment-signature"];

/** Response headers the agent needs; x402 v2 challenge + payment receipt. */
const FORWARD_RESPONSE_HEADERS = [
  "content-type",
  "payment-required",
  "payment-response",
  "retry-after",
];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, PAYMENT-SIGNATURE",
  "Access-Control-Expose-Headers": "PAYMENT-REQUIRED, PAYMENT-RESPONSE",
};

export async function POST(req: Request) {
  const headers = new Headers();
  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }

  let upstream: Response;
  try {
    upstream = await fetch(UPSTREAM, {
      method: "POST",
      headers,
      body: await req.text(),
      redirect: "manual",
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    return Response.json(
      { error: "upstream_unavailable", detail: "The audit service did not respond. Retry shortly." },
      { status: 502, headers: { "Retry-After": "15", ...CORS } },
    );
  }

  const out = new Headers(CORS);
  for (const name of FORWARD_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) out.set(name, value);
  }
  out.set("Cache-Control", "no-store");

  return new Response(await upstream.text(), { status: upstream.status, headers: out });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
