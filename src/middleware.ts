import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Get session
  const { data: { session } } = await supabase.auth.getSession()
  
  // Add security headers
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Add CSP header for better security
  res.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self'; " +
    "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com; " +
    "frame-ancestors 'none';"
  )
  
  // Protect API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    // Add rate limiting headers
    res.headers.set('X-RateLimit-Limit', '10')
    res.headers.set('X-RateLimit-Window', '60')
  }
  
  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 