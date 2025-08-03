'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Calendar, FileText, Eye, Download } from 'lucide-react'

interface TestHistoryProps {
  user: User
}

interface MedicalTest {
  id: string
  image_url: string
  analysis_result: string
  recommendations: string
  created_at: string
  test_type: string | null
}

export default function TestHistory({ user }: TestHistoryProps) {
  const [tests, setTests] = useState<MedicalTest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTest, setSelectedTest] = useState<MedicalTest | null>(null)

  const fetchTests = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('medical_tests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTests(data || [])
    } catch (error) {
      console.error('Error fetching tests:', error)
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    fetchTests()
  }, [fetchTests])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-EG', {
      calendar: 'gregory', // Gregorian calendar (Miladi)
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Riyadh' // or your local timezone
    })
  }

  // Function to format analysis result with better structure
  const formatAnalysisText = (text: string) => {
    // Remove ** and replace with proper HTML formatting
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Convert **text** to <strong>text</strong>
      .replace(/\*/g, '') // Remove remaining single *
      .replace(/\n\s*\n/g, '\n') // Remove extra empty lines
      .replace(/(\d+\.\s*)([^\n]+)/g, '<br><strong>$1$2</strong>') // Keep numbers with their complete text
      .replace(/\n/g, '<br>') // Convert line breaks to <br>
      .replace(/(🔬|📋|💊|🏥|📊|🩺|✅|❌|⚠️)/g, '<span class="medical-icon">$1</span>') // Style medical icons
      .replace(/<br><br>/g, '<br>') // Remove double breaks
      .replace(/^<br>/, '') // Remove leading break
      .trim()
    
    return formatted
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">جاري تحميل السجل الطبي...</p>
      </div>
    )
  }

  if (tests.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          لا توجد فحوصات طبية
        </h3>
        <p className="text-gray-500">
          قم برفع أول فحص طبي لك لبدء تكوين سجلك الطبي
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary-600" />
          السجل الطبي
        </h2>
        <p className="text-gray-600 mb-6">
          إجمالي الفحوصات: {tests.length}
        </p>

        <div className="space-y-3">
          {tests.map((test) => (
            <div
              key={test.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors cursor-pointer"
              onClick={() => setSelectedTest(test)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formatDate(test.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-800 line-clamp-2">
                    {test.analysis_result.substring(0, 100)}...
                  </p>
                </div>
                <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Detail Modal */}
      {selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">تفاصيل الفحص</h3>
                <button
                  onClick={() => setSelectedTest(null)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                التاريخ الميلادي: {formatDate(selectedTest.created_at)}
              </p>
            </div>

            <div className="p-4">
              {/* Image */}
              <div className="mb-6">
                <img
                  src={selectedTest.image_url}
                  alt="Medical test"
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>

              {/* Analysis Result */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">نتيجة التحليل:</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div 
                    className="text-gray-800 leading-relaxed medical-analysis"
                    dangerouslySetInnerHTML={{ 
                      __html: formatAnalysisText(selectedTest.analysis_result) 
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = selectedTest.image_url
                    link.download = `medical-test-${selectedTest.created_at}.jpg`
                    link.click()
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  تحميل الصورة
                </button>
                <button
                  onClick={() => setSelectedTest(null)}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 