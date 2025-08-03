import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Camera, User as UserIcon, Eye, EyeOff } from 'lucide-react';

// قائمة إيموجي احترافية كأفاتار (مزاجية/شخصية)
const moodAvatars = [
  '😀', // سعيد
  '😎', // واثق
  '🤓', // ذكي
  '😇', // بريء
  '🥳', // مبتهج
  '😔', // حزين
  '😷', // مريض
  '🤠', // مغامر
  '🧑‍⚕️', // طبيب
  '👩‍🎓', // متعلم
  '👨‍💻', // مبرمج
  '🦸‍♂️', // بطل
  '🧘‍♂️', // هادئ
  '🤖', // تقني
  '👑', // ملكي
];

interface EditProfileProps {
  user: User;
  onProfileUpdated?: () => void;
  needsPasswordReset?: boolean;
  onPasswordResetComplete?: () => void;
}

export default function EditProfile({ user, onProfileUpdated, needsPasswordReset, onPasswordResetComplete }: EditProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatar, setAvatar] = useState<string>('');
  const [customAvatar, setCustomAvatar] = useState<File | null>(null);

  // حقول تغيير كلمة المرور
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // الحقول الشخصية والطبية
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('');
  const [gender, setGender] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [phone, setPhone] = useState('');
  const [previousMedicalConditions, setPreviousMedicalConditions] = useState('');
  const [isSmoker, setIsSmoker] = useState(false);
  const [currentDiseases, setCurrentDiseases] = useState('');
  const [surgeries, setSurgeries] = useState('');
  const [chronicDiseases, setChronicDiseases] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [hasDrugAllergies, setHasDrugAllergies] = useState(false);
  const [drugAllergiesDetails, setDrugAllergiesDetails] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) {
        setError('تعذر تحميل البيانات');
      } else if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        setAge(data.age ? String(data.age) : '');
        setCountry(data.country || '');
        setGender(data.gender || '');
        setMaritalStatus(data.marital_status || '');
        setPhone(data.phone || '');
        setPreviousMedicalConditions(data.previous_medical_conditions || '');
        setIsSmoker(!!data.is_smoker);
        setCurrentDiseases(data.current_diseases || '');
        setSurgeries(data.surgeries || '');
        setChronicDiseases(data.chronic_diseases || '');
        setCurrentMedications(data.current_medications || '');
        setHasDrugAllergies(!!data.has_drug_allergies);
        setDrugAllergiesDetails(data.drug_allergies_details || '');
        setAvatar(data.avatar_url || '');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user.id]);

  // رفع صورة جديدة
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomAvatar(file);
    // رفع الصورة إلى Supabase Storage
    const fileName = `avatars/${user.id}-${Date.now()}`;
    const { data, error } = await supabase.storage
      .from('medical-images')
      .upload(fileName, file, { contentType: file.type });
    if (error) {
      setError('فشل رفع الصورة');
      return;
    }
    // جلب الرابط العام
    const { data: urlData } = supabase.storage
      .from('medical-images')
      .getPublicUrl(fileName);
    setAvatar(urlData.publicUrl);
    setCustomAvatar(null);
  };

  // حفظ التعديلات
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    const updates = {
      full_name: fullName,
      age: age ? parseInt(age) : null,
      country,
      gender,
      marital_status: maritalStatus,
      phone,
      previous_medical_conditions: previousMedicalConditions,
      is_smoker: isSmoker,
      current_diseases: currentDiseases,
      surgeries,
      chronic_diseases: chronicDiseases,
      current_medications: currentMedications,
      has_drug_allergies: hasDrugAllergies,
      drug_allergies_details: drugAllergiesDetails,
      avatar_url: avatar,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    if (error) {
      setError('فشل حفظ التعديلات');
    } else {
      setSuccess('تم حفظ التعديلات بنجاح');
      if (onProfileUpdated) onProfileUpdated();
    }
    setSaving(false);
  };

  // اختيار أفاتار افتراضي
  const handleSelectAvatar = (url: string) => {
    setAvatar(url);
    setCustomAvatar(null);
  };

  // تحديث كلمة المرور
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setPasswordError('');
    setPasswordSuccess('');
    
    // التحقق من صحة كلمة المرور
    if (newPassword.length < 8) {
      setPasswordError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('كلمتا المرور غير متطابقتين');
      return;
    }
    
    setUpdatingPassword(true);
    
    try {
      // الحصول على المستخدم الحالي أولاً
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        setPasswordError('لم يتم العثور على المستخدم. يرجى تسجيل الدخول مرة أخرى.');
        setUpdatingPassword(false);
        return;
      }
      
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) {
        setPasswordError(error.message || 'حدث خطأ أثناء تحديث كلمة المرور');
      } else {
        setPasswordSuccess('تم تحديث كلمة المرور بنجاح!');
        setNewPassword('');
        setConfirmPassword('');
        
        // إشعار بانتهاء عملية إعادة تعيين كلمة المرور
        if (onPasswordResetComplete) {
          onPasswordResetComplete();
        }
        
        // تأخير قليل ثم مسح رسالة النجاح
        setTimeout(() => {
          setPasswordSuccess('');
        }, 3000);
      }
    } catch (error) {
      setPasswordError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    }
    
    setUpdatingPassword(false);
  };

  if (loading) return <div className="text-center py-8">جاري تحميل البيانات...</div>;

  return (
    <>
      <form onSubmit={handleSave} className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 mt-8">
      <div className="flex items-center mb-4">
        <button
          type="button"
          className="mr-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          onClick={() => onProfileUpdated && onProfileUpdated()}
        >
          <span className="text-lg">←</span> رجوع
        </button>
      </div>
      <h2 className="text-2xl font-bold mb-6 text-center">تعديل الملف الشخصي</h2>
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-24 h-24 mb-2">
          {avatar && moodAvatars.includes(avatar) ? (
            <span className="w-24 h-24 rounded-full flex items-center justify-center text-6xl bg-gray-100 border-2 border-primary-600 mx-auto">{avatar}</span>
          ) : avatar ? (
            <img src={avatar} alt="avatar" className="w-24 h-24 rounded-full object-cover border-2 border-primary-600" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              <UserIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <label className="absolute bottom-0 right-0 bg-primary-600 p-2 rounded-full cursor-pointer hover:bg-primary-700">
            <Camera className="w-5 h-5 text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </label>
        </div>
        <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-2 w-full max-w-xs justify-center">
          {moodAvatars.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={`min-w-[40px] w-10 h-10 rounded-full border-2 flex items-center justify-center text-2xl bg-white cursor-pointer transition-all duration-150 shadow-sm hover:scale-110 ${avatar === emoji ? 'border-primary-600 ring-2 ring-primary-400' : 'border-gray-300'}`}
              onClick={() => handleSelectAvatar(emoji)}
              aria-label={`اختر ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500 mt-1">يمكنك اختيار رمز تعبيري يعبر عنك أو عن حالتك المزاجية</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
          <input type="text" className="w-full border rounded-lg p-2" value={fullName} onChange={e => setFullName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">العمر</label>
          <input type="number" className="w-full border rounded-lg p-2" value={age} onChange={e => setAge(e.target.value)} min="1" max="120" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
          <input type="tel" className="w-full border rounded-lg p-2 text-right" value={phone} onChange={e => setPhone(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">البلد</label>
          <input type="text" className="w-full border rounded-lg p-2" value={country} onChange={e => setCountry(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الجنس</label>
          <select className="w-full border rounded-lg p-2" value={gender} onChange={e => setGender(e.target.value)} required>
            <option value="">اختر الجنس</option>
            <option value="ذكر">ذكر</option>
            <option value="أنثى">أنثى</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الحالة الاجتماعية</label>
          <select className="w-full border rounded-lg p-2" value={maritalStatus} onChange={e => setMaritalStatus(e.target.value)} required>
            <option value="">اختر الحالة</option>
            <option value="أعزب">أعزب</option>
            <option value="متزوج">متزوج</option>
          </select>
        </div>
      </div>
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">الحالات المرضية السابقة</label>
        <textarea className="w-full border rounded-lg p-2" value={previousMedicalConditions} onChange={e => setPreviousMedicalConditions(e.target.value)} rows={2} />
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">هل أنت مدخن؟</label>
          <select className="w-full border rounded-lg p-2" value={isSmoker ? 'yes' : 'no'} onChange={e => setIsSmoker(e.target.value === 'yes')} required>
            <option value="no">لا</option>
            <option value="yes">نعم</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الأمراض الحالية</label>
          <textarea className="w-full border rounded-lg p-2" value={currentDiseases} onChange={e => setCurrentDiseases(e.target.value)} rows={2} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">العمليات الجراحية</label>
          <textarea className="w-full border rounded-lg p-2" value={surgeries} onChange={e => setSurgeries(e.target.value)} rows={2} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الأمراض المزمنة</label>
          <textarea className="w-full border rounded-lg p-2" value={chronicDiseases} onChange={e => setChronicDiseases(e.target.value)} rows={2} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الأدوية الحالية</label>
          <textarea className="w-full border rounded-lg p-2" value={currentMedications} onChange={e => setCurrentMedications(e.target.value)} rows={2} />
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">هل لديك حساسية من أدوية؟</label>
        <select className="w-full border rounded-lg p-2" value={hasDrugAllergies ? 'yes' : 'no'} onChange={e => setHasDrugAllergies(e.target.value === 'yes')} required>
          <option value="no">لا</option>
          <option value="yes">نعم</option>
        </select>
        {hasDrugAllergies && (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">تفاصيل الحساسية</label>
            <textarea className="w-full border rounded-lg p-2" value={drugAllergiesDetails} onChange={e => setDrugAllergiesDetails(e.target.value)} rows={2} />
          </div>
        )}
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4 text-red-600">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4 text-green-600">{success}</div>}
      <button type="submit" disabled={saving} className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium mt-6 hover:bg-primary-700 disabled:opacity-50">{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</button>
    </form>
    
    {/* قسم تغيير كلمة المرور - Form منفصل */}
    <div className={`mt-8 pt-6 border-t-2 ${needsPasswordReset ? 'border-orange-300 bg-orange-50' : 'border-gray-200'} ${needsPasswordReset ? 'rounded-lg p-4' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${needsPasswordReset ? 'text-orange-900' : 'text-gray-900'}`}>
          🔐 تغيير كلمة المرور
          {needsPasswordReset && <span className="animate-pulse"> (مطلوب)</span>}
        </h3>
        {needsPasswordReset && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 animate-bounce">
            ⚠️ مطلوب فوراً
          </span>
        )}
      </div>
      
      {needsPasswordReset && (
        <div className="mb-6 p-4 bg-gradient-to-r from-orange-100 to-red-100 border-l-4 border-orange-400 rounded-lg shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
              <span className="text-orange-700 text-lg">🔒</span>
            </div>
            <div>
              <p className="text-sm text-orange-900 font-bold mb-2">
                مطلوب إعادة تعيين كلمة المرور
              </p>
              <p className="text-xs text-orange-800 leading-relaxed">
                تم طلب إعادة تعيين كلمة المرور لحسابك من خلال البريد الإلكتروني.
                يرجى إدخال كلمة مرور جديدة وقوية أدناه لضمان أمان حسابك وحماية بياناتك الطبية.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handlePasswordUpdate} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {/* حقل كلمة المرور الجديدة */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">🔑</span>
            </div>
            كلمة المرور الجديدة
          </label>
          <div className="relative">
            <input 
              type={showNewPassword ? "text" : "password"}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 pr-12 pl-12 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="أدخل كلمة المرور الجديدة (8 أحرف على الأقل)"
              minLength={8}
              required 
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 text-gray-400">
                🔒
              </div>
            </div>
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <span className="w-3 h-3 text-gray-400">ℹ️</span>
            يجب أن تحتوي على 8 أحرف على الأقل
          </p>
        </div>
        
        {/* حقل تأكيد كلمة المرور */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
            <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            تأكيد كلمة المرور الجديدة
          </label>
          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 pr-12 pl-12 text-sm placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:border-gray-300" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="أعد إدخال كلمة المرور للتأكيد"
              minLength={8}
              required 
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 text-gray-400">
                🔐
              </div>
            </div>
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {confirmPassword && newPassword && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
              <span className="w-3 h-3">{newPassword === confirmPassword ? '✅' : '❌'}</span>
              {newPassword === confirmPassword ? 'كلمتا المرور متطابقتان' : 'كلمتا المرور غير متطابقتان'}
            </p>
          )}
        </div>
        
        {/* رسائل الخطأ والنجاح */}
        {passwordError && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-400 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm">⚠️</span>
              </div>
              <div>
                <h4 className="text-red-800 font-medium text-sm mb-1">خطأ في كلمة المرور</h4>
                <p className="text-red-700 text-sm">{passwordError}</p>
              </div>
            </div>
          </div>
        )}
        
        {passwordSuccess && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">✅</span>
              </div>
              <div>
                <h4 className="text-green-800 font-medium text-sm mb-1">تم التحديث بنجاح</h4>
                <p className="text-green-700 text-sm">{passwordSuccess}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* زر التحديث */}
        <div className="pt-2">
          <button 
            type="submit" 
            disabled={updatingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-xl font-semibold text-sm hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2"
          >
            {updatingPassword ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري تحديث كلمة المرور...
              </>
            ) : (
              <>
                <span className="text-base">🔄</span>
                تحديث كلمة المرور
              </>
            )}
          </button>
        </div>
        
        {/* معلومات الأمان */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 text-blue-600 flex-shrink-0">
              🛡️
            </div>
            <div>
              <h5 className="text-blue-800 font-medium text-xs mb-1">نصائح الأمان</h5>
              <ul className="text-blue-700 text-xs space-y-1">
                <li>• استخدم مزيج من الأحرف والأرقام والرموز</li>
                <li>• تجنب استخدام معلومات شخصية واضحة</li>
                <li>• لا تشارك كلمة المرور مع أي شخص</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
    </>
  );
} 