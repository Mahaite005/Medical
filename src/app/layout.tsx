import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { scheduleAutoCleanup } from '@/lib/autoCleanup'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'تطبيق التحليل الطبي',
  description: 'تطبيق ويب حديث لتحليل نتائج الفحوصات الطبية بدقة عالية',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#3b82f6',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // تفعيل التنظيف التلقائي (فقط في الخادم)
  if (typeof window === 'undefined') {
    scheduleAutoCleanup()
  }
  
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="تطبيق الذكاء الاصطناعي الطبي" />
        <link rel="apple-touch-icon" href="https://cdn-icons-png.flaticon.com/512/5394/5394269.png" />
        <link rel="icon" href="https://cdn-icons-png.flaticon.com/512/5394/5394269.png" />
      </head>
      <body className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ${inter.className}`}>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
} 