# Security Specifications

## Overview
Comprehensive security architecture covering authentication, authorization, data protection, and application security best practices.

## Security Layers

```
┌─────────────────────────────────────────────────┐
│         Application Security Layer              │
│  - XSS Prevention                               │
│  - CSRF Protection                              │
│  - Input Validation                             │
│  - Content Security Policy                      │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│      Authentication & Authorization Layer       │
│  - Supabase Auth (JWT)                          │
│  - Role-Based Access Control (RBAC)             │
│  - Route Guards                                 │
│  - Session Management                           │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│         Data Security Layer                     │
│  - Row Level Security (RLS)                     │
│  - QR Code Encryption (SHA-256 + Salt)          │
│  - HTTPS Encryption (TLS)                       │
│  - Environment Variable Protection              │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│      Infrastructure Security Layer              │
│  - Supabase Security Features                   │
│  - GitHub Pages HTTPS                           │
│  - Database Constraints                         │
└─────────────────────────────────────────────────┘
```

---

## 1. Authentication Security

### Supabase Auth Implementation

**Authentication Flow**:

1. **User Credentials** → Username + Password
2. **Lookup Scanner Account** → Find user_id by username
3. **Supabase Auth** → Sign in with email (from auth.users)
4. **JWT Token** → Issued by Supabase
5. **Session Storage** → localStorage (encrypted by Supabase)
6. **Auto-Refresh** → Token refreshed before expiration

**Security Features**:

```typescript
// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      // Auto-refresh tokens before expiration
      autoRefreshToken: true,

      // Persist session in localStorage (encrypted by Supabase)
      persistSession: true,

      // Don't detect session from URL (prevent session fixation)
      detectSessionInUrl: false,

      // Custom storage key (namespace isolation)
      storageKey: 'breakfast-counter-auth',

      // Use localStorage (more persistent than sessionStorage)
      storage: window.localStorage,

      // Flow type: implicit (for SPA)
      flowType: 'implicit'
    }
  }
)
```

### Password Security

**Requirements**:
- Minimum length: 8 characters
- Complexity: At least one uppercase, lowercase, number (enforced at app level)
- Hashing: bcrypt (handled by Supabase Auth)
- No password history (v1)

**Implementation**:
```typescript
// src/utils/validators.ts
export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
```

### Session Management

**Session Properties**:
- **Expiration**: 1 hour (Supabase default)
- **Refresh**: Automatic before expiration
- **Invalidation**: Logout clears localStorage
- **Concurrent Sessions**: Allowed (multiple devices)

**Session Security**:
```typescript
// src/composables/useAuth.ts
export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  // Check session validity on app load
  onMounted(async () => {
    await authStore.checkAuth()

    // If session invalid, redirect to login
    if (!authStore.isAuthenticated) {
      router.push({ name: 'login' })
    }
  })

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      // Clear all stores
      authStore.reset()
      router.push({ name: 'login' })
    } else if (event === 'TOKEN_REFRESHED') {
      // Update session in store
      authStore.session = session
    }
  })
}
```

---

## 2. Authorization (RBAC)

### Role-Based Access Control

**Roles**:
1. **admin**: Full system access
2. **scanner**: Limited to scanning and viewing own history

**Permission Matrix**:

| Feature | Admin | Scanner |
|---------|-------|---------|
| View Dashboard | ✓ | ✗ |
| Manage Employees | ✓ | ✗ |
| Create Employees | ✓ | ✗ |
| Edit Employees | ✓ | ✗ |
| Delete Employees | ✓ | ✗ |
| Regenerate QR Codes | ✓ | ✗ |
| Manage Scanners | ✓ | ✗ |
| Scan QR Codes | ✓ | ✓ |
| View Own Scan History | ✓ | ✓ |
| View All Scan History | ✓ | ✗ |
| Generate Reports | ✓ | ✗ |

### Route-Level Authorization

**Implementation**:
```typescript
// src/router/guards.ts
import { useAuthStore } from '@/stores'

export function setupNavigationGuards(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // Check authentication
    const requiresAuth = to.meta.requiresAuth !== false
    if (requiresAuth && !authStore.isAuthenticated) {
      return next({ name: 'login', query: { redirect: to.fullPath } })
    }

    // Check role-based access
    const allowedRoles = to.meta.allowedRoles as string[] | undefined
    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = authStore.userRole

      if (!userRole || !allowedRoles.includes(userRole)) {
        console.warn(`Access denied: User role '${userRole}' not in ${allowedRoles}`)
        return next({ name: 'unauthorized' })
      }
    }

    next()
  })
}
```

