/**
 * Error Handler Utility
 * 
 * Provides centralized error handling and parsing for the Breakfast Counter System.
 * Handles Supabase errors, validation errors, and provides user-friendly messages.
 */

import type { PostgrestError } from '@supabase/supabase-js'
import type {
  AppError,
  SupabaseError,
  ErrorHandlerResult,
  ErrorCategory,
  ErrorSeverity,
  ErrorContext,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  DatabaseError,
  BusinessLogicError
} from '@/types/errors.types'
import {
  SUPABASE_ERROR_CODES,
  ERROR_MESSAGES
} from '@/types/errors.types'

/**
 * Parse Supabase error and extract relevant information
 */
export function parseSupabaseError(error: unknown): SupabaseError {
  // Handle PostgrestError from Supabase
  if (isPostgrestError(error)) {
    return {
      code: error.code || 'UNKNOWN',
      message: error.message,
      details: error.details,
      hint: error.hint,
      status: parseInt(error.code) || undefined
    }
  }

  // Handle generic Error objects
  if (error instanceof Error) {
    return {
      code: 'UNKNOWN',
      message: error.message
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      code: 'UNKNOWN',
      message: error
    }
  }

  // Unknown error type
  return {
    code: 'UNKNOWN',
    message: 'An unexpected error occurred'
  }
}

/**
 * Get user-friendly error message based on error code or type
 */
export function getUserFriendlyMessage(error: unknown): string {
  const parsedError = parseSupabaseError(error)
  
  // Check if we have a predefined message for this error code
  if (parsedError.code && ERROR_MESSAGES[parsedError.code]) {
    return ERROR_MESSAGES[parsedError.code]
  }

  // Handle specific error patterns
  if (parsedError.message.toLowerCase().includes('duplicate')) {
    return ERROR_MESSAGES[SUPABASE_ERROR_CODES.UNIQUE_VIOLATION]
  }

  if (parsedError.message.toLowerCase().includes('not found')) {
    return 'The requested item was not found'
  }

  if (parsedError.message.toLowerCase().includes('permission') || 
      parsedError.message.toLowerCase().includes('unauthorized')) {
    return ERROR_MESSAGES[SUPABASE_ERROR_CODES.INSUFFICIENT_PRIVILEGE]
  }

  if (parsedError.message.toLowerCase().includes('network') ||
      parsedError.message.toLowerCase().includes('fetch')) {
    return ERROR_MESSAGES[SUPABASE_ERROR_CODES.NETWORK_ERROR]
  }

  // Return original message if no match found
  return parsedError.message || ERROR_MESSAGES.UNKNOWN
}

/**
 * Categorize error by type
 */
export function categorizeError(error: unknown): ErrorCategory {
  const parsedError = parseSupabaseError(error)
  const code = parsedError.code?.toLowerCase() || ''
  const message = parsedError.message?.toLowerCase() || ''

  // Authentication errors
  if (code.includes('auth') || 
      code === SUPABASE_ERROR_CODES.INVALID_CREDENTIALS ||
      message.includes('credentials') ||
      message.includes('password')) {
    return ErrorCategory.AUTHENTICATION
  }

  // Authorization errors
  if (code === SUPABASE_ERROR_CODES.INSUFFICIENT_PRIVILEGE ||
      message.includes('permission') ||
      message.includes('unauthorized')) {
    return ErrorCategory.AUTHORIZATION
  }

  // Database errors
  if (code === SUPABASE_ERROR_CODES.UNIQUE_VIOLATION ||
      code === SUPABASE_ERROR_CODES.FOREIGN_KEY_VIOLATION ||
      code === SUPABASE_ERROR_CODES.NOT_NULL_VIOLATION) {
    return ErrorCategory.DATABASE
  }

  // Network errors
  if (code === SUPABASE_ERROR_CODES.NETWORK_ERROR ||
      code === SUPABASE_ERROR_CODES.TIMEOUT ||
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout')) {
    return ErrorCategory.NETWORK
  }

  // Validation errors
  if (message.includes('invalid') ||
      message.includes('required') ||
      message.includes('must be')) {
    return ErrorCategory.VALIDATION
  }

  return ErrorCategory.UNKNOWN
}

/**
 * Determine error severity
 */
