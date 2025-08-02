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
    
    // سجل المعلمات للتصحيح
    console.log('Auth callback received:', {
      code: code ? 'present' : 'missing',
      type,
      allParams: Object.fromEntries(searchParams.entries())
    })
    
    // إذا كان نوع الطلب هو recovery (إعادة تعيين كلمة المرور)
    if (type === 'recovery' && code) {
      // بناء رابط إعادة التوجيه مع الحفاظ على جميع المعلمات
      const resetPasswordUrl = new URL('/reset-password', process.env.NEXT_PUBLIC_SITE_URL || 'https://medicalapp-teal.vercel.app')
      
      // نقل جميع المعلمات إلى الرابط الجديد
      searchParams.forEach((value, key) => {
        resetPasswordUrl.searchParams.append(key, value)
      })
      
      console.log('Redirecting to:', resetPasswordUrl.toString())
      
      // إعادة التوجيه إلى صفحة إعادة تعيين كلمة المرور
      return NextResponse.redirect(resetPasswordUrl)
    }
    
    // في حالة عدم وجود رموز إعادة تعيين كلمة المرور، إعادة التوجيه إلى الصفحة الرئيسية
    console.log('No recovery tokens found, redirecting to home page')
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'https://medicalapp-teal.vercel.app'))
    
  } catch (error) {
    console.error('Error in auth callback:', error)
    
    // في حالة حدوث خطأ، إعادة التوجيه إلى الصفحة الرئيسية
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'https://medicalapp-teal.vercel.app'))
  }
}