/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint checks during build
  },
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript error checking during build
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blob.v0.dev',
      },
      {
        protocol: 'https',
        hostname: 'xqi1eda.freshticks.xyz',
      },
    ],
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Handle potential module resolution issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
};

export default nextConfig;