export function getErrorSeverity(error: unknown): ErrorSeverity {
  const category = categorizeError(error)

  switch (category) {
    case ErrorCategory.VALIDATION:
      return ErrorSeverity.WARNING
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
      return ErrorSeverity.ERROR
    case ErrorCategory.DATABASE:
    case ErrorCategory.NETWORK:
      return ErrorSeverity.ERROR
    case ErrorCategory.BUSINESS_LOGIC:
      return ErrorSeverity.WARNING
    default:
      return ErrorSeverity.ERROR
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const category = categorizeError(error)
  const parsedError = parseSupabaseError(error)

  // Network errors are generally retryable
  if (category === ErrorCategory.NETWORK) {
    return true
  }

  // Timeout errors are retryable
  if (parsedError.code === SUPABASE_ERROR_CODES.TIMEOUT) {
    return true
  }

  // 5xx server errors are retryable
  if (parsedError.status && parsedError.status >= 500) {
    return true
  }

  return false
}

/**
 * Main error handler - processes error and returns structured result
 */
export function handleError(
  error: unknown,
  context?: ErrorContext
): ErrorHandlerResult {
  const userMessage = getUserFriendlyMessage(error)
  const category = categorizeError(error)
  const severity = getErrorSeverity(error)
  const retryable = isRetryableError(error)

  // Log error to console in development
  if (import.meta.env.DEV) {
    console.error('[Error Handler]', {
      error,
      context,
      category,
      severity,
      userMessage
    })
  }

  return {
    userMessage,
    severity,
    category,
    shouldLog: severity === ErrorSeverity.ERROR || severity === ErrorSeverity.CRITICAL,
    shouldNotify: true,
    retryable
  }
}

/**
 * Try-catch wrapper for async functions
 * Automatically handles errors and provides consistent error handling
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  context?: ErrorContext
): Promise<[T | null, ErrorHandlerResult | null]> {
  try {
    const result = await fn()
    return [result, null]
  } catch (error) {
    const errorResult = handleError(error, context)
    return [null, errorResult]
  }
}

/**
 * Type guard for PostgrestError
 */
function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  )
}

/**
 * Create typed error instances
 */
export class AppErrorFactory {
  static validation(message: string, fields?: Record<string, string[]>): ValidationError {
    return {
      name: 'ValidationError',
      message,
      category: ErrorCategory.VALIDATION,
      fields,
      timestamp: new Date()
    }
  }

  static authentication(message: string, code?: string): AuthenticationError {
    return {
      name: 'AuthenticationError',
      message,
      category: ErrorCategory.AUTHENTICATION,
      code,
      timestamp: new Date()
    }
  }

  static authorization(message: string, requiredRole?: string, userRole?: string): AuthorizationError {
    return {
      name: 'AuthorizationError',
      message,
      category: ErrorCategory.AUTHORIZATION,
      requiredRole,
      userRole,
      timestamp: new Date()
    }
  }

  static network(message: string, isOnline = true): NetworkError {
    return {
      name: 'NetworkError',
      message,
      category: ErrorCategory.NETWORK,
      isOnline,
      retryable: true,
      timestamp: new Date()
    }
  }

  static database(message: string, table?: string): DatabaseError {
    return {
      name: 'DatabaseError',
      message,
      category: ErrorCategory.DATABASE,
      table,
      timestamp: new Date()
    }
  }

  static businessLogic(message: string, code?: string): BusinessLogicError {
    return {
      name: 'BusinessLogicError',
      message,
      category: ErrorCategory.BUSINESS_LOGIC,
      code,
      timestamp: new Date()
    }
  }
}

/**
 * Extract field-specific validation errors from Supabase response
 */
export function extractValidationErrors(error: unknown): Record<string, string[]> {
  const parsedError = parseSupabaseError(error)
  const fields: Record<string, string[]> = {}

  // Try to parse details if available
  if (parsedError.details) {
    try {
      // Supabase might return validation details in different formats
      if (typeof parsedError.details === 'string') {
        // Try to extract field name from details string
        const fieldMatch = parsedError.details.match(/column "(\w+)"/)
        if (fieldMatch) {
          fields[fieldMatch[1]] = [parsedError.message]
        }
      }
    } catch {
      // Ignore parsing errors
    }
  }

  return fields
}
