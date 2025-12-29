/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@dema/ui', '@dema/config'],
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
        '@dema/ui': require.resolve('@dema/ui'),
        '@dema/config': require.resolve('@dema/config'),
      },
    },
  },
}

module.exports = nextConfig