### Row-Level Security (RLS)

**Database-Level Authorization**:

```sql
-- Employees Table RLS Policies
-- Admins: Full access
CREATE POLICY "Admins have full access to employees"
  ON employees FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scanner_accounts
      WHERE scanner_accounts.user_id = auth.uid()
        AND scanner_accounts.role = 'admin'
        AND scanner_accounts.is_active = true
    )
  );

-- Scanners: Read active employees only
CREATE POLICY "Scanners can read active employees"
  ON employees FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM scanner_accounts
      WHERE scanner_accounts.user_id = auth.uid()
        AND scanner_accounts.role = 'scanner'
        AND scanner_accounts.is_active = true
    )
  );
```

**Benefits**:
- Database enforces authorization (defense in depth)
- Cannot bypass with API manipulation
- Automatic filtering of queries
- Protects against client-side tampering

---

## 3. Data Security

### QR Code Security

**Algorithm**: SHA-256 Hash with Secret Salt

**Security Properties**:
- **One-way**: Cannot reverse hash to get original data
- **Deterministic**: Same input always produces same output
- **Collision-resistant**: Extremely unlikely duplicates
- **Salt-protected**: Cannot generate valid QR without salt

**Implementation**:
```typescript
// src/services/qrcode.service.ts
import { SHA256 } from 'crypto-js'

class QRCodeService {
  private readonly salt: string

  constructor() {
    // Load salt from environment
    this.salt = import.meta.env.VITE_QR_SALT

    // Validate salt exists and has minimum length
    if (!this.salt) {
      throw new Error('CRITICAL: QR_SALT not configured')
    }

    if (this.salt.length < 32) {
      console.warn('WARNING: QR_SALT should be at least 32 characters')
    }
  }

  generateQRCode(phone: string, name: string): string {
    // Normalize inputs (prevent case/whitespace bypass)
    const normalizedPhone = phone.trim()
    const normalizedName = name.trim().toLowerCase()

    // Create hash input
    const input = `${normalizedPhone}${normalizedName}${this.salt}`

    // Generate SHA-256 hash
    return SHA256(input).toString()
  }

  validateQRCode(qrCode: string, phone: string, name: string): boolean {
    const expectedQRCode = this.generateQRCode(phone, name)
    return qrCode === expectedQRCode
  }
}
```

**Salt Management**:
- Stored in environment variable (never in code)
- Same salt used across all environments
- Changing salt invalidates all existing QR codes
- Minimum 32 characters recommended
- Generated using cryptographically secure random: `openssl rand -base64 32`

### Input Validation & Sanitization

**Frontend Validation**:
```typescript
// src/utils/validators.ts
export const validators = {
  // Phone number validation
  phone: (value: string): boolean => {
    return /^[0-9]{10,15}$/.test(value.trim())
  },

  // Name validation (alphanumeric + spaces, min 2 chars)
  name: (value: string): boolean => {
    return /^[a-zA-Z\s]{2,255}$/.test(value.trim())
  },

  // Department validation
  department: (value: string): boolean => {
    return value.trim().length >= 2 && value.trim().length <= 100
  },

  // Gender validation
  gender: (value: string): boolean => {
    return ['Male', 'Female', 'Other'].includes(value)
  },

  // Username validation (alphanumeric, underscore, 3-50 chars)
  username: (value: string): boolean => {
    return /^[a-zA-Z0-9_]{3,50}$/.test(value)
  },

  // Email validation
  email: (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }
}

// Sanitize input (remove dangerous characters)
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets (XSS prevention)
    .replace(/['"]/g, '')  // Remove quotes (SQL injection prevention)
}
```

**Backend Validation** (Database Constraints):
```sql
-- Phone number constraint
ALTER TABLE employees ADD CONSTRAINT phone_format
  CHECK (phone ~ '^[0-9]{10,15}$');

-- Name constraint
ALTER TABLE employees ADD CONSTRAINT name_length
  CHECK (char_length(name) >= 2 AND char_length(name) <= 255);

-- Gender constraint
ALTER TABLE employees ADD CONSTRAINT gender_valid
  CHECK (gender IN ('Male', 'Female', 'Other'));
```

### SQL Injection Prevention

**Protection Mechanisms**:
1. **Parameterized Queries**: Supabase client uses parameterized queries
2. **ORM Layer**: Supabase SDK prevents direct SQL injection
3. **Database Constraints**: Type checking at database level
4. **Input Validation**: Reject invalid input before database query

