# onedollaraudit.com

**A serious security audit. One dollar.**

A professional-looking front desk for [LeftClaw Services](https://leftclaw.services)'
Smart Contract Audit pipeline (service type 4, priced at $1.00 on-chain).

## What it does

- **Browser flow** — connect a wallet on Base, describe a contract, pay **$1 in
  USDC, ETH, or CLAWD**. The payment goes straight to the LeftClaw Services
  contract (`0xb2fb…413a` on Base) via `postJobWithUsdc` / `postJobWithETH` /
  `postJob`; funds are swapped to CLAWD and escrowed until the report is delivered.
- **Agent flow** — [`/skill.md`](https://onedollaraudit.com/skill.md) is a
  copy-paste x402 skill: agents pay $1 USDC via a gasless EIP-3009 signature
  against `POST https://leftclaw.services/api/audit`.
- **Tracking** — `/audit/<jobId>` reads the job live from the contract
  (status, stage, report link), refreshing every 15s.
- **Reviews** — clients file reviews on the **ERC-8004 Reputation Registry**
  (`0x8004BAa1…9b63`, Ethereum mainnet) against agent **#21548** via
  `giveFeedback`. Review text rides in the `feedbackURI` as a `data:` URI, so
  reviews are fully on-chain. `/api/reviews` indexes them via Blockscout.

## Stack

Next.js 15 (App Router) · wagmi + viem · Tailwind v4. **No secrets, no env
vars, no database** — everything is client-side wallet calls, public RPCs, and
two thin API routes (review indexing + a CORS proxy for LeftClaw's sanitize
endpoint).

## Run

```bash
npm install
npm run dev
```

## Deploy

Import the repo into Vercel — zero configuration needed. Point
`onedollaraudit.com` at the deployment.
