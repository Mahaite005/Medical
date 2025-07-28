import { supabase } from './supabase'

export interface RealHealthMetric {
  name: string
  value: number
  unit: string
  status: 'normal' | 'warning' | 'danger'
  trend: 'up' | 'down' | 'stable'
  date: string
  source: 'manual' | 'test_analysis' | 'calculated'
}

export interface ExtractedHealthData {
  bloodPressure?: { systolic: number; diastolic: number }
  heartRate?: number
  bloodSugar?: number
  cholesterol?: { total: number; hdl: number; ldl: number; triglycerides: number }
  bmi?: number
  weight?: number
  height?: number
  temperature?: number
  oxygenSaturation?: number
  creatinine?: number
  hemoglobin?: number
  whiteBloodCells?: number
  platelets?: number
  liverEnzymes?: { alt: number; ast: number }
  kidneyFunction?: { urea: number; creatinine: number }
  thyroid?: { tsh: number; t3: number; t4: number }
}

// استخراج البيانات الصحية من نتائج التحليل الطبي
export function extractHealthDataFromAnalysis(analysisText: string): ExtractedHealthData {
  const extracted: ExtractedHealthData = {}
  
  // استخراج ضغط الدم
  const bloodPressureMatch = analysisText.match(/(?:ضغط الدم|blood pressure|BP)[:\s]*(\d+)\/(\d+)/i)
  if (bloodPressureMatch) {
    extracted.bloodPressure = {
      systolic: parseInt(bloodPressureMatch[1]),
      diastolic: parseInt(bloodPressureMatch[2])
    }
  }

  // استخراج معدل ضربات القلب
  const heartRateMatch = analysisText.match(/(?:معدل ضربات القلب|heart rate|HR)[:\s]*(\d+)/i)
  if (heartRateMatch) {
    extracted.heartRate = parseInt(heartRateMatch[1])
  }

  // استخراج مستوى السكر
  const bloodSugarMatch = analysisText.match(/(?:سكر الدم|glucose|sugar)[:\s]*(\d+)/i)
  if (bloodSugarMatch) {
    extracted.bloodSugar = parseInt(bloodSugarMatch[1])
  }

  // استخراج الكوليسترول
  const cholesterolMatch = analysisText.match(/(?:كوليسترول|cholesterol)[:\s]*(\d+)/i)
  if (cholesterolMatch) {
    extracted.cholesterol = {
      total: parseInt(cholesterolMatch[1]),
      hdl: 0, ldl: 0, triglycerides: 0
    }
  }

  // استخراج الوزن والطول لحساب BMI
  const weightMatch = analysisText.match(/(?:وزن|weight)[:\s]*(\d+)/i)
  const heightMatch = analysisText.match(/(?:طول|height)[:\s]*(\d+)/i)
  if (weightMatch && heightMatch) {
    const weight = parseInt(weightMatch[1])
    const height = parseInt(heightMatch[1]) / 100 // تحويل إلى متر
    extracted.weight = weight
    extracted.height = height
    extracted.bmi = weight / (height * height)
  }

  // استخراج درجة الحرارة
  const tempMatch = analysisText.match(/(?:درجة الحرارة|temperature|temp)[:\s]*(\d+\.?\d*)/i)
  if (tempMatch) {
    extracted.temperature = parseFloat(tempMatch[1])
  }

  // استخراج نسبة الأكسجين
  const oxygenMatch = analysisText.match(/(?:نسبة الأكسجين|oxygen saturation|SpO2)[:\s]*(\d+)/i)
  if (oxygenMatch) {
    extracted.oxygenSaturation = parseInt(oxygenMatch[1])
  }

  // استخراج الكرياتينين
  const creatinineMatch = analysisText.match(/(?:كرياتينين|creatinine)[:\s]*(\d+\.?\d*)/i)
  if (creatinineMatch) {
    extracted.creatinine = parseFloat(creatinineMatch[1])
  }

  // استخراج الهيموغلوبين
  const hemoglobinMatch = analysisText.match(/(?:هيموغلوبين|hemoglobin|Hb)[:\s]*(\d+\.?\d*)/i)
  if (hemoglobinMatch) {
    extracted.hemoglobin = parseFloat(hemoglobinMatch[1])
  }

  return extracted
}

