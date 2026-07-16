/** Local "your engagements" memory — audits this browser has commissioned
 * (PaymentCard success) or opened (the /audit/<id> tracker). Deliberately
 * simple: localStorage only, no wallet indexing yet — the on-chain JobPosted
 * log (client is indexed) is the upgrade path for a true per-wallet history. */

export type SavedAudit = {
  jobId: number;
  description: string;
  savedAt: string; // ISO — first time this browser saw the job
};

const KEY = "oda:my-audits";
const MAX = 50;

export function loadAudits(): SavedAudit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const list: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    return list.filter(
      (a): a is SavedAudit => typeof a?.jobId === "number" && Number.isFinite(a.jobId),
    );
  } catch {
    return []; // private mode / disabled storage / corrupt JSON — degrade to empty
  }
}

export function rememberAudit(jobId: number, description: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = loadAudits();
    const existing = list.find((a) => a.jobId === jobId);
    if (existing) {
      // Keep first-seen order stable; just backfill a missing description.
      if (!existing.description && description) {
        existing.description = description;
        window.localStorage.setItem(KEY, JSON.stringify(list));
      }
      return;
    }
    list.unshift({ jobId, description, savedAt: new Date().toISOString() });
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    // storage unavailable — the tracker URL still works, just isn't remembered
  }
}

export function forgetAudit(jobId: number): SavedAudit[] {
  const list = loadAudits().filter((a) => a.jobId !== jobId);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
  return list;
}
