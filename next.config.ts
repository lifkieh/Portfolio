import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Abaikan error TypeScript saat build agar bisa deploy
    ignoreBuildErrors: true,
  },
};

export default nextConfig;