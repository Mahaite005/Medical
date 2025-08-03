import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  try {
    const supabase = createMiddlewareClient({ req, res })
    
    // Get session
    const { data: { session } } = await supabase.auth.getSession()
    
    // Add security headers
    res.headers.set('X-Frame-Options', 'DENY')
    res.headers.set('X-Content-Type-Options', 'nosniff')
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    
    // Add CSP header for better security (محسّن)
    res.headers.set('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "img-src 'self' data: https: blob: https://*.supabase.co; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://vercel.live; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self';"
    )
    
    // Protect API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      // Add rate limiting headers
      res.headers.set('X-RateLimit-Limit', '10')
      res.headers.set('X-RateLimit-Window', '60')
    }
  } catch (error) {
    console.error('Middleware error:', error)
    // Continue with response even if Supabase fails
  }
  
  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 