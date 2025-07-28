import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Camera, User as UserIcon } from 'lucide-react';

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
}

export default function EditProfile({ user, onProfileUpdated }: EditProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatar, setAvatar] = useState<string>('');
  const [customAvatar, setCustomAvatar] = useState<File | null>(null);

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

  if (loading) return <div className="text-center py-8">جاري تحميل البيانات...</div>;

  return (
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
  );
} 