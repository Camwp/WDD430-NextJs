import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    cacheComponents: true, // This is the new way
  },
};

export default nextConfig;
