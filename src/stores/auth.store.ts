/**
 * Auth Store
 * Manages authentication state and user session
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authService } from '@/services/auth.service'
import type { User, Session, ScannerAccount } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // ============================================================================
  // STATE
  // ============================================================================
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const scannerAccount = ref<ScannerAccount | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ============================================================================
  // GETTERS
  // ============================================================================
  const isAuthenticated = computed(() => !!session.value)

  const userRole = computed(() => scannerAccount.value?.role || null)

  const isAdmin = computed(() => userRole.value === 'admin')

  const isScanner = computed(() => userRole.value === 'scanner')

  const username = computed(() => scannerAccount.value?.username || null)

  const scannerId = computed(() => scannerAccount.value?.id || null)

  const canManageEmployees = computed(() => isAdmin.value)

  const canManageScanners = computed(() => isAdmin.value)

  const canViewReports = computed(() => isAdmin.value)

  const canScanQR = computed(() => isAuthenticated.value)

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Login with username and password
   */
  async function login(username: string, password: string): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const authResponse = await authService.login({ username, password })

      user.value = authResponse.user
      session.value = authResponse.session
      scannerAccount.value = authResponse.scannerAccount

      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout current user
   */
  async function logout(): Promise<void> {
    try {
      await authService.logout()
      reset()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Logout failed'
      throw e
    }
  }

  /**
   * Check authentication status on app load
   */
  async function checkAuth(): Promise<void> {
    isLoading.value = true

    try {
      const authResponse = await authService.getCurrentUser()

      if (authResponse) {
        user.value = authResponse.user
        session.value = authResponse.session
        scannerAccount.value = authResponse.scannerAccount
      } else {
        reset()
      }
    } catch (e) {
      console.error('Auth check failed:', e)
      reset()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Refresh session
   */
  async function refreshSession(): Promise<void> {
    const newSession = await authService.getCurrentSession()
    if (newSession) {
      session.value = newSession
    } else {
      reset()
    }
  }

  /**
   * Clear error message
   */
  function clearError(): void {
    error.value = null
  }

  /**
   * Reset store to initial state
   */
  function reset(): void {
    user.value = null
    session.value = null
    scannerAccount.value = null
    error.value = null
  }

  // ============================================================================
  // RETURN
  // ============================================================================
  return {
    // State
    user,
    session,
    scannerAccount,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    userRole,
    isAdmin,
    isScanner,
    username,
    scannerId,
    canManageEmployees,
    canManageScanners,
    canViewReports,
    canScanQR,

    // Actions
    login,
    logout,
    checkAuth,
    refreshSession,
    clearError,
    reset
  }
})
