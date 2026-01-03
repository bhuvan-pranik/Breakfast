# Error Handling & Validation Specifications

## Overview
Comprehensive error handling, validation strategies, and user feedback patterns for robust application behavior.

---

## 1. Validation Architecture

### Frontend Validation Strategy

**Three-Tier Validation**:

1. **Input-Level Validation** (Real-time)
   - Validates as user types
   - Provides immediate feedback
   - Prevents invalid input submission

2. **Form-Level Validation** (On submit)
   - Validates all fields together
   - Checks field dependencies
   - Shows summary of all errors

3. **Server-Level Validation** (Backend)
   - Final validation before database
   - Database constraints enforce rules
   - Returns structured error responses

### Validation Composable

**File**: `src/composables/useValidation.ts`

```typescript
import { ref, reactive } from 'vue'

export type ValidationRule =
  | 'required'
  | 'email'
  | 'phone'
  | 'minLength'
  | 'maxLength'
  | 'numeric'
  | 'alphanumeric'
  | 'password'
  | 'match'

export interface ValidationRules {
  [field: string]: (ValidationRule | string)[]
}

export interface ValidationErrors {
  [field: string]: string | null
}

export function useValidation() {
  const errors = reactive<ValidationErrors>({})
  const isValidating = ref(false)

  /**
   * Validation rules implementation
   */
  const rules = {
    required: (value: any) => {
      return !!value || 'This field is required'
    },

    email: (value: string) => {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return pattern.test(value) || 'Invalid email address'
    },

    phone: (value: string) => {
      const pattern = /^[0-9]{10,15}$/
      return pattern.test(value.trim()) || 'Invalid phone number (10-15 digits)'
    },

    minLength: (min: number) => (value: string) => {
      return value.length >= min || `Minimum ${min} characters required`
    },

    maxLength: (max: number) => (value: string) => {
      return value.length <= max || `Maximum ${max} characters allowed`
    },

    numeric: (value: string) => {
      return /^[0-9]+$/.test(value) || 'Must contain only numbers'
    },

    alphanumeric: (value: string) => {
      return /^[a-zA-Z0-9]+$/.test(value) || 'Must contain only letters and numbers'
    },

    password: (value: string) => {
      if (value.length < 8) return 'Password must be at least 8 characters'
      if (!/[A-Z]/.test(value)) return 'Password must contain uppercase letter'
      if (!/[a-z]/.test(value)) return 'Password must contain lowercase letter'
      if (!/[0-9]/.test(value)) return 'Password must contain a number'
      return true
    },

    match: (compareValue: any) => (value: any) => {
      return value === compareValue || 'Values do not match'
    }
  }

  /**
   * Parse validation rule string
   * Examples: "minLength:8", "maxLength:50", "match:password"
   */
  const parseRule = (rule: string, formData: any) => {
    const [ruleName, param] = rule.split(':')

    switch (ruleName) {
      case 'minLength':
        return rules.minLength(parseInt(param))
      case 'maxLength':
        return rules.maxLength(parseInt(param))
      case 'match':
        return rules.match(formData[param])
      default:
        return rules[ruleName as ValidationRule]
    }
  }

  /**
   * Validate single field
   */
  const validateField = (
    fieldName: string,
    value: any,
    fieldRules: (ValidationRule | string)[],
    formData?: any
  ): boolean => {
    errors[fieldName] = null

    for (const rule of fieldRules) {
      const validator = typeof rule === 'string' && rule.includes(':')
        ? parseRule(rule, formData)
        : rules[rule as ValidationRule]

      if (!validator) {
        console.warn(`Unknown validation rule: ${rule}`)
        continue
      }

      const result = validator(value)

      if (result !== true) {
        errors[fieldName] = result as string
        return false
      }
    }

    return true
  }

  /**
   * Validate entire form
   */
  const validate = (
    formData: Record<string, any>,
    validationRules: ValidationRules
  ): boolean => {
    isValidating.value = true
    clearErrors()

    let isValid = true

    for (const [field, rules] of Object.entries(validationRules)) {
      const fieldValue = formData[field]
      const fieldValid = validateField(field, fieldValue, rules, formData)

      if (!fieldValid) {
        isValid = false
      }
    }

    isValidating.value = false
    return isValid
  }

  /**
   * Clear all errors
   */
  const clearErrors = () => {
    Object.keys(errors).forEach(key => {
      errors[key] = null
    })
  }

  /**
   * Clear specific field error
   */
  const clearFieldError = (field: string) => {
    errors[field] = null
  }

  /**
   * Set custom error for field
   */
  const setFieldError = (field: string, error: string) => {
    errors[field] = error
  }

  /**
   * Check if form has any errors
   */
  const hasErrors = () => {
    return Object.values(errors).some(error => error !== null)
  }

  return {
    errors,
    isValidating,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    setFieldError,
    hasErrors
  }
}
```

