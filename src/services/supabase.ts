/**
 * Supabase client initialization
 */

import { createClient } from '@supabase/supabase-js'
import { env } from '@/config/env'

const supabaseUrl = env.supabase.url
const supabaseAnonKey = env.supabase.anonKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: window.localStorage,
    storageKey: 'breakfast-counter-auth'
  }
})
