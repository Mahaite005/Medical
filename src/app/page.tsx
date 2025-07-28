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

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

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