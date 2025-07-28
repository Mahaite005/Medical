# ⚙️ إعدادات الإنتاج

## 🔧 ملفات الإعداد المطلوبة

### 1. **Environment Variables للإنتاج**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Google Gemini API
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# App Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### 2. **تحديث next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['your-project.supabase.co'], // تحديث domain
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ]
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
}

module.exports = nextConfig
```

### 3. **تحديث CORS في Supabase**

```sql
-- في Supabase Dashboard > Settings > API
-- أضف دومينك إلى CORS origins:
https://your-domain.com
https://www.your-domain.com
```

---

## 🛡️ إعدادات الأمان

### 1. **SSL Certificate**
```bash
# Vercel يوفر SSL تلقائياً
# تأكد من تفعيل HTTPS في جميع الصفحات
```

### 2. **Content Security Policy**
```javascript
// في middleware.ts
res.headers.set('Content-Security-Policy', 
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: https: blob:; " +
  "font-src 'self'; " +
  "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com; " +
  "frame-ancestors 'none';"
)
```

### 3. **Rate Limiting**
```javascript
// في API routes
const maxRequests = 10 // requests per minute
const windowMs = 60 * 1000 // 1 minute
```

---

## 📊 إعدادات المراقبة

### 1. **Google Analytics**
```javascript
// في _app.tsx أو layout.tsx
import Script from 'next/script'

export default function Layout({ children }) {
  return (
    <html>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 2. **Error Tracking**
```javascript
// إضافة Sentry أو LogRocket
// في _app.tsx
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

---

## 🚀 تحسينات الأداء

### 1. **Image Optimization**
```javascript
// في next.config.js
images: {
  domains: ['your-project.supabase.co'],
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

### 2. **Caching**
```javascript
// في API routes
res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
```

### 3. **Compression**
```javascript
// في next.config.js
compress: true,
```

---

## 📈 إعدادات التوسع

### 1. **Database Optimization**
```sql
-- إضافة indexes للاستعلامات المتكررة
CREATE INDEX idx_medical_tests_user_id_created_at 
ON medical_tests(user_id, created_at DESC);

CREATE INDEX idx_profiles_email 
ON profiles(email);
```

### 2. **Storage Optimization**
```javascript
// في ImageUpload.tsx
const optimizeImage = async (file: File) => {
  // تحسين الصور قبل الرفع
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = new Image()
  
  return new Promise((resolve) => {
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(resolve, 'image/jpeg', 0.8)
    }
    img.src = URL.createObjectURL(file)
  })
}
```

---

## 🔧 إعدادات النسخ الاحتياطي

### 1. **Database Backup**
```sql
-- في Supabase Dashboard > Settings > Database
-- فعّل Automated Backups
-- احتفظ بنسخة احتياطية أسبوعياً
```

### 2. **Code Backup**
```bash
# GitHub repository
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```

### 3. **Environment Backup**
```bash
# احتفظ بنسخة من Environment Variables
# في ملف آمن (لا ترفعه على GitHub)
```

---

## 📊 مراقبة الأداء

### 1. **Vercel Analytics**
```bash
# في Vercel Dashboard > Analytics
# فعّل Web Analytics
# راقب Core Web Vitals
```

### 2. **Supabase Monitoring**
```bash
# في Supabase Dashboard > Logs
# راقب Database Performance
# راقب API Calls
```

### 3. **Google Gemini Usage**
```bash
# في Google AI Studio
# راقب API Usage
# راقب التكلفة
```

---

## 🎯 النتيجة النهائية

بعد تطبيق هذه الإعدادات:

✅ **أداء محسن** (Core Web Vitals ممتاز)
✅ **أمان عالي** (جميع الثغرات مغلقة)
✅ **مراقبة شاملة** (Analytics + Error Tracking)
✅ **قابل للتوسع** (Database + Storage Optimization)
✅ **نسخ احتياطية** (Automated Backups)

---

*التطبيق جاهز للإنتاج! 🚀* 