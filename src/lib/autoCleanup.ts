// نظام الحذف التلقائي للصور الطبية
import { supabase } from './supabase'
import { STORAGE_CONFIG } from './storageConfig'

// دالة لحذف الصور القديمة (أكثر من 5 أيام) - محسنة
export async function cleanupOldMedicalImages(dryRun: boolean = false) {
  try {
    console.log('🔍 بدء عملية تنظيف الصور الطبية القديمة...')
    console.log(`📋 نمط التشغيل: ${dryRun ? 'محاكاة (لن يتم حذف شيء)' : 'تنفيذ فعلي'}`)
    
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
      return { success: true, deletedCount: 0, simulationOnly: dryRun }
    }
    
    // تعيين التاريخ الحد بدقة أكبر (5 أيام = 120 ساعة)
    const fiveDaysAgo = new Date()
    fiveDaysAgo.setTime(fiveDaysAgo.getTime() - (5 * 24 * 60 * 60 * 1000)) // 5 أيام بالميللي ثانية
    
    console.log(`📅 سيتم حذف الملفات الأقدم من: ${fiveDaysAgo.toLocaleString('ar-EG')}`)
    console.log(`📅 التاريخ الحالي: ${new Date().toLocaleString('ar-EG')}`)
    
    const filesToDelete: string[] = []
    const fileDetails: Array<{name: string, created: string, size: number, ageInDays: number}> = []
    let totalSizeDeleted = 0
    
    // فحص الملفات التي يزيد عمرها عن 5 أيام
    for (const file of files) {
      if (file.created_at) {
        const fileCreatedAt = new Date(file.created_at)
        const ageInMs = Date.now() - fileCreatedAt.getTime()
        const ageInDays = Math.floor(ageInMs / (24 * 60 * 60 * 1000))
        
        if (fileCreatedAt < fiveDaysAgo) {
          filesToDelete.push(file.name)
          const fileSize = file.metadata?.size || 0
          totalSizeDeleted += fileSize
          
          fileDetails.push({
            name: file.name,
            created: fileCreatedAt.toLocaleString('ar-EG'),
            size: Math.round(fileSize / 1024), // KB
            ageInDays: ageInDays
          })
          
          console.log(`📄 ملف للحذف: ${file.name} | العمر: ${ageInDays} يوم | الحجم: ${Math.round(fileSize / 1024)} KB`)
        }
      }
    }
    
    if (filesToDelete.length === 0) {
      console.log('✅ لا توجد ملفات قديمة للحذف')
      return { 
        success: true, 
        deletedCount: 0, 
        simulationOnly: dryRun,
        message: 'لا توجد ملفات تحتاج للحذف' 
      }
    }
    
    const totalSizeMB = Math.round(totalSizeDeleted / (1024 * 1024) * 100) / 100
    
    if (dryRun) {
      console.log(`🔍 محاكاة: سيتم حذف ${filesToDelete.length} ملف قديم`)
      console.log(`🔍 محاكاة: سيتم تحرير ${totalSizeMB} MB من المساحة`)
      
      return {
        success: true,
        deletedCount: 0,
        simulationOnly: true,
        potentialDeletions: filesToDelete.length,
        potentialSpaceFreed: totalSizeMB,
        fileDetails: fileDetails,
        message: `تم العثور على ${filesToDelete.length} ملف قديم يمكن حذفها`
      }
    }
    
    // التنفيذ الفعلي للحذف
    console.log(`🗑️ جاري حذف ${filesToDelete.length} ملف قديم...`)
    
    // حذف الملفات من التخزين
    const { error: deleteError } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .remove(filesToDelete)
    
    if (deleteError) {
      console.error('❌ خطأ في حذف الملفات:', deleteError)
      return { success: false, error: deleteError.message, simulationOnly: false }
    }
    
    // حذف السجلات من قاعدة البيانات
    const deletedRecords = await deleteMedicalTestRecords(filesToDelete)
    
    console.log(`✅ تم حذف ${filesToDelete.length} ملف بنجاح`)
    console.log(`💾 تم تحرير ${totalSizeMB} MB من المساحة`)
    console.log(`🗃️ تم حذف ${deletedRecords} سجل من قاعدة البيانات`)
    
    return {
      success: true,
      deletedCount: filesToDelete.length,
      sizeDeleted: totalSizeMB,
      recordsDeleted: deletedRecords,
      simulationOnly: false,
      fileDetails: fileDetails,
      message: `تم حذف ${filesToDelete.length} ملف بنجاح وتحرير ${totalSizeMB} MB`
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
    console.log('⏰ تشغيل التنظيف التلقائي...') // مهم للمراقبة
    await cleanupOldMedicalImages()
  }, 6 * 60 * 60 * 1000) // 6 ساعات
  
  // تشغيل التنظيف الأول بعد 10 دقائق
  setTimeout(async () => {
    console.log('⏰ تشغيل التنظيف الأول...') // مهم للمراقبة
    await cleanupOldMedicalImages()
  }, 10 * 60 * 1000) // 10 دقائق
} 