-- ===================================
-- تشخيص قاعدة البيانات - فحص شامل
-- نسخ والصق في Supabase SQL Editor
-- ===================================

-- 1. فحص عدد المستخدمين في جدول profiles
SELECT 'المستخدمين في جدول profiles' as table_name, COUNT(*) as count
FROM profiles;

-- 2. عرض جميع الإيميلات الموجودة في profiles
SELECT 'الإيميلات في profiles' as info, email, full_name, created_at 
FROM profiles 
ORDER BY created_at DESC;

-- 3. فحص عدد المستخدمين في جدول auth.users
SELECT 'المستخدمين في auth.users' as table_name, COUNT(*) as count
FROM auth.users;

-- 4. عرض الإيميلات من auth.users
SELECT 'الإيميلات في auth.users' as info, email, created_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

-- 5. البحث عن إيميل محدد في profiles
-- استبدل 'aa659531@gmail.com' بالإيميل الذي تريد البحث عنه
SELECT 'البحث في profiles' as search_type, * 
FROM profiles 
WHERE email = 'aa659531@gmail.com';

-- 6. البحث عن إيميل محدد في auth.users
SELECT 'البحث في auth.users' as search_type, id, email, created_at
FROM auth.users 
WHERE email = 'aa659531@gmail.com';

-- 7. البحث غير حساس للحالة في profiles
SELECT 'البحث غير حساس للحالة في profiles' as search_type, * 
FROM profiles 
WHERE LOWER(email) = LOWER('aa659531@gmail.com');

-- 8. فحص سياسات الأمان (RLS) على جدول profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 9. فحص الصلاحيات على جدول profiles
SELECT table_name, privilege_type, grantee
FROM information_schema.role_table_grants 
WHERE table_name = 'profiles';

-- 10. فحص إعدادات RLS
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 11. إدراج مستخدم اختبار إذا لم يكن موجوداً
INSERT INTO profiles (id, email, full_name, phone, age, country, gender)
SELECT 
    uuid_generate_v4(),
    'test@example.com',
    'مستخدم اختبار',
    '123456789',
    25,
    'السعودية',
    'ذكر'
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE email = 'test@example.com'
);

-- 12. التحقق من إدراج المستخدم الاختبار
SELECT 'مستخدم الاختبار' as user_type, * 
FROM profiles 
WHERE email = 'test@example.com'; 