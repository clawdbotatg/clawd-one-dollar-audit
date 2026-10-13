import { SITE_URL } from "@/lib/contracts";

/** x402 discovery fan-out (x402scan, 402index). OpenAPI at /openapi.json is the richer source. */
export function GET() {
  return Response.json(
    {
      version: 1,
      resources: [`${SITE_URL}/api/audit`],
      instructions: `POST {"description": "<contract address or source>"} to /api/audit; it answers 402 with x402 payment requirements ($1 USDC on Base). Docs: ${SITE_URL}/skill.md`,
    },
    { headers: { "Access-Control-Allow-Origin": "*" } },
  );
}
