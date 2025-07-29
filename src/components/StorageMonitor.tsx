'use client'

import { useState, useEffect } from 'react'
import { HardDrive, AlertTriangle, CheckCircle } from 'lucide-react'

interface StorageUsage {
  used: {
    bytes: number
    mb: number
    percentage: number
  }
  remaining: {
    bytes: number
    mb: number
  }
  limit: {
    bytes: number
    mb: number
  }
  fileCount: number
}

interface StorageResponse {
  storage: StorageUsage
  limits: {
    freeTier: string
    proTier: string
    maxFileSize: string
  }
}

export default function StorageMonitor() {
  const [storageData, setStorageData] = useState<StorageResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStorageUsage()
  }, [])

  const fetchStorageUsage = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/storage-usage')
      const data = await response.json()
      
      if (response.ok) {
        setStorageData(data)
      } else {
        setError(data.error || 'فشل في جلب معلومات مساحة التخزين')
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getUsageBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">مساحة التخزين</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">مساحة التخزين</h3>
        </div>
        <div className="text-red-600 text-sm">{error}</div>
        <button 
          onClick={fetchStorageUsage}
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
        >
          إعادة المحاولة
        </button>
      </div>
    )
  }

  if (!storageData) return null

  const { storage, limits } = storageData
  const isNearLimit = storage.used.percentage >= 75

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">مساحة التخزين</h3>
        </div>
        {isNearLimit ? (
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
        ) : (
          <CheckCircle className="w-5 h-5 text-green-600" />
        )}
      </div>

      {/* Usage Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>المساحة المستخدمة</span>
          <span className={getUsageColor(storage.used.percentage)}>
            {storage.used.percentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getUsageBarColor(storage.used.percentage)}`}
            style={{ width: `${Math.min(storage.used.percentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Storage Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-600">المساحة المستخدمة</div>
          <div className="font-semibold">{storage.used.mb} MB</div>
        </div>
        <div>
          <div className="text-gray-600">المساحة المتبقية</div>
          <div className="font-semibold">{storage.remaining.mb} MB</div>
        </div>
        <div>
          <div className="text-gray-600">إجمالي الملفات</div>
          <div className="font-semibold">{storage.fileCount} ملف</div>
        </div>
        <div>
          <div className="text-gray-600">الحد الأقصى</div>
          <div className="font-semibold">{limits.freeTier}</div>
        </div>
      </div>

      {/* Warning Message */}
      {isNearLimit && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              {storage.used.percentage >= 90 
                ? 'مساحة التخزين ممتلئة تقريباً! يرجى ترقية الحساب أو حذف الملفات القديمة.'
                : 'مساحة التخزين قاربت على الامتلاء. يرجى مراقبة الاستخدام.'
              }
            </span>
          </div>
        </div>
      )}

      {/* Upgrade Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>ترقية الحساب:</strong> احصل على {limits.proTier} مساحة تخزين مع الخطة المدفوعة
        </div>
      </div>
    </div>
  )
} 