'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { generateResetCode, storeResetCode, verifyResetCode, checkResetCode, sendResetPasswordEmail, resetUserPassword } from '@/lib/passwordReset'
import { Eye, EyeOff, Mail, Lock, User, Phone, Stethoscope, Calendar, MapPin, Users, FileText, Pill, AlertTriangle, ArrowLeft, Shield } from 'lucide-react'

// Password validation function
const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل')
  }
  
  if (!/\d/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Email validation function
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export default function AuthComponent() {
  const [isLogin, setIsLogin] = useState(true)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1) // 1: email, 2: code, 3: new password
  const [resetEmail, setResetEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState('')
  const [country, setCountry] = useState('')
  const [gender, setGender] = useState('')
  const [maritalStatus, setMaritalStatus] = useState('')
  const [previousMedicalConditions, setPreviousMedicalConditions] = useState('')
  const [isSmoker, setIsSmoker] = useState(false)
  const [currentDiseases, setCurrentDiseases] = useState('')
  const [surgeries, setSurgeries] = useState('')
  const [chronicDiseases, setChronicDiseases] = useState('')
  const [currentMedications, setCurrentMedications] = useState('')
  const [hasDrugAllergies, setHasDrugAllergies] = useState(false)
  const [drugAllergiesDetails, setDrugAllergiesDetails] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setPasswordErrors([])

    try {
      // Validate email
      if (!validateEmail(email)) {
        setError('يرجى إدخال بريد إلكتروني صحيح')
        setLoading(false)
        return
      }

      // Validate password for registration
      if (!isLogin) {
        const passwordValidation = validatePassword(password)
        if (!passwordValidation.isValid) {
          setPasswordErrors(passwordValidation.errors)
          setLoading(false)
          return
        }
      }

      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
            }
          }
        })
        if (error) throw error
        
        if (data.user) {
          // Insert comprehensive user profile
          console.log('👤 إنشاء الملف الشخصي للمستخدم:', data.user.email)
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email: data.user.email!,
                full_name: fullName,
                phone: phone,
                age: age ? parseInt(age) : null,
                country: country,
                gender: gender,
                marital_status: maritalStatus,
                previous_medical_conditions: previousMedicalConditions,
                is_smoker: isSmoker,
                current_diseases: currentDiseases,
                surgeries: surgeries,
                chronic_diseases: chronicDiseases,
                current_medications: currentMedications,
                has_drug_allergies: hasDrugAllergies,
                drug_allergies_details: drugAllergiesDetails,
              }
            ])
          
          if (profileError) {
            console.error('❌ خطأ في إنشاء الملف الشخصي:', profileError)
            
            // إعطاء رسالة خطأ واضحة للمستخدم
            throw new Error('فشل في إنشاء الملف الشخصي - يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني')
          } else {
            console.log('✅ تم إنشاء الملف الشخصي بنجاح')
          }
        }
      }
    } catch (error: any) {
      setError(error.message || 'حدث خطأ أثناء المصادقة')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      // Validate email
      if (!validateEmail(resetEmail)) {
        setError('يرجى إدخال بريد إلكتروني صحيح')
        setLoading(false)
        return
      }

      // Get site URL from environment or use current origin
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const redirectUrl = `${siteUrl}/reset-password`
      
      console.log('Sending password reset email to:', resetEmail)
      console.log('Using site URL:', siteUrl)
      console.log('Using redirect URL:', redirectUrl)
      
      // Use Supabase's built-in password reset
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: redirectUrl,
        captchaToken: undefined // No captcha required
      })

      if (error) {
        console.error('Supabase resetPasswordForEmail error:', error)
        throw error
      }

      console.log('Password reset email sent successfully')
      setSuccessMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد (والبريد المزعج) واتباع الرابط المرفق.')
    } catch (error: any) {
      console.error('Password reset error:', error)
      setError(error.message || 'حدث خطأ أثناء إعادة تعيين كلمة المرور')
    } finally {
      setLoading(false)
    }
  }

  const resetForgotPassword = () => {
    setShowForgotPassword(false)
    setForgotPasswordStep(1)
    setResetEmail('')
    setResetCode('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setSuccessMessage('')
  }

  // Forgot Password UI
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              إعادة تعيين كلمة المرور
            </h1>
            <p className="text-gray-600">
              {forgotPasswordStep === 1 && 'أدخل بريدك الإلكتروني لإرسال رابط إعادة تعيين كلمة المرور'}
              {forgotPasswordStep === 2 && 'أدخل رمز التحقق المرسل إلى بريدك'}
              {forgotPasswordStep === 3 && 'أدخل كلمة المرور الجديدة'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {forgotPasswordStep === 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    البريد الإلكتروني
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني
                  </p>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                                      <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="أدخل بريدك الإلكتروني"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    مثال: example@gmail.com
                  </p>
                  </div>
                </div>
              )}

              {forgotPasswordStep === 2 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رمز التحقق (6 أرقام)
                  </label>
                  <div className="relative">
                    <Shield className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                      pattern="\d{6}"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    تحقق من صندوق الوارد في بريدك الإلكتروني
                  </p>
                </div>
              )}

              {forgotPasswordStep === 3 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      كلمة المرور الجديدة
                    </label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pr-10 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="أدخل كلمة المرور الجديدة"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      تأكيد كلمة المرور الجديدة
                    </label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pr-10 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="أعد إدخال كلمة المرور"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-600">{successMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'جاري التحميل...' : 
                 forgotPasswordStep === 1 ? 'إرسال رمز التحقق' :
                 forgotPasswordStep === 2 ? 'التحقق من الرمز' :
                 'تحديث كلمة المرور'}
              </button>

              <button
                type="button"
                onClick={resetForgotPassword}
                className="w-full flex items-center justify-center text-gray-600 hover:text-gray-800 py-2"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة إلى تسجيل الدخول
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            تطبيق التحليل الطبي
          </h1>
          <p className="text-gray-600">
            تحليل نتائج الفحوصات الطبية بدقة عالية
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                isLogin
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                !isLogin
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              إنشاء حساب
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <>
                {/* معلومات شخصية أساسية */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <User className="w-5 h-5 ml-2" />
                    المعلومات الشخصية الأساسية
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الاسم الكامل
                      </label>
                      <div className="relative">
                        <User className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="أدخل اسمك الكامل"
                          required={!isLogin}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        العمر
                      </label>
                      <div className="relative">
                        <Calendar className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="العمر"
                          min="1"
                          max="120"
                          required={!isLogin}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        رقم الهاتف (يفضل الواتس اب)
                      </label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-right"
                          placeholder="أدخل رقم هاتفك"
                          required={!isLogin}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        البلد المقيم فيها
                      </label>
                      <div className="relative">
                        <MapPin className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="البلد"
                          required={!isLogin}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الجنس
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required={!isLogin}
                      >
                        <option value="">اختر الجنس</option>
                        <option value="ذكر">ذكر</option>
                        <option value="أنثى">أنثى</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الحالة الاجتماعية
                      </label>
                      <div className="relative">
                        <Users className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                        <select
                          value={maritalStatus}
                          onChange={(e) => setMaritalStatus(e.target.value)}
                          className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          required={!isLogin}
                        >
                          <option value="">اختر الحالة الاجتماعية</option>
                          <option value="أعزب">أعزب</option>
                          <option value="متزوج">متزوج</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* التاريخ الطبي */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FileText className="w-5 h-5 ml-2" />
                    التاريخ الطبي
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الحالات المرضية السابقة
                      </label>
                      <textarea
                        value={previousMedicalConditions}
                        onChange={(e) => setPreviousMedicalConditions(e.target.value)}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="اذكر أي حالات مرضية سابقة"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        العمليات الجراحية السابقة
                      </label>
                      <textarea
                        value={surgeries}
                        onChange={(e) => setSurgeries(e.target.value)}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="اذكر أي عمليات جراحية قمت بها"
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="checkbox"
                        id="smoker"
                        checked={isSmoker}
                        onChange={(e) => setIsSmoker(e.target.checked)}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label htmlFor="smoker" className="text-sm font-medium text-gray-700">
                        هل أنت مدخن؟
                      </label>
                    </div>
                  </div>
                </div>

                {/* الحالة الصحية الحالية */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Pill className="w-5 h-5 ml-2" />
                    الحالة الصحية الحالية
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الأمراض الحالية
                      </label>
                      <textarea
                        value={currentDiseases}
                        onChange={(e) => setCurrentDiseases(e.target.value)}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="اذكر أي أمراض تعاني منها حالياً"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الأمراض المزمنة
                      </label>
                      <textarea
                        value={chronicDiseases}
                        onChange={(e) => setChronicDiseases(e.target.value)}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="اذكر أي أمراض مزمنة (مثل السكري، الضغط، إلخ)"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الأدوية التي تتناولها حالياً
                      </label>
                      <textarea
                        value={currentMedications}
                        onChange={(e) => setCurrentMedications(e.target.value)}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="اذكر جميع الأدوية التي تتناولها حالياً"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* الحساسية */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 ml-2" />
                    الحساسية
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="checkbox"
                        id="allergies"
                        checked={hasDrugAllergies}
                        onChange={(e) => setHasDrugAllergies(e.target.checked)}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label htmlFor="allergies" className="text-sm font-medium text-gray-700">
                        هل تعاني من حساسية تجاه أي أدوية؟
                      </label>
                    </div>

                    {hasDrugAllergies && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          تفاصيل الحساسية
                        </label>
                        <textarea
                          value={drugAllergiesDetails}
                          onChange={(e) => setDrugAllergiesDetails(e.target.value)}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="اذكر الأدوية التي تسبب لك حساسية ونوع رد الفعل"
                          rows={3}
                          required={hasDrugAllergies}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="أدخل بريدك الإلكتروني"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="أدخل كلمة المرور"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password requirements for registration */}
              {!isLogin && password && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">متطلبات كلمة المرور:</p>
                  <ul className="text-xs space-y-1">
                    <li className={password.length >= 8 ? 'text-green-600' : 'text-red-600'}>
                      ✓ 8 أحرف على الأقل
                    </li>
                    <li className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-red-600'}>
                      ✓ حرف كبير واحد على الأقل
                    </li>
                    <li className={/[a-z]/.test(password) ? 'text-green-600' : 'text-red-600'}>
                      ✓ حرف صغير واحد على الأقل
                    </li>
                    <li className={/\d/.test(password) ? 'text-green-600' : 'text-red-600'}>
                      ✓ رقم واحد على الأقل
                    </li>
                    <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-red-600'}>
                      ✓ رمز خاص واحد على الأقل
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Forgot Password Link */}
            {isLogin && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  هل نسيت كلمة المرور؟
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {passwordErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <ul className="text-sm text-red-600 space-y-1">
                  {passwordErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'جاري التحميل...' : isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          بالمتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية
        </p>
      </div>
    </div>
  )
} 