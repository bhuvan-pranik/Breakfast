/**
 * Supabase client initialization
 */

import { createClient } from '@supabase/supabase-js'
import { getActiveSupabaseConfig } from '@/config/env'

const activeConfig = getActiveSupabaseConfig()
const supabaseUrl = activeConfig.url
const supabaseAnonKey = activeConfig.anonKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: window.localStorage,
    storageKey: 'breakfast-counter-auth'
  }
})
