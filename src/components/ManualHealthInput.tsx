'use client'

import { useState } from 'react'
import { RealHealthMetric } from '@/lib/realHealthData'
import { Plus, X } from 'lucide-react'

interface ManualHealthInputProps {
  onAddMetric: (metric: RealHealthMetric) => void
  onClose: () => void
}

export default function ManualHealthInput({ onAddMetric, onClose }: ManualHealthInputProps) {
  const [metricName, setMetricName] = useState('')
  const [metricValue, setMetricValue] = useState('')
  const [metricUnit, setMetricUnit] = useState('')
  const [metricStatus, setMetricStatus] = useState<'normal' | 'warning' | 'danger'>('normal')

  const predefinedMetrics = [
    { name: 'معدل ضربات القلب', unit: 'نبضة/دقيقة' },
    { name: 'ضغط الدم', unit: 'ملم زئبق' },
    { name: 'مستوى السكر', unit: 'ملجم/دل' },
    { name: 'مؤشر كتلة الجسم', unit: 'كجم/م²' },
    { name: 'درجة الحرارة', unit: '°م' },
    { name: 'نسبة الأكسجين', unit: '%' },
    { name: 'الكرياتينين', unit: 'ملجم/دل' },
    { name: 'الهيموغلوبين', unit: 'جم/دل' },
    { name: 'الكوليسترول الكلي', unit: 'ملجم/دل' },
    { name: 'الدهون الثلاثية', unit: 'ملجم/دل' }
  ]

  const handleAddMetric = () => {
    if (!metricName || !metricValue) return

    const newMetric: RealHealthMetric = {
      name: metricName,
      value: parseFloat(metricValue),
      unit: metricUnit,
      status: metricStatus,
      trend: 'stable',
      date: new Date().toISOString(),
      source: 'manual'
    }

    onAddMetric(newMetric)
    onClose()
  }

  const handlePredefinedMetric = (metric: { name: string; unit: string }) => {
    setMetricName(metric.name)
    setMetricUnit(metric.unit)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">إضافة مؤشر صحي</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* المؤشرات المحددة مسبقاً */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مؤشرات شائعة
            </label>
            <div className="grid grid-cols-2 gap-2">
              {predefinedMetrics.map((metric, index) => (
                <button
                  key={index}
                  onClick={() => handlePredefinedMetric(metric)}
                  className="p-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-right"
                >
                  {metric.name}
                </button>
              ))}
            </div>
          </div>

          {/* اسم المؤشر */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اسم المؤشر
            </label>
            <input
              type="text"
              value={metricName}
              onChange={(e) => setMetricName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="أدخل اسم المؤشر"
            />
          </div>

          {/* القيمة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              القيمة
            </label>
            <input
              type="number"
              step="0.1"
              value={metricValue}
              onChange={(e) => setMetricValue(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="أدخل القيمة"
            />
          </div>

          {/* الوحدة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الوحدة
            </label>
            <input
              type="text"
              value={metricUnit}
              onChange={(e) => setMetricUnit(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="أدخل الوحدة"
            />
          </div>

          {/* الحالة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الحالة
            </label>
            <select
              value={metricStatus}
              onChange={(e) => setMetricStatus(e.target.value as 'normal' | 'warning' | 'danger')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="normal">طبيعي</option>
              <option value="warning">تحذير</option>
              <option value="danger">خطر</option>
            </select>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              onClick={handleAddMetric}
              disabled={!metricName || !metricValue}
              className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 