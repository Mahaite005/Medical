// دالة للتواصل مع Gemini API
async function callGeminiAPI(messages: any[]) {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GOOGLE_GEMINI_API_KEY || ''
      },
      body: JSON.stringify({
        contents: messages.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          temperature: 0.3,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    throw error
  }
}

export interface HealthAnalysisRequest {
  profile: any
  healthMetrics: any[]
  medicalHistory: any[]
}

export interface HealthAnalysisResponse {
  summary: string
  recommendations: string[]
  riskFactors: string[]
  lifestyleTips: string[]
  nextSteps: string[]
}

export async function analyzeHealthData(request: HealthAnalysisRequest): Promise<HealthAnalysisResponse> {
  try {
    console.log('بدء تحليل البيانات الصحية...')
    
    // تحليل مفصل لبيانات المريض
    const patientAnalysis = analyzePatientProfile(request.profile)
    console.log('تحليل بيانات المريض:', patientAnalysis)
    
    // تحليل مفصل للسجل الطبي
    const medicalHistoryAnalysis = analyzeMedicalHistory(request.medicalHistory)
    console.log('تحليل السجل الطبي:', medicalHistoryAnalysis)
    
    // تحليل المؤشرات الصحية
    const metricsAnalysis = analyzeHealthMetrics(request.healthMetrics)
    console.log('تحليل المؤشرات الصحية:', metricsAnalysis)
    
    // إنشاء تحليل محلي بدلاً من الاعتماد على API الخارجي
    const localAnalysis = generateLocalAnalysis(request.profile, request.healthMetrics, request.medicalHistory, patientAnalysis, medicalHistoryAnalysis, metricsAnalysis)
    
    console.log('التحليل المحلي:', localAnalysis)
    return localAnalysis
    
  } catch (error) {
    console.error('خطأ في تحليل البيانات الصحية:', error)
    // إرجاع تحليل بديل في حالة الخطأ
    return generateLocalAnalysis(request.profile, request.healthMetrics, request.medicalHistory, analyzePatientProfile(request.profile), analyzeMedicalHistory(request.medicalHistory), analyzeHealthMetrics(request.healthMetrics))
  }
}

// دوال مساعدة لإنشاء التحليل
function generateLocalAnalysis(profile: any, healthMetrics: any[], medicalHistory: any[], patientAnalysis: any, medicalHistoryAnalysis: any, metricsAnalysis: any): HealthAnalysisResponse {
  const summary = generateSummary(profile, healthMetrics, medicalHistory, patientAnalysis, medicalHistoryAnalysis, metricsAnalysis)
  const recommendations = generateRecommendations(profile, healthMetrics, medicalHistory, patientAnalysis, medicalHistoryAnalysis, metricsAnalysis)
  const riskFactors = generateRiskFactors(profile, healthMetrics, medicalHistory, patientAnalysis, medicalHistoryAnalysis, metricsAnalysis)
  const lifestyleTips = generateLifestyleTips(profile, healthMetrics, medicalHistory, patientAnalysis, medicalHistoryAnalysis, metricsAnalysis)
  const nextSteps = generateNextSteps(profile, healthMetrics, medicalHistory, patientAnalysis, medicalHistoryAnalysis, metricsAnalysis)
  
  return {
    summary,
    recommendations,
    riskFactors,
    lifestyleTips,
    nextSteps
  }
}

