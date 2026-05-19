import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  basePath: "/salsaarkan",
  allowedDevOrigins: ["192.168.1.3", "192.168.1.251", "192.168.40.201", "*.local"],
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
