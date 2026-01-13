/**
 * Type-safe environment variable access
 */

// Validated environment configuration
export const env = {
  // Supabase - Production
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  },

  // Supabase - Development
  devSupabase: {
    url: import.meta.env.VITE_DEV_SUPABASE_URL,
    anonKey: import.meta.env.VITE_DEV_SUPABASE_ANON_KEY
  },

  // Application
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Breakfast Counter System',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    env: (import.meta.env.VITE_APP_ENV || 'development') as 'development' | 'staging' | 'production',
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD
  },

  // Secrets
  qrSalt: import.meta.env.VITE_QR_SALT,
  devQrSalt: import.meta.env.VITE_DEV_QR_SALT,

  // Feature Flags
  features: {
    realtime: import.meta.env.VITE_ENABLE_REALTIME === 'true',
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    debug: import.meta.env.VITE_ENABLE_DEBUG === 'true'
  },

  // GitHub Pages
  github: {
    baseUrl: import.meta.env.VITE_BASE_URL || '/',
    repo: import.meta.env.VITE_GITHUB_REPO || ''
  }
} as const

/**
 * Get active Supabase configuration based on environment
 */
export function getActiveSupabaseConfig() {
  const isDevelopment = env.app.env === 'development'
  return isDevelopment ? env.devSupabase : env.supabase
}

/**
 * Get active QR salt based on environment
 */
export function getActiveQrSalt() {
  const isDevelopment = env.app.env === 'development'
  return isDevelopment ? env.devQrSalt : env.qrSalt
}

// Validation: Ensure critical env vars are present
export function validateEnv(): void {
  const isDevelopment = env.app.env === 'development'
  
  // Base required variables
  const baseRequired = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_QR_SALT'
  ]

  // Development-specific variables
  const devRequired = [
    'VITE_DEV_SUPABASE_URL',
    'VITE_DEV_SUPABASE_ANON_KEY',
    'VITE_DEV_QR_SALT'
  ]

  // Check required variables based on environment
  const required = isDevelopment ? [...baseRequired, ...devRequired] : baseRequired

  const missing = required.filter(key => !import.meta.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file'
    )
  }

  // Validate QR salt length (minimum 32 characters for security)
  const activeQrSalt = getActiveQrSalt()
  if (activeQrSalt && activeQrSalt.length < 32) {
    console.warn('WARNING: QR_SALT should be at least 32 characters for security')
  }
}
