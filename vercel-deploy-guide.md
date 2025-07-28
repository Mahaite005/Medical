# 🚀 دليل رفع التطبيق على Vercel المجاني

## 📋 المتطلبات الأساسية

### 1. **حساب GitHub**
- إذا لم يكن لديك حساب، أنشئ واحد على [github.com](https://github.com)

### 2. **حساب Vercel**
- سجل دخول على [vercel.com](https://vercel.com) بحساب GitHub

### 3. **إعداد Supabase**
- أنشئ مشروع على [supabase.com](https://supabase.com)

---

## 🔧 الخطوة 1: إعداد GitHub Repository

### 1.1 إنشاء Repository جديد
```bash
# 1. اذهب إلى github.com
# 2. اضغط على "+" في الأعلى
# 3. اختر "New repository"
# 4. املأ البيانات:
#    - Repository name: medical-ai-app
#    - Description: تطبيق الذكاء الاصطناعي الطبي
#    - Public (اختياري)
# 5. اضغط "Create repository"
```

### 1.2 رفع الكود إلى GitHub
```bash
# افتح Terminal في مجلد المشروع
cd /path/to/your/medical-app

# تهيئة Git
git init

# إضافة جميع الملفات
git add .

# عمل commit أولي
git commit -m "Initial commit - Medical AI App"

# إضافة remote repository
git remote add origin https://github.com/YOUR_USERNAME/medical-ai-app.git

# تغيير الفرع إلى main
git branch -M main

# رفع الكود
git push -u origin main
```

**⚠️ مهم**: تأكد من استبدال `YOUR_USERNAME` باسم المستخدم الخاص بك على GitHub.

---

## 🌐 الخطوة 2: إعداد Supabase

### 2.1 إنشاء مشروع Supabase
```bash
# 1. اذهب إلى supabase.com
# 2. اضغط "Start your project"
# 3. سجل دخول أو أنشئ حساب
# 4. اضغط "New Project"
# 5. املأ البيانات:
#    - Project name: Medical AI App
#    - Database Password: أنشئ كلمة مرور قوية
#    - Region: اختر الأقرب لك
# 6. انتظر إنشاء المشروع (2-3 دقائق)
```

### 2.2 تشغيل قاعدة البيانات
```bash
# 1. في Supabase Dashboard، اذهب إلى SQL Editor
# 2. انسخ محتوى ملف database.sql
# 3. الصقه في SQL Editor
# 4. اضغط RUN
```

### 2.3 إعداد Storage
```bash
# 1. اذهب إلى Storage في Supabase Dashboard
# 2. اضغط "Create bucket"
# 3. اسم الـ bucket: medical-images
# 4. اجعله Public bucket
# 5. اضغط "Create bucket"
```

### 2.4 الحصول على API Keys
```bash
# 1. اذهب إلى Settings > API
# 2. انسخ:
#    - Project URL
#    - anon public key
#    - service_role key (اختياري)
```

---

## 🔑 الخطوة 3: إعداد Google Gemini API

### 3.1 الحصول على API Key
```bash
# 1. اذهب إلى Google AI Studio
#    https://aistudio.google.com/app/apikey
# 2. سجل دخول بحساب Google
# 3. اضغط "Create API Key"
# 4. انسخ المفتاح واحتفظ به
```

### 3.2 إضافة رصيد (اختياري)
```bash
# 1. في Google AI Studio، اذهب إلى Billing
# 2. أضف بطاقة ائتمان
# 3. أضف رصيد للبدء ($5-10)
```

---

## 🚀 الخطوة 4: رفع التطبيق على Vercel

### 4.1 ربط Vercel بـ GitHub
```bash
# 1. اذهب إلى vercel.com
# 2. اضغط "Sign up with GitHub"
# 3. امنح الصلاحيات المطلوبة
# 4. اضغط "Continue"
```

### 4.2 استيراد المشروع
```bash
# 1. في Vercel Dashboard، اضغط "New Project"
# 2. اختر "Import Git Repository"
# 3. ابحث عن repository الخاص بك
# 4. اضغط "Import"
```

### 4.3 إعداد Environment Variables
```bash
# في صفحة إعداد المشروع، أضف هذه المتغيرات:

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Google Gemini API
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# App Configuration
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
```

**⚠️ مهم**: استبدل القيم بمعلوماتك الحقيقية من Supabase و Google Gemini.

### 4.4 إعدادات إضافية
```bash
# في نفس الصفحة:
# 1. Framework Preset: Next.js (يجب أن يكتشفه تلقائياً)
# 2. Root Directory: ./ (اتركه فارغ)
# 3. Build Command: npm run build (افتراضي)
# 4. Output Directory: .next (افتراضي)
# 5. Install Command: npm install (افتراضي)
```

### 4.5 النشر
```bash
# 1. اضغط "Deploy"
# 2. انتظر عملية البناء (2-3 دقائق)
# 3. ستظهر رسالة "Deployment successful"
```

---

## 🌍 الخطوة 5: إعداد الدومين المخصص (اختياري)

### 5.1 شراء دومين
```bash
# مواقع موصى بها:
# - Namecheap.com
# - GoDaddy.com
# - Google Domains
```

### 5.2 ربط الدومين بـ Vercel
```bash
# 1. في Vercel Dashboard، اذهب إلى Settings > Domains
# 2. اضغط "Add Domain"
# 3. أدخل دومينك (مثال: myapp.com)
# 4. اتبع تعليمات DNS
```

### 5.3 إعداد DNS
```bash
# في موقع شراء الدومين، أضف هذه السجلات:
# Type: A
# Name: @
# Value: 76.76.19.19

# Type: CNAME
# Name: www
# Value: cname.vercel-dns.com
```

### 5.4 تحديث Environment Variables
```bash
# في Vercel Dashboard > Settings > Environment Variables
# حدث NEXT_PUBLIC_SITE_URL:
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## 🧪 الخطوة 6: اختبار التطبيق

### 6.1 اختبار الوظائف الأساسية
```bash
# 1. افتح رابط التطبيق
# 2. جرب تسجيل حساب جديد
# 3. جرب رفع صورة للتحليل
# 4. جرب رفع ملف PDF
# 5. جرب إعادة تعيين كلمة المرور
```

### 6.2 اختبار الأمان
```bash
# 1. تأكد من عمل HTTPS
# 2. جرب Rate Limiting
# 3. جرب File Upload Security
```

---

## 🔧 استكشاف الأخطاء الشائعة

### مشكلة: خطأ في البناء
```bash
# الحل:
# 1. تحقق من Environment Variables
# 2. تأكد من صحة API Keys
# 3. راجع Build Logs في Vercel
```

### مشكلة: خطأ في قاعدة البيانات
```bash
# الحل:
# 1. تأكد من تشغيل database.sql
# 2. تحقق من صحة Supabase URL
# 3. تأكد من إنشاء bucket 'medical-images'
```

### مشكلة: خطأ في API
```bash
# الحل:
# 1. تحقق من Google Gemini API Key
# 2. تأكد من وجود رصيد كافي
# 3. راجع API Logs
```

### مشكلة: خطأ في الدومين
```bash
# الحل:
# 1. انتظر 24 ساعة لتفعيل DNS
# 2. تحقق من إعدادات DNS
# 3. تأكد من ربط الدومين بـ Vercel
```

---

## 📊 مراقبة التطبيق

### 1. **Vercel Analytics**
```bash
# في Vercel Dashboard > Analytics
# فعّل Web Analytics لمراقبة الزيارات
```

### 2. **Supabase Monitoring**
```bash
# في Supabase Dashboard > Logs
# راقب Database Performance
```

### 3. **Google Gemini Usage**
```bash
# في Google AI Studio
# راقب API Usage والتكلفة
```

---

## 💰 التكلفة

### **Vercel المجاني يتضمن:**
- ✅ 100GB Bandwidth/شهر
- ✅ 100GB Storage
- ✅ 100 Function Executions/يوم
- ✅ Custom Domains
- ✅ SSL Certificates
- ✅ CDN

### **Supabase المجاني يتضمن:**
- ✅ 500MB Database
- ✅ 1GB Storage
- ✅ 50,000 API Calls/شهر

### **Google Gemini:**
- ✅ $0.001/request تقريباً
- ✅ $1-5/شهر للاستخدام العادي

---

## 🎯 النتيجة النهائية

بعد اتباع هذه الخطوات ستحصل على:

✅ **تطبيق يعمل على الإنترنت**
✅ **دومين مجاني من Vercel**
✅ **SSL Certificate مجاني**
✅ **CDN مجاني**
✅ **قاعدة بيانات آمنة**
✅ **API يعمل بكفاءة**
✅ **دعم الصور و PDF**
✅ **حماية أمنية كاملة**

---

## 📞 الدعم

إذا واجهت أي مشاكل:

1. **تحقق من Logs** في Vercel Dashboard
2. **راجع Environment Variables**
3. **اختبر محلياً أولاً**
4. **تواصل مع الدعم الفني**

---

*التطبيق جاهز للاستخدام! 🚀* 