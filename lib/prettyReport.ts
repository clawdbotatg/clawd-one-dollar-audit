import { LEFTCLAW_APP } from "@/lib/contracts";

/**
 * Pretty HTML rendering of a completed job's report, served by
 * leftclaw.services/result/<id>.html. Since leftclaw renders these on demand
 * for any completed job whose result lives on IPFS, we mirror its gate
 * (completed + https URL with an ipfs host, or a bare CID) and link
 * deterministically. No probing: a browser-side HEAD probe dies on CORS
 * (which silently hid this link on every engagement page), and a server-side
 * one is a wasted round-trip.
 */
export function prettyReportLink(id: string | number, cid: string, completed: boolean): string | null {
  if (!completed || !cid) return null;
  const raw = cid.trim();
  let host = "";
  if (/^[a-z0-9]{46,}$/i.test(raw)) {
    host = "bgipfs.com";
  } else {
    const url = raw.startsWith("ipfs://") ? `https://ipfs.io/ipfs/${raw.slice(7)}` : raw;
    if (!/^https:\/\//i.test(url)) return null;
    try {
      host = new URL(url).hostname;
    } catch {
      return null;
    }
  }
  if (!/ipfs/i.test(host)) return null;
  return `${LEFTCLAW_APP}/result/${id}.html`;
}
