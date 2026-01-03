const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Build optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: true,
  },
  experimental: {
    optimizeCss: true,
    turbotrace: {
      contextDirectory: __dirname,
      logLevel: 'error',
    },
    serverActions: true,
    serverComponentsExternalPackages: ['sharp'],
    optimizePackageImports: [
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-dialog',
      '@radix-ui/react-label',
      '@radix-ui/react-select',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
      'lucide-react'
    ],
  },
  
  // Performance optimizations
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize CSS
    if (!dev) {
      config.optimization.minimize = true;
    }

    // Optimize images
    config.module.rules.push({
      test: /\.(jpe?g|png|svg|gif|ico|webp|avif)$/,
      use: [
        {
          loader: 'image-webpack-loader',
          options: {
            mozjpeg: { progressive: true },
            optipng: { enabled: true },
            pngquant: { quality: [0.65, 0.90], speed: 4 },
            gifsicle: { interlaced: true },
            webp: { quality: 75 }
          }
        }
      ]
    });

    return config;
  },

  // Output configuration
  output: 'standalone',
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },

  // Redirect configuration
  async redirects() {
    return [
      {
        source: '/health',
        destination: '/api/health',
        permanent: true
      }
    ]
  }
}

module.exports = withBundleAnalyzer(nextConfig)
