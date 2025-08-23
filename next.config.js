/** @type {import('next').NextConfig} */
const nextConfig = {
  // API-only configuration
  experimental: {
    appDir: true,
  },
  async headers() {
    return [
      {
        // Apply these headers to all API routes
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.NODE_ENV === 'production' 
              ? process.env.NEXT_PUBLIC_FRONTEND_URL || '*'
              : 'http://localhost:3000'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig