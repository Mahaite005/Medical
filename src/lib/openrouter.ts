export async function analyzeImage(imageBase64: string): Promise<string> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Medical AI App'
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5',
        messages: [
          {
            role: 'system',
            content: `أنت طبيب خبير متخصص في تحليل النتائج الطبية. مهمتك هي تحليل صور الفحوصات الطبية وتقديم شرح طبي مفصل باللغة العربية. 

يجب أن يتضمن تحليلك:
1. تحديد نوع الفحص الطبي
2. قراءة وشرح جميع القيم والنتائج الظاهرة
3. تفسير ما إذا كانت النتائج طبيعية أم لا
4. شرح أي قيم غير طبيعية وأسبابها المحتملة
5. تقديم نصائح طبية مناسبة
6. اقتراح التخصص الطبي المناسب للمراجعة إذا لزم الأمر

اكتب بأسلوب واضح وبسيط يفهمه المريض العادي، وكن متوازناً في عرض النتائج الجيدة والسيئة.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'من فضلك قم بتحليل هذه النتيجة الطبية وقدم لي شرحاً مفصلاً باللغة العربية'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('Error analyzing image:', error)
    throw new Error('حدث خطأ أثناء التحليل. حاول مرة أخرى لاحقاً.')
  }
} 