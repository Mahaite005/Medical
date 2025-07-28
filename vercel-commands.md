# ⚡ الأوامر المباشرة لرفع التطبيق على Vercel

## 🚀 الأوامر السريعة

### **الخطوة 1: إعداد Git**
```bash
# افتح Terminal في مجلد المشروع
cd C:\Users\Osama-Pc\Desktop\Med

# تهيئة Git
git init

# إضافة جميع الملفات
git add .

# عمل commit أولي
git commit -m "Initial commit - Medical AI App"

# إضافة remote repository (استبدل YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/medical-ai-app.git

# تغيير الفرع إلى main
git branch -M main

# رفع الكود
git push -u origin main
```

### **الخطوة 2: إنشاء ملف .gitignore**
```bash
# تأكد من وجود ملف .gitignore يحتوي على:
.env.local
.env.production.local
node_modules/
.next/
.vercel/
```

### **الخطوة 3: تحديث package.json**
```json
{
  "name": "medical-ai-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## 🔧 إعدادات Vercel

### **Environment Variables المطلوبة:**
```env
# في Vercel Dashboard > Settings > Environment Variables

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Google Gemini
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# App
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

### **Build Settings:**
```bash
# Framework Preset: Next.js
# Root Directory: ./
# Build Command: npm run build
# Output Directory: .next
# Install Command: npm install
```

---

## 🌐 روابط مهمة

### **إنشاء الحسابات:**
- [GitHub](https://github.com) - لحفظ الكود
- [Vercel](https://vercel.com) - للنشر
- [Supabase](https://supabase.com) - لقاعدة البيانات
- [Google AI Studio](https://aistudio.google.com/app/apikey) - لـ API

### **الروابط المطلوبة:**
```bash
# 1. GitHub Repository
https://github.com/YOUR_USERNAME/medical-ai-app

# 2. Vercel Dashboard
https://vercel.com/dashboard

# 3. Supabase Dashboard
https://supabase.com/dashboard/project/YOUR_PROJECT_ID

# 4. Google AI Studio
https://aistudio.google.com/app/apikey
```

---

## 📋 قائمة التحقق

### **قبل النشر:**
- [ ] ✅ إنشاء حساب GitHub
- [ ] ✅ إنشاء حساب Vercel
- [ ] ✅ إنشاء مشروع Supabase
- [ ] ✅ الحصول على Google Gemini API Key
- [ ] ✅ تشغيل database.sql في Supabase
- [ ] ✅ إنشاء bucket 'medical-images'
- [ ] ✅ رفع الكود إلى GitHub

### **في Vercel:**
- [ ] ✅ استيراد المشروع من GitHub
- [ ] ✅ إضافة Environment Variables
- [ ] ✅ النقر على Deploy
- [ ] ✅ انتظار نجاح البناء

### **بعد النشر:**
- [ ] ✅ اختبار تسجيل حساب جديد
- [ ] ✅ اختبار رفع صورة
- [ ] ✅ اختبار رفع PDF
- [ ] ✅ اختبار إعادة تعيين كلمة المرور

---

## 🔧 استكشاف الأخطاء

### **إذا فشل البناء:**
```bash
# 1. تحقق من Environment Variables
# 2. تأكد من صحة API Keys
# 3. راجع Build Logs في Vercel
# 4. تأكد من عدم وجود أخطاء في الكود
```

### **إذا لم يعمل التطبيق:**
```bash
# 1. تحقق من Supabase URL و API Key
# 2. تأكد من تشغيل database.sql
# 3. تحقق من إنشاء bucket 'medical-images'
# 4. راجع Function Logs في Vercel
```

### **إذا لم يعمل API:**
```bash
# 1. تحقق من Google Gemini API Key
# 2. تأكد من وجود رصيد كافي
# 3. راجع API Logs في Vercel
```

---

## 📊 مراقبة الأداء

### **Vercel Analytics:**
```bash
# في Vercel Dashboard > Analytics
# فعّل Web Analytics لمراقبة:
# - عدد الزيارات
# - Core Web Vitals
# - Function Calls
```

### **Supabase Monitoring:**
```bash
# في Supabase Dashboard > Logs
# راقب:
# - Database Performance
# - API Calls
# - Storage Usage
```

### **Google Gemini Usage:**
```bash
# في Google AI Studio
# راقب:
# - API Usage
# - التكلفة
# - Rate Limits
```

---

## 💰 التكلفة الشهرية

### **المجاني:**
- ✅ Vercel: 100GB Bandwidth
- ✅ Supabase: 500MB Database
- ✅ Google Gemini: ~$1-5 (حسب الاستخدام)

### **المجموع: ~$5-10/شهر**

---

## 🎯 النتيجة

بعد اتباع هذه الأوامر ستحصل على:

✅ **تطبيق يعمل على الإنترنت**
✅ **دومين مجاني: your-app.vercel.app**
✅ **SSL Certificate مجاني**
✅ **CDN مجاني**
✅ **قاعدة بيانات آمنة**
✅ **API يعمل بكفاءة**
✅ **دعم الصور و PDF**
✅ **حماية أمنية كاملة**

---

*التطبيق جاهز للاستخدام! 🚀* 