// Rest of your existing functions...
function generateSummary(profile: any, healthMetrics: any[], medicalHistory: any[], patientAnalysis: any, medicalHistoryAnalysis: any, metricsAnalysis: any): string {
  const age = profile?.age || 'غير محدد'
  const gender = profile?.gender || 'غير محدد'
  const chronicDiseases = profile?.chronic_diseases || 'لا توجد'
  const isSmoker = profile?.is_smoker
  const normalMetrics = metricsAnalysis.normalMetrics.length
  const dangerMetrics = metricsAnalysis.dangerMetrics.length
  const totalTests = medicalHistoryAnalysis.totalTests
  
  let summary = `بناءً على تحليل شامل لبيانات المريض، العمر: ${age} سنة، الجنس: ${gender}، `
  
  if (chronicDiseases !== 'لا توجد') {
    summary += `والأمراض المزمنة: ${chronicDiseases}، `
  }
  
  if (isSmoker) {
    summary += `مع وجود عامل خطر التدخين، `
  }
  
  summary += `يبدو أن الحالة الصحية ${dangerMetrics > 0 ? 'تحتاج مراقبة خاصة' : normalMetrics > 0 ? 'جيدة نسبياً' : 'متوسطة'}. `
  
  summary += `تم إجراء ${totalTests} فحص طبي، و${normalMetrics} مؤشر صحي طبيعي.`
  
  return summary
}

function generateRecommendations(profile: any, healthMetrics: any[], medicalHistory: any[], patientAnalysis: any, medicalHistoryAnalysis: any, metricsAnalysis: any): string[] {
  const recommendations = []
  
  if (profile?.is_smoker) {
    recommendations.push('الإقلاع عن التدخين فوراً')
  }
  
  if (profile?.chronic_diseases) {
    recommendations.push('متابعة دورية مع الطبيب المختص')
  }
  
  if (metricsAnalysis.dangerMetrics.length > 0) {
    recommendations.push('مراجعة طبية عاجلة للمؤشرات الخطرة')
  }
  
  if (medicalHistoryAnalysis.totalTests === 0) {
    recommendations.push('إجراء فحوصات طبية أساسية')
  }
  
  recommendations.push('اتباع نظام غذائي صحي ومتوازن')
  recommendations.push('ممارسة الرياضة بانتظام')
  recommendations.push('إجراء فحوصات دورية')
  
  return recommendations
}

function generateRiskFactors(profile: any, healthMetrics: any[], medicalHistory: any[], patientAnalysis: any, medicalHistoryAnalysis: any, metricsAnalysis: any): string[] {
  const riskFactors = []
  
  if (profile?.is_smoker) {
    riskFactors.push('التدخين')
  }
  
  if (profile?.chronic_diseases) {
    riskFactors.push('الأمراض المزمنة')
  }
  
  if (profile?.age && parseInt(profile.age) > 60) {
    riskFactors.push('التقدم في العمر')
  }
  
  if (metricsAnalysis.dangerMetrics.length > 0) {
    riskFactors.push('مؤشرات صحية خطرة')
  }
  
  if (medicalHistoryAnalysis.abnormalResults.length > 0) {
    riskFactors.push('نتائج تحاليل غير طبيعية')
  }
  
  return riskFactors
}

function generateLifestyleTips(profile: any, healthMetrics: any[], medicalHistory: any[], patientAnalysis: any, medicalHistoryAnalysis: any, metricsAnalysis: any): string[] {
  const tips = []
  
  tips.push('الحفاظ على وزن صحي ومتوازن')
  tips.push('النوم 7-8 ساعات يومياً')
  tips.push('شرب 8 أكواب من الماء يومياً')
  tips.push('ممارسة الرياضة 30 دقيقة يومياً')
  tips.push('تجنب التوتر والإجهاد')
  tips.push('تناول الخضروات والفواكه بانتظام')
  
  if (profile?.is_smoker) {
    tips.push('تجنب التدخين والتدخين السلبي')
  }
  
  if (profile?.age && parseInt(profile.age) > 50) {
    tips.push('إجراء فحوصات دورية للكشف المبكر')
  }
  
  return tips
}

function generateNextSteps(profile: any, healthMetrics: any[], medicalHistory: any[], patientAnalysis: any, medicalHistoryAnalysis: any, metricsAnalysis: any): string[] {
  const steps = []
  
  if (metricsAnalysis.dangerMetrics.length > 0) {
    steps.push('مراجعة طبية عاجلة')
  }
  
  steps.push('حجز موعد مع الطبيب للفحص الدوري')
  steps.push('إجراء فحوصات طبية أساسية')
  steps.push('متابعة المؤشرات الصحية بانتظام')
  steps.push('تطبيق النصائح الطبية المقدمة')
  
  if (medicalHistoryAnalysis.totalTests === 0) {
    steps.push('إجراء فحص شامل للجسم')
  }
  
  return steps
}

