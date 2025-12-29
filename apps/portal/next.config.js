/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@dema-group/ui', '@dema-group/config'],
  // Optimizations for Vercel deployment
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true,
    turbo: {
      resolveAlias: {
        '@dema-group/ui': require.resolve('@dema-group/ui'),
        '@dema-group/config': require.resolve('@dema-group/config'),
      },
    },
  },
}

module.exports = nextConfig
