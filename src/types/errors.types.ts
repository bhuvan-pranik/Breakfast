/**
 * Error Types for Breakfast Counter System
 * 
 * Defines standardized error types and interfaces for consistent error handling
 * across the application.
 */

/**
 * Base application error with additional context
 */
export interface AppError extends Error {
  code?: string
  statusCode?: number
  details?: Record<string, unknown>
  timestamp?: Date
  userMessage?: string
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  DATABASE = 'database',
  BUSINESS_LOGIC = 'business_logic',
  UNKNOWN = 'unknown'
}

/**
 * Validation error with field-specific details
 */
export interface ValidationError extends AppError {
  category: ErrorCategory.VALIDATION
  fields?: Record<string, string[]>
}

/**
 * Authentication error
 */
export interface AuthenticationError extends AppError {
  category: ErrorCategory.AUTHENTICATION
}

/**
 * Authorization error (insufficient permissions)
 */
export interface AuthorizationError extends AppError {
  category: ErrorCategory.AUTHORIZATION
  requiredRole?: string
  userRole?: string
}

/**
 * Network/connection error
 */
export interface NetworkError extends AppError {
  category: ErrorCategory.NETWORK
  isOnline?: boolean
  retryable?: boolean
}

/**
 * Database operation error
 */
export interface DatabaseError extends AppError {
  category: ErrorCategory.DATABASE
  query?: string
  table?: string
}

/**
 * Business logic error (e.g., duplicate scan, employee not found)
 */
export interface BusinessLogicError extends AppError {
  category: ErrorCategory.BUSINESS_LOGIC
}

/**
 * Supabase-specific error details
 */
export interface SupabaseError {
  code: string
  message: string
  details?: string
  hint?: string
  status?: number
}

/**
 * Error handler response
 */
export interface ErrorHandlerResult {
  userMessage: string
  severity: ErrorSeverity
  category: ErrorCategory
  shouldLog: boolean
  shouldNotify: boolean
  retryable: boolean
}

/**
 * Error context for logging and debugging
 */
export interface ErrorContext {
  action?: string
  component?: string
  userId?: string
  additionalData?: Record<string, unknown>
}

/**
 * Known Supabase error codes
 */
export const SUPABASE_ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'invalid_grant',
  EMAIL_NOT_CONFIRMED: 'email_not_confirmed',
  USER_NOT_FOUND: 'user_not_found',
  WEAK_PASSWORD: 'weak_password',
  
  // Database errors
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514',
  
  // Permission errors
  INSUFFICIENT_PRIVILEGE: '42501',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
} as const

/**
 * User-friendly error messages map
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Authentication
  [SUPABASE_ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid username or password',
  [SUPABASE_ERROR_CODES.EMAIL_NOT_CONFIRMED]: 'Please confirm your email address',
  [SUPABASE_ERROR_CODES.USER_NOT_FOUND]: 'User not found',
  [SUPABASE_ERROR_CODES.WEAK_PASSWORD]: 'Password is too weak',
  
  // Database
  [SUPABASE_ERROR_CODES.UNIQUE_VIOLATION]: 'This record already exists',
  [SUPABASE_ERROR_CODES.FOREIGN_KEY_VIOLATION]: 'Cannot delete: related records exist',
  [SUPABASE_ERROR_CODES.NOT_NULL_VIOLATION]: 'Required field is missing',
  
  // Permission
  [SUPABASE_ERROR_CODES.INSUFFICIENT_PRIVILEGE]: 'You do not have permission to perform this action',
  
  // Network
  [SUPABASE_ERROR_CODES.NETWORK_ERROR]: 'Network connection error. Please check your internet connection.',
  [SUPABASE_ERROR_CODES.TIMEOUT]: 'Request timed out. Please try again.',
  
  // Generic
  UNKNOWN: 'An unexpected error occurred. Please try again.',
} as const
