import { NextRequest, NextResponse } from 'next/server'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting function
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 10 // max 10 requests per minute

  const record = rateLimitStore.get(ip)
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs })
    if (process.env.NODE_ENV === 'development') {
      console.log('Rate limit: New record for IP:', ip)
    }
    return true
  }

  if (record.count >= maxRequests) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Rate limit: Exceeded for IP:', ip, 'Count:', record.count)
    }
    return false
  }

  record.count++
  if (process.env.NODE_ENV === 'development') {
    console.log('Rate limit: Incremented for IP:', ip, 'Count:', record.count)
  }
  return true
}

// CSRF protection (محسّن)
function validateCSRFToken(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  // في development mode فقط، اطبع التفاصيل
  if (process.env.NODE_ENV === 'development') {
    console.log('Validating CSRF - Origin:', origin, 'Referer:', referer)
  }
  
  // قائمة بالـ domains المسموحة
  const allowedDomains = [
    'localhost',
    '127.0.0.1',
    'medicalapp-teal.vercel.app',
    'medical-sage-nine.vercel.app',
    'medical-git-website-updates-mahaite005s-projects.vercel.app',
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/https?:\/\//, '') || ''
  ].filter(Boolean)
  
  // التحقق من الـ origin
  if (origin) {
    const isAllowed = allowedDomains.some(domain => origin.includes(domain)) || 
                     origin.includes('vercel.app') // للسماح بجميع subdomains على Vercel
    if (!isAllowed) {
      if (process.env.NODE_ENV === 'development') {
        console.log('CSRF validation failed - Origin not allowed:', origin)
      }
      return false
    }
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('CSRF validation passed')
  }
  return true
}

export async function POST(request: NextRequest) {
  let timeoutId: NodeJS.Timeout | undefined;
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Analyze API called');
      // Log request details for debugging
      console.log('Request origin:', request.headers.get('origin'));
      console.log('Request referer:', request.headers.get('referer'));
      console.log('Request IP:', request.headers.get('x-forwarded-for'));
    }
    
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) {
      console.log('Rate limit exceeded for IP:', ip);
      return NextResponse.json(
        { error: 'تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة لاحقاً.' },
        { status: 429 }
      )
    }

    // CSRF protection
    if (!validateCSRFToken(request)) {
      console.log('CSRF validation failed');
      return NextResponse.json(
        { error: 'طلب غير صالح' },
        { status: 403 }
      )
    }
    
    const { imageBase64, fileType } = await request.json()
    console.log('Received file data length:', imageBase64?.length);
    console.log('File type:', fileType);

    if (!imageBase64) {
      console.log('No file provided');
      return NextResponse.json(
        { error: 'لم يتم إرسال ملف. يرجى اختيار ملف صحيح.' },
        { status: 400 }
      )
    }

    // Validate file size on server side
    const fileSizeInBytes = Math.ceil((imageBase64.length * 3) / 4)
    const maxSizeInBytes = fileType === 'application/pdf' ? 5 * 1024 * 1024 : 10 * 1024 * 1024 // 5MB for PDF, 10MB for images
    
    if (fileSizeInBytes > maxSizeInBytes) {
      console.log('File too large:', fileSizeInBytes, 'bytes');
      const maxSizeMB = fileType === 'application/pdf' ? 5 : 10;
      return NextResponse.json(
        { error: `حجم الملف كبير جداً. الحد الأقصى ${maxSizeMB} ميجابايت. يرجى اختيار ملف أصغر.` },
        { status: 400 }
      )
    }

    const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
    console.log('Google Gemini API Key available:', !!GOOGLE_GEMINI_API_KEY);

    if (!GOOGLE_GEMINI_API_KEY) {
      console.log('No Google Gemini API key found');
      return NextResponse.json(
        { error: 'مفتاح Google Gemini API غير متوفر. يرجى التحقق من إعدادات الخادم.' },
        { status: 500 }
      )
    }

    console.log('Calling Google Gemini API...');
    
    // Determine MIME type based on file type
    const mimeType = fileType === 'application/pdf' ? 'application/pdf' : 'image/jpeg'
    
    // Set timeout for PDF files to be longer
    const timeout = fileType === 'application/pdf' ? 60000 : 30000; // 60s for PDF, 30s for images
    
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `أنت طبيب خبير متخصص في تحليل النتائج الطبية. مهمتك هي تحليل ${fileType === 'application/pdf' ? 'ملفات PDF' : 'صور'} الفحوصات الطبية وتقديم شرح طبي مفصل باللغة العربية. 

يجب أن يتضمن تحليلك:
1. تحديد نوع الفحص الطبي
2. قراءة وشرح جميع القيم والنتائج الظاهرة
3. تفسير ما إذا كانت النتائج طبيعية أم لا
4. شرح أي قيم غير طبيعية وأسبابها المحتملة
5. تقديم نصائح طبية مناسبة
6. اقتراح التخصص الطبي المناسب للمراجعة إذا لزم الأمر

${fileType === 'application/pdf' ? 'إذا كان الملف يحتوي على عدة صفحات، قم بتحليل جميع الصفحات التي تحتوي على نتائج طبية.' : ''}

اكتب بأسلوب واضح وبسيط يفهمه المريض العادي، وكن متوازناً في عرض النتائج الجيدة والسيئة.

من فضلك قم بتحليل هذه النتيجة الطبية وقدم لي شرحاً مفصلاً باللغة العربية:`
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    })

    console.log('Google Gemini response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Google Gemini error:', errorText);
      
      // Provide more specific error messages based on status code
      let errorMessage = 'حدث خطأ أثناء تحليل الملف'
      if (response.status === 400) {
        errorMessage = 'الملف غير صالح أو غير مدعوم'
      } else if (response.status === 401) {
        errorMessage = 'مفتاح API غير صالح'
      } else if (response.status === 403) {
        errorMessage = 'غير مسموح بالوصول إلى خدمة التحليل'
      } else if (response.status === 429) {
        errorMessage = 'تم تجاوز حد الاستخدام. يرجى المحاولة لاحقاً'
      } else if (response.status === 504) {
        errorMessage = 'انتهت مهلة التحليل. الملف كبير جداً أو يحتوي على صفحات كثيرة. يرجى اختيار ملف أصغر أو تقليل عدد الصفحات.'
      } else if (response.status >= 500) {
        errorMessage = 'خطأ في الخادم. يرجى المحاولة لاحقاً'
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Analysis completed successfully');
    
    // Clear timeout since request completed successfully
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'لم يتمكن من تحليل الملف';

    return NextResponse.json({
      result,
      recommendations: result
    })

  } catch (error: any) {
    console.error('Analysis error:', error);
    
    // Clear timeout if it exists
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
    
    // Log more details about the error
    if (error.message) {
      console.error('Error message:', error.message);
    }
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    // Handle timeout errors specifically
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'انتهت مهلة التحليل. الملف كبير جداً أو يحتوي على صفحات كثيرة. يرجى اختيار ملف أصغر أو تقليل عدد الصفحات.' },
        { status: 504 }
      )
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التحليل. حاول مرة أخرى لاحقاً.' },
      { status: 500 }
    )
  }
} 