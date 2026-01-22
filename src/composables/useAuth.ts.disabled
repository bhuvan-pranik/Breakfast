/**
 * useAuth Composable
 * 
 * Provides authentication functionality and state management.
 * Wraps the auth store with convenient methods and reactive state.
 */

import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { handleError, tryCatch } from '@/utils/error-handler'
import type { LoginCredentials } from '@/types/auth.types'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  // Reactive state from store
  const {
    user,
    session,
    isAuthenticated,
    isAdmin,
    isScanner,
    userRole,
    isLoading,
    error
  } = storeToRefs(authStore)

  /**
   * Login user with credentials
   */
  async function login(credentials: LoginCredentials) {
    const [result, errorResult] = await tryCatch(
      () => authStore.login(credentials),
      { action: 'login', component: 'useAuth' }
    )

    if (errorResult) {
      return {
        success: false,
        error: errorResult.userMessage
      }
    }

    return {
      success: true,
      data: result
    }
  }

  /**
   * Logout current user
   */
  async function logout() {
    const [, errorResult] = await tryCatch(
      () => authStore.logout(),
      { action: 'logout', component: 'useAuth' }
    )

    if (errorResult) {
      return {
        success: false,
        error: errorResult.userMessage
      }
    }

    // Redirect to login page
    await router.push('/login')

    return {
      success: true
    }
  }

  /**
   * Initialize auth state (restore session)
   */
  async function initialize() {
    const [, errorResult] = await tryCatch(
      () => authStore.initializeAuth(),
      { action: 'initialize', component: 'useAuth' }
    )

    if (errorResult) {
      console.error('Failed to initialize auth:', errorResult)
    }
  }

  /**
   * Check if user has specific role
   */
  function hasRole(role: string): boolean {
    return authStore.hasRole(role)
  }

  /**
   * Check if user has any of the specified roles
   */
  function hasAnyRole(roles: string[]): boolean {
    return authStore.hasAnyRole(roles)
  }

  /**
   * Check if user has all specified roles
   */
  function hasAllRoles(roles: string[]): boolean {
    return authStore.hasAllRoles(roles)
  }

  /**
   * Check if user has specific permission
   */
  function hasPermission(permission: string): boolean {
    return authStore.hasPermission(permission)
  }

  /**
   * Require authentication - redirect to login if not authenticated
   */
  async function requireAuth() {
    if (!isAuthenticated.value) {
      await router.push('/login')
      return false
    }
    return true
  }

  /**
   * Require specific role - redirect to unauthorized if not authorized
   */
  async function requireRole(role: string) {
    if (!await requireAuth()) {
      return false
    }

    if (!hasRole(role)) {
      await router.push('/unauthorized')
      return false
    }

    return true
  }

  /**
   * Require admin role
   */
  async function requireAdmin() {
    return await requireRole('admin')
  }

  /**
   * Require scanner role
   */
  async function requireScanner() {
    return await requireRole('scanner')
  }

  /**
   * Get current user ID
   */
  const userId = computed(() => user.value?.id)

  /**
   * Get current user email
   */
  const userEmail = computed(() => user.value?.email)

  /**
   * Get current user username
   */
  const username = computed(() => {
    if (!user.value?.email) return null
    return user.value.email.split('@')[0]
  })

  /**
   * Check if session is valid
   */
  const hasValidSession = computed(() => {
    return !!session.value && !!user.value
  })

  return {
    // State
    user,
    session,
    isAuthenticated,
    isAdmin,
    isScanner,
    userRole,
    isLoading,
    error,
    userId,
    userEmail,
    username,
    hasValidSession,

    // Methods
    login,
    logout,
    initialize,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    requireAuth,
    requireRole,
    requireAdmin,
    requireScanner
  }
}
