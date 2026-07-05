"use client";

import { useEffect, useState } from "react";
import { keccak256, toBytes } from "viem";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import { ConnectButton } from "./ConnectButton";
import {
  ERC8004_AGENT_ID,
  ERC8004_REPUTATION_REGISTRY,
  MAINNET_CHAIN_ID,
  REPUTATION_ABI,
  SITE_URL,
} from "@/lib/contracts";

interface Review {
  reviewer: string;
  rating: number;
  tag1: string;
  tag2: string;
  text: string;
  uri?: string;
  timestamp: number;
  tx: string;
}

function Stars({ n, className = "" }: { n: number; className?: string }) {
  // Registry convention: "starred" feedback is 0-100; older entries may be 1-5
  const scaled = n > 5 ? n / 20 : n;
  const full = Math.round(Math.max(0, Math.min(5, scaled)));
  return (
    <span className={`text-gold-bright tracking-widest ${className}`} aria-label={`${full} out of 5`}>
      {"★".repeat(full)}
      <span className="text-line">{"★".repeat(5 - full)}</span>
    </span>
  );
}

export function Reviews() {
  const [reviews, setReviews] = useState<Review[] | null>(null);

  useEffect(() => {
    fetch("/api/reviews")
      .then(r => r.json())
      // Star ratings only — the registry also carries machine feedback
      // (uptime pings tagged "reachable" etc.) that isn't a review.
      .then(d =>
        setReviews(
          (d.reviews || []).filter((r: Review) => r.tag1 === "starred" || r.tag2 === "onedollaraudit"),
        ),
      )
      .catch(() => setReviews([]));
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div>
        <h3 className="font-display text-2xl font-semibold mb-1">On the record</h3>
        <p className="text-sm text-ink-soft mb-6">
          Every review is a signed transaction on the ERC-8004 Reputation Registry on Ethereum
          mainnet, filed against agent&nbsp;#{String(ERC8004_AGENT_ID)}. We can&apos;t edit them,
          delete them, or buy them. That&apos;s the point.
        </p>

        {reviews === null && <p className="text-sm text-ink-soft/70">Reading the registry…</p>}
        {reviews !== null && reviews.length === 0 && (
          <p className="text-sm text-ink-soft/70">No reviews indexed yet — be the first on-chain.</p>
        )}

        <div className="space-y-4">
          {reviews?.slice(0, 8).map(r => (
            <div key={r.tx + r.reviewer} className="border border-line bg-white/60 px-5 py-4">
              <div className="flex items-baseline justify-between gap-4">
                <Stars n={r.rating} />
                <a
                  href={`https://etherscan.io/tx/${r.tx}`}
                  target="_blank" rel="noopener noreferrer"
                  className="font-mono text-xs text-ink-soft/70 hover:text-ink underline decoration-line"
                >
                  {r.reviewer.slice(0, 6)}…{r.reviewer.slice(-4)}
                </a>
              </div>
              {r.text && <p className="text-sm mt-2 leading-relaxed">{r.text}</p>}
              {r.uri && (
                <a href={r.uri} target="_blank" rel="noopener noreferrer" className="text-xs underline text-ink-soft">
                  full review →
                </a>
              )}
              {r.timestamp > 0 && (
                <p className="text-xs text-ink-soft/60 mt-2">
                  {new Date(r.timestamp * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <LeaveReview />
    </div>
  );
}

function LeaveReview() {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const wrongNetwork = !!address && chainId !== MAINNET_CHAIN_ID;

  async function submit() {
    if (!address || wrongNetwork) return;
    setError(null);
    setState("sending");
    try {
      const body = text.trim();
      // Review text rides in the feedbackURI as a data: URI — fully on-chain, no hosting
      const feedbackURI = body ? `data:text/plain;charset=utf-8,${encodeURIComponent(body)}` : "";
      const feedbackHash = body ? keccak256(toBytes(body)) : ("0x" + "0".repeat(64)) as `0x${string}`;

      await writeContractAsync({
        chainId: MAINNET_CHAIN_ID,
        address: ERC8004_REPUTATION_REGISTRY,
        abi: REPUTATION_ABI,
        functionName: "giveFeedback",
        // "starred" convention: value on a 0-100 scale (5 stars = 100)
        args: [ERC8004_AGENT_ID, BigInt(rating * 20), 0, "starred", "onedollaraudit", SITE_URL, feedbackURI, feedbackHash],
      });
      setState("done");
    } catch (e: unknown) {
      const err = e as { shortMessage?: string; message?: string };
      setError((err.shortMessage || err.message || String(e)).slice(0, 300));
      setState("idle");
    }
  }

  return (
    <div className="border border-line bg-white/60 h-fit">
      <div className="border-b border-line px-6 py-4">
        <span className="smallcaps text-sm font-semibold text-ink-soft">File a review · ERC-8004</span>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <label className="smallcaps block text-sm font-semibold mb-2 text-ink-soft">Rating</label>
          <div className="flex gap-1 text-3xl">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setRating(n)}
                className={n <= rating ? "text-gold-bright" : "text-line hover:text-gold"}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="smallcaps block text-sm font-semibold mb-2 text-ink-soft">
            Statement <span className="normal-case font-normal opacity-60">(stored on-chain, keep it short)</span>
          </label>
          <textarea
            className="w-full h-24 border border-line bg-paper px-4 py-3 text-sm focus:outline-none focus:border-ink resize-y"
            placeholder="The audit found a real bug for a dollar. Remarkable."
            value={text}
            maxLength={280}
            onChange={e => setText(e.target.value)}
            disabled={state !== "idle"}
          />
        </div>

        {mounted && !address && <ConnectButton />}
        {mounted && wrongNetwork && (
          <button
            onClick={() => switchChain({ chainId: MAINNET_CHAIN_ID })}
            className="w-full py-3 bg-seal text-paper smallcaps font-semibold hover:opacity-90"
          >
            Switch to Ethereum mainnet
          </button>
        )}
        {mounted && address && !wrongNetwork && state !== "done" && (
          <button
            onClick={submit}
            disabled={state === "sending"}
            className="w-full py-3 bg-ink text-paper smallcaps font-semibold hover:bg-navy transition-colors disabled:opacity-40"
          >
            {state === "sending" ? "Confirm in wallet…" : "Sign & file on-chain"}
          </button>
        )}
        {state === "done" && (
          <p className="text-sm text-mint font-semibold">
            Filed. It will appear above once the block is indexed (~a minute).
          </p>
        )}
        {error && <p className="text-sm text-seal">{error}</p>}

        <p className="text-xs text-ink-soft/70 leading-relaxed">
          Reviews live on Ethereum mainnet (small gas fee). The registry rejects reviews from the
          agent&apos;s own wallets — only clients can speak here.
        </p>
      </div>
    </div>
  );
}
