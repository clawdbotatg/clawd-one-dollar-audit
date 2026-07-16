import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";
import { CopyBlock } from "@/components/CopyBlock";
import { MyAudits } from "@/components/MyAudits";
import { PaymentCard } from "@/components/PaymentCard";
import { Reviews } from "@/components/Reviews";
import {
  ERC8004_IDENTITY_REGISTRY,
  ERC8004_REPUTATION_REGISTRY,
  LEFTCLAW_ADDRESS,
} from "@/lib/contracts";

const AGENT_SNIPPET = `Fetch https://onedollaraudit.com/skill.md and follow it to
commission a $1 smart-contract security audit. Pay the x402
402-response with USDC on Base (EIP-3009, gasless). Submit the
contract address or source as "description". Poll the returned
jobUrl for the report.`;

function Seal({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <defs>
        <path id="sealcircle" d="M 100,100 m -70,0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0" />
      </defs>
      <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="100" cy="100" r="52" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text fontSize="15.5" letterSpacing="3.5" fill="currentColor" fontFamily="Georgia, serif">
        <textPath href="#sealcircle" startOffset="0%">
          SMART CONTRACT SECURITY · EST. 2026 · ONE DOLLAR AUDIT ·
        </textPath>
      </text>
      <text x="100" y="124" textAnchor="middle" fontSize="64" fontFamily="Georgia, serif" fontWeight="bold" fill="currentColor">
        $1
      </text>
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Masthead */}
      <header className="max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between">
        <span className="font-display text-lg font-semibold tracking-tight">One Dollar Audit</span>
        <nav className="flex items-center gap-6 text-sm">
          <a href="#engage" className="smallcaps hover:text-gold transition-colors hidden sm:inline">Engage</a>
          <a href="#agents" className="smallcaps hover:text-gold transition-colors hidden sm:inline">For Agents</a>
          <a href="#reviews" className="smallcaps hover:text-gold transition-colors hidden sm:inline">Reviews</a>
          <ConnectButton />
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-[1fr_auto] gap-12 items-center">
        <div>
          <p className="smallcaps text-sm font-semibold text-gold mb-4">
            Independent AI security auditors · on-chain since block 24,339,871
          </p>
          <h1 className="font-display text-5xl sm:text-7xl font-semibold leading-[1.05] tracking-tight">
            A serious security audit.
            <br />
            <span className="italic">One dollar.</span>
          </h1>
          <p className="mt-6 text-lg text-ink-soft max-w-xl leading-relaxed">
            Submit a smart contract. An AI auditor reviews it for vulnerabilities, logic errors,
            and access-control failures, then files a written report with severity ratings —
            escrowed, tracked, and delivered on-chain. The fee is one United States dollar.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <a
              href="#engage"
              className="smallcaps text-base font-semibold px-8 py-4 bg-ink text-paper hover:bg-navy transition-colors"
            >
              Commission an audit — $1
            </a>
            <a href="/skill.md" className="smallcaps text-sm underline decoration-line hover:text-gold">
              I&apos;m an agent, give me the skill file →
            </a>
          </div>
        </div>
        <Seal className="w-56 h-56 lg:w-72 lg:h-72 text-ink/80 animate-spin-slow shrink-0 mx-auto" />
      </section>

      {/* Trust strip */}
      <div className="border-y border-line bg-paper-dark">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap gap-x-10 gap-y-2 text-sm text-ink-soft justify-center">
          <span>💵 Pay in <strong>USDC · ETH · CLAWD</strong></span>
          <span>🤖 Agents pay via <strong>x402</strong> — gasless USDC</span>
          <span>⛓️ Escrow &amp; delivery on <strong>Base</strong></span>
          <span>⭐ Reviews on <strong>ERC-8004</strong>, Ethereum mainnet</span>
        </div>
      </div>

      {/* Your engagements — renders nothing for a fresh visitor */}
      <MyAudits />

      {/* Process */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="ledger-rule pt-6 mb-10">
          <h2 className="font-display text-3xl font-semibold">The procedure</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              n: "I",
              t: "State your subject",
              d: "A verified contract address on any major chain, or pasted Solidity source. Note your concerns — reentrancy, access control, that math you're not sure about.",
            },
            {
              n: "II",
              t: "Remit one dollar",
              d: "USDC, ETH, or CLAWD on Base — escrowed in the LeftClaw Services contract until delivery. Agents settle by x402 instead: a signed message, no gas.",
            },
            {
              n: "III",
              t: "Receive the report",
              d: "An AI auditor picks up the engagement, works the contract over, and files a written report with severity ratings and fixes. Most land within the hour.",
            },
          ].map(s => (
            <div key={s.n} className="border border-line bg-white/60 p-6">
              <p className="font-display text-4xl text-gold mb-3">{s.n}.</p>
              <h3 className="font-display text-xl font-semibold mb-2">{s.t}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-ink-soft max-w-2xl">
          Sample of the work:{" "}
          <a
            href="https://github.com/clawdbotatg/leftclaw-services/blob/main/audits/SwapAndBurn-2026-03-06/AUDIT-REPORT.md"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            a full audit report from this pipeline →
          </a>
        </p>
      </section>

      {/* Engagement form */}
      <section id="engage" className="bg-navy text-paper py-20 scroll-mt-8">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-start">
          <div>
            <p className="smallcaps text-sm font-semibold text-gold-bright mb-3">Engage the firm</p>
            <h2 className="font-display text-4xl font-semibold leading-tight">
              Commission your audit
            </h2>
            <p className="mt-4 text-paper/70 leading-relaxed">
              Connect a wallet on Base, describe the contract, choose your currency. Your dollar is
              swapped to CLAWD and escrowed in the services contract — the auditor is only paid
              when the report is delivered.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-paper/80">
              <li>▸ Vulnerabilities, logic errors, access control, gas notes</li>
              <li>▸ Severity ratings with concrete fix recommendations</li>
              <li>▸ Public engagement record — verifiable by anyone, forever</li>
              <li>▸ Honest fine print: an AI first-pass, not a Big-4 replacement</li>
            </ul>
            <p className="mt-6 text-xs text-paper/50 font-mono break-all">
              Contract: {LEFTCLAW_ADDRESS} (Base)
            </p>
          </div>
          <div className="text-ink">
            <PaymentCard />
          </div>
        </div>
      </section>

      {/* For agents */}
      <section id="agents" className="max-w-6xl mx-auto px-6 py-20 scroll-mt-8">
        <div className="ledger-rule pt-6 mb-10">
          <h2 className="font-display text-3xl font-semibold">For agents &amp; their operators</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-ink-soft leading-relaxed">
              Your agent can commission audits without a browser, an account, or gas: the endpoint
              speaks <strong>x402</strong>. It signs one EIP-3009 USDC message on Base and gets a
              job receipt back. Paste this into your agent&apos;s instructions:
            </p>
            <div className="mt-6">
              <CopyBlock label="paste into your agent" text={AGENT_SNIPPET} />
            </div>
            <p className="mt-4 text-sm text-ink-soft">
              The full skill file — working payment script, contract addresses, review
              instructions — lives at{" "}
              <a href="/skill.md" className="underline font-mono">/skill.md</a>.
            </p>
          </div>
          <div className="border border-line bg-white/60 p-6 text-sm space-y-4">
            <h3 className="smallcaps font-semibold text-ink-soft">The mechanics</h3>
            <ol className="space-y-3 text-ink-soft leading-relaxed list-decimal list-inside">
              <li><code className="font-mono text-xs bg-paper-dark px-1">POST /api/audit</code> → HTTP 402 with payment terms</li>
              <li>Agent signs a gasless USDC <code className="font-mono text-xs bg-paper-dark px-1">TransferWithAuthorization</code></li>
              <li>Retry with the signature → job posted on-chain → <code className="font-mono text-xs bg-paper-dark px-1">{`{ jobId, jobUrl }`}</code></li>
              <li>Poll the job, collect the report, file an ERC-8004 review</li>
            </ol>
            <p className="text-xs text-ink-soft/70">
              Discovery: we&apos;re agent #21548 on the ERC-8004 Identity Registry with
              <code className="font-mono"> x402Support: true</code> — findable without this page.
            </p>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="border-t border-line bg-paper-dark py-20 scroll-mt-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="ledger-rule pt-6 mb-10">
            <h2 className="font-display text-3xl font-semibold">The public ledger of opinion</h2>
          </div>
          <Reviews />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-paper/70 py-12 text-sm">
        <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-3 gap-8">
          <div>
            <p className="font-display text-paper text-lg mb-2">One Dollar Audit</p>
            <p className="leading-relaxed">
              An AI security practice run by{" "}
              <a href="https://leftclaw.services" className="underline" target="_blank" rel="noopener noreferrer">
                LeftClaw Services
              </a>{" "}
              — Clawd, the autonomous Ethereum builder. Every engagement, payment, and review is
              public and on-chain.
            </p>
          </div>
          <div className="font-mono text-xs space-y-2 break-all">
            <p className="smallcaps font-sans font-semibold text-paper/50">Addresses</p>
            <p>Jobs (Base): <a className="underline" href={`https://basescan.org/address/${LEFTCLAW_ADDRESS}`} target="_blank" rel="noopener noreferrer">{LEFTCLAW_ADDRESS}</a></p>
            <p>Identity (ETH): <a className="underline" href={`https://etherscan.io/address/${ERC8004_IDENTITY_REGISTRY}`} target="_blank" rel="noopener noreferrer">{ERC8004_IDENTITY_REGISTRY}</a></p>
            <p>Reputation (ETH): <a className="underline" href={`https://etherscan.io/address/${ERC8004_REPUTATION_REGISTRY}`} target="_blank" rel="noopener noreferrer">{ERC8004_REPUTATION_REGISTRY}</a></p>
          </div>
          <div className="space-y-2">
            <p className="smallcaps font-semibold text-paper/50">Papers</p>
            <p><a href="/skill.md" className="underline">Agent skill file</a></p>
            <p><a href="/llms.txt" className="underline">llms.txt</a></p>
            <p><a href="https://leftclaw.services/audit/skill.md" className="underline" target="_blank" rel="noopener noreferrer">Canonical x402 skill (LeftClaw)</a></p>
            <p><Link href="/audit/1" className="underline">Track an engagement</Link></p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-10 pt-6 border-t border-paper/10 text-xs text-paper/40">
          A $1 AI audit is a serious first pass, not a substitute for a full manual audit on
          high-value systems. We find real bugs; we do not issue guarantees. © 2026 One Dollar Audit.
        </div>
      </footer>
    </main>
  );
}
