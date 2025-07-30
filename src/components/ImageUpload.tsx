'use client'

import { useState, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { Camera, Upload, X, Loader2, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { GEMINI_CONFIG, isValidFileType, isValidFileSize } from '@/lib/geminiConfig'

interface ImageUploadProps {
  user: User
}

export default function ImageUpload({ user }: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [selectedFileType, setSelectedFileType] = useState<string>('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Enhanced file validation
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file type
    if (!isValidFileType(file.type)) {
      return { 
        isValid: false, 
        error: GEMINI_CONFIG.ERROR_MESSAGES.INVALID_FILE_TYPE
      }
    }

    // Check file size using the new function
    if (!isValidFileSize(file.size, file.type)) {
      const maxSizeMB = file.type === 'application/pdf' ? 5 : 10;
      return { 
        isValid: false, 
        error: `حجم الملف كبير جداً. الحد الأقصى ${maxSizeMB} ميجابايت. يرجى اختيار ملف أصغر.`
      }
    }

    // Additional security checks
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      return { 
        isValid: false, 
        error: 'اسم الملف غير صالح.' 
      }
    }

    return { isValid: true }
  }

  const handleFileSelect = (file: File) => {
    // Validate file
    const validation = validateFile(file)
    if (!validation.isValid) {
      setError(validation.error!)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      
      // Additional validation of the file data
      if (file.type === 'application/pdf') {
        if (!result.startsWith('data:application/pdf')) {
          setError('الملف المحدد ليس ملف PDF صحيح.')
          return
        }
      } else if (!result.startsWith('data:image/')) {
        setError('الملف المحدد ليس صورة صحيحة.')
        return
      }

      setSelectedFile(result)
      setSelectedFileType(file.type)
      setResult(null)
      setError(null)
    }
    reader.onerror = () => {
      setError('فشل في قراءة الملف. يرجى المحاولة مرة أخرى.')
    }
    reader.readAsDataURL(file)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
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

  const analyzeFile = async () => {
    if (!selectedFile) return

    setAnalyzing(true)
    setError(null)

    try {
      console.log('Starting file analysis...')
      
      // Convert file to base64
      const base64 = selectedFile.split(',')[1]
      console.log('File converted to base64, length:', base64.length)
      
      // Validate base64 data
      if (!base64 || base64.length === 0) {
        throw new Error('بيانات الملف غير صحيحة.')
      }

      // First, try to upload file to Supabase storage
      const fileExtension = selectedFileType === 'application/pdf' ? 'pdf' : 'jpg'
      const fileName = `${user.id}/${Date.now()}.${fileExtension}`
      console.log('Uploading to Supabase storage:', fileName)
      
      // Convert base64 to blob for upload
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: selectedFileType });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('medical-images')
        .upload(fileName, blob, {
          contentType: selectedFileType
        })

      if (uploadError) {
        console.error('Supabase upload error:', uploadError)
        throw new Error('فشل في رفع الملف. تحقق من إعدادات التخزين.')
      }

      console.log('File uploaded successfully:', uploadData)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('medical-images')
        .getPublicUrl(fileName)

      console.log('Public URL:', publicUrl)

      // Analyze file
      console.log('Calling analysis API...')
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64,
          fileType: selectedFileType,
        }),
      })

      console.log('Analysis API response status:', response.status)

      if (!response.ok) {
        let errorMessage = 'فشل في تحليل الملف'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          console.error('Failed to parse error response:', e)
          // Handle specific status codes
          if (response.status === 504) {
            errorMessage = selectedFileType === 'application/pdf' 
              ? GEMINI_CONFIG.ERROR_MESSAGES.PDF_TIMEOUT
              : 'انتهت مهلة التحليل. يرجى المحاولة مرة أخرى.'
          }
        }
        throw new Error(errorMessage)
      }

      const analysis = await response.json()
      console.log('Analysis completed successfully')
      
      // Save to database
      console.log('Saving to database...')
      const { error: dbError } = await supabase
        .from('medical_tests')
        .insert([
          {
            user_id: user.id,
            image_url: publicUrl,
            analysis_result: analysis.result,
            recommendations: analysis.recommendations || analysis.result,
            test_type: selectedFileType === 'application/pdf' ? 'PDF' : 'Image'
          }
        ])

      if (dbError) {
        console.error('Database error:', dbError)
        // Don't throw error here, just log it - the analysis was successful
        console.log('Analysis successful but failed to save to database')
      } else {
        console.log('Successfully saved to database')
      }

      setResult(analysis.result)
    } catch (error: any) {
      console.error('Analysis error:', error)
      let errorMessage = error.message || 'حدث خطأ أثناء التحليل. حاول مرة أخرى لاحقاً.'
      
      // Provide more specific error messages for PDF files
      if (selectedFileType === 'application/pdf' && errorMessage.includes('مهلة')) {
        errorMessage = 'انتهت مهلة تحليل ملف PDF. الملف كبير جداً أو يحتوي على صفحات كثيرة. يرجى اختيار ملف أصغر أو تقليل عدد الصفحات.'
      }
      
      setError(errorMessage)
    } finally {
      setAnalyzing(false)
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setSelectedFileType('')
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const getFileTypeIcon = () => {
    return selectedFileType === 'application/pdf' ? <FileText className="w-6 h-6" /> : <Camera className="w-6 h-6" />
  }

  const getFileTypeText = () => {
    return selectedFileType === 'application/pdf' ? 'ملف PDF' : 'صورة'
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {!selectedFile && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
            رفع ملف الفحص الطبي
          </h2>
          
          <div className="space-y-4">
            {/* Camera Button */}
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-primary-300 rounded-xl text-primary-600 hover:border-primary-400 hover:bg-primary-50 transition-colors"
            >
              <Camera className="w-6 h-6" />
              <span className="font-medium">التقط صورة بالكاميرا</span>
            </button>

            {/* File Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-6 h-6" />
              <span className="font-medium">اختر ملف من الجهاز</span>
            </button>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">نصائح لأفضل النتائج:</h3>
                         <ul className="text-sm text-blue-800 space-y-1">
               <li>• تأكد من وضوح الصورة وعدم وجود ضبابية</li>
               <li>• تأكد من وجود إضاءة جيدة</li>
               <li>• احرص على ظهور جميع النتائج في الصورة</li>
               <li>• تجنب الظلال على الورقة</li>
               <li>• حجم الملف: الصور أقل من 10 ميجابايت، PDF أقل من 5 ميجابايت</li>
               <li>• الصيغ المدعومة: JPG, PNG, WebP, PDF</li>
               <li>• ملفات PDF: يفضل أن تحتوي على أقل من 10 صفحات للتحليل الأسرع</li>
               <li>• تأكد من أن ملفات PDF تحتوي على صور واضحة للنتائج</li>
             </ul>
          </div>
        </div>
      )}

      {/* File Preview and Analysis */}
      {selectedFile && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">معاينة الملف</h3>
            <button
              onClick={resetUpload}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {getFileTypeIcon()}
              <span className="font-medium">{getFileTypeText()}</span>
            </div>
          </div>

          {selectedFileType === 'application/pdf' ? (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">ملف PDF</span>
              </div>
                           <p className="text-sm text-yellow-700">
               سيتم تحليل جميع الصور الموجودة في ملف PDF. تأكد من أن الصور واضحة ويمكن قراءتها. يفضل أن يحتوي الملف على أقل من 10 صفحات للتحليل الأسرع.
             </p>
            </div>
          ) : (
            <div className="camera-container mb-6">
              <img
                src={selectedFile}
                alt="Medical test preview"
                className="camera-preview"
              />
            </div>
          )}

          {!analyzing && !result && (
            <button
              onClick={analyzeFile}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              تحليل النتيجة
            </button>
          )}

          {analyzing && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">جاري تحليل الملف...</p>
                           <p className="text-sm text-gray-500 mt-2">
               {selectedFileType === 'application/pdf' 
                 ? 'قد يستغرق تحليل ملف PDF وقتاً أطول (حتى دقيقة واحدة)'
                 : 'قد يستغرق هذا 10-30 ثانية'
               }
             </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-sm font-bold">!</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-red-900 mb-2">خطأ في التحليل</h4>
                  <p className="text-red-700 mb-4 text-sm leading-relaxed">{error}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={analyzeFile}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-red-700 transition-colors"
                    >
                      إعادة المحاولة
                    </button>
                    <button
                      onClick={resetUpload}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-gray-700 transition-colors"
                    >
                      اختيار ملف جديد
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="font-semibold text-green-900 mb-4 text-lg">🔬 نتيجة التحليل:</h4>
              <div 
                className="text-green-800 leading-relaxed medical-analysis"
                dangerouslySetInnerHTML={{ 
                  __html: formatAnalysisText(result) 
                }}
              />
              <button
                onClick={resetUpload}
                className="mt-6 w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                تحليل ملف جديد
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 