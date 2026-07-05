import { NextResponse } from "next/server";
import { decodeEventLog, encodeEventTopics } from "viem";
import { ERC8004_AGENT_ID, ERC8004_REPUTATION_REGISTRY, REPUTATION_ABI } from "@/lib/contracts";

export const revalidate = 120;

const BLOCKSCOUT = "https://eth.blockscout.com/api";

interface BlockscoutLog {
  topics: (string | null)[];
  data: string;
  timeStamp: string;
  transactionHash: string;
}

/** ERC-8004 reviews for Clawd (agent #21548) from the mainnet Reputation
 * Registry, fetched via Blockscout (public RPCs cap getLogs ranges). */
export async function GET() {
  try {
    const [topic0, topic1] = encodeEventTopics({
      abi: REPUTATION_ABI,
      eventName: "NewFeedback",
      args: { agentId: ERC8004_AGENT_ID },
    });

    const url =
      `${BLOCKSCOUT}?module=logs&action=getLogs&address=${ERC8004_REPUTATION_REGISTRY}` +
      `&topic0=${topic0}&topic1=${topic1}&topic0_1_opr=and&fromBlock=0&toBlock=latest`;

    const res = await fetch(url, { next: { revalidate: 120 } });
    const body = await res.json();
    const logs: BlockscoutLog[] = Array.isArray(body.result) ? body.result : [];

    const reviews = logs.flatMap(log => {
      try {
        const decoded = decodeEventLog({
          abi: REPUTATION_ABI,
          eventName: "NewFeedback",
          topics: log.topics.filter((t): t is string => t !== null) as [
            `0x${string}`,
            ...`0x${string}`[],
          ],
          data: log.data as `0x${string}`,
        });
        const a = decoded.args;
        const rating = Number(a.value) / 10 ** Number(a.valueDecimals);

        let text = "";
        const uri = a.feedbackURI || "";
        if (uri.startsWith("data:")) {
          const comma = uri.indexOf(",");
          if (comma > -1) {
            const payload = uri.slice(comma + 1);
            text = uri.includes(";base64")
              ? Buffer.from(payload, "base64").toString("utf-8")
              : decodeURIComponent(payload);
          }
        }

        return [{
          reviewer: a.clientAddress,
          rating,
          tag1: a.tag1,
          tag2: a.tag2,
          text: text.slice(0, 2000),
          uri: uri.startsWith("http") || uri.startsWith("ipfs") ? uri : undefined,
          timestamp: parseInt(log.timeStamp, 16) || 0,
          tx: log.transactionHash,
        }];
      } catch {
        return [];
      }
    });

    reviews.sort((x, y) => y.timestamp - x.timestamp);
    return NextResponse.json({ agentId: Number(ERC8004_AGENT_ID), count: reviews.length, reviews });
  } catch (e) {
    console.error("reviews route error:", e);
    return NextResponse.json({ agentId: Number(ERC8004_AGENT_ID), count: 0, reviews: [] });
  }
}
