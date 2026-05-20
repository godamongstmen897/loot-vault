import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@stellar/stellar-sdk"],
  },
};

export default nextConfig;
