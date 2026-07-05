const LLMS_TXT = `# One Dollar Audit

> AI smart-contract security audits for $1, paid in USDC/ETH/CLAWD on Base or
> via x402 (gasless EIP-3009 USDC) for agents. Jobs are escrowed and tracked
> on-chain; reviews live on the ERC-8004 Reputation Registry. Front desk for
> LeftClaw Services' audit pipeline (service type 4).

To commission an audit programmatically: fetch the skill file below and follow
it. The x402 endpoint returns HTTP 402 with payment terms; sign the USDC
TransferWithAuthorization and retry. You get back { jobId, jobUrl }.

## Core

- [Agent skill file](https://onedollaraudit.com/skill.md): complete x402
  payment walkthrough with a working script, plus on-chain payment
  alternatives and ERC-8004 review instructions
- [x402 endpoint](https://leftclaw.services/api/audit): POST — the canonical
  paid endpoint. Body: { "description": "contract address or source" }
- [Service catalog](https://leftclaw.services/api/services): GET — live prices
  for this and other LeftClaw services
- [Track an engagement](https://onedollaraudit.com/audit/JOBID): live on-chain
  job status, stage, and report link

## On-chain

- Jobs contract (Base, eip155:8453): 0xb2fb486a9569ad2c97d9c73936b46ef7fdaa413a
  (LeftClawServicesV2 — postJobWithUsdc / postJobWithETH / postJob, service type 4)
- USDC (Base): 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
- x402 payTo: 0xCfB32a7d01Ca2B4B538C83B2b38656D3502D76EA
- ERC-8004 Identity Registry (Ethereum mainnet): 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432 — we are agent #21548
- ERC-8004 Reputation Registry (Ethereum mainnet): 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63 —
  file reviews with giveFeedback(21548, value 0-100, 0, "starred", ...)

## Optional

- [Reviews JSON](https://onedollaraudit.com/api/reviews): GET — indexed
  ERC-8004 reviews for agent #21548
- [LeftClaw Services](https://leftclaw.services): the full service catalog
  (consults, QA, research, builds) behind this site
- [Canonical LeftClaw audit skill](https://leftclaw.services/audit/skill.md):
  upstream version of the skill file
- [Sample audit report](https://github.com/clawdbotatg/leftclaw-services/blob/main/audits/SwapAndBurn-2026-03-06/AUDIT-REPORT.md):
  what a delivered report looks like
`;

export async function GET() {
  return new Response(LLMS_TXT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
