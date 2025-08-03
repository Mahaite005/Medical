import { NextRequest, NextResponse } from 'next/server'
import { cleanupOldMedicalImages, getOldFilesStats } from '@/lib/autoCleanup'

// إجبار هذا الـ route على أن يكون dynamic (مطلوب للـ cron jobs)
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // الحصول على إحصائيات الملفات القديمة
    const stats = await getOldFilesStats()
    
    if (!stats) {
      return NextResponse.json({ 
        error: 'فشل في جلب إحصائيات الملفات' 
      }, { status: 500 })
    }
    
    return NextResponse.json({
      message: 'إحصائيات الملفات القديمة',
      stats,
      info: {
        retentionPeriod: '5 أيام',
        nextCleanup: 'كل 6 ساعات',
        description: 'سيتم حذف الملفات التي يزيد عمرها عن 5 أيام تلقائياً'
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Cleanup stats API error:', error)
    return NextResponse.json({ 
      error: 'حدث خطأ في الخادم' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // قراءة المعاملات من الطلب (قد يكون فارغ للـ cron jobs)
    const body = await request.json().catch(() => ({}))
    const { dryRun = false, confirm = false } = body
    
    // تحديد إذا كان الطلب من Vercel cron
    const isVercelCron = request.headers.get('user-agent')?.includes('vercel-cron') || false
    
    // للـ cron jobs، نفذ الحذف الفعلي تلقائياً
    // للطلبات العادية، إذا لم يتم التأكيد، اجعله dry run
    const isDryRun = isVercelCron ? false : (dryRun || !confirm)
    
    console.log(`🔧 تشغيل API التنظيف - نمط: ${isDryRun ? 'محاكاة' : 'تنفيذ فعلي'}`)
    console.log(`🤖 مصدر الطلب: ${isVercelCron ? 'Vercel Cron Job' : 'Manual Request'}`)
    
    // تنفيذ عملية التنظيف
    const result = await cleanupOldMedicalImages(isDryRun)
    
    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'فشل في عملية التنظيف',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
    
    // تحديد الرسالة بناءً على النمط
    const message = isDryRun ? 
      'تم فحص الملفات - لا يتم حذف شيء في نمط المحاكاة' : 
      'تم التنظيف بنجاح'
    
    return NextResponse.json({
      message,
      result,
      simulation: isDryRun,
      info: {
        mode: isDryRun ? 'محاكاة' : 'تنفيذ فعلي',
        foundFiles: isDryRun ? result.potentialDeletions : result.deletedCount,
        deletedFiles: result.deletedCount || 0,
        freedSpace: isDryRun ? 
          `${result.potentialSpaceFreed || 0} MB (محتمل)` : 
          `${result.sizeDeleted || 0} MB`,
        deletedRecords: result.recordsDeleted || 0,
        fileDetails: result.fileDetails || []
      },
      instructions: isDryRun ? {
        next: 'لتنفيذ الحذف الفعلي، أرسل POST request مع { "confirm": true }',
        warning: 'تأكد من مراجعة قائمة الملفات قبل التأكيد'
      } : null,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Cleanup API error:', error)
    return NextResponse.json({ 
      error: 'حدث خطأ في الخادم',
      details: error instanceof Error ? error.message : 'خطأ غير معروف',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 