'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { generateHealthReport } from '@/lib/healthAnalysis'
import { 
  getPatientHealthData, 
  generateRealAlerts, 
  RealHealthMetric 
} from '@/lib/realHealthData'
import { 
  Heart, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  Pill, 
  Stethoscope,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  Lightbulb,
  BarChart3,
  Target,
  Shield,
  Plus,
  HardDrive
} from 'lucide-react'
import ManualHealthInput from './ManualHealthInput'
import StorageMonitor from './StorageMonitor'

interface SmartDashboardProps {
  user: User
  profile: any
  needsPasswordReset?: boolean
}

// استخدام RealHealthMetric من المكتبة الجديدة

interface HealthAlert {
  id: string
  type: 'medication' | 'appointment' | 'test' | 'general'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high'
  date: string
  isRead: boolean
}

interface HealthTip {
  id: string
  title: string
  content: string
  category: 'nutrition' | 'exercise' | 'medication' | 'lifestyle'
  icon: string
}

interface HealthAnalysis {
  summary: string
  recommendations: string[]
  riskFactors: string[]
  lifestyleTips: string[]
  nextSteps: string[]
  generatedAt?: string
}

export default function SmartDashboard({ user, profile, needsPasswordReset }: SmartDashboardProps) {
  const [healthMetrics, setHealthMetrics] = useState<RealHealthMetric[]>([])
  const [alerts, setAlerts] = useState<HealthAlert[]>([])
  const [tips, setTips] = useState<HealthTip[]>([])
  const [loading, setLoading] = useState(true)
  const [healthScore, setHealthScore] = useState(0)
  const [healthAnalysis, setHealthAnalysis] = useState<HealthAnalysis | null>(null)
  const [medicalHistory, setMedicalHistory] = useState<any[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [showPasswordNotice, setShowPasswordNotice] = useState(false)

  // توليد بيانات افتراضية في حالة عدم وجود بيانات حقيقية
  const generateDefaultHealthData = () => {
    const baseMetrics: RealHealthMetric[] = [
      {
        name: 'معدل ضربات القلب',
        value: 72,
        unit: 'نبضة/دقيقة',
        status: 'normal',
        trend: 'stable',
        date: new Date().toISOString(),
        source: 'manual'
      },
      {
        name: 'ضغط الدم',
        value: 120,
        unit: '120/80 ملم زئبق',
        status: 'normal',
        trend: 'stable',
        date: new Date().toISOString(),
        source: 'manual'
      },
      {
        name: 'مستوى السكر',
        value: profile?.chronic_diseases?.includes('سكري') ? 140 : 95,
        unit: 'ملجم/دل',
        status: profile?.chronic_diseases?.includes('سكري') ? 'warning' : 'normal',
        trend: 'stable',
        date: new Date().toISOString(),
        source: 'manual'
      },
      {
        name: 'مؤشر كتلة الجسم',
        value: 24.5,
        unit: 'كجم/م²',
        status: 'normal',
        trend: 'stable',
        date: new Date().toISOString(),
        source: 'manual'
      }
    ]

    setHealthMetrics(baseMetrics)
  }

  // جلب البيانات الصحية الحقيقية  
  const loadRealHealthData = useCallback(async () => {
    try {
      setLoading(true)
      const healthData = await getPatientHealthData(user.id)
      
      setHealthMetrics(healthData.healthMetrics)
      setHealthScore(healthData.healthScore)
      setMedicalHistory(healthData.medicalTests || [])
      
      // توليد تنبيهات بناءً على البيانات الحقيقية
      const realAlerts = generateRealAlerts(healthData.profile, healthData.healthMetrics, healthData.medicalTests || [])
      setAlerts(realAlerts)
      
    } catch (error) {
      console.error('Error loading real health data:', error)
      // في حالة الخطأ، نستخدم البيانات الافتراضية
      generateDefaultHealthData()
    } finally {
      setLoading(false)
    }
  }, [user.id])

  // توليد نصائح طبية مخصصة
  const generateTips = useCallback(() => {
    const baseTips: HealthTip[] = []

    // نصائح بناءً على العمر
    if (profile?.age) {
      const age = parseInt(profile.age)
      if (age > 50) {
        baseTips.push({
          id: '1',
          title: 'صحة القلب للكبار',
          content: 'مارس رياضة المشي 30 دقيقة يومياً للحفاظ على صحة القلب',
          category: 'exercise',
          icon: '❤️'
        })
      } else {
        baseTips.push({
          id: '1',
          title: 'بناء العضلات',
          content: 'مارس تمارين القوة مرتين أسبوعياً لبناء العضلات',
          category: 'exercise',
          icon: '💪'
        })
      }
    }

    baseTips.push({
      id: '4',
      title: 'النوم الجيد',
      content: 'احرص على النوم 7-8 ساعات يومياً لصحة أفضل',
      category: 'lifestyle',
      icon: '😴'
    })

    setTips(baseTips)
  }, [profile])

  // توليد تحليل طبي شامل
  const generateAIAnalysis = useCallback(async () => {
    if (analyzing) return
    
    setAnalyzing(true)
    try {
      const analysis = await generateHealthReport(profile, healthMetrics, medicalHistory)
      setHealthAnalysis(analysis)
    } catch (error) {
      console.error('خطأ في التحليل الطبي:', error)
      const fallbackAnalysis: HealthAnalysis = {
        summary: `بناءً على بيانات المريض، الحالة الصحية جيدة نسبياً.`,
        recommendations: ['مراجعة الطبيب بشكل دوري', 'إجراء فحوصات دورية'],
        riskFactors: [],
        lifestyleTips: ['الحفاظ على وزن صحي', 'النوم 7-8 ساعات يومياً'],
        nextSteps: ['حجز موعد مع الطبيب'],
        generatedAt: new Date().toISOString()
      }
      setHealthAnalysis(fallbackAnalysis)
    } finally {
      setAnalyzing(false)
    }
  }, [analyzing, profile, healthMetrics, medicalHistory])

  useEffect(() => {
    loadRealHealthData()
    generateTips()
  }, [loadRealHealthData, generateTips])

  useEffect(() => {
    if (healthMetrics.length > 0 && medicalHistory.length >= 0) {
      generateAIAnalysis()
    }
  }, [healthMetrics, medicalHistory, generateAIAnalysis])

  // إدارة ملاحظة تغيير كلمة المرور
  useEffect(() => {
    // التأكد من أننا في client side قبل استخدام localStorage
    if (typeof window === 'undefined') return;
    
    if (needsPasswordReset) {
      try {
        // التحقق من localStorage لمعرفة آخر مرة تم إخفاء الملاحظة
        const lastHidden = localStorage.getItem(`password-notice-hidden-${user.id}`)
        
        if (lastHidden) {
          const hiddenTime = new Date(lastHidden)
          const now = new Date()
          const diffMinutes = (now.getTime() - hiddenTime.getTime()) / (1000 * 60)
          
          // إذا مر أكثر من 15 دقيقة، اعرض الملاحظة مرة أخرى
          if (diffMinutes > 15) {
            setShowPasswordNotice(true)
            localStorage.removeItem(`password-notice-hidden-${user.id}`)
          }
        } else {
          // أول مرة، اعرض الملاحظة
          setShowPasswordNotice(true)
        }
      } catch (error) {
        // في حالة خطأ في localStorage، اعرض الملاحظة
        setShowPasswordNotice(true)
      }
    } else {
      setShowPasswordNotice(false)
    }
  }, [needsPasswordReset, user.id])

  // إضافة مؤشر صحي يدوياً
  const handleAddManualMetric = (metric: RealHealthMetric) => {
    setHealthMetrics(prev => [...prev, metric])
  }

  // إغلاق ملاحظة تغيير كلمة المرور
  const handleHidePasswordNotice = () => {
    setShowPasswordNotice(false)
    
    // التأكد من أننا في client side قبل استخدام localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`password-notice-hidden-${user.id}`, new Date().toISOString())
      } catch (error) {
        // تجاهل الخطأ إذا فشل localStorage
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'danger': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50'
      case 'medium': return 'border-yellow-500 bg-yellow-50'
      case 'low': return 'border-blue-500 bg-blue-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />
      case 'down': return <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />
      case 'stable': return <Activity className="w-4 h-4 text-blue-500" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏥 المختبر الرقمي</h1>
          <p className="text-gray-600">لوحة التحكم الذكية للمؤشرات الصحية</p>
        </div>

        {/* النتيجة الصحية العامة - محسنة */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl border border-blue-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">النتيجة الصحية العامة</h2>
                  <p className="text-blue-100 text-sm">تقييم شامل لحالتك الصحية</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{healthScore}</span>
                  <span className="text-2xl text-blue-100">/100</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
                  <div className={`w-3 h-3 rounded-full ${
                    healthScore >= 80 ? 'bg-green-400' : 
                    healthScore >= 60 ? 'bg-yellow-400' : 
                    healthScore >= 40 ? 'bg-orange-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-sm font-medium">
                    {healthScore >= 80 ? '🎉 صحة ممتازة' : 
                     healthScore >= 60 ? '😊 صحة جيدة' : 
                     healthScore >= 40 ? '⚠️ صحة متوسطة' : '🚨 تحتاج تحسين'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-40 h-40 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="white"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(healthScore / 100) * 351} 351`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{healthScore}%</span>
                    <span className="text-xs text-blue-100">نقاط صحية</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* المؤشرات الصحية - محسنة */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">المؤشرات الصحية</h3>
                <p className="text-gray-600 text-sm">متابعة مستمرة لمؤشراتك الحيوية</p>
              </div>
            </div>
            <button
              onClick={() => setShowManualInput(true)}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">إضافة مؤشر</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {healthMetrics.map((metric, index) => (
              <div key={index} className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1">
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                    metric.source === 'test_analysis' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    metric.source === 'calculated' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                    'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}>
                    {metric.source === 'test_analysis' ? '📊 من التحليل' :
                     metric.source === 'calculated' ? '🧮 محسوب' : '✋ يدوي'}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-bold text-gray-800">{metric.name}</h4>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    آخر تحديث: {new Date(metric.date).toLocaleDateString('ar-EG')}
                  </div>
                </div>
                
                <div className="flex items-end justify-between">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">{metric.value}</span>
                      <span className="text-sm text-gray-500 font-medium">{metric.unit}</span>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm border ${
                    metric.status === 'normal' ? 'bg-green-50 text-green-700 border-green-200' : 
                    metric.status === 'warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                    'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {metric.status === 'normal' ? '✅ طبيعي' : 
                     metric.status === 'warning' ? '⚠️ تحذير' : '🚨 خطر'}
                  </div>
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>

        {/* ملاحظة تغيير كلمة المرور - محسنة */}
        {needsPasswordReset && showPasswordNotice && (
          <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border-2 border-orange-300 rounded-3xl p-8 shadow-xl animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-orange-900 mb-3 flex items-center gap-2">
                    🔐 مطلوب تغيير كلمة المرور
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 animate-bounce">
                      عاجل
                    </span>
                  </h3>
                  <p className="text-sm text-orange-800 leading-relaxed mb-6">
                    تم طلب إعادة تعيين كلمة المرور لحسابك. لضمان أمان بياناتك الطبية، يرجى اتباع الخطوات أدناه:
                  </p>
                  <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl p-6 mb-6 border border-orange-200">
                    <p className="text-sm text-orange-900 font-bold mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">!</span>
                      الخطوات المطلوبة:
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
                        <p className="text-sm text-orange-800">اذهب إلى قسم <span className="bg-orange-200 px-2 py-1 rounded-lg font-bold">"تعديل الملف الشخصي"</span> بالأسفل</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
                        <p className="text-sm text-orange-800">ستجد قسم <span className="bg-orange-200 px-2 py-1 rounded-lg font-bold">"تغيير كلمة المرور"</span> في الأسفل</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
                        <p className="text-sm text-orange-800">أدخل كلمة مرور جديدة وقوية (8 أحرف على الأقل)</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</span>
                        <p className="text-sm text-orange-800">اضغط على "تحديث كلمة المرور"</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-xs text-blue-800 flex items-center gap-2">
                      <span className="text-lg">💡</span>
                      <span>ستختفي هذه الملاحظة تلقائياً بعد 15 دقيقة وستظهر مرة أخرى عند تسجيل الدخول التالي حتى يتم تغيير كلمة المرور.</span>
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleHidePasswordNotice}
                className="flex-shrink-0 p-3 text-orange-600 hover:text-orange-800 hover:bg-orange-100 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md"
                title="إخفاء لمدة 15 دقيقة"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* التنبيهات الصحية - محسنة */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">التنبيهات الصحية</h3>
              <p className="text-gray-600 text-sm">تنبيهات مهمة تتطلب انتباهك</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className={`group relative rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${getPriorityColor(alert.priority)} hover:scale-[1.02]`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        alert.type === 'medication' ? 'bg-red-100' :
                        alert.type === 'appointment' ? 'bg-blue-100' :
                        alert.type === 'test' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {alert.type === 'medication' && <Pill className="w-5 h-5 text-red-600" />}
                        {alert.type === 'appointment' && <Calendar className="w-5 h-5 text-blue-600" />}
                        {alert.type === 'test' && <Stethoscope className="w-5 h-5 text-green-600" />}
                        {alert.type === 'general' && <Info className="w-5 h-5 text-gray-600" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg">{alert.title}</h4>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          alert.priority === 'high' ? 'bg-red-100 text-red-700' :
                          alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {alert.priority === 'high' ? '🚨 عالي' :
                           alert.priority === 'medium' ? '⚠️ متوسط' : '📌 منخفض'}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">{alert.message}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>تاريخ التنبيه: {new Date(alert.date).toLocaleDateString('ar-EG')}</span>
                    </div>
                  </div>
                  {!alert.isRead && (
                    <div className="flex-shrink-0">
                      <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* التحليل الذكي - محسن */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">التحليل الذكي للحالة الصحية</h3>
                <p className="text-gray-600 text-sm">تحليل شامل مدعوم بالذكاء الاصطناعي</p>
              </div>
            </div>
            {analyzing && (
              <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-2xl border border-blue-200">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm font-medium text-blue-600">جاري التحليل...</span>
              </div>
            )}
          </div>
        
        {healthAnalysis ? (
          <div className="space-y-6">
            {/* معلومات المريض */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
              <h4 className="font-semibold text-gray-800 mb-3">معلومات المريض</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">الاسم:</span>
                  <span className="mr-2 text-gray-800">{profile?.full_name || 'غير محدد'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">العمر:</span>
                  <span className="mr-2 text-gray-800">{profile?.age || 'غير محدد'} سنة</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">الجنس:</span>
                  <span className="mr-2 text-gray-800">{profile?.gender || 'غير محدد'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">التدخين:</span>
                  <span className="mr-2 text-gray-800">{profile?.is_smoker ? 'نعم' : 'لا'}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-600">الأمراض المزمنة:</span>
                  <span className="mr-2 text-gray-800">{profile?.chronic_diseases || 'لا توجد'}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-600">الأدوية الحالية:</span>
                  <span className="mr-2 text-gray-800">{profile?.current_medications || 'لا توجد'}</span>
                </div>
              </div>
            </div>

            {/* ملخص السجل الطبي */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-gray-800 mb-3">ملخص السجل الطبي</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{medicalHistory.length}</div>
                  <div className="text-gray-600">إجمالي الفحوصات</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{healthMetrics.filter(m => m.status === 'normal').length}</div>
                  <div className="text-gray-600">مؤشرات طبيعية</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{healthMetrics.filter(m => m.status === 'danger').length}</div>
                  <div className="text-gray-600">مؤشرات خطرة</div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{healthAnalysis.summary}</p>
            </div>

            {/* التوصيات الطبية */}
            {healthAnalysis.recommendations.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold text-gray-800 mb-3">التوصيات الطبية المحددة</h4>
                <ul className="space-y-2">
                  {healthAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* عوامل الخطر */}
            {healthAnalysis.riskFactors.length > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
                <h4 className="font-semibold text-gray-800 mb-3">عوامل الخطر المحتملة</h4>
                <ul className="space-y-2">
                  {healthAnalysis.riskFactors.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* نصائح نمط الحياة */}
            {healthAnalysis.lifestyleTips.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-3">نصائح نمط الحياة</h4>
                <ul className="space-y-2">
                  {healthAnalysis.lifestyleTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* الخطوات التالية */}
            {healthAnalysis.nextSteps.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="font-semibold text-gray-800 mb-3">الخطوات التالية الموصى بها</h4>
                <ul className="space-y-2">
                  {healthAnalysis.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* معلومات إضافية */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>تاريخ التحليل: {new Date(healthAnalysis.generatedAt || Date.now()).toLocaleDateString('ar-EG')}</span>
                <span>تم التحليل بواسطة النظام الطبي</span>
              </div>
            </div>
          </div>
        ) : !analyzing ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <BarChart3 className="w-12 h-12 mx-auto" />
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">التحليل الطبي الشامل</h4>
              <p className="text-gray-600 text-sm">
                سيقوم النظام بفحص شامل لـ:
              </p>
              <ul className="text-gray-500 text-sm space-y-1">
                <li>• بيانات المريض الشخصية والطبية</li>
                <li>• السجل الطبي والتحاليل السابقة</li>
                <li>• المؤشرات الصحية الحالية</li>
                <li>• تحليل مفصل للحالة الصحية</li>
              </ul>
            </div>
                          <button
                onClick={generateAIAnalysis}
                className="mt-6 bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                بدء التحليل الطبي الشامل
              </button>
          </div>
        ) : null}
      </div>

      {/* مراقبة مساحة التخزين */}
      <StorageMonitor />

      {/* النصائح الطبية */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 ml-2" />
          نصائح طبية مخصصة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tips.map((tip) => (
            <div key={tip.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{tip.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 mb-2">{tip.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{tip.content}</p>
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      tip.category === 'nutrition' ? 'bg-green-100 text-green-700' :
                      tip.category === 'exercise' ? 'bg-blue-100 text-blue-700' :
                      tip.category === 'medication' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {tip.category === 'nutrition' ? 'تغذية' :
                       tip.category === 'exercise' ? 'رياضة' :
                       tip.category === 'medication' ? 'أدوية' : 'نمط حياة'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ملخص سريع */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <Target className="w-5 h-5 ml-2" />
          ملخص سريع
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-lg font-bold text-gray-800">{healthMetrics.filter(m => m.status === 'normal').length}</div>
            <div className="text-xs text-gray-500">مؤشرات طبيعية</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-lg font-bold text-gray-800">{alerts.filter(a => !a.isRead).length}</div>
            <div className="text-xs text-gray-500">تنبيهات جديدة</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Lightbulb className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-gray-800">{tips.length}</div>
            <div className="text-xs text-gray-500">نصائح متاحة</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-gray-800">{healthScore}%</div>
            <div className="text-xs text-gray-500">صحة عامة</div>
          </div>
        </div>
      </div>

      {/* نافذة إدخال المؤشرات يدوياً */}
      {showManualInput && (
        <ManualHealthInput
          onAddMetric={handleAddManualMetric}
          onClose={() => setShowManualInput(false)}
        />
      )}
      </div>
    </div>
  )
} 