// تحويل البيانات المستخرجة إلى مؤشرات صحية
export function convertToHealthMetrics(extractedData: ExtractedHealthData, profile: any): RealHealthMetric[] {
  const metrics: RealHealthMetric[] = []
  const now = new Date().toISOString()

  // ضغط الدم
  if (extractedData.bloodPressure) {
    const { systolic, diastolic } = extractedData.bloodPressure
    let status: 'normal' | 'warning' | 'danger' = 'normal'
    
    if (systolic > 140 || diastolic > 90) status = 'danger'
    else if (systolic > 120 || diastolic > 80) status = 'warning'

    metrics.push({
      name: 'ضغط الدم',
      value: systolic,
      unit: `${systolic}/${diastolic} ملم زئبق`,
      status,
      trend: 'stable',
      date: now,
      source: 'test_analysis'
    })
  }

  // معدل ضربات القلب
  if (extractedData.heartRate) {
    let status: 'normal' | 'warning' | 'danger' = 'normal'
    let trend: 'up' | 'down' | 'stable' = 'stable'
    
    if (extractedData.heartRate > 100) status = 'warning'
    else if (extractedData.heartRate > 120) status = 'danger'
    else if (extractedData.heartRate < 60) status = 'warning'
    else if (extractedData.heartRate < 50) status = 'danger'

    // تعديل بناءً على التدخين
    if (profile?.is_smoker && extractedData.heartRate > 80) {
      status = 'warning'
      trend = 'up'
    }

    metrics.push({
      name: 'معدل ضربات القلب',
      value: extractedData.heartRate,
      unit: 'نبضة/دقيقة',
      status,
      trend,
      date: now,
      source: 'test_analysis'
    })
  }

  // مستوى السكر
  if (extractedData.bloodSugar) {
    let status: 'normal' | 'warning' | 'danger' = 'normal'
    
    if (extractedData.bloodSugar > 200) status = 'danger'
    else if (extractedData.bloodSugar > 140) status = 'warning'

    // تعديل بناءً على وجود السكري
    if (profile?.chronic_diseases?.includes('سكري')) {
      if (extractedData.bloodSugar > 180) status = 'warning'
      if (extractedData.bloodSugar > 250) status = 'danger'
    }

    metrics.push({
      name: 'مستوى السكر',
      value: extractedData.bloodSugar,
      unit: 'ملجم/دل',
      status,
      trend: 'stable',
      date: now,
      source: 'test_analysis'
    })
  }

  // مؤشر كتلة الجسم
  if (extractedData.bmi) {
    let status: 'normal' | 'warning' | 'danger' = 'normal'
    
    if (extractedData.bmi > 30) status = 'danger'
    else if (extractedData.bmi > 25) status = 'warning'
    else if (extractedData.bmi < 18.5) status = 'warning'

    metrics.push({
      name: 'مؤشر كتلة الجسم',
      value: Math.round(extractedData.bmi * 10) / 10,
      unit: 'كجم/م²',
      status,
      trend: 'stable',
      date: now,
      source: 'calculated'
    })
  }

  // درجة الحرارة
  if (extractedData.temperature) {
    let status: 'normal' | 'warning' | 'danger' = 'normal'
    
    if (extractedData.temperature > 38) status = 'danger'
    else if (extractedData.temperature > 37.5) status = 'warning'
    else if (extractedData.temperature < 36) status = 'warning'

    metrics.push({
      name: 'درجة الحرارة',
      value: extractedData.temperature,
      unit: '°م',
      status,
      trend: 'stable',
      date: now,
      source: 'test_analysis'
    })
  }

  // نسبة الأكسجين
  if (extractedData.oxygenSaturation) {
    let status: 'normal' | 'warning' | 'danger' = 'normal'
    
    if (extractedData.oxygenSaturation < 90) status = 'danger'
    else if (extractedData.oxygenSaturation < 95) status = 'warning'

    metrics.push({
      name: 'نسبة الأكسجين',
      value: extractedData.oxygenSaturation,
      unit: '%',
      status,
      trend: 'stable',
      date: now,
      source: 'test_analysis'
    })
  }

  // الكرياتينين
  if (extractedData.creatinine) {
    let status: 'normal' | 'warning' | 'danger' = 'normal'
    
    if (extractedData.creatinine > 1.3) status = 'warning'
    if (extractedData.creatinine > 2.0) status = 'danger'

    metrics.push({
      name: 'الكرياتينين',
      value: extractedData.creatinine,
      unit: 'ملجم/دل',
      status,
      trend: 'stable',
      date: now,
      source: 'test_analysis'
    })
  }

  // الهيموغلوبين
  if (extractedData.hemoglobin) {
    let status: 'normal' | 'warning' | 'danger' = 'normal'
    
    if (extractedData.hemoglobin < 12) status = 'warning'
    if (extractedData.hemoglobin < 10) status = 'danger'

    metrics.push({
      name: 'الهيموغلوبين',
      value: extractedData.hemoglobin,
      unit: 'جم/دل',
      status,
      trend: 'stable',
      date: now,
      source: 'test_analysis'
    })
  }

  return metrics
}

