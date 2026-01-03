/**
 * Type-safe environment variable access
 */

// Validated environment configuration
export const env = {
  // Supabase
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
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

// Validation: Ensure critical env vars are present
export function validateEnv(): void {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_QR_SALT'
  ]

  const missing = required.filter(key => !import.meta.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file'
    )
  }

  // Validate QR salt length (minimum 32 characters for security)
  if (env.qrSalt && env.qrSalt.length < 32) {
    console.warn('WARNING: QR_SALT should be at least 32 characters for security')
  }
}
