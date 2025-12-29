/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizations for Vercel deployment
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true
  }
}

module.exports = nextConfig
