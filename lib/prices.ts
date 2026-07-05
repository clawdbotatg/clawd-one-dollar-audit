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
    Promise.all([fetchPrice(CLAWD_ADDRESS), fetchPrice(WETH_BASE)]).then(([clawd, eth]) => {
      cache = { clawd, eth, at: Date.now() };
      if (clawd) setClawdPrice(clawd);
      if (eth) setEthPrice(eth);
    });
  }, []);

  return { clawdPrice, ethPrice };
}
