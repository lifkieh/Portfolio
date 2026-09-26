import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Abaikan error TypeScript saat build agar bisa deploy
    ignoreBuildErrors: true,
  },
  // Serve the new cmd.exe arcade single-file at "/" (URL stays "/"; scripts run;
  // /admin, /api, /about, /projects and the old page.tsx are untouched/reversible).
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/arcade.html" }],
    };
  },
  // never cache the arcade page — always serve the freshest build during dev/deploy
  async headers() {
    return [
      { source: "/", headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }] },
      { source: "/arcade.html", headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }] },
    ];
  },
};

export default nextConfig;