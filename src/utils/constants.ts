/**
 * Application constants
 */

export const APP_NAME = 'Breakfast Counter System'
export const APP_VERSION = '1.0.0'

// Gender options
export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' }
] as const

// Gender values array
export const GENDERS = ['Male', 'Female', 'Other'] as const

// Department options
export const DEPARTMENTS = [
  'Interns',
  'Tech',
  'operations',
  'Others'
] as const

// Role options
export const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'scanner', label: 'Scanner' }
] as const

// Scan status options
export const SCAN_STATUS = {
  SUCCESS: 'success',
  DUPLICATE: 'duplicate',
  INVALID: 'invalid',
  INACTIVE: 'inactive'
} as const

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// Date formats
export const DATE_FORMAT = 'YYYY-MM-DD'
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
export const TIME_FORMAT = 'HH:mm:ss'

// Validation constraints
export const VALIDATION = {
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  DEPARTMENT_MAX_LENGTH: 50
} as const

// Notification durations (ms)
export const NOTIFICATION_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000
} as const
