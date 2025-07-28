import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// إنشاء Supabase client عادي
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// إنشاء Supabase admin client إذا كان service role key متاحاً
let supabaseAdmin: SupabaseClient | null = null
if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json()

    console.log('🔍 API: معالجة طلب إعادة تعيين كلمة المرور')
    console.log('📧 البريد الإلكتروني المستلم:', email)
    console.log('🔐 الكود المستلم:', code)
    console.log('🔒 كلمة المرور الجديدة موجودة:', !!newPassword)

    if (!email || !code || !newPassword) {
      console.log('❌ بيانات مفقودة - البريد:', !!email, '- الكود:', !!code, '- كلمة المرور:', !!newPassword)
      return NextResponse.json(
        { error: 'البريد الإلكتروني والكود وكلمة المرور الجديدة مطلوبة' },
        { status: 400 }
      )
    }

    console.log(`🔍 API: معالجة طلب إعادة تعيين كلمة المرور لـ: ${email}`)

    // التحقق من صحة الكود
    console.log('🔎 البحث عن الكود في قاعدة البيانات...')
    const { data: resetCodeData, error: codeError } = await supabaseClient
      .from('password_reset_codes')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    console.log('📊 نتيجة البحث عن الكود:')
    console.log('- خطأ:', codeError?.message || 'لا يوجد')
    console.log('- البيانات موجودة:', !!resetCodeData)
    if (resetCodeData) {
      console.log('- تاريخ انتهاء الصلاحية:', resetCodeData.expires_at)
      console.log('- الكود مستخدم:', resetCodeData.used)
      console.log('- الوقت الحالي:', new Date().toISOString())
    }

    // إضافة تحقق إضافي من وجود كودات أخرى
    const { data: allCodes, error: allCodesError } = await supabaseClient
      .from('password_reset_codes')
      .select('*')
      .eq('email', email.toLowerCase())
      .order('created_at', { ascending: false })

    console.log('📋 جميع الكودات لهذا البريد:', allCodes?.length || 0)
    if (allCodes && allCodes.length > 0) {
      allCodes.forEach((codeData, index) => {
        console.log(`- كود ${index + 1}: ${codeData.code}, مستخدم: ${codeData.used}, ينتهي: ${codeData.expires_at}`)
      })
    }

    if (codeError || !resetCodeData) {
      console.log('❌ كود غير صحيح أو منتهي الصلاحية')
      return NextResponse.json(
        { error: 'رمز التحقق غير صحيح أو منتهي الصلاحية' },
        { status: 400 }
      )
    }

    console.log('✅ تم التحقق من صحة الكود')

    // البحث عن المستخدم في الملفات الشخصية
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('email', email.toLowerCase())
      .single()

    if (profileError || !profile) {
      console.log('⚠️ المستخدم غير موجود في الملفات الشخصية')
      console.log('💡 في وضع التطوير: تخطي التحقق من الملف الشخصي والمتابعة')
      console.log('🔧 هذا يحدث عادة عندما يكون المستخدم موجود في auth ولكن لم يُحفظ في profiles')
    } else {
      console.log('✅ تم العثور على المستخدم:', profile.full_name)
    }

    // محاولة تحديث كلمة المرور بطرق مختلفة
    let updateSuccess = false
    let updateMethod = ''

    // الطريقة الأولى: استخدام Admin API إذا كان متاحاً
    if (supabaseAdmin && !updateSuccess) {
      try {
        console.log('🔧 محاولة تحديث كلمة المرور باستخدام Admin API...')
        
        // البحث عن المستخدم في auth
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        
        if (!listError) {
          const authUser = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())
          
          if (authUser) {
            console.log('✅ تم العثور على المستخدم في auth:', authUser.email)
            
            // تحديث كلمة المرور
            const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
              authUser.id,
              { 
                password: newPassword,
                email_confirm: true
              }
            )
            
            if (!updateError) {
              console.log('✅ تم تحديث كلمة المرور باستخدام Admin API')
              updateSuccess = true
              updateMethod = 'admin_api'
            } else {
              console.log('⚠️ فشل في Admin API:', updateError.message)
            }
          } else {
            console.log('❌ المستخدم غير موجود في نظام auth')
          }
        } else {
          console.log('⚠️ فشل في البحث عن المستخدمين:', listError.message)
        }
      } catch (error) {
        console.log('⚠️ خطأ في Admin API:', error)
      }
    }

    // الطريقة الثانية: محاولة تحديث كلمة المرور المباشر
    if (!updateSuccess) {
      try {
        const { data: updateData, error: updateError } = await supabaseClient.auth.updateUser({
          password: newPassword
        })

        if (!updateError) {
          console.log('✅ تم تحديث كلمة المرور بنجاح (الطريقة المباشرة)')
          updateSuccess = true
          updateMethod = 'direct_update'
        } else {
          console.log('⚠️ الطريقة المباشرة لم تنجح:', updateError.message)
        }
      } catch (error) {
        console.log('⚠️ خطأ في الطريقة المباشرة:', error)
      }
    }

    // الطريقة الثالثة: استخدام SQL function لتحديث كلمة المرور مباشرة
    if (!updateSuccess) {
      try {
        console.log('🔧 محاولة تحديث كلمة المرور باستخدام SQL function...')
        
        // استدعاء SQL function لتحديث كلمة المرور
        const { data: sqlResult, error: sqlError } = await supabaseClient.rpc('update_user_password', {
          user_email: email.toLowerCase(),
          new_password: newPassword
        })

        if (!sqlError && sqlResult) {
          console.log('✅ تم تحديث كلمة المرور باستخدام SQL function')
          updateSuccess = true
          updateMethod = 'sql_function'
        } else {
          console.log('⚠️ فشل في SQL function:', sqlError?.message || 'لم يتم العثور على المستخدم')
        }
      } catch (error) {
        console.log('⚠️ خطأ في SQL function:', error)
      }
    }

    // الطريقة الرابعة: استخدام resetPasswordForEmail (أقل فعالية)
    if (!updateSuccess) {
      try {
        const { error: resetError } = await supabaseClient.auth.resetPasswordForEmail(
          email.toLowerCase(),
          {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password-confirm`
          }
        )

        if (!resetError) {
          console.log('📧 تم إرسال رابط إعادة تعيين (الطريقة الأخيرة)')
          updateMethod = 'email_link'
          // لا نعتبر هذا نجاح حقيقي لأنه لا يحدث كلمة المرور مباشرة
        } else {
          console.log('⚠️ الطريقة الأخيرة لم تنجح:', resetError.message)
        }
      } catch (error) {
        console.log('⚠️ خطأ في الطريقة الأخيرة:', error)
      }
    }

    // إذا فشلت جميع الطرق
    if (!updateSuccess) {
      console.log('❌ فشل في تحديث كلمة المرور بجميع الطرق')
      console.log('🔧 يحتاج النظام إلى:')
      console.log('   1. Supabase Service Role Key في متغيرات البيئة')
      console.log('   2. أو تشغيل SQL function في قاعدة البيانات')
      console.log('   3. أو استخدام نظام إعادة تعيين كلمة المرور التقليدي')
      
      return NextResponse.json(
        { 
          error: 'فشل في تحديث كلمة المرور. يرجى استخدام خيار "نسيت كلمة المرور" من صفحة تسجيل الدخول العادية، أو الاتصال بالدعم الفني.',
          technical_info: 'System requires admin privileges or SQL function to update passwords directly',
          suggestions: [
            'استخدم خيار "نسيت كلمة المرور" التقليدي',
            'تواصل مع الدعم الفني',
            'تحقق من إعدادات Supabase'
          ]
        },
        { status: 500 }
      )
    }

    // نجحت العملية
    if (updateSuccess) {
      // تحديد الكود كمستخدم
      await supabaseClient
        .from('password_reset_codes')
        .update({ used: true })
        .eq('id', resetCodeData.id)

      console.log('🧹 تم وضع علامة على الكود كمستخدم')

      // تنظيف جميع الكودات القديمة لهذا المستخدم
      await supabaseClient
        .from('password_reset_codes')
        .delete()
        .eq('email', email.toLowerCase())
        .neq('id', resetCodeData.id)

      console.log('🧹 تم تنظيف الكودات القديمة')
      console.log(`🎉 تم تحديث كلمة المرور بنجاح باستخدام: ${updateMethod}`)

      return NextResponse.json({
        success: true,
        message: 'تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
        method: updateMethod
      })
    }

  } catch (error) {
    console.error('❌ خطأ في API:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم - يرجى المحاولة مرة أخرى' },
      { status: 500 }
    )
  }
} 