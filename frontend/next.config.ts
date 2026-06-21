import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Model/WASM assets have stable filenames (not content-hashed like
        // _next/static/), so they need an explicit long-lived cache header
        // to actually get cached across repeat visits.
        source: "/:path(models|wasm)/:file*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