// تحليل مفصل لبيانات المريض
function analyzePatientProfile(profile: any) {
  const analysis = {
    ageGroup: '',
    riskFactors: [] as string[],
    healthStatus: '',
    recommendations: [] as string[]
  }

  // تحليل الفئة العمرية
  if (profile?.age) {
    const age = parseInt(profile.age)
    if (age < 18) analysis.ageGroup = 'مراهق'
    else if (age < 30) analysis.ageGroup = 'شاب'
    else if (age < 50) analysis.ageGroup = 'بالغ'
    else if (age < 65) analysis.ageGroup = 'متوسط العمر'
    else analysis.ageGroup = 'كبير السن'
  }

  // تحليل عوامل الخطر
  if (profile?.is_smoker) analysis.riskFactors.push('التدخين')
  if (profile?.chronic_diseases) analysis.riskFactors.push('الأمراض المزمنة')
  if (profile?.age && parseInt(profile.age) > 60) analysis.riskFactors.push('التقدم في العمر')
  if (profile?.previous_medical_conditions) analysis.riskFactors.push('تاريخ مرضي')

  // تقييم الحالة الصحية
  if (analysis.riskFactors.length === 0) {
    analysis.healthStatus = 'جيدة'
  } else if (analysis.riskFactors.length <= 2) {
    analysis.healthStatus = 'متوسطة'
  } else {
    analysis.healthStatus = 'تحتاج مراقبة'
  }

  return analysis
}

// تحليل مفصل للسجل الطبي
function analyzeMedicalHistory(medicalHistory: any[]) {
  const analysis = {
    totalTests: medicalHistory.length,
    recentTests: [] as any[],
    abnormalResults: [] as any[],
    testTypes: [] as string[],
    recommendations: [] as string[]
  }

  // تحليل الفحوصات الحديثة (آخر 3 أشهر)
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  analysis.recentTests = medicalHistory.filter(test => 
    new Date(test.created_at) > threeMonthsAgo
  )

  // تحليل أنواع الفحوصات
  analysis.testTypes = Array.from(new Set(medicalHistory.map(test => test.test_type)))

  // تحليل النتائج غير الطبيعية
  medicalHistory.forEach(test => {
    if (test.analysis_result) {
      const result = test.analysis_result.toLowerCase()
      if (result.includes('غير طبيعي') || result.includes('مرتفع') || result.includes('منخفض') || result.includes('خطر')) {
        analysis.abnormalResults.push(test)
      }
    }
  })

  return analysis
}

// تحليل المؤشرات الصحية
function analyzeHealthMetrics(healthMetrics: any[]) {
  const analysis = {
    normalMetrics: [] as any[],
    warningMetrics: [] as any[],
    dangerMetrics: [] as any[],
    totalMetrics: healthMetrics.length,
    recommendations: [] as string[]
  }

  healthMetrics.forEach(metric => {
    switch (metric.status) {
      case 'normal':
        analysis.normalMetrics.push(metric)
        break
      case 'warning':
        analysis.warningMetrics.push(metric)
        break
      case 'danger':
        analysis.dangerMetrics.push(metric)
        break
    }
  })

  return analysis
}

// دالة لتوليد تقرير صحي شامل
export async function generateHealthReport(profile: any, healthMetrics: any[], medicalHistory: any[]) {
  const analysis = await analyzeHealthData({ profile, healthMetrics, medicalHistory })
  
  return {
    ...analysis,
    generatedAt: new Date().toISOString(),
    patientInfo: {
      name: profile?.full_name,
      age: profile?.age,
      gender: profile?.gender
    }
  }
}