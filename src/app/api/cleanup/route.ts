import { NextRequest, NextResponse } from 'next/server'
import { cleanupOldMedicalImages, getOldFilesStats } from '@/lib/autoCleanup'

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
    // تنفيذ عملية التنظيف اليدوية
    const result = await cleanupOldMedicalImages()
    
    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'فشل في عملية التنظيف' 
      }, { status: 500 })
    }
    
    return NextResponse.json({
      message: 'تم التنظيف بنجاح',
      result,
      info: {
        deletedFiles: result.deletedCount,
        freedSpace: `${result.sizeDeleted} MB`,
        deletedRecords: result.recordsDeleted
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Cleanup API error:', error)
    return NextResponse.json({ 
      error: 'حدث خطأ في الخادم' 
    }, { status: 500 })
  }
} 