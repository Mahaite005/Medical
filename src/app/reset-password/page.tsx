"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [tokenTried, setTokenTried] = useState(false);

  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  // تسجيل خروج إجباري أولاً إذا كان هناك جلسة
  useEffect(() => {
    const doLogoutAndSetSession = async () => {
      if (accessToken && refreshToken && !tokenTried) {
        setTokenTried(true);
        // تسجيل خروج إجباري
        await supabase.auth.signOut();
        // ثم setSession بالتوكنات الجديدة
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          setError('رابط غير صالح أو انتهت صلاحيته. يرجى طلب رابط جديد.');
        } else {
          setSessionReady(true);
        }
      }
    };
    doLogoutAndSetSession();
    // eslint-disable-next-line
  }, [accessToken, refreshToken, tokenTried]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (password !== confirm) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message || 'حدث خطأ أثناء تحديث كلمة المرور');
    } else {
      setSuccess('تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  };

  if (!accessToken || !refreshToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-4">رابط غير صالح</h2>
          <p>يرجى التأكد من استخدام رابط إعادة تعيين كلمة المرور الصحيح من بريدك الإلكتروني.</p>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-4">جاري التحقق من الرابط...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">تعيين كلمة مرور جديدة</h2>
        <div className="mb-4">
          <label className="block mb-1">كلمة المرور الجديدة</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">تأكيد كلمة المرور</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            minLength={6}
            required
          />
        </div>
        {error && <div className="text-red-600 mb-3">{error}</div>}
        {success && <div className="text-green-600 mb-3">{success}</div>}
        <button
          type="submit"
          className="w-full bg-primary-600 text-white py-2 rounded font-bold"
          disabled={loading}
        >
          {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
        </button>
      </form>
    </div>
  );
} 