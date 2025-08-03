'use client'

import { useState, useEffect } from 'react'
import { HardDrive, AlertTriangle, CheckCircle, Trash2, Clock } from 'lucide-react'

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

interface CleanupStats {
  totalFiles: number
  totalSize: number
  oldFiles: number
  oldFilesSize: number
  willBeDeleted: boolean
}

interface CleanupResponse {
  stats: CleanupStats
  info: {
    retentionPeriod: string
    nextCleanup: string
    description: string
  }
}

export default function StorageMonitor() {
  const [storageData, setStorageData] = useState<StorageResponse | null>(null)
  const [cleanupData, setCleanupData] = useState<CleanupResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cleanupLoading, setCleanupLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [cleanupPreview, setCleanupPreview] = useState<any>(null)

  useEffect(() => {
    fetchStorageUsage()
    fetchCleanupStats()
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

  const fetchCleanupStats = async () => {
    try {
      const response = await fetch('/api/cleanup')
      const data = await response.json()
      
      if (response.ok) {
        setCleanupData(data)
      }
    } catch (error) {
      console.error('Error fetching cleanup stats:', error)
    }
  }

  // معاينة الملفات التي سيتم حذفها
  const handlePreviewCleanup = async () => {
    try {
      setPreviewLoading(true)
      setError(null)
      
      const response = await fetch('/api/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dryRun: true })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setCleanupPreview(data)
      } else {
        setError(data.error || 'فشل في معاينة التنظيف')
      }
    } catch (error) {
      setError('حدث خطأ أثناء معاينة التنظيف')
    } finally {
      setPreviewLoading(false)
    }
  }

  // تنفيذ التنظيف الفعلي
  const handleManualCleanup = async () => {
    try {
      setCleanupLoading(true)
      setError(null)
      
      const response = await fetch('/api/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ confirm: true })
      })
      const data = await response.json()
      
      if (response.ok) {
        // إعادة تحميل البيانات
        await fetchStorageUsage()
        await fetchCleanupStats()
        setCleanupPreview(null) // إخفاء المعاينة بعد التنظيف
        alert(`تم التنظيف بنجاح! ${data.info?.deletedFiles || 0} ملف محذوف، ${data.info?.freedSpace || '0 MB'} تم تحريرها`)
      } else {
        setError(data.error || 'فشل في التنظيف')
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال أثناء التنظيف')
    } finally {
      setCleanupLoading(false)
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

      {/* التنظيف التلقائي */}
      {cleanupData && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-orange-800">التنظيف التلقائي</span>
            </div>
            {cleanupData.stats.willBeDeleted && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                {cleanupData.stats.oldFiles} ملف قديم
              </span>
            )}
          </div>
          <div className="text-sm text-orange-700 mb-3">
            <p>سيتم حذف الملفات التي يزيد عمرها عن {cleanupData.info.retentionPeriod} تلقائياً</p>
            <p className="text-xs mt-1">التنظيف التالي: {cleanupData.info.nextCleanup}</p>
          </div>
          {cleanupData.stats.willBeDeleted && (
            <div className="space-y-3">
              {/* أزرار التنظيف */}
              <div className="flex gap-2">
                <button
                  onClick={handlePreviewCleanup}
                  disabled={previewLoading || cleanupLoading}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {previewLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  معاينة التنظيف
                </button>
                
                <button
                  onClick={handleManualCleanup}
                  disabled={cleanupLoading || previewLoading}
                  className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm"
                >
                  {cleanupLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  حذف فوري
                </button>
              </div>
              
              {/* عرض المعاينة */}
              {cleanupPreview && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-semibold text-gray-800 mb-2">📋 معاينة الملفات المرشحة للحذف</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>• عدد الملفات: <span className="font-bold text-orange-600">{cleanupPreview.info?.foundFiles || 0}</span></p>
                    <p>• المساحة المحررة: <span className="font-bold text-green-600">{cleanupPreview.info?.freedSpace || '0 MB'}</span></p>
                    <p>• النمط: <span className="font-bold">{cleanupPreview.info?.mode || 'محاكاة'}</span></p>
                  </div>
                  
                  {cleanupPreview.info?.fileDetails && cleanupPreview.info.fileDetails.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-600 mb-2">تفاصيل الملفات:</p>
                      <div className="max-h-40 overflow-y-auto bg-white rounded border p-2">
                        {cleanupPreview.info.fileDetails.slice(0, 10).map((file: any, index: number) => (
                          <div key={index} className="text-xs text-gray-600 py-1 border-b border-gray-100 last:border-b-0">
                            📄 {file.name} ({file.ageInDays} يوم، {file.size} KB)
                          </div>
                        ))}
                        {cleanupPreview.info.fileDetails.length > 10 && (
                          <div className="text-xs text-gray-500 mt-1">... و {cleanupPreview.info.fileDetails.length - 10} ملف آخر</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-xs text-yellow-800">⚠️ هذه معاينة فقط. لم يتم حذف أي ملف بعد.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

 
    </div>
  )
} 