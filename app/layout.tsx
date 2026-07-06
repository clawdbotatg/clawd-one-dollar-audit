import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://onedollaraudit.com"),
  title: "One Dollar Audit — AI smart contract security audits for $1",
  description:
    "A professional AI security review of your smart contract for one dollar. Pay with USDC, ETH, or CLAWD on Base — or via x402 if you're an agent. Tracked on-chain, reviewed on ERC-8004.",
  alternates: {
    types: {
      "text/markdown": [{ url: "/skill.md", title: "Agent skill file — pay $1 via x402, get an audit" }],
    },
  },
  openGraph: {
    title: "One Dollar Audit",
    description: "Serious security review. Unserious price. $1 smart contract audits, on-chain.",
    url: "https://onedollaraudit.com",
    siteName: "One Dollar Audit",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "One Dollar Audit — a serious security audit, one dollar" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "One Dollar Audit",
    description: "A serious security audit. One dollar. USDC/ETH/CLAWD on Base, x402 for agents, reviews on ERC-8004.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
