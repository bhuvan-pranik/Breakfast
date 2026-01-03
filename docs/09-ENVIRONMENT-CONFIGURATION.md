# Environment & Configuration Specifications

## Overview
Complete configuration specifications for development, staging, and production environments.

## Environment Variables

### Required Variables

**File**: `.env.local` (gitignored, copy from `.env.example`)

```env
# =============================================================================
# SUPABASE CONFIGURATION
# =============================================================================

# Supabase Project URL
# Location: Supabase Dashboard → Settings → API
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Anonymous Key (Public Key - Safe for client)
# Location: Supabase Dashboard → Settings → API → Project API keys → anon public
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# =============================================================================
# APPLICATION SECRETS
# =============================================================================

# QR Code Generation Salt
# CRITICAL: Keep this secret. Never commit to version control.
# Generate using: openssl rand -base64 32
VITE_QR_SALT=your-super-secret-salt-string-here-min-32-chars

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================

# Application Name
VITE_APP_NAME=Breakfast Counter System

# Application Version
VITE_APP_VERSION=1.0.0

# Environment
VITE_APP_ENV=development

# =============================================================================
# FEATURE FLAGS (Optional)
# =============================================================================

# Enable real-time subscriptions for attendance updates
VITE_ENABLE_REALTIME=false

# Enable analytics tracking
VITE_ENABLE_ANALYTICS=false

# Enable debug logging
VITE_ENABLE_DEBUG=true

# =============================================================================
# GITHUB PAGES DEPLOYMENT (Production Only)
# =============================================================================

# Base URL for GitHub Pages
# Format: /repository-name/ (e.g., /Breakfast-v3/)
VITE_BASE_URL=/Breakfast-v3/

# GitHub Repository
VITE_GITHUB_REPO=your-username/Breakfast-v3
```

### Environment Template

**File**: `.env.example` (committed to repo)

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Application Secrets
VITE_QR_SALT=generate-a-secure-random-string

# Application Configuration
VITE_APP_NAME=Breakfast Counter System
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# Feature Flags
VITE_ENABLE_REALTIME=false
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true

# GitHub Pages (Production)
VITE_BASE_URL=/Breakfast-v3/
VITE_GITHUB_REPO=your-username/Breakfast-v3
```

---

## Environment Access in Code

### Type-Safe Environment Variables

**File**: `src/config/env.ts`

```typescript
/**
 * Type-safe environment variable access
 */

interface ImportMetaEnv {
  // Supabase
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string

  // Application
  readonly VITE_QR_SALT: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production'

  // Feature Flags
  readonly VITE_ENABLE_REALTIME: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_DEBUG: string

  // GitHub Pages
  readonly VITE_BASE_URL: string
  readonly VITE_GITHUB_REPO: string

  // Vite defaults
  readonly BASE_URL: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

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
  if (env.qrSalt.length < 32) {
    console.warn('WARNING: QR_SALT should be at least 32 characters for security')
  }
}

// Validate on import
if (env.app.isProd) {
  validateEnv()
}
```

### Usage in Application

```typescript
// Import validated config
import { env } from '@/config/env'

// Use config
console.log(env.app.name) // 'Breakfast Counter System'
console.log(env.app.isDev) // true/false

if (env.features.debug) {
  console.debug('Debug mode enabled')
}
```

---

## Vite Configuration

**File**: `vite.config.ts`

```typescript
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],

    // Base URL for GitHub Pages deployment
    base: mode === 'production' ? env.VITE_BASE_URL || '/' : '/',

    // Path aliases
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },

    // Server configuration
    server: {
      port: 5173,
      host: true,
      open: true
    },

    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode !== 'production',
      minify: mode === 'production' ? 'esbuild' : false,

      // Chunk splitting strategy
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunk (Vue ecosystem)
            'vendor-vue': ['vue', 'vue-router', 'pinia'],

            // Supabase chunk
            'vendor-supabase': ['@supabase/supabase-js'],

            // QR code libraries
            'vendor-qr': ['qrcode', 'html5-qrcode'],

            // Utilities
            'vendor-utils': ['crypto-js']
          },

          // Asset file names
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.')
            const ext = info?.[info.length - 1]

            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
              return `assets/images/[name]-[hash][extname]`
            } else if (/woff2?|eot|ttf|otf/i.test(ext || '')) {
              return `assets/fonts/[name]-[hash][extname]`
            }

            return `assets/[name]-[hash][extname]`
          },

          // Chunk file names
          chunkFileNames: 'assets/js/[name]-[hash].js',

          // Entry file names
          entryFileNames: 'assets/js/[name]-[hash].js'
        }
      },

      // Chunk size warnings
      chunkSizeWarningLimit: 1000
    },

    // CSS configuration
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/assets/styles/variables.scss";`
        }
      }
    },

    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    }
  }
})
```

---

## TypeScript Configuration

### Main TypeScript Config

**File**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },

    /* Type definitions */
    "types": ["vite/client"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.tsx",
    "src/**/*.vue"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ],
  "references": [
    { "path": "./tsconfig.node.json" }
  ]
}
```

