import { NextRequest, NextResponse } from 'next/server'
import { getStorageUsage, STORAGE_CONFIG } from '@/lib/storageConfig'

export async function GET(request: NextRequest) {
  try {
    // Get storage usage
    const usage = await getStorageUsage()
    
    if (!usage) {
      return NextResponse.json({ 
        error: 'فشل في جلب معلومات مساحة التخزين' 
      }, { status: 500 })
    }
    
    // Calculate remaining space
    const remainingSpace = STORAGE_CONFIG.FREE_TIER_LIMIT - usage.totalSize
    const remainingSpaceMB = Math.round(remainingSpace / (1024 * 1024) * 100) / 100
    
    return NextResponse.json({
      message: 'معلومات مساحة التخزين',
      storage: {
        used: {
          bytes: usage.totalSize,
          mb: usage.totalSizeMB,
          percentage: usage.usagePercentage
        },
        remaining: {
          bytes: remainingSpace,
          mb: remainingSpaceMB
        },
        limit: {
          bytes: STORAGE_CONFIG.FREE_TIER_LIMIT,
          mb: Math.round(STORAGE_CONFIG.FREE_TIER_LIMIT / (1024 * 1024))
        },
        fileCount: usage.fileCount
      },
      limits: {
        freeTier: '1 GB',
        proTier: '100 GB',
        maxFileSize: '10 MB'
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Storage usage API error:', error)
    return NextResponse.json({ 
      error: 'حدث خطأ في الخادم' 
    }, { status: 500 })
  }
} 