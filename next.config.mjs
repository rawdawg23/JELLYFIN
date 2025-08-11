import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
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
      {
        protocol: 'https',
        hostname: 'placeholder.svg',
      },
    ],
    unoptimized: true,
  },
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['three', '@react-three/fiber', '@react-three/drei'],
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
      buffer: false,
      util: false,
      events: false,
      child_process: false,
      worker_threads: false,
    };

    // Handle Three.js modules properly
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader'],
    });

    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };

    if (isServer) {
      config.externals = [...(config.externals || [])];
    }

    return config;
  },
  output: 'standalone',
  poweredByHeader: false,
  trailingSlash: false,
  generateEtags: false,
  swcMinify: true,
};

export default nextConfig;