### Node TypeScript Config

**File**: `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": [
    "vite.config.ts"
  ]
}
```

### Vite Environment Types

**File**: `src/vite-env.d.ts`

```typescript
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_QR_SALT: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production'
  readonly VITE_ENABLE_REALTIME: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_DEBUG: string
  readonly VITE_BASE_URL: string
  readonly VITE_GITHUB_REPO: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

## ESLint Configuration

**File**: `.eslintrc.cjs`

```javascript
module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    '@vue/typescript/recommended',
    'prettier'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 2021,
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    // Vue specific
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'warn',
    'vue/require-default-prop': 'off',
    'vue/require-explicit-emits': 'error',
    'vue/component-api-style': ['error', ['script-setup']],

    // TypeScript
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],

    // General
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
```

---

## Prettier Configuration

**File**: `.prettierrc.json`

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "vueIndentScriptAndStyle": false,
  "endOfLine": "lf"
}
```

---

## GitHub Pages Deployment

### GitHub Actions Workflow

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Create .env file
        run: |
          cat << EOF > .env.production
          VITE_SUPABASE_URL=${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY=${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_QR_SALT=${{ secrets.VITE_QR_SALT }}
          VITE_APP_NAME=Breakfast Counter System
          VITE_APP_VERSION=${{ github.ref_name }}
          VITE_APP_ENV=production
          VITE_ENABLE_REALTIME=false
          VITE_ENABLE_ANALYTICS=true
          VITE_ENABLE_DEBUG=false
          VITE_BASE_URL=/Breakfast-v3/
          VITE_GITHUB_REPO=${{ github.repository }}
          EOF

      - name: Build
        run: npm run build
        env:
          NODE_ENV: production

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### GitHub Secrets Configuration

**Required Secrets** (Settings → Secrets and variables → Actions):

1. `VITE_SUPABASE_URL`: Your Supabase project URL
2. `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
3. `VITE_QR_SALT`: Your secret QR salt string

---

## Build Scripts

**File**: `package.json` (scripts section)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "build:dev": "vite build --mode development",
    "build:staging": "vite build --mode staging",
    "build:production": "vite build --mode production",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore",
    "format": "prettier --write src/"
  }
}
```

---

## Environment-Specific Configuration

### Development
- Source maps enabled
- Hot module replacement (HMR)
- Debug logging enabled
- No minification

### Staging
- Source maps enabled
- Minification enabled
- Debug logging optional
- Test with production-like data

### Production
- No source maps
- Full minification
- Debug logging disabled
- Analytics enabled
- Chunk splitting optimized

---

## Security Checklist

- [x] `.env.local` in `.gitignore`
- [x] `.env.example` with placeholders committed
- [x] Secrets stored in GitHub Secrets
- [x] QR salt minimum 32 characters
- [x] Supabase anon key (public) used, not service role key
- [x] Environment validation on startup
- [x] No hardcoded credentials in code
- [x] HTTPS enforced (GitHub Pages + Supabase)

---

## Troubleshooting

### Issue: Environment variables not loading

**Solution**: Ensure file is named `.env.local` and restart dev server

### Issue: Build fails on GitHub Actions

**Solution**: Verify all secrets are configured in repository settings

### Issue: 404 errors on GitHub Pages routes

**Solution**: Ensure base URL matches repository name and 404.html redirect is in place

### Issue: Supabase connection fails

**Solution**: Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct
