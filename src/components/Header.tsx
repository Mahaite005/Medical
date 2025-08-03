'use client'

import { User } from '@supabase/supabase-js'
import { LogOut, User as UserIcon, AlertTriangle } from 'lucide-react'

interface HeaderProps {
  user: User
  profile: any
  onLogout: () => void
  needsPasswordReset?: boolean
}

export default function Header({ user, profile, onLogout, needsPasswordReset }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      {/* رسالة تنبيه تغيير كلمة المرور */}
      {needsPasswordReset && (
        <div className="bg-orange-50 border-b border-orange-200">
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-orange-800 font-medium">
                  مطلوب تغيير كلمة المرور
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  يرجى تحديث كلمة المرور من قسم تعديل الملف الشخصي لضمان أمان حسابك
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {profile?.avatar_url && /^[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF\uFE0F\u1F300-\u1F6FF\u1F900-\u1F9FF\u1FA70-\u1FAFF\u1F680-\u1F6FF\u1F1E6-\u1F1FF]+$/.test(profile.avatar_url) ? (
              <span className="text-2xl select-none" style={{lineHeight: '1'}}>{profile.avatar_url}</span>
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-primary-200 bg-transparent">
                <UserIcon className="w-5 h-5 text-primary-600" />
              </div>
            )}
            <div>
              <h2 className="font-semibold text-gray-900">
                {profile?.full_name || 'مرحباً بك'}
              </h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
} 