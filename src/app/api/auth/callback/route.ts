import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Auth callback route for handling authentication redirects
 */
export async function GET(request: NextRequest) {
  const baseUrl = 'https://medicalapp-teal.vercel.app'
  
  try {
    // Extract URL and search parameters safely
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const type = searchParams.get('type')
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    // Build redirect URL
    let redirectTo = `${baseUrl}/`
    
    if (type === 'recovery' && (code || accessToken)) {
      // Password reset flow
      const params = new URLSearchParams()
      params.set('reset_password', 'true')
      
      if (accessToken) params.set('access_token', accessToken)
      if (refreshToken) params.set('refresh_token', refreshToken)
      if (code) params.set('code', code)
      
      redirectTo = `${baseUrl}/?${params.toString()}`
    }
    
    return NextResponse.redirect(redirectTo)
    
  } catch (error) {
    // Log error for debugging but don't expose details
    console.error('Auth callback error:', error)
    // Safe fallback
    return NextResponse.redirect(`${baseUrl}/`)
  }
}