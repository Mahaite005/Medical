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
  const [needsPasswordReset, setNeedsPasswordReset] = useState(false)

  useEffect(() => {
    // Check URL params for password reset flow
    const checkPasswordResetFlow = async () => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        const resetPassword = urlParams.get('reset_password')
        const accessToken = urlParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token')
        const code = urlParams.get('code')

        if (resetPassword === 'true') {
          console.log('Password reset flow detected')
          setIsPasswordResetFlow(true)
          setNeedsPasswordReset(true)

          // Set session with tokens if available
          if (accessToken && refreshToken) {
            console.log('Setting session with access token')
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })
            
            if (!error && data.session) {
              setUser(data.session.user)
              // Clean URL without reloading
              window.history.replaceState({}, '', window.location.pathname)
            }
          } else if (code) {
            console.log('Exchanging code for session')
            const { data, error } = await supabase.auth.exchangeCodeForSession(code)
            
            if (!error && data.session) {
              setUser(data.session.user)
              // Clean URL without reloading
              window.history.replaceState({}, '', window.location.pathname)
            }
          }
          
          setIsPasswordResetFlow(false)
          setLoading(false)
          return
        }
      }

      // Normal session check
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    checkPasswordResetFlow()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
        <EditProfile 
          user={user} 
          onProfileUpdated={() => setShowEditProfile(false)}
          needsPasswordReset={needsPasswordReset}
          onPasswordResetComplete={() => setNeedsPasswordReset(false)}
        />
      ) : (
        <Dashboard 
          user={user} 
          onEditProfile={() => setShowEditProfile(true)}
          needsPasswordReset={needsPasswordReset}
        />
      )}
    </main>
  )
} 