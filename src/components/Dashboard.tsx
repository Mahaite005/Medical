'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Camera, Upload, History, LogOut, FileImage, Stethoscope, BarChart3 } from 'lucide-react'
import ImageUpload from './ImageUpload'
import TestHistory from './TestHistory'
import SmartDashboard from './SmartDashboard'
import Header from './Header'

interface DashboardProps {
  user: User
  onEditProfile?: () => void
}

type ActiveView = 'upload' | 'history' | 'editProfile' | 'smartDashboard'

export default function Dashboard({ user, onEditProfile }: DashboardProps) {
  const [activeView, setActiveView] = useState<ActiveView>('smartDashboard')
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setProfile(data)
      }
    }
    fetchProfile()
  }, [user.id])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header user={user} profile={profile} onLogout={handleLogout} />
      
      {/* Navigation */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveView('smartDashboard')}
              className={`flex-shrink-0 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-colors ${
                activeView === 'smartDashboard'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              لوحة المعلومات
            </button>
            <button
              onClick={() => setActiveView('upload')}
              className={`flex-shrink-0 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-colors ${
                activeView === 'upload'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileImage className="w-5 h-5" />
              تحليل جديد
            </button>
            <button
              onClick={() => setActiveView('history')}
              className={`flex-shrink-0 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-colors ${
                activeView === 'history'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <History className="w-5 h-5" />
              السجل الطبي
            </button>
            <button
              onClick={() => {
                setActiveView('editProfile');
                if (onEditProfile) onEditProfile();
              }}
              className={`flex-shrink-0 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-colors ${
                activeView === 'editProfile'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Stethoscope className="w-5 h-5" />
              تعديل الملف الشخصي
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={activeView === 'smartDashboard' ? 'max-w-6xl mx-auto' : 'max-w-md mx-auto p-4'}>
        {activeView === 'smartDashboard' ? (
          <SmartDashboard user={user} profile={profile} />
        ) : activeView === 'upload' ? (
          <ImageUpload user={user} />
        ) : activeView === 'history' ? (
          <TestHistory user={user} />
        ) : null}
      </div>
    </div>
  )
} 