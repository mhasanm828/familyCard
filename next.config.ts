import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Auth + live API routes in this app are dynamic, so the experimental
     component cache is off. */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
