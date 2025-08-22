/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'ypcyvaacsjlathtejrxl.supabase.co',
      '*.supabase.co',
      'supabase.co'
    ],
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Response-Time',
            value: '60s',
          },
        ],
      },
    ]
  },

  // Environment variables validation
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://ypcyvaacsjlathtejrxl.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwY3l2YWFjc2psYXRodGVqcnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMjgxNTcsImV4cCI6MjA2ODYwNDE1N30.A-MGUKD1yI4VmaRLqDlfr-QdUP-lY_gnPw7RjNNzyc8',
    GOOGLE_GEMINI_API_KEY: 'AIzaSyB0-mLWhjL7UJGhpU2wqGp8i-H0c4MnDPA',
    NEXT_PUBLIC_SITE_URL: 'https://medical-sage-nine.vercel.app',
  },
}

module.exports = nextConfig