// نظام الحذف التلقائي للصور الطبية
import { supabase } from './supabase'
import { STORAGE_CONFIG } from './storageConfig'

// دالة لحذف الصور القديمة (أكثر من 5 أيام)
export async function cleanupOldMedicalImages() {
  try {
    console.log('🔍 بدء عملية تنظيف الصور الطبية القديمة...')
    
    // جلب جميع الملفات من التخزين
    const { data: files, error: listError } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .list('', { limit: 1000 })
    
    if (listError) {
      console.error('❌ خطأ في جلب قائمة الملفات:', listError)
      return { success: false, error: listError.message }
    }
    
    if (!files || files.length === 0) {
      console.log('✅ لا توجد ملفات للتنظيف')
      return { success: true, deletedCount: 0 }
    }
    
    const fiveDaysAgo = new Date()
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
    
    const filesToDelete: string[] = []
    let totalSizeDeleted = 0
    
    // فحص الملفات التي يزيد عمرها عن 5 أيام
    for (const file of files) {
      if (file.created_at) {
        const fileCreatedAt = new Date(file.created_at)
        
        if (fileCreatedAt < fiveDaysAgo) {
          filesToDelete.push(file.name)
          if (file.metadata?.size) {
            totalSizeDeleted += file.metadata.size
          }
        }
      }
    }
    
    if (filesToDelete.length === 0) {
      console.log('✅ لا توجد ملفات قديمة للحذف')
      return { success: true, deletedCount: 0 }
    }
    
    console.log(`🗑️ جاري حذف ${filesToDelete.length} ملف قديم...`)
    
    // حذف الملفات من التخزين
    const { error: deleteError } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .remove(filesToDelete)
    
    if (deleteError) {
      console.error('❌ خطأ في حذف الملفات:', deleteError)
      return { success: false, error: deleteError.message }
    }
    
    // حذف السجلات من قاعدة البيانات
    const deletedRecords = await deleteMedicalTestRecords(filesToDelete)
    
    const totalSizeMB = Math.round(totalSizeDeleted / (1024 * 1024) * 100) / 100
    
    console.log(`✅ تم حذف ${filesToDelete.length} ملف بنجاح`)
    console.log(`💾 تم تحرير ${totalSizeMB} MB من المساحة`)
    console.log(`🗃️ تم حذف ${deletedRecords} سجل من قاعدة البيانات`)
    
    return {
      success: true,
      deletedCount: filesToDelete.length,
      sizeDeleted: totalSizeMB,
      recordsDeleted: deletedRecords
    }
    
  } catch (error) {
    console.error('❌ خطأ في عملية التنظيف:', error)
    return { success: false, error: 'خطأ غير متوقع' }
  }
}

// دالة لحذف سجلات الفحوصات الطبية من قاعدة البيانات
async function deleteMedicalTestRecords(fileNames: string[]) {
  try {
    // تحويل أسماء الملفات إلى URLs للبحث عنها
    const fileUrls = fileNames.map(fileName => {
      const { data } = supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .getPublicUrl(fileName)
      return data.publicUrl
    })
    
    // حذف السجلات من قاعدة البيانات
    const { error } = await supabase
      .from('medical_tests')
      .delete()
      .in('image_url', fileUrls)
    
    if (error) {
      console.error('❌ خطأ في حذف سجلات قاعدة البيانات:', error)
      return 0
    }
    
    // تقدير عدد السجلات المحذوفة بناءً على عدد الملفات
    return fileUrls.length
    
  } catch (error) {
    console.error('❌ خطأ في حذف السجلات:', error)
    return 0
  }
}

// دالة للحصول على إحصائيات الملفات القديمة
export async function getOldFilesStats() {
  try {
    const { data: files, error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .list('', { limit: 1000 })
    
    if (error) {
      console.error('❌ خطأ في جلب إحصائيات الملفات:', error)
      return null
    }
    
    const fiveDaysAgo = new Date()
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
    
    let oldFilesCount = 0
    let oldFilesSize = 0
    let totalFilesCount = 0
    let totalFilesSize = 0
    
    for (const file of files || []) {
      totalFilesCount++
      if (file.metadata?.size) {
        totalFilesSize += file.metadata.size
      }
      
      if (file.created_at) {
        const fileCreatedAt = new Date(file.created_at)
        if (fileCreatedAt < fiveDaysAgo) {
          oldFilesCount++
          if (file.metadata?.size) {
            oldFilesSize += file.metadata.size
          }
        }
      }
    }
    
    return {
      totalFiles: totalFilesCount,
      totalSize: Math.round(totalFilesSize / (1024 * 1024) * 100) / 100,
      oldFiles: oldFilesCount,
      oldFilesSize: Math.round(oldFilesSize / (1024 * 1024) * 100) / 100,
      willBeDeleted: oldFilesCount > 0
    }
    
  } catch (error) {
    console.error('❌ خطأ في حساب الإحصائيات:', error)
    return null
  }
}

// دالة لجدولة التنظيف التلقائي
export function scheduleAutoCleanup() {
  // تشغيل التنظيف كل 6 ساعات
  setInterval(async () => {
    console.log('⏰ تشغيل التنظيف التلقائي...')
    await cleanupOldMedicalImages()
  }, 6 * 60 * 60 * 1000) // 6 ساعات
  
  // تشغيل التنظيف الأول بعد 10 دقائق
  setTimeout(async () => {
    console.log('⏰ تشغيل التنظيف الأول...')
    await cleanupOldMedicalImages()
  }, 10 * 60 * 1000) // 10 دقائق
} 