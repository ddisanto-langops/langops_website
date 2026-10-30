import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  
  // Force Webpack to poll the Docker filesystem
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,          // Check files every 1000ms
        aggregateTimeout: 800, // Wait a moment for multi-file saves
      };
    }
    return config;
  },
};

export default nextConfig;
