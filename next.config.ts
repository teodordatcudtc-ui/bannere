import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Skip build-time static generation for API routes that depend on runtime environment
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
