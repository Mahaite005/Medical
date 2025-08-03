import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// تم إزالة scheduleAutoCleanup لأنه لا يعمل بشكل صحيح في serverless environment

const inter = Inter({ subsets: ['latin'] })

// إعدادات Viewport منفصلة (Next.js 14+ requirement)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6'
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://medicalapp-teal.vercel.app'),
  title: {
    default: 'المختبر الرقمي - تحليل الفحوصات الطبية بالذكاء الاصطناعي',
    template: '%s | المختبر الرقمي'
  },
  description: 'منصة رقمية متطورة لتحليل نتائج الفحوصات والتحاليل الطبية باستخدام الذكاء الاصطناعي. احصل على تقارير مفصلة ونصائح طبية شخصية مع أعلى معايير الأمان والخصوصية.',
  keywords: ['تحليل طبي', 'فحوصات طبية', 'ذكاء اصطناعي', 'تقارير طبية', 'نصائح صحية', 'مختبر رقمي', 'صحة', 'طب', 'تشخيص'],
  authors: [{ name: 'المختبر الرقمي' }],
  creator: 'المختبر الرقمي',
  publisher: 'المختبر الرقمي',
  robots: 'index, follow',
  manifest: '/manifest.json',
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: 'https://medicalapp-teal.vercel.app',
    title: 'المختبر الرقمي - تحليل الفحوصات الطبية بالذكاء الاصطناعي',
    description: 'منصة رقمية متطورة لتحليل نتائج الفحوصات والتحاليل الطبية باستخدام الذكاء الاصطناعي',
    siteName: 'المختبر الرقمي',
    images: [
      {
        url: '/lab-icon-192.svg',
        width: 192,
        height: 192,
        alt: 'المختبر الرقمي'
      }
    ]
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'المختبر الرقمي - تحليل الفحوصات الطبية بالذكاء الاصطناعي',
    description: 'منصة رقمية متطورة لتحليل نتائج الفحوصات والتحاليل الطبية باستخدام الذكاء الاصطناعي',
            images: ['/lab-icon-192.svg']
  },
  
  // App Links
  other: {
    'application-name': 'المختبر الرقمي',
    'msapplication-TileColor': '#3b82f6',
    'msapplication-config': '/browserconfig.xml'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // التنظيف التلقائي الآن يتم عبر API calls وcron jobs
  // راجع /api/cleanup للتنظيف اليدوي
  
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="المختبر الرقمي" />
        
        {/* Enhanced SEO Meta Tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="google" content="notranslate" />
        <meta name="language" content="Arabic" />
        <meta name="geo.region" content="EG" />
        <meta name="geo.country" content="Egypt" />
        <meta name="audience" content="all" />
        <meta name="rating" content="general" />
        <meta name="distribution" content="global" />
        <meta name="coverage" content="worldwide" />
        <meta name="target" content="all" />
        
        {/* Icons and App Integration */}
        <link rel="apple-touch-icon" href="/lab-icon-192.svg" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" sizes="192x192" href="/lab-icon-192.svg" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
        <link rel="mask-icon" href="/lab-icon-192.svg" color="#3b82f6" />
        
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "المختبر الرقمي",
            "description": "منصة رقمية متطورة لتحليل نتائج الفحوصات والتحاليل الطبية باستخدام الذكاء الاصطناعي",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Web Browser",
            "url": "https://medicalapp-teal.vercel.app",
            "provider": {
              "@type": "Organization",
              "name": "المختبر الرقمي",
              "url": "https://medicalapp-teal.vercel.app"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "تحليل الفحوصات الطبية",
              "تقارير مفصلة",
              "نصائح صحية شخصية",
              "مراقبة المؤشرات الصحية",
              "أمان البيانات"
            ]
          })}
        </script>
      </head>
      <body className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ${inter.className}`}>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
} 