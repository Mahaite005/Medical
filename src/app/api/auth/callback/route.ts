import { NextRequest, NextResponse } from 'next/server'

// Force dynamic server rendering for this route
export const dynamic = 'force-dynamic'

/**
 * هذه النقطة النهائية تعمل كوسيط لعملية إعادة تعيين كلمة المرور
 * تستقبل الطلب من Supabase وتعيد توجيهه إلى صفحة إعادة تعيين كلمة المرور مع الحفاظ على الرموز
 */
export async function GET(request: NextRequest) {
  try {
    // استخراج الرابط الكامل
    const url = new URL(request.url)
    
    // استخراج جميع المعلمات من الاستعلام
    const searchParams = url.searchParams
    
    // التحقق من وجود رموز إعادة تعيين كلمة المرور
    const code = searchParams.get('code')
    const type = searchParams.get('type')
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    // سجل المعلمات للتصحيح
    console.log('Auth callback received:', {
      code: code ? 'present' : 'missing',
      type,
      accessToken: accessToken ? 'present' : 'missing',
      refreshToken: refreshToken ? 'present' : 'missing',
      allParams: Object.fromEntries(searchParams.entries())
    })
    
    // إذا كان نوع الطلب هو recovery (إعادة تعيين كلمة المرور)
    // Supabase قد يرسل إما code أو access_token بناءً على نوع التحقق
    if (type === 'recovery' && (code || accessToken)) {
      // بناء رابط إعادة التوجيه إلى الصفحة الرئيسية مع معلمة تنبيه
      const dashboardUrl = new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'https://medicalapp-teal.vercel.app')
      
      // إضافة معلمة تدل على ضرورة تغيير كلمة المرور
      dashboardUrl.searchParams.append('reset_password', 'true')
      
      // إضافة المعلمات المطلوبة لإعداد الجلسة إذا كانت موجودة
      if (accessToken) {
        dashboardUrl.searchParams.append('access_token', accessToken)
      }
      if (refreshToken) {
        dashboardUrl.searchParams.append('refresh_token', refreshToken)
      }
      if (code) {
        dashboardUrl.searchParams.append('code', code)
      }
      
      console.log('Redirecting to dashboard with reset password flag:', dashboardUrl.toString())
      
      // إعادة التوجيه إلى الصفحة الرئيسية مع تنبيه تغيير كلمة المرور
      return NextResponse.redirect(dashboardUrl)
    }
    
    // التحقق من حالة تسجيل الدخول العادي
    if (code && !type) {
      // هذا تسجيل دخول عادي، التوجيه إلى لوحة التحكم
      console.log('Regular login callback, redirecting to dashboard')
      return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'https://medicalapp-teal.vercel.app'))
    }
    
    // في حالة عدم وجود معلمات صالحة، إعادة التوجيه إلى الصفحة الرئيسية
    console.log('No valid auth tokens found, redirecting to home page')
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'https://medicalapp-teal.vercel.app'))
    
  } catch (error) {
    console.error('Error in auth callback:', error)
    
    // في حالة حدوث خطأ، إعادة التوجيه إلى الصفحة الرئيسية
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'https://medicalapp-teal.vercel.app'))
  }
}