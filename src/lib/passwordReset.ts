import { createClient } from '@supabase/supabase-js'
import { sendEmail, createPasswordResetTemplate } from './emailService'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Generate 6-digit random code
export function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Store reset code in database
export async function storeResetCode(email: string, code: string) {
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 15) // 15 minutes from now

  const { error } = await supabase
    .from('password_reset_codes')
    .insert({
      email: email.toLowerCase(),
      code,
      expires_at: expiresAt.toISOString(),
      used: false
    })

  if (error) {
    console.error('Error storing reset code:', error)
    throw new Error('فشل في حفظ كود إعادة التعيين')
  }

  return true
}

// Verify reset code (without marking as used)
export async function checkResetCode(email: string, code: string) {
  const { data, error } = await supabase
    .from('password_reset_codes')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('code', code)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  return !error && data
}

// Verify reset code and mark as used (for final password reset)
export async function verifyResetCode(email: string, code: string) {
  const { data, error } = await supabase
    .from('password_reset_codes')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('code', code)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !data) {
    return false
  }

  // Mark code as used (only when password is actually being reset)
  await supabase
    .from('password_reset_codes')
    .update({ used: true })
    .eq('id', data.id)

  return true
}

// Send reset password email using Supabase only (no code)
export async function sendResetPasswordEmail(email: string) {
  // Get the site URL from environment or use Vercel URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://medicalapp-teal.vercel.app'
  
  // Use Supabase built-in method to send reset link with custom redirect URL
  const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
    redirectTo: `${siteUrl}/reset-password`
  })
  
  if (error) {
    console.error('❌ فشل في إرسال رابط إعادة تعيين كلمة المرور:', error)
    throw new Error('فشل في إرسال رابط إعادة تعيين كلمة المرور')
  }
  // For development
  console.log('📧 تم إرسال رابط إعادة تعيين كلمة المرور عبر Supabase')
  console.log('🔗 رابط إعادة التوجيه:', `${siteUrl}/reset-password`)
  return true
}

// Reset user password directly in Supabase Auth
export async function resetUserPassword(email: string, newPassword: string) {
  try {
    console.log(`🔄 تحديث كلمة المرور لـ: ${email}`)
    console.log(`🔐 كلمة المرور الجديدة: ${newPassword}`)
    
    // البحث عن المستخدم في قاعدة البيانات أولاً
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('email', email.toLowerCase())
      .single()

    if (profileError || !profile) {
      console.error('❌ المستخدم غير موجود في الملفات الشخصية:', profileError)
      throw new Error('البريد الإلكتروني غير مسجل في النظام')
    }

    console.log('✅ تم العثور على الملف الشخصي:', profile.full_name)

    // استخدام API endpoint الجديد لإعادة تعيين كلمة المرور
    const response = await fetch('/api/password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.toLowerCase(),
        code: 'verified', // الكود تم التحقق منه مسبقاً
        newPassword: newPassword
      })
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('❌ خطأ من API:', result.error)
      throw new Error(result.error || 'فشل في تحديث كلمة المرور')
    }

    console.log('✅ تم تحديث كلمة المرور بنجاح عبر API')
    console.log('🎉 العملية مكتملة!')

    return true
  } catch (error) {
    console.error('❌ خطأ في resetUserPassword:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('فشل في تحديث كلمة المرور - يرجى المحاولة مرة أخرى')
  }
} 