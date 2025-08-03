@echo off
echo =====================================
echo      المختبر الرقمي
echo =====================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js غير مثبت!
    echo.
    echo يرجى تثبيت Node.js من:
    echo https://nodejs.org
    echo.
    echo ثم أعد تشغيل هذا الملف
    pause
    exit /b 1
)

echo ✅ Node.js مثبت
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 تثبيت المكتبات...
    echo هذا قد يستغرق دقيقة...
    echo.
    npm install
    if %errorlevel% neq 0 (
        echo.
        echo ❌ فشل في تثبيت المكتبات
        echo جرب تشغيل: npm install --legacy-peer-deps
        pause
        exit /b 1
    )
    echo ✅ تم تثبيت المكتبات بنجاح
    echo.
)

echo 🚀 تشغيل التطبيق...
echo.
echo افتح المتصفح على: http://localhost:3000
echo اضغط Ctrl+C لإيقاف التطبيق
echo.

npm run dev 