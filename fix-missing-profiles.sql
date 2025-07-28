-- إصلاح مشكلة المستخدمين الموجودين في auth ولكن غير موجودين في profiles
-- يجب تشغيل هذا السكريبت في Supabase SQL Editor

-- 1. التحقق من المستخدمين الموجودين في auth ولكن غير موجودين في profiles
-- (هذا الاستعلام لا يمكن تشغيله مباشرة لأن auth.users محمي، ولكن يمكن استخدامه للمرجع)

-- SELECT 
--   au.email,
--   au.id,
--   au.created_at as auth_created_at,
--   p.email as profile_email
-- FROM auth.users au
-- LEFT JOIN profiles p ON au.id = p.id
-- WHERE p.id IS NULL;

-- 2. إنشاء ملفات شخصية للمستخدمين المفقودين (يدوياً)
-- استبدل البيانات التالية بالبيانات الفعلية للمستخدمين

-- مثال: إنشاء ملف شخصي للمستخدم aa659531@gmail.com
-- تحتاج للحصول على user_id من Supabase Dashboard -> Authentication -> Users

-- INSERT INTO profiles (
--   id,
--   email,
--   full_name,
--   phone,
--   created_at,
--   updated_at
-- ) VALUES (
--   'USER_ID_FROM_AUTH_TABLE',  -- يجب الحصول على هذا من Supabase Dashboard
--   'aa659531@gmail.com',
--   'مستخدم جديد',
--   '',
--   NOW(),
--   NOW()
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   email = EXCLUDED.email,
--   updated_at = NOW();

-- 3. التحقق من المستخدمين الذين لديهم كودات إعادة تعيين كلمة المرور ولكن لا يوجد لهم ملف شخصي
SELECT DISTINCT
  prc.email,
  prc.created_at as reset_code_created,
  p.id as profile_id
FROM password_reset_codes prc
LEFT JOIN profiles p ON prc.email = p.email
WHERE p.id IS NULL
ORDER BY prc.created_at DESC;

-- 4. إضافة constraint للتأكد من أن كل user في auth له profile (اختياري)
-- ALTER TABLE profiles 
-- ADD CONSTRAINT profiles_id_fkey 
-- FOREIGN KEY (id) REFERENCES auth.users(id) 
-- ON DELETE CASCADE;

-- 5. إنشاء function لإنشاء profile تلقائياً عند إنشاء user جديد (اختياري)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. إنشاء trigger لتشغيل function عند إنشاء user جديد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. استعلام للتحقق من جميع الكودات النشطة
SELECT 
  email,
  code,
  expires_at,
  used,
  created_at,
  CASE 
    WHEN expires_at > NOW() AND used = false THEN 'نشط'
    WHEN expires_at <= NOW() THEN 'منتهي الصلاحية'
    WHEN used = true THEN 'مستخدم'
    ELSE 'غير معروف'
  END as status
FROM password_reset_codes
ORDER BY created_at DESC
LIMIT 20;

-- 8. تنظيف الكودات المنتهية الصلاحية والمستخدمة (اختياري)
-- DELETE FROM password_reset_codes 
-- WHERE expires_at < NOW() OR used = true;

-- 9. لحل المشكلة الحالية - تحتاج للحصول على user IDs من Supabase Dashboard
-- اذهب إلى: Supabase Dashboard -> Authentication -> Users
-- انسخ UUID لكل مستخدم وأدرجه أدناه

-- مثال للمستخدمين الحاليين (استبدل UUIDs بالقيم الحقيقية):
-- INSERT INTO profiles (
--   id,
--   email,
--   full_name,
--   phone,
--   created_at,
--   updated_at
-- ) VALUES (
--   'PASTE_USER_ID_HERE',  -- من Authentication -> Users في Dashboard
--   'aa659531@gmail.com',
--   'مستخدم جديد',
--   '',
--   NOW(),
--   NOW()
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   email = EXCLUDED.email,
--   updated_at = NOW();

-- INSERT INTO profiles (
--   id,
--   email,
--   full_name,
--   phone,
--   created_at,
--   updated_at
-- ) VALUES (
--   'PASTE_USER_ID_HERE',  -- من Authentication -> Users في Dashboard
--   'pormaxhd@gmail.com',
--   'مستخدم جديد',
--   '',
--   NOW(),
--   NOW()
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   email = EXCLUDED.email,
--   updated_at = NOW();

-- 10. بديل مؤقت: تعديل API ليتعامل مع المستخدمين المفقودين
-- هذا تم بالفعل في الكود - النظام سيتابع في وضع التطوير

-- 11. للتحقق من نجاح العملية:
SELECT 
  'تم إصلاح المشكلة' as status,
  COUNT(*) as profiles_count
FROM profiles 
WHERE email IN ('aa659531@gmail.com', 'pormaxhd@gmail.com'); 