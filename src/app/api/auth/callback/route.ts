import { NextRequest, NextResponse } from 'next/server'

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
      // بناء رابط إعادة التوجيه مع الحفاظ على جميع المعلمات
      const resetPasswordUrl = new URL('/reset-password', process.env.NEXT_PUBLIC_SITE_URL || 'https://medicalapp-teal.vercel.app')
      
      // نقل جميع المعلمات إلى الرابط الجديد
      searchParams.forEach((value, key) => {
        resetPasswordUrl.searchParams.append(key, value)
      })
      
      console.log('Redirecting to reset password page:', resetPasswordUrl.toString())
      
      // إعادة التوجيه إلى صفحة إعادة تعيين كلمة المرور
      return NextResponse.redirect(resetPasswordUrl)
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