// Environment Variables Check Helper
export function checkEnvironmentVariables() {
  const requiredVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'GOOGLE_GEMINI_API_KEY': process.env.GOOGLE_GEMINI_API_KEY,
  }

  const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    console.error('❌ Missing Environment Variables:', missingVars)
    return false
  }

  console.log('✅ All required environment variables are set')
  return true
}

// Debug function to log environment variables (without sensitive data) - development only
export function debugEnvironmentVariables() {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Environment Variables Debug:')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing')
    console.log('GOOGLE_GEMINI_API_KEY:', process.env.GOOGLE_GEMINI_API_KEY ? '✅ Set' : '❌ Missing')
    console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL || 'Not set (using fallback)')
  }
} 