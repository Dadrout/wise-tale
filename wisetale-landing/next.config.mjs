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
  output: 'standalone',
  // Optional: add compression for better performance
  compress: true,
  // Optional: enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add path alias configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve('.'),
    }
    return config
  },
  async rewrites() {
    // In production, nginx handles the /app routing
    // Only use rewrites in development
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/app',
          destination: 'http://localhost:3001', // Main app will run on port 3001
        },
        {
          source: '/app/:path*',
          destination: 'http://localhost:3001/:path*',
        },
      ]
    }
    return []
  },
}

export default nextConfig
