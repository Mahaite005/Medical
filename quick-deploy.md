# ⚡ دليل النشر السريع

## 🚀 النشر في 10 دقائق

### الخطوة 1: إعداد Supabase (3 دقائق)
```bash
# 1. اذهب إلى supabase.com
# 2. أنشئ مشروع جديد
# 3. انسخ هذه المعلومات:
```

**معلومات Supabase المطلوبة:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**تشغيل قاعدة البيانات:**
```sql
-- انسخ محتوى database.sql في SQL Editor
-- اضغط RUN
```

### الخطوة 2: إعداد Storage (1 دقيقة)
```bash
# في Supabase Dashboard > Storage
# 1. أنشئ bucket باسم 'medical-images'
# 2. اجعله public
```

### الخطوة 3: إعداد Google Gemini (2 دقيقة)
```bash
# 1. اذهب إلى Google AI Studio
# 2. أنشئ API Key جديد
# 3. انسخ المفتاح
```

### الخطوة 4: رفع الكود إلى GitHub (2 دقيقة)
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```

### الخطوة 5: نشر على Vercel (2 دقيقة)
```bash
# 1. اذهب إلى vercel.com
# 2. Import Project من GitHub
# 3. أضف Environment Variables:
```

**Environment Variables في Vercel:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## 🌍 إعداد الدومين (اختياري)

### شراء دومين:
- Namecheap
- GoDaddy
- Google Domains

### ربط الدومين:
```bash
# في Vercel Dashboard > Settings > Domains
# 1. أضف دومينك
# 2. اتبع تعليمات DNS
# 3. انتظر 24 ساعة للتفعيل
```

---

## ✅ اختبار التطبيق

### اختبار سريع:
1. ✅ تسجيل حساب جديد
2. ✅ رفع صورة للتحليل
3. ✅ رفع ملف PDF للتحليل
4. ✅ اختبار إعادة تعيين كلمة المرور

---

## 🔧 استكشاف الأخطاء السريع

### مشكلة: خطأ في قاعدة البيانات
```bash
# الحل: تأكد من تشغيل database.sql في Supabase
```

### مشكلة: خطأ في رفع الملفات
```bash
# الحل: تأكد من إنشاء bucket 'medical-images' في Supabase
```

### مشكلة: خطأ في API
```bash
# الحل: تأكد من Environment Variables في Vercel
```

---

## 📊 التكلفة التقريبية

### شهرياً:
- **Vercel**: مجاني (للبداية)
- **Supabase**: مجاني (للبداية)
- **Google Gemini**: ~$1-5 (حسب الاستخدام)
- **الدومين**: ~$10-15/سنة

### التكلفة الإجمالية: ~$20-30/شهر

---

## 🎯 النتيجة

بعد 10 دقائق ستحصل على:
✅ تطبيق يعمل على الإنترنت
✅ قاعدة بيانات آمنة
✅ API يعمل بكفاءة
✅ دعم الصور و PDF
✅ حماية أمنية كاملة

---

*التطبيق جاهز للاستخدام! 🚀* 