### Usage Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useValidation } from '@/composables/useValidation'

const formData = ref({
  phone: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const { errors, validate, clearFieldError } = useValidation()

const handleSubmit = () => {
  const isValid = validate(formData.value, {
    phone: ['required', 'phone'],
    name: ['required', 'minLength:2', 'maxLength:255'],
    email: ['required', 'email'],
    password: ['required', 'password'],
    confirmPassword: ['required', 'match:password']
  })

  if (isValid) {
    // Submit form
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <AppInput
      v-model="formData.phone"
      label="Phone Number"
      :error="errors.phone"
      @input="clearFieldError('phone')"
    />

    <AppInput
      v-model="formData.name"
      label="Full Name"
      :error="errors.name"
      @input="clearFieldError('name')"
    />

    <AppButton type="submit">Submit</AppButton>
  </form>
</template>
```

---

## 2. Error Handling Architecture

### Error Types

```typescript
// src/types/errors.types.ts

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType
  message: string
  field?: string
  code?: string
  details?: any
  timestamp: Date
}

export class ValidationError extends Error {
  type = ErrorType.VALIDATION
  field?: string

  constructor(message: string, field?: string) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

export class AuthenticationError extends Error {
  type = ErrorType.AUTHENTICATION

  constructor(message: string = 'Authentication failed') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  type = ErrorType.AUTHORIZATION

  constructor(message: string = 'Access denied') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class NetworkError extends Error {
  type = ErrorType.NETWORK

  constructor(message: string = 'Network request failed') {
    super(message)
    this.name = 'NetworkError'
  }
}

export class NotFoundError extends Error {
  type = ErrorType.NOT_FOUND

  constructor(message: string = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error {
  type = ErrorType.CONFLICT

  constructor(message: string = 'Resource conflict') {
    super(message)
    this.name = 'ConflictError'
  }
}
```

### Error Handler Utility

**File**: `src/utils/error-handler.ts`

```typescript
import type { AppError } from '@/types/errors.types'
import { ErrorType } from '@/types/errors.types'
import { useUIStore } from '@/stores'

/**
 * Parse Supabase error into AppError
 */
export function parseSupabaseError(error: any): AppError {
  const timestamp = new Date()

  // PostgreSQL error codes
  const pgErrorCodes: Record<string, ErrorType> = {
    '23505': ErrorType.CONFLICT,      // Unique violation
    '23503': ErrorType.CONFLICT,      // Foreign key violation
    'PGRST116': ErrorType.NOT_FOUND,  // Not found
    '42501': ErrorType.AUTHORIZATION  // Insufficient privilege
  }

  const errorType = pgErrorCodes[error.code] || ErrorType.DATABASE

  return {
    type: errorType,
    message: getUserFriendlyMessage(error),
    code: error.code,
    details: error.details || error.hint,
    timestamp
  }
}

/**
 * Convert technical error to user-friendly message
 */
export function getUserFriendlyMessage(error: any): string {
  // Supabase specific errors
  if (error.code === '23505') {
    if (error.message?.includes('phone')) {
      return 'An employee with this phone number already exists'
    }
    if (error.message?.includes('username')) {
      return 'This username is already taken'
    }
    return 'This record already exists'
  }

  if (error.code === 'PGRST116') {
    return 'The requested resource was not found'
  }

  if (error.code === '42501') {
    return 'You do not have permission to perform this action'
  }

  // Authentication errors
  if (error.message?.includes('Invalid login credentials')) {
    return 'Invalid username or password'
  }

  if (error.message?.includes('Email not confirmed')) {
    return 'Please confirm your email address'
  }

  // Network errors
  if (error.message?.includes('Failed to fetch')) {
    return 'Network error. Please check your connection.'
  }

  // Default message
  return error.message || 'An unexpected error occurred'
}

/**
 * Handle error globally
 */
export function handleError(error: any, context?: string): void {
  console.error(`Error${context ? ` in ${context}` : ''}:`, error)

  const uiStore = useUIStore()
  const appError = parseSupabaseError(error)

  // Show notification
  uiStore.showError(appError.message)

  // Log to error tracking service (future enhancement)
  // logErrorToService(appError)
}

/**
 * Try-catch wrapper with error handling
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<[T | null, AppError | null]> {
  try {
    const result = await fn()
    return [result, null]
  } catch (error) {
    const appError = parseSupabaseError(error)
    handleError(error, context)
    return [null, appError]
  }
}
```

### Service-Level Error Handling

```typescript
// src/services/employee.service.ts
import { supabase } from './supabase'
import { handleError, getUserFriendlyMessage } from '@/utils/error-handler'
import { NotFoundError, ConflictError } from '@/types/errors.types'

class EmployeeService {
  async getByPhone(phone: string): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('phone', phone)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError(`Employee with phone ${phone} not found`)
      }
      throw new Error(getUserFriendlyMessage(error))
    }

    return data as Employee
  }

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .insert(dto)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new ConflictError('Employee with this phone number already exists')
      }
      throw new Error(getUserFriendlyMessage(error))
    }

    return data as Employee
  }
}
```

### Component-Level Error Handling

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useEmployees } from '@/composables/useEmployees'
import { handleError } from '@/utils/error-handler'
import { useUIStore } from '@/stores'

const { createEmployee } = useEmployees()
const uiStore = useUIStore()
const isLoading = ref(false)
const error = ref<string | null>(null)

const handleSubmit = async (formData: CreateEmployeeDto) => {
  isLoading.value = true
  error.value = null

  try {
    await createEmployee(formData)
    uiStore.showSuccess('Employee created successfully')
    // Reset form or navigate
  } catch (e) {
    // Error already handled by handleError in service/composable
    error.value = e instanceof Error ? e.message : 'Failed to create employee'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <ErrorMessage v-if="error" :error="error" @dismiss="error = null" />

    <EmployeeForm
      :loading="isLoading"
      @submit="handleSubmit"
    />
  </div>
</template>
```

---

## 3. User Feedback Patterns

### Toast Notifications

**File**: `src/components/common/AppToast.vue`

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useUIStore } from '@/stores'
import type { Notification } from '@/stores/ui.store'

const uiStore = useUIStore()

const notifications = computed(() => uiStore.notifications)

const getIcon = (type: Notification['type']) => {
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[type]
}

const getClass = (type: Notification['type']) => {
  return `toast-${type}`
}
</script>

<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['toast', getClass(notification.type)]"
      >
        <span class="toast-icon">{{ getIcon(notification.type) }}</span>
        <span class="toast-message">{{ notification.message }}</span>
        <button
          class="toast-close"
          @click="uiStore.removeNotification(notification.id)"
        >
          ×
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 500px;
}

.toast-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.toast-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.toast-warning {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.toast-info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.toast-icon {
  font-size: 20px;
  font-weight: bold;
}

.toast-message {
  flex: 1;
  font-size: 14px;
}

.toast-close {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  color: inherit;
  opacity: 0.6;
}

.toast-close:hover {
  opacity: 1;
}

/* Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
```

### Loading States

**Inline Loading**:
```vue
<AppButton :loading="isLoading" @click="handleSave">
  Save Employee
</AppButton>
```

**Full-Screen Loading**:
```vue
<LoadingSpinner v-if="isLoading" overlay message="Loading employees..." />
```

**Skeleton Loading**:
```vue
<div v-if="isLoading" class="skeleton">
  <div class="skeleton-line"></div>
  <div class="skeleton-line"></div>
  <div class="skeleton-line"></div>
</div>

<div v-else>
  <!-- Actual content -->
</div>
```

### Empty States

```vue
<div v-if="employees.length === 0" class="empty-state">
  <img src="@/assets/empty-state.svg" alt="No employees" />
  <h3>No employees found</h3>
  <p>Get started by creating your first employee</p>
  <AppButton @click="openCreateModal">Create Employee</AppButton>
</div>
```

---

## 4. Form Validation Patterns

### Real-Time Validation

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { debounce } from '@/utils/helpers'

const phone = ref('')
const phoneError = ref<string | null>(null)

// Debounced validation
const validatePhone = debounce((value: string) => {
  if (!value) {
    phoneError.value = null
    return
  }

  if (!/^[0-9]{10,15}$/.test(value)) {
    phoneError.value = 'Invalid phone number'
  } else {
    phoneError.value = null
  }
}, 500)

watch(phone, validatePhone)
</script>

<template>
  <AppInput
    v-model="phone"
    label="Phone Number"
    :error="phoneError"
  />
</template>
```

### Async Validation

```typescript
// Check if phone number already exists
async function validatePhoneUnique(phone: string): Promise<boolean> {
  try {
    const existing = await employeeService.getByPhone(phone)
    return !existing // false if exists
  } catch (error) {
    if (error instanceof NotFoundError) {
      return true // Phone doesn't exist, validation passes
    }
    throw error
  }
}

// Usage
const handlePhoneBlur = async () => {
  const isUnique = await validatePhoneUnique(formData.phone)
  if (!isUnique) {
    setFieldError('phone', 'This phone number is already registered')
  }
}
```

---

## 5. Error Recovery Strategies

### Retry Mechanism

```typescript
// src/utils/retry.ts
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000
): Promise<T> {
  let lastError: any

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      console.warn(`Attempt ${attempt}/${maxAttempts} failed:`, error)

      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
  }

  throw lastError
}

// Usage
const fetchEmployees = async () => {
  try {
    const employees = await retry(
      () => employeeService.getAll(),
      3,
      1000
    )
    return employees
  } catch (error) {
    handleError(error, 'fetchEmployees')
    throw error
  }
}
```

### Offline Detection

```typescript
// src/composables/useOnlineStatus.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useOnlineStatus() {
  const isOnline = ref(navigator.onLine)

  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine
  }

  onMounted(() => {
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
  })

  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)
  })

  return { isOnline }
}

// Usage in component
const { isOnline } = useOnlineStatus()

watch(isOnline, (online) => {
  if (!online) {
    uiStore.showWarning('You are offline. Some features may not work.')
  } else {
    uiStore.showInfo('Connection restored')
  }
})
```

---

## 6. Accessibility & Error Announcements

### ARIA Live Regions

```vue
<template>
  <div>
    <!-- Error announcement for screen readers -->
    <div
      role="alert"
      aria-live="assertive"
      class="sr-only"
    >
      {{ error }}
    </div>

    <!-- Visual error -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
```

---

## 7. Error Logging & Monitoring

### Console Logging (Development)

```typescript
// src/utils/logger.ts
import { env } from '@/config/env'

export const logger = {
  debug: (...args: any[]) => {
    if (env.features.debug) {
      console.debug('[DEBUG]', ...args)
    }
  },

  info: (...args: any[]) => {
    console.info('[INFO]', ...args)
  },

  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args)
  },

  error: (...args: any[]) => {
    console.error('[ERROR]', ...args)
  }
}
```

### Error Tracking Service Integration (Future)

```typescript
// Example: Sentry integration
// import * as Sentry from '@sentry/vue'

export function initErrorTracking(app: App) {
  if (env.app.isProd) {
    // Sentry.init({
    //   app,
    //   dsn: 'YOUR_SENTRY_DSN',
    //   environment: env.app.env
    // })
  }
}
```

---

## 8. Testing Error Handling

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest'
import { useValidation } from '@/composables/useValidation'

describe('useValidation', () => {
  it('validates required field', () => {
    const { validate, errors } = useValidation()

    const isValid = validate(
      { name: '' },
      { name: ['required'] }
    )

    expect(isValid).toBe(false)
    expect(errors.name).toBe('This field is required')
  })

  it('validates phone number format', () => {
    const { validate, errors } = useValidation()

    const isValid = validate(
      { phone: 'invalid' },
      { phone: ['phone'] }
    )

    expect(isValid).toBe(false)
    expect(errors.phone).toContain('Invalid phone number')
  })
})
```

---

## Validation & Error Handling Checklist

### Validation
- [x] Frontend validation for all forms
- [x] Real-time validation with debouncing
- [x] Server-side validation as final check
- [x] Database constraints enforce rules
- [x] User-friendly error messages
- [x] Field-level error display
- [x] Form-level error summary

### Error Handling
- [x] Try-catch blocks in all async operations
- [x] Specific error types for different scenarios
- [x] User-friendly error messages
- [x] Toast notifications for errors
- [x] Console logging in development
- [x] Error boundaries for component errors
- [x] Network error handling
- [x] Offline detection

### User Feedback
- [x] Loading states (spinner, skeleton)
- [x] Success notifications
- [x] Error notifications
- [x] Warning notifications
- [x] Empty states
- [x] Confirmation dialogs
- [x] Inline validation feedback
- [x] Accessibility (ARIA, screen reader support)
