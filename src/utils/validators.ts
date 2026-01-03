/**
 * Validation helper functions
 */

import { VALIDATION } from './constants'

export const validators = {
  /**
   * Validate phone number
   */
  phone: (value: string): boolean => {
    const cleaned = value.replace(/\D/g, '')
    return cleaned.length >= VALIDATION.PHONE_MIN_LENGTH && 
           cleaned.length <= VALIDATION.PHONE_MAX_LENGTH
  },

  /**
   * Validate phone number with error message
   */
  phoneWithMessage: (value: string): true | string => {
    if (!value) return 'Phone number is required'
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length < VALIDATION.PHONE_MIN_LENGTH) {
      return `Phone number must be at least ${VALIDATION.PHONE_MIN_LENGTH} digits`
    }
    if (cleaned.length > VALIDATION.PHONE_MAX_LENGTH) {
      return `Phone number must not exceed ${VALIDATION.PHONE_MAX_LENGTH} digits`
    }
    return true
  },

  /**
   * Validate name
   */
  name: (value: string): true | string => {
    if (!value) return 'Name is required'
    if (value.length < VALIDATION.NAME_MIN_LENGTH) {
      return `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`
    }
    if (value.length > VALIDATION.NAME_MAX_LENGTH) {
      return `Name must not exceed ${VALIDATION.NAME_MAX_LENGTH} characters`
    }
    return true
  },

  /**
   * Validate username
   */
  username: (value: string): true | string => {
    if (!value) return 'Username is required'
    if (value.length < VALIDATION.USERNAME_MIN_LENGTH) {
      return `Username must be at least ${VALIDATION.USERNAME_MIN_LENGTH} characters`
    }
    if (value.length > VALIDATION.USERNAME_MAX_LENGTH) {
      return `Username must not exceed ${VALIDATION.USERNAME_MAX_LENGTH} characters`
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return 'Username can only contain letters, numbers, hyphens, and underscores'
    }
    return true
  },

  /**
   * Validate password
   */
  password: (value: string): true | string => {
    if (!value) return 'Password is required'
    if (value.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      return `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`
    }
    if (!/[A-Z]/.test(value)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/[a-z]/.test(value)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/[0-9]/.test(value)) {
      return 'Password must contain at least one number'
    }
    return true
  },

  /**
   * Validate email
   */
  email: (value: string): true | string => {
    if (!value) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return 'Invalid email address'
    }
    return true
  },

  /**
   * Validate required field
   */
  required: (value: any): true | string => {
    if (value === null || value === undefined || value === '') {
      return 'This field is required'
    }
    return true
  }
}
