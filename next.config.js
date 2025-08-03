/** @type {import('next').NextConfig} */
const nextConfig = {
  // إعدادات API Routes
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  
  // تكوين output للتأكد من التوافق مع Vercel
  output: 'standalone',

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
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY,
    // Always use the Vercel URL for production and localhost for development
    NEXT_PUBLIC_SITE_URL: 'https://medicalapp-teal.vercel.app',
  },
}

module.exports = nextConfig 