**Example** (Safe Query):
```typescript
// SAFE: Parameterized query via Supabase SDK
const { data, error } = await supabase
  .from('employees')
  .select('*')
  .eq('phone', userInput) // Automatically parameterized

// UNSAFE (Never do this - shown for reference)
// const query = `SELECT * FROM employees WHERE phone = '${userInput}'`
```

### XSS (Cross-Site Scripting) Prevention

**Vue.js Built-in Protection**:
- Vue automatically escapes HTML in templates
- `{{ }}` interpolation sanitizes output
- `v-html` directive avoided (or used with sanitized data only)

**Additional Measures**:
```vue
<template>
  <!-- SAFE: Automatically escaped -->
  <p>{{ employee.name }}</p>

  <!-- SAFE: Attribute binding escaped -->
  <input :value="employee.phone" />

  <!-- UNSAFE: Only use with trusted data -->
  <!-- <div v-html="untrustedData"></div> -->
</template>
```

**Content Security Policy (CSP)**:
```html
<!-- public/index.html -->
<meta http-equiv="Content-Security-Policy"
      content="
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
        font-src 'self' data:;
        connect-src 'self' https://*.supabase.co;
        frame-ancestors 'none';
      ">
```

### CSRF (Cross-Site Request Forgery) Prevention

**Supabase Protection**:
- JWT tokens in Authorization header (not cookies)
- SameSite cookie attribute (if using cookies)
- Origin verification by Supabase

**Application-Level**:
```typescript
// JWT token stored in localStorage, sent in Authorization header
const { data, error } = await supabase
  .from('employees')
  .select('*')
// Supabase automatically includes: Authorization: Bearer <jwt-token>
```

---

## 4. HTTPS & Transport Security

### GitHub Pages HTTPS

**Configuration**:
- GitHub Pages enforces HTTPS automatically
- No HTTP access allowed
- Valid SSL certificate provided by GitHub

**Verification**:
```bash
# Check HTTPS enforcement
curl -I https://your-username.github.io/Breakfast-v3/
# Should return: Strict-Transport-Security: max-age=31536000
```

### Supabase HTTPS

**Configuration**:
- All Supabase endpoints use HTTPS
- TLS 1.2+ required
- Certificate pinning by Supabase SDK

**API Calls**:
```typescript
// All requests automatically use HTTPS
const supabaseUrl = 'https://your-project.supabase.co' // HTTPS enforced
```

---

## 5. Environment Variable Security

### Secure Storage

**Development**:
- `.env.local` file (gitignored)
- Never commit to version control
- Shared securely among team (password manager, 1Password, etc.)

**Production (GitHub Actions)**:
- GitHub Secrets (encrypted storage)
- Accessed via: `${{ secrets.VARIABLE_NAME }}`
- Never logged in build output

### Validation

```typescript
// src/config/env.ts
export function validateEnv(): void {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_QR_SALT'
  ]

  const missing = required.filter(key => !import.meta.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    )
  }

  // Validate salt strength
  if (import.meta.env.VITE_QR_SALT.length < 32) {
    console.error('SECURITY WARNING: QR_SALT too short')
  }
}
```

---

## 6. Audit Logging

### Attendance Records

All scan attempts logged:
```sql
-- Every scan creates an audit record
INSERT INTO attendance_records (
  employee_phone,
  scanner_id,
  scan_timestamp,
  scan_date,
  status,
  validation_message
) VALUES (...);
```

**Logged Events**:
- Successful scans
- Duplicate attempts
- Invalid QR codes
- Inactive employee scans

### Scanner Account Activity

```sql
-- Update last login timestamp
UPDATE scanner_accounts
SET last_login_at = NOW()
WHERE id = <scanner_id>;
```

---

## 7. Rate Limiting & Abuse Prevention

### Supabase Rate Limits

**Free Tier Limits**:
- 500 requests per second (configurable)
- Automatic DDoS protection
- API key throttling

### Application-Level Throttling

**QR Scan Debouncing**:
```typescript
// src/composables/useQRScanner.ts
import { debounce } from '@/utils/helpers'

const handleScan = debounce(async (qrCode: string) => {
  // Process scan (prevents rapid scanning)
  await recordScan(qrCode)
}, 2000) // 2-second cooldown
```

**Login Attempts**:
```typescript
// src/composables/useAuth.ts
const loginAttempts = ref(0)
const lockoutUntil = ref<Date | null>(null)

async function login(username: string, password: string) {
  // Check lockout
  if (lockoutUntil.value && new Date() < lockoutUntil.value) {
    throw new Error('Too many failed attempts. Try again later.')
  }

  try {
    await authService.login({ username, password })
    loginAttempts.value = 0
  } catch (e) {
    loginAttempts.value++

    // Lock out after 5 failed attempts for 15 minutes
    if (loginAttempts.value >= 5) {
      lockoutUntil.value = new Date(Date.now() + 15 * 60 * 1000)
    }

    throw e
  }
}
```