// حساب النتيجة الصحية بناءً على البيانات الحقيقية
export function calculateRealHealthScore(profile: any, metrics: RealHealthMetric[]): number {
  let score = 100

  // خصم نقاط بناءً على عوامل الخطر من الملف الشخصي
  if (profile?.is_smoker) score -= 20
  if (profile?.chronic_diseases) score -= 15
  if (profile?.age && parseInt(profile.age) > 60) score -= 10
  if (profile?.previous_medical_conditions) score -= 10

  // خصم نقاط بناءً على المؤشرات الصحية
  metrics.forEach(metric => {
    switch (metric.status) {
      case 'warning':
        score -= 5
        break
      case 'danger':
        score -= 15
        break
    }
  })

  // إضافة نقاط إيجابية
  if (profile?.age && parseInt(profile.age) < 30) score += 5
  if (!profile?.is_smoker) score += 10

  // إضافة نقاط للمؤشرات الطبيعية
  const normalMetrics = metrics.filter(m => m.status === 'normal').length
  score += normalMetrics * 2

  return Math.max(0, Math.min(100, score))
}

// جلب جميع البيانات الصحية للمريض
export async function getPatientHealthData(userId: string) {
  try {
    // جلب الملف الشخصي
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // جلب التحاليل الطبية
    const { data: medicalTests } = await supabase
      .from('medical_tests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // استخراج البيانات الصحية من التحاليل
    const allMetrics: RealHealthMetric[] = []
    
    medicalTests?.forEach(test => {
      if (test.analysis_result) {
        const extractedData = extractHealthDataFromAnalysis(test.analysis_result)
        const metrics = convertToHealthMetrics(extractedData, profile)
        allMetrics.push(...metrics)
      }
    })

    // حساب النتيجة الصحية
    const healthScore = calculateRealHealthScore(profile, allMetrics)

    return {
      profile,
      medicalTests,
      healthMetrics: allMetrics,
      healthScore
    }
  } catch (error) {
    console.error('Error fetching patient health data:', error)
    throw error
  }
}

// توليد تنبيهات بناءً على البيانات الحقيقية
export function generateRealAlerts(profile: any, metrics: RealHealthMetric[], medicalTests: any[]) {
  const alerts = []

  // تنبيهات بناءً على المؤشرات الخطرة
  const dangerousMetrics = metrics.filter(m => m.status === 'danger')
  dangerousMetrics.forEach(metric => {
    alerts.push({
      id: `danger-${metric.name}`,
      type: 'test' as const,
      title: `مؤشر صحي خطير: ${metric.name}`,
      message: `قيمة ${metric.name} (${metric.value} ${metric.unit}) تتطلب مراجعة طبية عاجلة`,
      priority: 'high' as const,
      date: new Date().toISOString(),
      isRead: false
    })
  })

  // تنبيهات بناءً على الأدوية
  if (profile?.current_medications) {
    alerts.push({
      id: 'medication-reminder',
      type: 'medication' as const,
      title: 'تذكير بالأدوية',
      message: 'تذكر تناول الأدوية الموصوفة لك في الوقت المحدد',
      priority: 'high' as const,
      date: new Date().toISOString(),
      isRead: false
    })
  }

  // تنبيهات بناءً على الفحوصات الدورية
  if (medicalTests.length > 0) {
    const lastTest = medicalTests[0]
    const daysSinceLastTest = Math.floor((Date.now() - new Date(lastTest.created_at).getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceLastTest > 90) {
      alerts.push({
        id: 'periodic-test',
        type: 'test' as const,
        title: 'فحص دوري مطلوب',
        message: 'مر 90 يوم على آخر فحص طبي. يُنصح بإجراء فحص دوري',
        priority: 'medium' as const,
        date: new Date().toISOString(),
        isRead: false
      })
    }
  }

  // تنبيهات بناءً على الأمراض المزمنة
  if (profile?.chronic_diseases) {
    alerts.push({
      id: 'chronic-disease-monitoring',
      type: 'test' as const,
      title: 'مراقبة الأمراض المزمنة',
      message: 'تأكد من مراقبة مؤشرات الأمراض المزمنة بانتظام',
      priority: 'medium' as const,
      date: new Date().toISOString(),
      isRead: false
    })
  }

  return alerts
} 