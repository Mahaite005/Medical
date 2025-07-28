# 🚀 دليل نشر التطبيق على الاستضافة

## 📋 المتطلبات الأساسية

### 1. **حساب Supabase**
- إنشاء مشروع جديد على [supabase.com](https://supabase.com)
- الحصول على URL و API Keys

### 2. **استضافة ويب**
- Vercel (موصى به)
- Netlify
- Railway
- أو أي استضافة تدعم Node.js

### 3. **دومين**
- دومين خاص بك
- إعداد DNS

---

## 🔧 الخطوة 1: إعداد قاعدة البيانات

### 1.1 إنشاء مشروع Supabase
```bash
# 1. اذهب إلى supabase.com
# 2. أنشئ حساب جديد
# 3. أنشئ مشروع جديد
# 4. احفظ المعلومات التالية:
```

### 1.2 معلومات Supabase المطلوبة
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 1.3 تشغيل SQL Scripts
```sql
-- انسخ والصق محتوى database.sql في SQL Editor
-- في Supabase Dashboard > SQL Editor
```

### 1.4 إعداد Storage
```bash
# في Supabase Dashboard > Storage
# 1. أنشئ bucket جديد باسم 'medical-images'
# 2. اجعله public
# 3. أضف policies للأمان
```

---

## 🌐 الخطوة 2: إعداد الاستضافة (Vercel)

### 2.1 رفع الكود إلى GitHub
```bash
# 1. أنشئ repository جديد على GitHub
# 2. ارفع الكود:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```

### 2.2 ربط Vercel بـ GitHub
```bash
# 1. اذهب إلى vercel.com
# 2. سجل دخول بـ GitHub
# 3. اختر Import Project
# 4. اختر repository الخاص بك
```

### 2.3 إعداد Environment Variables
```env
# في Vercel Dashboard > Settings > Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## 🔑 الخطوة 3: إعداد Google Gemini API

### 3.1 الحصول على API Key
```bash
# 1. اذهب إلى Google AI Studio
# 2. أنشئ API Key جديد
# 3. احفظ المفتاح
```

### 3.2 إضافة المفتاح إلى Vercel
```env
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 🌍 الخطوة 4: إعداد الدومين

### 4.1 شراء دومين
```bash
# مواقع موصى بها:
# - Namecheap
# - GoDaddy
# - Google Domains
```

### 4.2 إعداد DNS
```bash
# في Vercel Dashboard > Settings > Domains
# 1. أضف دومينك
# 2. اتبع تعليمات DNS
# 3. انتظر التفعيل (قد يستغرق 24 ساعة)
```

### 4.3 تحديث Environment Variables
```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## ⚙️ الخطوة 5: إعدادات إضافية

### 5.1 تحديث next.config.js
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
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

### 5.2 تحديث CORS في Supabase
```sql
-- في Supabase Dashboard > Settings > API
-- أضف دومينك إلى CORS origins:
https://your-domain.com
https://www.your-domain.com
```

---

## 🧪 الخطوة 6: اختبار التطبيق

### 6.1 اختبار الوظائف الأساسية
```bash
# 1. تسجيل حساب جديد
# 2. رفع صورة للتحليل
# 3. رفع ملف PDF للتحليل
# 4. اختبار إعادة تعيين كلمة المرور
```

### 6.2 اختبار الأمان
```bash
# 1. اختبار Rate Limiting
# 2. اختبار CSRF Protection
# 3. اختبار File Upload Security
```

---

## 📊 الخطوة 7: المراقبة والتحسين

### 7.1 إعداد Analytics
```bash
# في Vercel Dashboard > Analytics
# 1. فعّل Web Analytics
# 2. راقب الأداء
```

### 7.2 إعداد Monitoring
```bash
# في Supabase Dashboard > Logs
# 1. راقب Database Logs
# 2. راقب API Calls
```

---

## 🔧 استكشاف الأخطاء

### مشاكل شائعة وحلولها:

#### 1. **خطأ في قاعدة البيانات**
```bash
# الحل: تأكد من تشغيل SQL scripts
# في Supabase Dashboard > SQL Editor
```

#### 2. **خطأ في رفع الملفات**
```bash
# الحل: تأكد من إعداد Storage Bucket
# في Supabase Dashboard > Storage
```

#### 3. **خطأ في API**
```bash
# الحل: تأكد من Environment Variables
# في Vercel Dashboard > Settings > Environment Variables
```

#### 4. **خطأ في الدومين**
```bash
# الحل: انتظر 24 ساعة لتفعيل DNS
# أو تحقق من إعدادات DNS
```

---

## 📈 التحسينات الإضافية

### 1. **إضافة CDN**
```bash
# في Vercel Dashboard > Settings > Domains
# فعّل Edge Network
```

### 2. **إضافة SSL Certificate**
```bash
# Vercel يوفر SSL تلقائياً
# تأكد من تفعيل HTTPS
```

### 3. **إعداد Backup**
```bash
# في Supabase Dashboard > Settings > Database
# فعّل Automated Backups
```

---

## 🎯 النتيجة النهائية

بعد اتباع هذه الخطوات، ستحصل على:

✅ **تطبيق يعمل على دومين خاص**
✅ **قاعدة بيانات آمنة ومحسنة**
✅ **API يعمل بكفاءة**
✅ **حماية أمنية كاملة**
✅ **أداء محسن**
✅ **قابل للتوسع**

---

## 📞 الدعم

إذا واجهت أي مشاكل:

1. **تحقق من Logs** في Vercel Dashboard
2. **راجع Environment Variables**
3. **اختبر محلياً أولاً**
4. **تواصل مع الدعم الفني**

---

*آخر تحديث: ${new Date().toLocaleDateString('ar-SA')}* 