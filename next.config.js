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
            value: process.env.NODE_ENV === 'production' 
              ? 'https://your-frontend-domain.com' 
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