import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * Run `npm run dev` from the `frontend/` folder so `process.cwd()` is this app.
   * Avoids Turbopack picking the repo root when a parent `package-lock.json` exists.
   */
  turbopack: {
    root: process.cwd(),
  },
  headers: async () => [
    {
      source: "/sw.js",
      headers: [
        { key: "Cache-Control", value: "no-cache" },
        { key: "Service-Worker-Allowed", value: "/" },
      ],
    },
  ],
};

export default nextConfig;
