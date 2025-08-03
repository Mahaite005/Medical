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

  // Get code from URL search params (Supabase sends it via the callback route)
  const [authCode, setAuthCode] = useState<string | null>(null);

  useEffect(() => {
    const parseCodeFromUrl = () => {
      try {
        // Get the full URL including search params
        const fullUrl = window.location.href;
        console.log('Full URL:', fullUrl);

        // Get search params from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const type = urlParams.get('type');
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        
        console.log('URL search params:', Array.from(urlParams.entries()));
        console.log('Code present:', !!code);
        console.log('Access token present:', !!accessToken);
        console.log('Token type:', type);
        
        // Check if we have the required parameters
        // Accept either code or access_token for recovery
        if (!code && !accessToken) {
          console.error('No authentication tokens found in URL');
          setError('رابط غير صالح. يرجى طلب رابط جديد. تأكد من النقر على الرابط مباشرة من بريدك الإلكتروني.');
          return;
        }

        // Validate we have the correct type
        if (type !== 'recovery') {
          console.error('Invalid token type:', type);
          setError('رابط غير صالح. يرجى طلب رابط جديد. نوع الرمز غير صحيح.');
          return;
        }

        // If we have access_token, user is already logged in by Supabase
        if (accessToken && refreshToken) {
          console.log('Access token found - user is already authenticated');
          // Set the session with the tokens
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          }).then(() => {
            setSessionReady(true);
          }).catch((error) => {
            console.error('Error setting session with tokens:', error);
            setError('فشل في إعداد الجلسة. يرجى طلب رابط جديد.');
          });
        } else if (code) {
          // Use the code for exchange
          setAuthCode(code);
        }
      } catch (error) {
        console.error('Error parsing URL:', error);
        setError('حدث خطأ في معالجة الرابط. يرجى طلب رابط جديد.');
      }
    };

    // Parse code when component mounts
    if (typeof window !== 'undefined') {
      parseCodeFromUrl();
    }
  }, []);

  // Handle session setup using the code
  useEffect(() => {
    const exchangeCodeForSession = async () => {
      if (authCode && !tokenTried) {
        setTokenTried(true);
        console.log('Exchanging code for session...');
        
        try {
          // Force logout first to clear any existing session
          const { error: signOutError } = await supabase.auth.signOut();
          if (signOutError) {
            console.error('Error signing out:', signOutError);
          } else {
            console.log('Logged out successfully');
          }

          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);

          if (error) {
            console.error('Code exchange error:', error);
            setError('رمز الوصول غير صالح أو انتهت صلاحيته. يرجى طلب رابط جديد.');
            return;
          }

          if (!data.session) {
            console.error('No session data received');
            setError('فشل في إنشاء جلسة جديدة. يرجى طلب رابط جديد.');
            return;
          }

          // Verify the user is logged in
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError || !userData.user) {
            console.error('User verification error:', userError);
            setError('فشل في التحقق من المستخدم. يرجى طلب رابط جديد.');
            return;
          }
          
          console.log('Session set successfully for user:', userData.user.email);
          setSessionReady(true);
        } catch (error) {
          console.error('Error in session setup:', error);
          setError('حدث خطأ في معالجة الرابط. يرجى طلب رابط جديد.');
        }
      }
    };
    
    exchangeCodeForSession();
  }, [authCode, tokenTried]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
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
        setSuccess('تم تحديث كلمة المرور بنجاح! سيتم توجيهك للصفحة الرئيسية للتسجيل بكلمة المرور الجديدة.');
        
        // Force logout after password update
        await supabase.auth.signOut();
        console.log('Logged out after password update');
        
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setLoading(false);
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    }
  };

  // Show error if no valid authentication tokens found
  if (!authCode && !sessionReady && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-4 text-red-600">رابط غير صالح</h2>
          <p className="text-gray-600 mb-4">
            يرجى التأكد من استخدام رابط إعادة تعيين كلمة المرور الصحيح من بريدك الإلكتروني.
            <br />
            <span className="text-sm text-gray-500 block mt-2">تأكد من النقر على الرابط مباشرة من البريد الإلكتروني وعدم نسخه ولصقه.</span>
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
  
  // Show error message if there's an error
  if (error && !sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-4 text-red-600">خطأ في الرابط</h2>
          <p className="text-gray-600 mb-4">{error}</p>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">يرجى الانتظار بينما نتحقق من صلاحية رابط إعادة تعيين كلمة المرور</p>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
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