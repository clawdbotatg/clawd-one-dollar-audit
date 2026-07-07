"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parseEther, parseEventLogs, parseUnits } from "viem";
import { useAccount, usePublicClient, useReadContract, useSwitchChain, useWriteContract } from "wagmi";
import { ConnectButton } from "./ConnectButton";
import {
  AUDIT_SERVICE_TYPE_ID,
  BASE_CHAIN_ID,
  CLAWD_ADDRESS,
  ERC20_ABI,
  LEFTCLAW_ABI,
  LEFTCLAW_ADDRESS,
  USDC_ADDRESS,
} from "@/lib/contracts";
import { refreshPrices, usePrices } from "@/lib/prices";

type Method = "usdc" | "eth" | "clawd";
type Step = "idle" | "approving" | "posting" | "done";

const METHOD_LABELS: Record<Method, { name: string; symbol: string }> = {
  usdc: { name: "USDC", symbol: "$" },
  eth: { name: "ETH", symbol: "⟠" },
  clawd: { name: "CLAWD", symbol: "🦞" },
};

export function PaymentCard() {
  const router = useRouter();
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });
  const { writeContractAsync } = useWriteContract();
  const { clawdPrice, ethPrice } = usePrices();

  const [description, setDescription] = useState("");
  const [method, setMethod] = useState<Method>("usdc");
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);

  const wrongNetwork = !!address && chainId !== BASE_CHAIN_ID;

  // Live price from the LeftClaw contract (USDC 6-decimals; audit = service type 4)
  const { data: serviceType } = useReadContract({
    chainId: BASE_CHAIN_ID,
    address: LEFTCLAW_ADDRESS,
    abi: LEFTCLAW_ABI,
    functionName: "getServiceType",
    args: [BigInt(AUDIT_SERVICE_TYPE_ID)],
  });
  const priceUsd = serviceType ? Number(serviceType.priceUsd) / 1e6 : 1;

  const usdcAmount = parseUnits(priceUsd.toFixed(6), 6);
  const clawdNeeded = clawdPrice ? Math.ceil(priceUsd / clawdPrice) : 0;
  const clawdWei = BigInt(clawdNeeded) * 10n ** 18n;
  const ethNeeded = ethPrice ? priceUsd / ethPrice : 0;

  const { data: usdcBalance } = useReadContract({
    chainId: BASE_CHAIN_ID, address: USDC_ADDRESS, abi: ERC20_ABI,
    functionName: "balanceOf", args: address ? [address] : undefined,
  });
  const { data: clawdBalance } = useReadContract({
    chainId: BASE_CHAIN_ID, address: CLAWD_ADDRESS, abi: ERC20_ABI,
    functionName: "balanceOf", args: address ? [address] : undefined,
  });

  const insufficient =
    !!address &&
    ((method === "usdc" && usdcBalance !== undefined && usdcBalance < usdcAmount) ||
      (method === "clawd" && clawdBalance !== undefined && clawdWei > 0n && clawdBalance < clawdWei));

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const costDisplay =
    method === "usdc"
      ? `$${priceUsd.toFixed(2)} USDC`
      : method === "eth"
        ? ethNeeded > 0 ? `~${ethNeeded.toFixed(6)} ETH` : "…"
        : clawdNeeded > 0 ? `~${clawdNeeded.toLocaleString()} CLAWD` : "…";

  async function approveAndWait(token: `0x${string}`, amount: bigint) {
    if (!address || !publicClient) throw new Error("Not connected");
    const allowance = await publicClient.readContract({
      address: token, abi: ERC20_ABI, functionName: "allowance",
      args: [address, LEFTCLAW_ADDRESS],
    });
    if (allowance >= amount) return;
    setStep("approving");
    await writeContractAsync({
      chainId: BASE_CHAIN_ID, address: token, abi: ERC20_ABI,
      functionName: "approve", args: [LEFTCLAW_ADDRESS, amount],
    });
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 1500));
      const a = await publicClient.readContract({
        address: token, abi: ERC20_ABI, functionName: "allowance",
        args: [address, LEFTCLAW_ADDRESS],
      });
      if (a >= amount) return;
    }
    throw new Error("Approval didn't confirm — please try again");
  }

  async function submit() {
    if (!address || !publicClient || wrongNetwork) return;
    if (description.trim().length < 10) {
      setError("Describe the contract — paste a verified address or the source code (min 10 characters).");
      return;
    }
    setError(null);

    try {
      const desc = description.trim();
      const svcId = BigInt(AUDIT_SERVICE_TYPE_ID);
      let txHash: `0x${string}`;

      // Re-quote at pay time — the mount-time quote can be minutes stale, which
      // would trip the slippage bound or misprice the ETH/CLAWD amounts.
      const live = await refreshPrices();
      // The contract swaps USDC/ETH → CLAWD on-chain; bound the swap at 5% below
      // the quote (1 wei fallback keeps payments working if the feed is down).
      const minClawdOut = live.clawd
        ? parseUnits(((priceUsd / live.clawd) * 0.95).toFixed(18), 18)
        : 1n;

      if (method === "usdc") {
        await approveAndWait(USDC_ADDRESS, usdcAmount);
        setStep("posting");
        txHash = await writeContractAsync({
          chainId: BASE_CHAIN_ID, address: LEFTCLAW_ADDRESS, abi: LEFTCLAW_ABI,
          functionName: "postJobWithUsdc", args: [svcId, desc, minClawdOut],
        });
      } else if (method === "eth") {
        if (!live.eth) throw new Error("ETH price not loaded yet — try again in a moment");
        setStep("posting");
        // 5% buffer — the contract swaps ETH → CLAWD and needs the USD price covered
        const ethWei = parseEther(((priceUsd / live.eth) * 1.05).toFixed(18));
        txHash = await writeContractAsync({
          chainId: BASE_CHAIN_ID, address: LEFTCLAW_ADDRESS, abi: LEFTCLAW_ABI,
          functionName: "postJobWithETH", args: [svcId, desc, minClawdOut], value: ethWei,
        });
      } else {
        if (!live.clawd) throw new Error("CLAWD price not loaded yet — try again in a moment");
        const liveClawdWei = BigInt(Math.ceil(priceUsd / live.clawd)) * 10n ** 18n;
        await approveAndWait(CLAWD_ADDRESS, liveClawdWei);
        setStep("posting");
        txHash = await writeContractAsync({
          chainId: BASE_CHAIN_ID, address: LEFTCLAW_ADDRESS, abi: LEFTCLAW_ABI,
          functionName: "postJob", args: [svcId, liveClawdWei, desc],
        });
      }

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      const events = parseEventLogs({ abi: LEFTCLAW_ABI, logs: receipt.logs, eventName: "JobPosted" });
      const jobId = events.length > 0 ? Number(events[0].args.jobId) : null;
      if (jobId === null) throw new Error("Job posted but couldn't read the job ID — check your wallet activity");

      // Kick off LeftClaw's sanitization check so workers pick the job up promptly
      fetch("/api/sanitize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: String(jobId), description: desc }),
      }).catch(() => {});

      setStep("done");
      router.push(`/audit/${jobId}`);
    } catch (e: unknown) {
      const err = e as { shortMessage?: string; message?: string };
      setError((err.shortMessage || err.message || String(e)).slice(0, 300));
      setStep("idle");
    }
  }

  const busy = step === "approving" || step === "posting";
  const canSubmit = !!address && !wrongNetwork && !insufficient && !busy && step !== "done" && description.trim().length >= 10;

  return (
    <div className="border border-line bg-paper shadow-xl">
      {/* Engagement form header */}
      <div className="border-b border-line bg-paper-dark px-6 py-4 flex items-baseline justify-between">
        <span className="smallcaps text-sm font-semibold text-ink-soft">Engagement Form 1-A</span>
        <span className="font-display text-2xl font-semibold">
          ${priceUsd.toFixed(2)}
        </span>
      </div>

      <div className="p-6 space-y-5">
        <div>
          <label className="smallcaps block text-sm font-semibold mb-2 text-ink-soft">
            Subject of engagement
          </label>
          <textarea
            className="w-full h-32 border border-line bg-white px-4 py-3 text-sm font-mono focus:outline-none focus:border-ink resize-y"
            placeholder={"Paste a contract address (verified on Basescan/Etherscan) or the Solidity source.\n\ne.g. 0xAbC… on Base — staking vault, please focus on reentrancy and access control"}
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={busy || step === "done"}
          />
        </div>

        <div>
          <label className="smallcaps block text-sm font-semibold mb-2 text-ink-soft">
            Method of payment · Base network
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(METHOD_LABELS) as Method[]).map(m => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                disabled={busy}
                className={`border px-3 py-3 text-sm font-semibold transition-colors ${
                  method === m
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-paper hover:border-ink-soft"
                }`}
              >
                {METHOD_LABELS[m].symbol} {METHOD_LABELS[m].name}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-ink-soft">
            <span>Total due: <strong className="font-mono">{costDisplay}</strong></span>
            <span className="opacity-70">{method === "clawd" ? "escrowed" : "swapped to CLAWD & escrowed"}</span>
          </div>
        </div>

        {mounted && !address && (
          <div className="flex justify-center py-2">
            <ConnectButton />
          </div>
        )}

        {mounted && wrongNetwork && (
          <button
            onClick={() => switchChain({ chainId: BASE_CHAIN_ID })}
            className="w-full py-3 bg-seal text-paper smallcaps font-semibold hover:opacity-90 transition-opacity"
          >
            Switch to Base network
          </button>
        )}

        {mounted && insufficient && (
          <p className="text-sm text-seal">
            Insufficient {METHOD_LABELS[method].name} balance on Base.{" "}
            {method === "clawd" && (
              <a
                className="underline"
                href={`https://app.uniswap.org/swap?outputCurrency=${CLAWD_ADDRESS}&chain=base`}
                target="_blank" rel="noopener noreferrer"
              >
                Get CLAWD →
              </a>
            )}
          </p>
        )}

        {mounted && address && !wrongNetwork && (
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="w-full py-4 bg-ink text-paper smallcaps text-base font-semibold tracking-wider hover:bg-navy transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {step === "approving" && "Approving in wallet…"}
            {step === "posting" && "Commissioning audit on-chain…"}
            {step === "done" && "Audit commissioned ✓"}
            {step === "idle" && `Commission audit — ${costDisplay}`}
          </button>
        )}

        {error && <p className="text-sm text-seal border border-seal/40 bg-seal/5 px-4 py-3">{error}</p>}

        <p className="text-xs text-ink-soft/70 leading-relaxed">
          Payment is escrowed in the LeftClaw Services contract on Base until the audit is delivered.
          Your job — description, stage, and final report — is tracked publicly on-chain.
        </p>
      </div>
    </div>
  );
}
