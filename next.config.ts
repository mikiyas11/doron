import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is a native module: load it from node_modules at runtime (AD-6).
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
