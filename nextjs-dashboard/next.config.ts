import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: { // This is the new way
  },
};

export default nextConfig;
