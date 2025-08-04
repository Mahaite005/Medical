import { NextRequest, NextResponse } from 'next/server'

// تكوين صارم للـ API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0
export const fetchCache = 'force-no-store'

/**
 * Auth callback route - completely static approach
 */
export async function GET(request: NextRequest) {
  const baseUrl = 'https://medicalapp-teal.vercel.app'
  
  try {
    // استخراج المعاملات بطريقة آمنة
    const url = request.nextUrl
    const code = url.searchParams.get('code')
    const type = url.searchParams.get('type')
    const accessToken = url.searchParams.get('access_token')
    const refreshToken = url.searchParams.get('refresh_token')
    
    // Build redirect URL
    let redirectTo = baseUrl + '/'
    
    if (type === 'recovery' && (code || accessToken)) {
      // Password reset flow
      const params = new URLSearchParams()
      params.set('reset_password', 'true')
      
      if (accessToken) params.set('access_token', accessToken)
      if (refreshToken) params.set('refresh_token', refreshToken)
      if (code) params.set('code', code)
      
      redirectTo = baseUrl + '/?' + params.toString()
    }
    
    return NextResponse.redirect(redirectTo)
    
  } catch {
    // Safe fallback
    return NextResponse.redirect(baseUrl + '/')
  }
}