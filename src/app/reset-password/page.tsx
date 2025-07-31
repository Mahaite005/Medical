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

  // Get tokens from URL hash (Supabase sends them in the hash fragment)
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    // Parse tokens from URL hash
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    
    console.log('Reset password page - URL hash:', hash);
    console.log('Access token found:', !!access_token);
    console.log('Refresh token found:', !!refresh_token);
    
    setAccessToken(access_token);
    setRefreshToken(refresh_token);
  }, []);

  // Handle session setup
  useEffect(() => {
    const doLogoutAndSetSession = async () => {
      if (accessToken && refreshToken && !tokenTried) {
        setTokenTried(true);
        console.log('Setting up session for password reset...');
        
        try {
          // Force logout first
          await supabase.auth.signOut();
          console.log('Logged out successfully');
          
          // Set session with reset tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            console.error('Session setup error:', error);
            setError('رابط غير صالح أو انتهت صلاحيته. يرجى طلب رابط جديد.');
          } else {
            console.log('Session set successfully for password reset');
            setSessionReady(true);
          }
        } catch (error) {
          console.error('Error setting session:', error);
          setError('حدث خطأ في معالجة الرابط. يرجى طلب رابط جديد.');
        }
      }
    };
    
    doLogoutAndSetSession();
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
    console.log('Updating password...');

    try {
      const { error } = await supabase.auth.updateUser({ password });
      setLoading(false);

      if (error) {
        console.error('Password update error:', error);
        setError(error.message || 'حدث خطأ أثناء تحديث كلمة المرور');
      } else {
        console.log('Password updated successfully');
        setSuccess('تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setLoading(false);
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    }
  };

  // Show error if no tokens found
  if (!accessToken || !refreshToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-4 text-red-600">رابط غير صالح</h2>
          <p className="text-gray-600 mb-4">
            يرجى التأكد من استخدام رابط إعادة تعيين كلمة المرور الصحيح من بريدك الإلكتروني.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  // Show loading while setting up session
  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-4">جاري التحقق من الرابط...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">تعيين كلمة مرور جديدة</h2>
        
        <div className="mb-4">
          <label className="block mb-2 font-medium">كلمة المرور الجديدة</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={6}
            required
            placeholder="أدخل كلمة المرور الجديدة"
          />
        </div>
        
        <div className="mb-6">
          <label className="block mb-2 font-medium">تأكيد كلمة المرور</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            minLength={6}
            required
            placeholder="أعد إدخال كلمة المرور"
          />
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={loading}
        >
          {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
        </button>
      </form>
    </div>
  );
} 