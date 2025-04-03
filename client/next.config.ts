import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  rules: {
    "@typescript-eslint/no-unused-vars": "off", // Disable globally
  },
  // You can add other Next.js configuration options here as needed
};

export default nextConfig;
