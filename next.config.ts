import type { NextConfig } from "next";

// GitHub Pages 静的書き出し用設定
// 環境変数 NEXT_PUBLIC_BASE_PATH で basePath を指定（例: "/dd-map"）
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
