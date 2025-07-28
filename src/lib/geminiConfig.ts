// إعدادات Google Gemini API
export const GEMINI_CONFIG = {
  // حدود الاستخدام
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 10,
    REQUESTS_PER_HOUR: 100,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB (زيادة للـ PDF)
  },

  // إعدادات النموذج
  MODEL_CONFIG: {
    MODEL: 'gemini-1.5-flash',
    TEMPERATURE: 0.3,
    TOP_K: 32,
    TOP_P: 1,
    MAX_OUTPUT_TOKENS: 2048,
  },

  // أنواع الملفات المسموحة
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'application/pdf'  // إضافة دعم PDF
  ],

  // التكلفة التقريبية (بالدولار)
  COST_ESTIMATE: {
    PER_REQUEST: 0.001, // تقريباً $0.001 لكل طلب
    PER_MONTH_1000_REQUESTS: 1.00, // تقريباً $1 لـ 1000 طلب
  },

  // رسائل الخطأ
  ERROR_MESSAGES: {
    RATE_LIMIT_EXCEEDED: 'تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة لاحقاً.',
    INVALID_FILE_TYPE: 'نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG, PNG, WebP أو ملف PDF.',
    FILE_TOO_LARGE: 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت.',
    API_KEY_MISSING: 'مفتاح Google Gemini API غير متوفر.',
    ANALYSIS_FAILED: 'فشل في تحليل الملف. يرجى المحاولة مرة أخرى.',
    PDF_PROCESSING_ERROR: 'فشل في معالجة ملف PDF. تأكد من أن الملف يحتوي على صور واضحة.',
  }
}

// دالة لحساب التكلفة التقريبية
export function estimateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1000) * 0.00025
  const outputCost = (outputTokens / 1000) * 0.0005
  return inputCost + outputCost
}

// دالة للتحقق من حدود الاستخدام
export function checkUsageLimits(currentUsage: number): boolean {
  return currentUsage < GEMINI_CONFIG.RATE_LIMIT.REQUESTS_PER_MINUTE
}

// دالة للتحقق من نوع الملف
export function isValidFileType(fileType: string): boolean {
  return GEMINI_CONFIG.ALLOWED_FILE_TYPES.includes(fileType.toLowerCase())
}

// دالة لتحويل PDF إلى صور
export async function convertPdfToImages(file: File): Promise<string[]> {
  // سيتم تنفيذ هذه الدالة في الخطوة التالية
  return []
} 