'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import AuthComponent from '@/components/Auth'
import Dashboard from '@/components/Dashboard'
import LoadingSpinner from '@/components/LoadingSpinner'
import EditProfile from '@/components/EditProfile'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [isPasswordResetFlow, setIsPasswordResetFlow] = useState(false)

  useEffect(() => {
    // Check if this is a password reset flow
    const checkPasswordResetFlow = () => {
      const hash = window.location.hash
      if (hash && hash.includes('access_token') && hash.includes('type=recovery')) {
        console.log('Password reset flow detected')
        setIsPasswordResetFlow(true)
        // Redirect to reset password page
        window.location.href = '/reset-password' + hash
        return true
      }
      return false
    }

    // Get initial session
    const getSession = async () => {
      // Check for password reset flow first
      if (checkPasswordResetFlow()) {
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Don't update user state if we're in password reset flow
        if (!isPasswordResetFlow) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [isPasswordResetFlow])

  // If we're in password reset flow, show loading
  if (isPasswordResetFlow) {
    return <LoadingSpinner />
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <main className="flex-1">
      {!user ? (
        <AuthComponent />
      ) : showEditProfile ? (
        <EditProfile user={user} onProfileUpdated={() => setShowEditProfile(false)} />
      ) : (
        <Dashboard user={user} onEditProfile={() => setShowEditProfile(true)} />
      )}
    </main>
  )
} 