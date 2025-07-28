-- إنشاء function لتحديث كلمة المرور مباشرة في نظام auth
-- يجب تشغيل هذا في Supabase SQL Editor

-- إنشاء extension للتشفير إذا لم تكن موجودة
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- إنشاء function لتحديث كلمة المرور
CREATE OR REPLACE FUNCTION update_user_password(user_email TEXT, new_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    user_record auth.users%ROWTYPE;
    encrypted_password TEXT;
BEGIN
    -- البحث عن المستخدم
    SELECT * INTO user_record
    FROM auth.users
    WHERE email = user_email
    AND deleted_at IS NULL;
    
    -- التحقق من وجود المستخدم
    IF NOT FOUND THEN
        RAISE LOG 'User not found: %', user_email;
        RETURN FALSE;
    END IF;
    
    -- تشفير كلمة المرور الجديدة
    encrypted_password := crypt(new_password, gen_salt('bf'));
    
    -- تحديث كلمة المرور في جدول auth.users
    UPDATE auth.users
    SET 
        encrypted_password = encrypted_password,
        password_hash = encrypted_password,
        updated_at = NOW()
    WHERE id = user_record.id;
    
    -- تسجيل العملية
    RAISE LOG 'Password updated successfully for user: %', user_email;
    
    RETURN TRUE;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error updating password for user %: %', user_email, SQLERRM;
        RETURN FALSE;
END;
$$;

-- منح الصلاحيات اللازمة
GRANT EXECUTE ON FUNCTION update_user_password(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_password(TEXT, TEXT) TO anon;

-- اختبار الfunction (اختياري)
-- SELECT update_user_password('test@example.com', 'newpassword123');

-- للتحقق من الfunction
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'update_user_password';

-- تنظيف الكودات القديمة
DELETE FROM password_reset_codes 
WHERE expires_at < NOW() OR used = true;

-- استعلام للتحقق من الكودات النشطة
SELECT 
    email,
    code,
    expires_at,
    used,
    created_at
FROM password_reset_codes
WHERE used = false AND expires_at > NOW()
ORDER BY created_at DESC;

/*
ملاحظات مهمة:
1. هذه Function تتطلب صلاحيات SECURITY DEFINER
2. تستخدم pgcrypto لتشفير كلمة المرور
3. تحدث كلمة المرور مباشرة في auth.users
4. في حالة فشل هذه الطريقة، استخدم Supabase Service Role Key
*/ 