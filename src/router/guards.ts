/**
 * Navigation guards
 */

import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

export function setupNavigationGuards(router: Router): void {
  // Before each route navigation
  router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore()

    // Check if route requires authentication
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

    // Set page title
    document.title = to.meta.title 
      ? `${to.meta.title} - Breakfast Counter System` 
      : 'Breakfast Counter System'

    if (requiresAuth) {
      // Check if user is authenticated
      if (!authStore.isAuthenticated) {
        // Try to restore session from storage
        await authStore.checkAuth()

        if (!authStore.isAuthenticated) {
          // Redirect to login
          next({
            name: 'login',
            query: { redirect: to.fullPath }
          })
          return
        }
      }

      // Check role-based access
      const allowedRoles = to.meta.allowedRoles as string[] | undefined
      
      if (allowedRoles && allowedRoles.length > 0) {
        const userRole = authStore.userRole

        if (!userRole || !allowedRoles.includes(userRole)) {
          // User doesn't have required role
          next({ name: 'unauthorized' })
          return
        }
      }
    } else {
      // If user is already authenticated and tries to access login
      if (to.name === 'login' && authStore.isAuthenticated) {
        // Redirect to appropriate dashboard based on role
        if (authStore.isAdmin) {
          next({ name: 'admin-dashboard' })
        } else {
          next({ name: 'scanner-scan' })
        }
        return
      }
    }

    // Proceed to route
    next()
  })

  // After each route navigation
  router.afterEach(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0)
  })

  // On navigation error
  router.onError((error) => {
    console.error('Router error:', error)
  })
}
