/**
 * useValidation Composable
 * 
 * Provides form validation functionality with common validation rules.
 * Can be used standalone or with form libraries like vee-validate.
 */

import { ref, computed } from 'vue'
import { VALIDATION_RULES } from '@/utils/validators'

export interface ValidationRule {
  validate: (value: unknown) => boolean
  message: string
}

export interface FieldValidation {
  value: unknown
  rules: ValidationRule[]
  error: string | null
  isValid: boolean
  isDirty: boolean
  isTouched: boolean
}

export function useValidation() {
  const fields = ref<Map<string, FieldValidation>>(new Map())

  /**
   * Register a field for validation
   */
  function registerField(
    fieldName: string,
    rules: ValidationRule[],
    initialValue: unknown = null
  ) {
    fields.value.set(fieldName, {
      value: initialValue,
      rules,
      error: null,
      isValid: true,
      isDirty: false,
      isTouched: false
    })
  }

  /**
   * Validate a single field
   */
  function validateField(fieldName: string, value?: unknown): boolean {
    const field = fields.value.get(fieldName)
    if (!field) return true

    // Update value if provided
    if (value !== undefined) {
      field.value = value
      field.isDirty = true
    }

    // Run all validation rules
    for (const rule of field.rules) {
      if (!rule.validate(field.value)) {
        field.error = rule.message
        field.isValid = false
        fields.value.set(fieldName, field)
        return false
      }
    }

    // All rules passed
    field.error = null
    field.isValid = true
    fields.value.set(fieldName, field)
    return true
  }

  /**
   * Validate all registered fields
   */
  function validateAll(): boolean {
    let isValid = true

    for (const [fieldName] of fields.value) {
      if (!validateField(fieldName)) {
        isValid = false
      }
    }

    return isValid
  }

  /**
   * Mark field as touched (for blur events)
   */
  function touchField(fieldName: string) {
    const field = fields.value.get(fieldName)
    if (field) {
      field.isTouched = true
      fields.value.set(fieldName, field)
    }
  }

  /**
   * Get field error message
   */
  function getError(fieldName: string): string | null {
    return fields.value.get(fieldName)?.error || null
  }

  /**
   * Get field validation state
   */
  function getFieldState(fieldName: string) {
    return fields.value.get(fieldName) || null
  }

  /**
   * Check if field is valid
   */
  function isFieldValid(fieldName: string): boolean {
    return fields.value.get(fieldName)?.isValid ?? true
  }

  /**
   * Reset field validation
   */
  function resetField(fieldName: string) {
    const field = fields.value.get(fieldName)
    if (field) {
      field.error = null
      field.isValid = true
      field.isDirty = false
      field.isTouched = false
      fields.value.set(fieldName, field)
    }
  }

  /**
   * Reset all fields
   */
  function resetAll() {
    for (const [fieldName] of fields.value) {
      resetField(fieldName)
    }
  }

  /**
   * Clear/unregister field
   */
  function unregisterField(fieldName: string) {
    fields.value.delete(fieldName)
  }

  /**
   * Clear all fields
   */
  function clearAll() {
    fields.value.clear()
  }

  /**
   * Check if form is valid
   */
  const isFormValid = computed(() => {
    for (const [, field] of fields.value) {
      if (!field.isValid) return false
    }
    return true
  })

  /**
   * Check if form is dirty (any field has changed)
   */
  const isFormDirty = computed(() => {
    for (const [, field] of fields.value) {
      if (field.isDirty) return true
    }
    return false
  })

  /**
   * Get all errors
   */
  const errors = computed(() => {
    const errorMap: Record<string, string> = {}
    for (const [fieldName, field] of fields.value) {
      if (field.error) {
        errorMap[fieldName] = field.error
      }
    }
    return errorMap
  })

  /**
   * Common validation rules factory
   */
  const rules = {
    required: (message = 'This field is required'): ValidationRule => ({
      validate: (value) => {
        if (typeof value === 'string') return value.trim().length > 0
        if (Array.isArray(value)) return value.length > 0
        return value !== null && value !== undefined
      },
      message
    }),

    email: (message = 'Invalid email address'): ValidationRule => ({
      validate: (value) => {
        if (!value) return true // Allow empty (use required() to enforce)
        return VALIDATION_RULES.EMAIL.test(String(value))
      },
      message
    }),

    phone: (message = 'Invalid phone number'): ValidationRule => ({
      validate: (value) => {
        if (!value) return true
        return VALIDATION_RULES.PHONE.test(String(value))
      },
      message
    }),

    minLength: (min: number, message?: string): ValidationRule => ({
      validate: (value) => {
        if (!value) return true
        return String(value).length >= min
      },
      message: message || `Minimum ${min} characters required`
    }),

    maxLength: (max: number, message?: string): ValidationRule => ({
      validate: (value) => {
        if (!value) return true
        return String(value).length <= max
      },
      message: message || `Maximum ${max} characters allowed`
    }),

    min: (min: number, message?: string): ValidationRule => ({
      validate: (value) => {
        if (value === null || value === undefined) return true
        return Number(value) >= min
      },
      message: message || `Minimum value is ${min}`
    }),

    max: (max: number, message?: string): ValidationRule => ({
      validate: (value) => {
        if (value === null || value === undefined) return true
        return Number(value) <= max
      },
      message: message || `Maximum value is ${max}`
    }),

    pattern: (pattern: RegExp, message = 'Invalid format'): ValidationRule => ({
      validate: (value) => {
        if (!value) return true
        return pattern.test(String(value))
      },
      message
    }),

    custom: (validate: (value: unknown) => boolean, message: string): ValidationRule => ({
      validate,
      message
    })
  }

  return {
    // State
    fields,
    isFormValid,
    isFormDirty,
    errors,

    // Methods
    registerField,
    validateField,
    validateAll,
    touchField,
    getError,
    getFieldState,
    isFieldValid,
    resetField,
    resetAll,
    unregisterField,
    clearAll,

    // Rules factory
    rules
  }
}

/**
 * Standalone validation helpers (without reactive state)
 */
export const validate = {
  required: (value: unknown): boolean => {
    if (typeof value === 'string') return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    return value !== null && value !== undefined
  },

  email: (value: string): boolean => {
    return VALIDATION_RULES.EMAIL.test(value)
  },

  phone: (value: string): boolean => {
    return VALIDATION_RULES.PHONE.test(value)
  },

  minLength: (value: string, min: number): boolean => {
    return value.length >= min
  },

  maxLength: (value: string, max: number): boolean => {
    return value.length <= max
  },

  pattern: (value: string, pattern: RegExp): boolean => {
    return pattern.test(value)
  }
}
