// خدمة إرسال البريد الإلكتروني
// يمكن تكاملها مع خدمات مثل EmailJS، SendGrid، Mailgun، إلخ

interface EmailTemplate {
  to: string
  subject: string
  html: string
  code?: string
}

// إرسال بريد إلكتروني باستخدام EmailJS (للتطوير)
export async function sendEmailWithEmailJS(emailData: EmailTemplate) {
  try {
    // للتطوير: نعرض الكود في console
    console.log('📧 إرسال بريد إلكتروني...')
    console.log('📮 إلى:', emailData.to)
    console.log('📝 الموضوع:', emailData.subject)
    if (emailData.code) {
      console.log('🔐 رمز التحقق:', emailData.code)
    }

    // في الإنتاج، استخدم EmailJS أو خدمة أخرى
    // const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     service_id: 'YOUR_SERVICE_ID',
    //     template_id: 'YOUR_TEMPLATE_ID',
    //     user_id: 'YOUR_USER_ID',
    //     template_params: {
    //       to_email: emailData.to,
    //       subject: emailData.subject,
    //       message: emailData.html,
    //       verification_code: emailData.code
    //     }
    //   })
    // })

    // للتطوير: محاكاة إرسال ناجح
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('✅ تم إرسال البريد الإلكتروني بنجاح (محاكاة)')
    return { success: true, message: 'تم إرسال البريد الإلكتروني' }

  } catch (error) {
    console.error('❌ خطأ في إرسال البريد الإلكتروني:', error)
    return { success: false, error: 'فشل في إرسال البريد الإلكتروني' }
  }
}

// إرسال بريد إلكتروني باستخدام Supabase Edge Functions (متقدم)
export async function sendEmailWithSupabase(emailData: EmailTemplate) {
  try {
    // للتطوير: نعرض المعلومات في console
    console.log('📧 إرسال بريد إلكتروني عبر Supabase...')
    console.log('📮 إلى:', emailData.to)
    
    // في الإنتاج، يمكن استخدام Supabase Edge Function
    // const response = await fetch('/api/send-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(emailData)
    // })

    // للتطوير: محاكاة إرسال ناجح
    console.log('✅ تم إرسال البريد الإلكتروني عبر Supabase (محاكاة)')
    return { success: true }

  } catch (error) {
    console.error('❌ خطأ في إرسال البريد الإلكتروني:', error)
    return { success: false, error: 'فشل في إرسال البريد الإلكتروني' }
  }
}

// دالة موحدة لإرسال البريد الإلكتروني
export async function sendEmail(emailData: EmailTemplate) {
  // في التطوير: استخدم EmailJS
  // في الإنتاج: يمكن تغيير هذا إلى خدمة أخرى
  return await sendEmailWithEmailJS(emailData)
}

// إنشاء قالب البريد الإلكتروني لإعادة تعيين كلمة المرور
export function createPasswordResetTemplate(email: string, code: string): EmailTemplate {
  const subject = 'رمز إعادة تعيين كلمة المرور - المختبر الرقمي'
  
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f8fafc;
                color: #334155;
                direction: rtl;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                padding: 40px 30px;
                text-align: center;
                color: white;
            }
            .logo {
                font-size: 48px;
                margin-bottom: 16px;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
            }
            .content {
                padding: 40px 30px;
            }
            .code-container {
                background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
                border-radius: 16px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
                border: 2px solid #e2e8f0;
            }
            .verification-code {
                font-size: 48px;
                font-weight: 900;
                color: #1d4ed8;
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
                background: white;
                padding: 20px;
                border-radius: 12px;
                display: inline-block;
                border: 3px solid #3b82f6;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
            }
            .message {
                font-size: 16px;
                line-height: 1.6;
                color: #475569;
                margin-bottom: 20px;
            }
            .footer {
                background-color: #f1f5f9;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
                font-size: 14px;
                color: #64748b;
            }
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
                <div class="message">
                    مرحباً بك،<br><br>
                    تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. 
                    يرجى استخدام رمز التحقق التالي:
                </div>
                
                <div class="code-container">
                    <div class="verification-code">${code}</div>
                    <p style="margin-top: 15px; color: #f59e0b; font-weight: 600;">
                        ⏱ ينتهي صلاحية هذا الرمز خلال 15 دقيقة
                    </p>
                </div>
                
                <div class="message">
                    إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذه الرسالة.
                </div>
            </div>
            
            <div class="footer">
                شكراً لاستخدامك المختبر الرقمي<br>
                فريق التطوير والدعم الفني
            </div>
        </div>
    </body>
    </html>
  `

  return {
    to: email,
    subject,
    html,
    code
  }
} 