import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createPasswordResetTemplate, sendEmail } from '@/lib/emailService'

// إجبار هذا الـ route على أن يكون dynamic
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      )
    }

    // Get the site URL from environment or use Vercel URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medicalapp-teal.vercel.app'
    
    // Generate a custom reset token
    const resetToken = await generateCustomResetToken(email)
    
    if (!resetToken) {
      return NextResponse.json(
        { error: 'فشل في إنشاء رمز إعادة التعيين' },
        { status: 500 }
      )
    }

    // Create custom reset link with correct Vercel URL
    const resetLink = `${siteUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`
    
    // Send custom email with correct URL
    const emailTemplate = createCustomResetEmailTemplate(email, resetLink)
    const emailResult = await sendEmail(emailTemplate)
    
    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'فشل في إرسال البريد الإلكتروني' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور بنجاح',
      info: 'يرجى التحقق من بريدك الإلكتروني (والبريد المزعج)'
    })

  } catch (error) {
    console.error('Password reset API error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// Generate custom reset token
async function generateCustomResetToken(email: string): Promise<string | null> {
  try {
    // Use Supabase's internal method to generate a proper reset token
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://medicalapp-teal.vercel.app'}/reset-password`
    })
    
    if (error) {
      console.error('Error generating reset token:', error)
      return null
    }
    
    // For now, we'll use a simple token generation
    // In production, you might want to use a more secure method
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    // Store the token in database for verification
    const { error: dbError } = await supabase
      .from('password_reset_tokens')
      .insert({
        email: email.toLowerCase(),
        token: token,
        expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour
        used: false
      })
    
    if (dbError) {
      console.error('Error storing reset token:', dbError)
      return null
    }
    
    return token
  } catch (error) {
    console.error('Error in generateCustomResetToken:', error)
    return null
  }
}

// Create custom email template with correct URL
function createCustomResetEmailTemplate(email: string, resetLink: string) {
      const subject = 'إعادة تعيين كلمة المرور - المختبر الرقمي'
  
  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>إعادة تعيين كلمة المرور - المختبر الرقمي</title>
      <style>
        body { background: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; margin: 0; padding: 0; direction: rtl; }
        .container { max-width: 500px; margin: 40px auto; background: #fff; border-radius: 16px; box-shadow: 0 8px 32px rgba(30, 64, 175, 0.08); overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #fff; text-align: center; padding: 32px 24px 16px 24px; }
        .header .logo { font-size: 48px; margin-bottom: 8px; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 700; }
        .content { padding: 32px 24px; text-align: right; }
        .content h2 { color: #1d4ed8; font-size: 22px; margin-bottom: 12px; }
        .content p { font-size: 16px; margin-bottom: 18px; color: #475569; }
        .reset-link { display: block; width: fit-content; margin: 24px auto; background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%); color: #fff !important; text-decoration: none; font-size: 18px; font-weight: 700; padding: 14px 36px; border-radius: 8px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.12); transition: background 0.2s; }
        .reset-link:hover { background: linear-gradient(90deg, #1d4ed8 0%, #3b82f6 100%); }
        .footer { background: #f1f5f9; color: #64748b; text-align: center; padding: 18px 0; font-size: 14px; border-top: 1px solid #e2e8f0; }
        @media (max-width: 600px) { .container, .content, .header { padding: 16px !important; } .reset-link { font-size: 16px; padding: 12px 18px; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🩺</div>
          <h1>المختبر الرقمي</h1>
          <p>منصة التحليل الطبي الذكي</p>
        </div>
        <div class="content">
          <h2>إعادة تعيين كلمة المرور</h2>
          <p>
            لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.<br>
            إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة بأمان.
          </p>
          <!-- الزر مع الرابط الصحيح -->
          <a class="reset-link" href="${resetLink}">
            اضغط هنا لإعادة تعيين كلمة المرور
          </a>
          <p>
            إذا لم يعمل الزر أعلاه، يمكنك نسخ الرابط التالي ولصقه في متصفحك:<br>
            <span style="color:#1d4ed8;word-break:break-all;">${resetLink}</span>
          </p>
          <p style="color:#f59e0b;font-size:15px;">
            ⚠️ لأمانك: لا تشارك هذا الرابط مع أي شخص آخر. ينتهي صلاحية الرابط تلقائياً بعد ساعة واحدة.
          </p>
        </div>
        <div class="footer">
          فريق الدعم الفني - المختبر الرقمي<br>
          جميع الحقوق محفوظة &copy; 2024
        </div>
      </div>
    </body>
    </html>
  `

  return {
    to: email,
    subject,
    html
  }
} 