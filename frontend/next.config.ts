import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  
  // Environment variables passed to the frontend
  env: {
    NEXT_PUBLIC_DFX_NETWORK: process.env.DFX_NETWORK,
    NEXT_PUBLIC_CANISTER_ID_BACKEND: process.env.CANISTER_ID_BACKEND,
    NEXT_PUBLIC_CANISTER_ID_FRONTEND: process.env.CANISTER_ID_FRONTEND,
    NEXT_PUBLIC_CANISTER_ID_INTERNET_IDENTITY: process.env.CANISTER_ID_INTERNET_IDENTITY,
  },
  
  // Optimization for production
  compress: true,
  poweredByHeader: false,
  
  webpack: (config) => {
    config.optimization = {
      ...config.optimization,
      minimize: true,
    };
    return config;
  },
};

export default nextConfig;
