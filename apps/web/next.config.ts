import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: "../../",
  turbopack: {
    root: "../../",
  },
  allowedDevOrigins: ['sky-parks-attachments-preparing.trycloudflare.com', 'triangle-crown-reel-icon.trycloudflare.com', 'chocolate-lovely-pharmaceutical-processor.trycloudflare.com', 'locally-strengths-chrome-directly.trycloudflare.com', 'hrmanager4u-api.loca.lt', 'hrmanager4u-web.loca.lt'],
};

export default nextConfig;
