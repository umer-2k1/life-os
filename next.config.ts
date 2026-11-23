import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native / server-only packages must not be bundled by Turbopack.
  serverExternalPackages: [
    "typeorm",
    "pg",
    "better-sqlite3",
    "reflect-metadata",
    "grammy",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
