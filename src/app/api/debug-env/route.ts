import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Only allow in development or with specific key
  const debugKey = request.nextUrl.searchParams.get('key')
  
  if (process.env.NODE_ENV === 'production' && debugKey !== 'debug123') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
    GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'Not set',
    NODE_ENV: process.env.NODE_ENV,
  }

  return NextResponse.json({
    message: 'Environment Variables Debug',
    environment: envVars,
    timestamp: new Date().toISOString()
  })
} 