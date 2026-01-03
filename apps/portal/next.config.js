/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
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