---

## 8. Security Headers

### HTTP Security Headers

**Recommended Headers** (configured in Supabase or CDN):

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=*, geolocation=(), microphone=()
```

**Implementation** (via meta tags if headers unavailable):
```html
<!-- public/index.html -->
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="X-XSS-Protection" content="1; mode=block">
```

---

## 9. Dependency Security

### Package Management

**Regular Updates**:
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

**Automated Scanning**:
- GitHub Dependabot enabled
- Automatic pull requests for security updates

### Trusted Dependencies

**Core Dependencies**:
- Vue 3: Official framework (trusted)
- Vite: Official build tool (trusted)
- Supabase: Enterprise-grade BaaS (trusted)
- Pinia: Official state management (trusted)

**Third-Party Dependencies**:
- `qrcode`: 250k+ weekly downloads (vetted)
- `html5-qrcode`: 50k+ weekly downloads (vetted)
- `crypto-js`: 2M+ weekly downloads (vetted)

---

## 10. Security Checklist

### Development Phase
- [x] Environment variables in `.gitignore`
- [x] Input validation on all forms
- [x] Password complexity requirements
- [x] XSS prevention (Vue escaping)
- [x] CSRF protection (JWT tokens)
- [x] SQL injection prevention (parameterized queries)
- [x] QR code salt minimum 32 characters
- [x] Role-based route guards
- [x] Row-level security policies

### Deployment Phase
- [x] HTTPS enforced (GitHub Pages + Supabase)
- [x] Secrets stored in GitHub Secrets
- [x] Security headers configured
- [x] Content Security Policy defined
- [x] Audit logging enabled
- [x] Rate limiting configured
- [x] Dependencies scanned for vulnerabilities

### Ongoing Maintenance
- [ ] Regular dependency updates
- [ ] Periodic security audits
- [ ] Monitor Supabase logs for anomalies
- [ ] Review RLS policies quarterly
- [ ] Rotate QR salt annually (if needed)
- [ ] Update passwords for scanner accounts
- [ ] Review and revoke inactive scanner accounts

---

## 11. Incident Response Plan

### Security Breach Response

1. **Detect**: Monitor logs for suspicious activity
2. **Contain**: Disable affected scanner accounts immediately
3. **Investigate**: Review audit logs to identify scope
4. **Remediate**: Rotate QR salt if compromised, regenerate all QR codes
5. **Notify**: Inform administrators and affected users
6. **Review**: Update security measures to prevent recurrence

### QR Code Compromise

**Immediate Actions**:
1. Generate new QR salt
2. Regenerate all employee QR codes
3. Notify all employees to get new QR codes
4. Invalidate old QR codes in database

**Implementation**:
```typescript
// Admin function: Rotate QR salt and regenerate all codes
async function rotateSaltAndRegenerateQRCodes(newSalt: string) {
  // 1. Update environment variable (manual step)
  // 2. Restart application with new salt
  // 3. Regenerate all QR codes
  const employees = await employeeService.getAll()

  for (const employee of employees) {
    await employeeService.regenerateQRCode(employee.phone)
  }

  console.log(`Regenerated ${employees.length} QR codes with new salt`)
}
```

---

## 12. Compliance Considerations

### Data Privacy

- **Data Minimization**: Only collect necessary employee data
- **Data Retention**: Define retention policy for attendance records
- **Data Access**: Limit access based on role (RBAC + RLS)
- **Data Export**: Allow employees to request their data (Phase II)

### GDPR Compliance (if applicable)

- Right to access (employees can view their attendance)
- Right to erasure (soft delete, mark as inactive)
- Data portability (export attendance records)
- Consent management (employees consent to QR code generation)

---

## Security Best Practices Summary

1. **Authentication**: Strong passwords, JWT tokens, session management
2. **Authorization**: RBAC, RLS policies, route guards
3. **Data Protection**: Input validation, sanitization, encryption (HTTPS)
4. **QR Security**: SHA-256 + salt, server-side validation
5. **Transport Security**: HTTPS only, TLS 1.2+
6. **Environment Security**: Secrets in GitHub Secrets, validated on startup
7. **Audit Logging**: All scan events logged with timestamps
8. **Rate Limiting**: Scan debouncing, login attempt lockout
9. **Dependency Management**: Regular updates, vulnerability scanning
10. **Incident Response**: Plan for QR salt rotation, account compromise
