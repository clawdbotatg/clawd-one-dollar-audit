import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [{ source: "/skill", destination: "/skill.md", permanent: true }];
  },
};

export default nextConfig;
