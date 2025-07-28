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
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

// CSRF protection
function validateCSRFToken(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  // In production, implement proper CSRF token validation
  // For now, basic origin check
  if (origin && !origin.includes('localhost') && !origin.includes('your-domain.com')) {
    return false
  }
  
  return true
}

export async function POST(request: NextRequest) {
  try {
    console.log('Analyze API called');
    
    // Rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة لاحقاً.' },
        { status: 429 }
      )
    }

    // CSRF protection
    if (!validateCSRFToken(request)) {
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
        { error: 'لم يتم إرسال ملف' },
        { status: 400 }
      )
    }

    // Validate file size on server side
    const fileSizeInBytes = Math.ceil((imageBase64.length * 3) / 4)
    const maxSizeInBytes = 10 * 1024 * 1024 // 10MB (increased for PDF)
    
    if (fileSizeInBytes > maxSizeInBytes) {
      return NextResponse.json(
        { error: 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت.' },
        { status: 400 }
      )
    }

    const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
    console.log('Google Gemini API Key available:', !!GOOGLE_GEMINI_API_KEY);

    if (!GOOGLE_GEMINI_API_KEY) {
      console.log('No Google Gemini API key found');
      return NextResponse.json(
        { error: 'مفتاح Google Gemini API غير متوفر' },
        { status: 500 }
      )
    }

    console.log('Calling Google Gemini API...');
    
    // Determine MIME type based on file type
    const mimeType = fileType === 'application/pdf' ? 'application/pdf' : 'image/jpeg'
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
      throw new Error(`Google Gemini API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Analysis completed successfully');

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'لم يتمكن من تحليل الملف';

    return NextResponse.json({
      result,
      recommendations: result
    })

  } catch (error: any) {
    console.error('Analysis error:', error);
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التحليل. حاول مرة أخرى لاحقاً.' },
      { status: 500 }
    )
  }
} 