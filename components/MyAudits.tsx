"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useReadContracts } from "wagmi";
import { BASE_CHAIN_ID, JOB_STATUS, LEFTCLAW_ABI, LEFTCLAW_ADDRESS } from "@/lib/contracts";
import { forgetAudit, loadAudits, type SavedAudit } from "@/lib/myAudits";

/** "Your engagements" — the audits this browser has commissioned or opened,
 * from localStorage (see lib/myAudits.ts), with live status read from chain.
 * Renders nothing for a fresh visitor. */
export function MyAudits() {
  const [audits, setAudits] = useState<SavedAudit[]>([]);
  useEffect(() => {
    setAudits(loadAudits());
  }, []);

  const { data: jobs } = useReadContracts({
    contracts: audits.map((a) => ({
      chainId: BASE_CHAIN_ID,
      address: LEFTCLAW_ADDRESS,
      abi: LEFTCLAW_ABI,
      functionName: "getJob",
      args: [BigInt(a.jobId)],
    })),
    query: { enabled: audits.length > 0, refetchInterval: 30_000 },
  });

  if (audits.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 pt-16">
      <div className="ledger-rule pt-6 mb-6 flex items-baseline justify-between gap-4 flex-wrap">
        <h2 className="font-display text-3xl font-semibold">Your engagements</h2>
        <p className="text-xs text-ink-soft">
          Remembered by this browser — the on-chain record itself never expires.
        </p>
      </div>
      <div className="border border-line bg-white/60 divide-y divide-line max-h-80 overflow-y-auto">
        {audits.map((a, i) => {
          const read = jobs?.[i];
          const job =
            read?.status === "success" ? (read.result as unknown as { status: number }) : null;
          const label = job ? JOB_STATUS[job.status] ?? "Unknown" : null;
          return (
            <div key={a.jobId} className="flex items-center gap-4 px-5 py-3">
              <Link href={`/audit/${a.jobId}`} className="flex-1 min-w-0 group">
                <span className="smallcaps text-sm font-semibold group-hover:text-gold transition-colors">
                  Engagement No. {a.jobId}
                </span>
                <span className="block text-sm text-ink-soft truncate">
                  {a.description || "…"}
                </span>
              </Link>
              <span className="text-xs text-ink-soft hidden sm:block shrink-0">
                {new Date(a.savedAt).toLocaleDateString()}
              </span>
              {label && (
                <span
                  className={`smallcaps text-xs font-bold shrink-0 ${
                    job!.status === 2
                      ? "text-mint"
                      : job!.status >= 3
                        ? "text-seal"
                        : "text-gold"
                  }`}
                >
                  {label}
                </span>
              )}
              <button
                onClick={() => setAudits(forgetAudit(a.jobId))}
                aria-label={`Forget engagement ${a.jobId}`}
                title="Forget (this browser only)"
                className="shrink-0 text-ink-soft/40 hover:text-seal transition-colors"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
