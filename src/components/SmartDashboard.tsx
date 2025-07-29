'use client'

import { useState, useEffect } from 'react'
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

export default function SmartDashboard({ user, profile }: SmartDashboardProps) {
  const [healthMetrics, setHealthMetrics] = useState<RealHealthMetric[]>([])
  const [alerts, setAlerts] = useState<HealthAlert[]>([])
  const [tips, setTips] = useState<HealthTip[]>([])
  const [loading, setLoading] = useState(true)
  const [healthScore, setHealthScore] = useState(0)
  const [healthAnalysis, setHealthAnalysis] = useState<HealthAnalysis | null>(null)
  const [medicalHistory, setMedicalHistory] = useState<any[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)

  useEffect(() => {
    loadRealHealthData()
    generateTips()
  }, [profile])

  useEffect(() => {
    if (healthMetrics.length > 0 && medicalHistory.length >= 0) {
      generateAIAnalysis()
    }
  }, [healthMetrics, medicalHistory])

  // جلب البيانات الصحية الحقيقية
  const loadRealHealthData = async () => {
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
  }

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



  // توليد نصائح طبية مخصصة
  const generateTips = () => {
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

    // نصائح بناءً على الحالة الصحية
    if (profile?.is_smoker) {
      baseTips.push({
        id: '2',
        title: 'الإقلاع عن التدخين',
        content: 'فكر في الإقلاع عن التدخين لتحسين صحتك العامة',
        category: 'lifestyle',
        icon: '🚭'
      })
    }

    if (profile?.chronic_diseases?.includes('سكري')) {
      baseTips.push({
        id: '3',
        title: 'إدارة السكري',
        content: 'راقب مستوى السكر بانتظام واتبع نظام غذائي متوازن',
        category: 'nutrition',
        icon: '🩸'
      })
    }

    // نصائح عامة
    baseTips.push({
      id: '4',
      title: 'النوم الجيد',
      content: 'احرص على النوم 7-8 ساعات يومياً لصحة أفضل',
      category: 'lifestyle',
      icon: '😴'
    })

    setTips(baseTips)
    setLoading(false)
  }

  // إضافة مؤشر صحي يدوياً
  const handleAddManualMetric = (metric: RealHealthMetric) => {
    setHealthMetrics(prev => [...prev, metric])
  }

  // توليد تحليل طبي شامل
  const generateAIAnalysis = async () => {
    if (analyzing) return
    
    setAnalyzing(true)
    try {
      console.log('بدء التحليل الطبي...')
      console.log('بيانات المريض:', profile)
      console.log('المؤشرات الصحية:', healthMetrics)
      console.log('السجل الطبي:', medicalHistory)
      
      const analysis = await generateHealthReport(profile, healthMetrics, medicalHistory)
      console.log('نتيجة التحليل:', analysis)
      setHealthAnalysis(analysis)
    } catch (error) {
      console.error('خطأ في التحليل الطبي:', error)
      // إنشاء تحليل بديل في حالة الخطأ
      const fallbackAnalysis: HealthAnalysis = {
        summary: `بناءً على بيانات المريض، العمر: ${profile?.age || 'غير محدد'} سنة، الجنس: ${profile?.gender || 'غير محدد'}، والأمراض المزمنة: ${profile?.chronic_diseases || 'لا توجد'}، يبدو أن الحالة الصحية ${profile?.is_smoker ? 'تحتاج مراقبة خاصة' : 'جيدة نسبياً'}.`,
        recommendations: [
          'مراجعة الطبيب بشكل دوري',
          'إجراء فحوصات دورية',
          'اتباع نظام غذائي صحي',
          'ممارسة الرياضة بانتظام'
        ],
        riskFactors: profile?.is_smoker ? ['التدخين'] : [],
        lifestyleTips: [
          'الحفاظ على وزن صحي',
          'النوم 7-8 ساعات يومياً',
          'شرب الماء بكميات كافية',
          'تجنب التوتر والإجهاد'
        ],
        nextSteps: [
          'حجز موعد مع الطبيب',
          'إجراء فحوصات دورية',
          'متابعة المؤشرات الصحية'
        ],
        generatedAt: new Date().toISOString()
      }
      setHealthAnalysis(fallbackAnalysis)
    } finally {
      setAnalyzing(false)
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
    <div className="space-y-6 p-4">
      {/* النتيجة الصحية العامة */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">النتيجة الصحية العامة</h2>
          <Shield className="w-6 h-6" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold">{healthScore}/100</div>
            <div className="text-blue-100 text-sm">
              {healthScore >= 80 ? 'صحة ممتازة' : 
               healthScore >= 60 ? 'صحة جيدة' : 
               healthScore >= 40 ? 'صحة متوسطة' : 'تحتاج تحسين'}
            </div>
          </div>
          <div className="relative">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="white"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${(healthScore / 100) * 201} 201`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold">{healthScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* المؤشرات الصحية */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <BarChart3 className="w-5 h-5 ml-2" />
            المؤشرات الصحية
          </h3>
          <button
            onClick={() => setShowManualInput(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة مؤشر
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthMetrics.map((metric, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{metric.name}</span>
                <div className="flex items-center gap-2">
                  {getTrendIcon(metric.trend)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    metric.source === 'test_analysis' ? 'bg-blue-100 text-blue-700' :
                    metric.source === 'calculated' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {metric.source === 'test_analysis' ? 'من التحليل' :
                     metric.source === 'calculated' ? 'محسوب' : 'يدوي'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-800">
                  {metric.value}
                  <span className="text-sm font-normal text-gray-500 mr-1">{metric.unit}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                  {metric.status === 'normal' ? 'طبيعي' : 
                   metric.status === 'warning' ? 'تحذير' : 'خطر'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* التنبيهات الصحية */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 ml-2" />
          التنبيهات الصحية
        </h3>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className={`border-r-4 p-4 rounded-lg ${getPriorityColor(alert.priority)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {alert.type === 'medication' && <Pill className="w-4 h-4 text-red-500" />}
                    {alert.type === 'appointment' && <Calendar className="w-4 h-4 text-blue-500" />}
                    {alert.type === 'test' && <Stethoscope className="w-4 h-4 text-green-500" />}
                    {alert.type === 'general' && <Info className="w-4 h-4 text-gray-500" />}
                    <h4 className="font-medium text-gray-800">{alert.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {new Date(alert.date).toLocaleDateString('ar-EG')}
                  </div>
                </div>
                {!alert.isRead && (
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* التحليل الذكي */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <BarChart3 className="w-5 h-5 ml-2" />
            التحليل الذكي للحالة الصحية
          </h3>
          {analyzing && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              جاري التحليل...
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
  )
} 