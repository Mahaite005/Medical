import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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