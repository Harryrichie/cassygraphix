import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key is missing! Make sure you have a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, and restart your server.')
}

// Use fallbacks to prevent the app from crashing completely if env vars are missing
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder-key')