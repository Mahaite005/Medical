import { createClient } from '@supabase/supabase-js'
import { debugEnvironmentVariables } from './envCheck'

// Debug environment variables in development
if (process.env.NODE_ENV === 'development') {
  debugEnvironmentVariables()
}

// Force environment variables to be loaded properly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌')
  throw new Error('Supabase environment variables are not configured properly')
}

// Create Supabase client with validated environment variables
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Updated: 2024 - Environment variables validation added
// Database fix: Added proper policies and tables support
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      medical_tests: {
        Row: {
          id: string
          user_id: string
          image_url: string
          analysis_result: string
          recommendations: string
          created_at: string
          test_type: string | null
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          analysis_result: string
          recommendations: string
          created_at?: string
          test_type?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          analysis_result?: string
          recommendations?: string
          created_at?: string
          test_type?: string | null
        }
      }
    }
  }
} 