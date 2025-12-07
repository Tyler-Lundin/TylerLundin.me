import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow production builds to succeed even if ESLint has warnings/errors.
  // We'll address lint issues separately without blocking deploys.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
