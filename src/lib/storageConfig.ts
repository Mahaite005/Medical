// Storage Configuration and Monitoring
import { supabase } from './supabase'

export const STORAGE_CONFIG = {
  // Storage bucket name
  BUCKET_NAME: 'medical-images',
  
  // File size limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Allowed file types
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png', 
    'image/webp',
    'application/pdf'
  ],
  
  // Storage limits (in bytes)
  FREE_TIER_LIMIT: 1 * 1024 * 1024 * 1024, // 1GB
  PRO_TIER_LIMIT: 100 * 1024 * 1024 * 1024, // 100GB
  
  // File organization
  FOLDERS: {
    MEDICAL_IMAGES: 'medical-images',
    AVATARS: 'avatars',
    PDFS: 'pdfs'
  }
}

// دالة للتحقق من مساحة التخزين المستخدمة
export async function getStorageUsage() {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .list('', { limit: 1000 })
    
    if (error) {
      console.error('Error getting storage usage:', error)
      return null
    }
    
    let totalSize = 0
    let fileCount = 0
    
    // Calculate total size
    for (const file of data) {
      if (file.metadata?.size) {
        totalSize += file.metadata.size
        fileCount++
      }
    }
    
    return {
      totalSize,
      fileCount,
      totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
      usagePercentage: Math.round((totalSize / STORAGE_CONFIG.FREE_TIER_LIMIT) * 100)
    }
  } catch (error) {
    console.error('Error calculating storage usage:', error)
    return null
  }
}

// دالة لحذف الملفات القديمة
export async function cleanupOldFiles(daysOld: number = 30) {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .list('', { limit: 1000 })
    
    if (error) {
      console.error('Error listing files for cleanup:', error)
      return
    }
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    
    const filesToDelete: string[] = []
    
    for (const file of data) {
      if (file.created_at && new Date(file.created_at) < cutoffDate) {
        filesToDelete.push(file.name)
      }
    }
    
    if (filesToDelete.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .remove(filesToDelete)
      
      if (deleteError) {
        console.error('Error deleting old files:', deleteError)
      } else {
        console.log(`Deleted ${filesToDelete.length} old files`)
      }
    }
  } catch (error) {
    console.error('Error during cleanup:', error)
  }
}

// دالة للتحقق من نوع الملف
export function isValidFileType(fileType: string): boolean {
  return STORAGE_CONFIG.ALLOWED_TYPES.includes(fileType)
}

// دالة للتحقق من حجم الملف
export function isValidFileSize(fileSize: number): boolean {
  return fileSize <= STORAGE_CONFIG.MAX_FILE_SIZE
}

// دالة لتوليد اسم فريد للملف
export function generateFileName(userId: string, fileType: string): string {
  const timestamp = Date.now()
  const extension = fileType === 'application/pdf' ? 'pdf' : 'jpg'
  return `${userId}/${timestamp}.${extension}`
}

// دالة للحصول على رابط عام للملف
export function getPublicUrl(fileName: string): string {
  const { data } = supabase.storage
    .from(STORAGE_CONFIG.BUCKET_NAME)
    .getPublicUrl(fileName)
  
  return data.publicUrl
} 