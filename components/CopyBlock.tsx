"use client";

import { useState } from "react";

export function CopyBlock({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="relative border border-line bg-navy text-paper/90">
      <div className="flex items-center justify-between border-b border-paper/10 px-4 py-2">
        <span className="smallcaps text-xs font-semibold text-paper/60">{label}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(text).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
          className="smallcaps text-xs font-semibold px-3 py-1 border border-paper/30 hover:bg-paper/10 transition-colors"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <pre className="px-4 py-3 text-xs font-mono overflow-x-auto whitespace-pre">{text}</pre>
    </div>
  );
}
