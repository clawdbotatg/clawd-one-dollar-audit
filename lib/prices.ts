"use client";

import { useEffect, useState } from "react";
import { CLAWD_ADDRESS } from "./contracts";

const WETH_BASE = "0x4200000000000000000000000000000000000006";

let cache: { clawd: number | null; eth: number | null; at: number } = { clawd: null, eth: null, at: 0 };
const TTL = 60_000;

async function fetchPrice(token: string): Promise<number | null> {
  try {
    const r = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token}`);
    const data = await r.json();
    const p = parseFloat(data.pairs?.[0]?.priceUsd || "0");
    return p > 0 ? p : null;
  } catch {
    return null;
  }
}

/** Force-refresh both quotes, e.g. at submit time so a long-idle tab doesn't
 * pay against a stale price. Falls back to the cached value per-token if a
 * fetch fails, so a DexScreener blip degrades to the old behavior. */
export async function refreshPrices(): Promise<{ clawd: number | null; eth: number | null }> {
  const [clawd, eth] = await Promise.all([fetchPrice(CLAWD_ADDRESS), fetchPrice(WETH_BASE)]);
  cache = { clawd: clawd ?? cache.clawd, eth: eth ?? cache.eth, at: Date.now() };
  return { clawd: cache.clawd, eth: cache.eth };
}

/** Live CLAWD + ETH USD prices from DexScreener (same source leftclaw.services uses). */
export function usePrices() {
  const [clawdPrice, setClawdPrice] = useState<number | null>(cache.clawd);
  const [ethPrice, setEthPrice] = useState<number | null>(cache.eth);

  useEffect(() => {
    if (cache.clawd !== null && cache.eth !== null && Date.now() - cache.at < TTL) {
      setClawdPrice(cache.clawd);
      setEthPrice(cache.eth);
      return;
    }
    refreshPrices().then(({ clawd, eth }) => {
      if (clawd) setClawdPrice(clawd);
      if (eth) setEthPrice(eth);
    });
  }, []);

  return { clawdPrice, ethPrice };
}
