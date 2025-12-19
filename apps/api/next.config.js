/** @type {import('next').NextConfig} */
const nextConfig = {
  // API-only service - no React pages needed
  reactStrictMode: true,
  
  // Enable API routes only
  async rewrites() {
    return []
  },
  
  // CORS headers for API
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Api-Key, X-Company-Id, X-Webhook-Signature, X-Webhook-Id' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
