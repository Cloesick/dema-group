const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Output file tracing for monorepo
  outputFileTracingRoot: path.resolve(__dirname, '../..'),

  // Include PDF files in the serverless function output for Vercel
  outputFileTracingIncludes: {
    '/api/pdf/[...path]': ['./public/documents/**/*'],
    '/api/pdf-catalog': ['./public/documents/**/*'],
  },

  // Exclude large files from serverless functions to stay under 250MB limit
  outputFileTracingExcludes: {
    '/api/images/[...path]': [
      './public/data/**/*',
      './public/images/**/*',
      './src/data/**/*',
      './documents/**/*',
    ],
    '*': [
      './public/data/makita_*.json',
      './public/data/kranzle_*.json',
      './public/data/products_*.json',
      './src/data/catalog_products.json',
    ],
  },

  // Add headers to prevent PDF caching issues
  async headers() {
    return [
      {
        source: '/documents/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      {
        source: '/api/pdf/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    // Enable optimization in all environments for better quality
    unoptimized: false,
    // Supported formats
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images - added larger sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for layout optimization - added larger sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    // Minimize layout shift
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  
  // Add production browser source maps for better debugging
  productionBrowserSourceMaps: true,
}

module.exports = nextConfig