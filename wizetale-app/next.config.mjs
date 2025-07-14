import path from 'path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable standalone mode for Docker production builds
  output: 'export',
  // Optional: add compression for better performance
  compress: true,
  // Optional: enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  // Configure headers for OAuth popup compatibility
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          // Remove COEP header for OAuth compatibility
          // {
          //   key: 'Cross-Origin-Embedder-Policy',
          //   value: 'require-corp',
          // },
        ],
      },
    ]
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add path alias configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve('.'),
    }
    return config
  },
}

export default nextConfig
