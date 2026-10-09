import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@webstore/core", "@webstore/ui", "@webstore/db"],
};

export default nextConfig;
