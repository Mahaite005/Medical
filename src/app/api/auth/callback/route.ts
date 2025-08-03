import { NextRequest, NextResponse } from 'next/server'

// تكوين شامل لضمان العمل في بيئة serverless
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

/**
 * Route للتعامل مع callback من Supabase Auth
 * يدعم تسجيل الدخول وإعادة تعيين كلمة المرور
 */
export async function GET(request: NextRequest) {
  try {
    // استخراج المعاملات مباشرة بدون استخدام searchParams.entries()
    const { searchParams } = request.nextUrl
    
    const code = searchParams.get('code')
    const type = searchParams.get('type') 
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    // URL الأساسي للتطبيق
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medicalapp-teal.vercel.app'
    
    // في حالة إعادة تعيين كلمة المرور
    if (type === 'recovery' && (code || accessToken)) {
      const dashboardUrl = new URL('/', baseUrl)
      dashboardUrl.searchParams.set('reset_password', 'true')
      
      if (accessToken) {
        dashboardUrl.searchParams.set('access_token', accessToken)
      }
      if (refreshToken) {
        dashboardUrl.searchParams.set('refresh_token', refreshToken)
      }
      if (code) {
        dashboardUrl.searchParams.set('code', code)
      }
      
      return NextResponse.redirect(dashboardUrl.toString())
    }
    
    // في حالة تسجيل الدخول العادي
    if (code && !type) {
      return NextResponse.redirect(new URL('/', baseUrl))
    }
    
    // إعادة توجيه افتراضية للصفحة الرئيسية
    return NextResponse.redirect(new URL('/', baseUrl))
    
  } catch (error) {
    // في حالة حدوث خطأ، العودة للصفحة الرئيسية
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medicalapp-teal.vercel.app'
    return NextResponse.redirect(new URL('/', baseUrl))
  }
}