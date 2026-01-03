# Routing Specification

## Overview
Complete routing architecture using Vue Router 4 with authentication guards, role-based access control, and lazy loading.

## Router Configuration

### Main Router File

**File**: `src/router/index.ts`

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { setupNavigationGuards } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      return { top: 0 }
    }
  }
})

// Setup navigation guards
setupNavigationGuards(router)

export default router
```

---

## Route Definitions

**File**: `src/router/routes.ts`

```typescript
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  // ============================================================================
  // PUBLIC ROUTES (No authentication required)
  // ============================================================================
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      requiresAuth: false,
      layout: 'auth',
      title: 'Login'
    }
  },

  // ============================================================================
  // ADMIN ROUTES (Requires authentication + admin role)
  // ============================================================================
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['admin']
    },
    children: [
      // Dashboard
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: {
          title: 'Dashboard',
          icon: 'dashboard'
        }
      },

      // Employee Management
      {
        path: 'employees',
        name: 'admin-employees',
        component: () => import('@/views/admin/EmployeesView.vue'),
        meta: {
          title: 'Employees',
          icon: 'people'
        }
      },
      {
        path: 'employees/create',
        name: 'admin-employee-create',
        component: () => import('@/views/admin/EmployeeCreateView.vue'),
        meta: {
          title: 'Create Employee',
          breadcrumb: [
            { text: 'Employees', to: { name: 'admin-employees' } },
            { text: 'Create' }
          ]
        }
      },
      {
        path: 'employees/:phone',
        name: 'admin-employee-detail',
        component: () => import('@/views/admin/EmployeeDetailView.vue'),
        meta: {
          title: 'Employee Details',
          breadcrumb: [
            { text: 'Employees', to: { name: 'admin-employees' } },
            { text: 'Details' }
          ]
        }
      },
      {
        path: 'employees/:phone/edit',
        name: 'admin-employee-edit',
        component: () => import('@/views/admin/EmployeeEditView.vue'),
        meta: {
          title: 'Edit Employee',
          breadcrumb: [
            { text: 'Employees', to: { name: 'admin-employees' } },
            { text: 'Edit' }
          ]
        }
      },

      // Scanner Account Management
      {
        path: 'scanners',
        name: 'admin-scanners',
        component: () => import('@/views/admin/ScannersView.vue'),
        meta: {
          title: 'Scanners',
          icon: 'qr-code-scanner'
        }
      },
      {
        path: 'scanners/create',
        name: 'admin-scanner-create',
        component: () => import('@/views/admin/ScannerCreateView.vue'),
        meta: {
          title: 'Create Scanner',
          breadcrumb: [
            { text: 'Scanners', to: { name: 'admin-scanners' } },
            { text: 'Create' }
          ]
        }
      },

      // Reports (Phase II)
      {
        path: 'reports',
        name: 'admin-reports',
        component: () => import('@/views/admin/ReportsView.vue'),
        meta: {
          title: 'Reports',
          icon: 'assessment',
          phase: 2 // Optional: mark as Phase II feature
        }
      }
    ]
  },

  // ============================================================================
  // SCANNER ROUTES (Requires authentication, accessible by admin + scanner)
  // ============================================================================
  {
    path: '/scanner',
    component: () => import('@/layouts/ScannerLayout.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['admin', 'scanner']
    },
    children: [
      // QR Scan Interface
      {
        path: '',
        name: 'scanner-scan',
        component: () => import('@/views/scanner/ScanView.vue'),
        meta: {
          title: 'Scan QR Code',
          icon: 'qr-code-scanner'
        }
      },

      // Scan History (optional - scanner can see their own scans)
      {
        path: 'history',
        name: 'scanner-history',
        component: () => import('@/views/scanner/ScanHistoryView.vue'),
        meta: {
          title: 'Scan History',
          icon: 'history'
        }
      }
    ]
  },

  // ============================================================================
  // REDIRECT ROUTES
  // ============================================================================
  {
    path: '/',
    redirect: (to) => {
      // This will be handled by navigation guard based on auth status
      return { name: 'login' }
    }
  },

  // ============================================================================
  // ERROR ROUTES
  // ============================================================================
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('@/views/errors/UnauthorizedView.vue'),
    meta: {
      requiresAuth: false,
      layout: 'empty',
      title: 'Unauthorized'
    }
  },
  {
    path: '/error',
    name: 'error',
    component: () => import('@/views/errors/ErrorView.vue'),
    meta: {
      requiresAuth: false,
      layout: 'empty',
      title: 'Error'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/errors/NotFoundView.vue'),
    meta: {
      requiresAuth: false,
      layout: 'empty',
      title: '404 Not Found'
    }
  }
]
```

---

## Route Meta Fields

**Type Definition**:

```typescript
// src/types/router.types.ts
export interface RouteMeta {
  // Authentication & Authorization
  requiresAuth?: boolean           // Route requires authentication
  allowedRoles?: string[]          // Roles allowed to access (undefined = all authenticated)

  // UI Configuration
  title?: string                   // Page title
  layout?: string                  // Layout component to use
  icon?: string                    // Icon for navigation menus
  breadcrumb?: BreadcrumbItem[]    // Breadcrumb navigation

  // Feature Flags
  phase?: number                   // Development phase (1, 2, etc.)
  feature?: string                 // Feature flag name

  // SEO (optional)
  description?: string
  keywords?: string[]
}

export interface BreadcrumbItem {
  text: string
  to?: RouteLocationRaw
}
```

---

## Navigation Guards

**File**: `src/router/guards.ts`

```typescript
import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores'

export function setupNavigationGuards(router: Router) {
  // ============================================================================
  // BEFORE EACH GUARD (Authentication & Authorization)
  // ============================================================================
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // Check if auth state is initialized
    if (!authStore.user && authStore.session === null) {
      await authStore.checkAuth()
    }

    const requiresAuth = to.meta.requiresAuth !== false // Default to true
    const isAuthenticated = authStore.isAuthenticated
    const userRole = authStore.userRole
    const allowedRoles = to.meta.allowedRoles as string[] | undefined

    // Route requires authentication
    if (requiresAuth && !isAuthenticated) {
      // Redirect to login, save intended destination
      next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // User is authenticated but accessing login page
    if (to.name === 'login' && isAuthenticated) {
      // Redirect to appropriate dashboard based on role
      if (userRole === 'admin') {
        next({ name: 'admin-dashboard' })
      } else if (userRole === 'scanner') {
        next({ name: 'scanner-scan' })
      } else {
        next({ name: 'error' })
      }
      return
    }

    // Check role-based access
    if (requiresAuth && allowedRoles && allowedRoles.length > 0) {
      if (!userRole || !allowedRoles.includes(userRole)) {
        next({ name: 'unauthorized' })
        return
      }
    }

    // Handle root redirect based on authentication
    if (to.path === '/') {
      if (isAuthenticated) {
        if (userRole === 'admin') {
          next({ name: 'admin-dashboard' })
        } else if (userRole === 'scanner') {
          next({ name: 'scanner-scan' })
        } else {
          next({ name: 'error' })
        }
      } else {
        next({ name: 'login' })
      }
      return
    }

    // Allow navigation
    next()
  })

  // ============================================================================
  // AFTER EACH GUARD (Set page title, analytics, etc.)
  // ============================================================================
  router.afterEach((to) => {
    // Set document title
    const baseTitle = 'Breakfast Counter System'
    const pageTitle = to.meta.title as string | undefined

    if (pageTitle) {
      document.title = `${pageTitle} | ${baseTitle}`
    } else {
      document.title = baseTitle
    }

    // Optional: Track page view analytics
    // trackPageView(to.path)
  })

  // ============================================================================
  // ON ERROR GUARD (Global error handling)
  // ============================================================================
  router.onError((error) => {
    console.error('Router error:', error)

    // Optional: Log to error tracking service
    // logError(error)

    // Redirect to error page
    router.push({ name: 'error', query: { message: error.message } })
  })
}
```

---

## Route Helper Functions

**File**: `src/router/helpers.ts`

```typescript
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores'

/**
 * Navigate to route with role-based fallback
 */
export function useRoleBasedNavigation() {
  const router = useRouter()
  const authStore = useAuthStore()

  const navigateToDefaultRoute = () => {
    if (authStore.isAdmin) {
      router.push({ name: 'admin-dashboard' })
    } else if (authStore.isScanner) {
      router.push({ name: 'scanner-scan' })
    } else {
      router.push({ name: 'login' })
    }
  }

  return { navigateToDefaultRoute }
}

/**
 * Check if user can access route
 */
export function canAccessRoute(routeName: string): boolean {
  const router = useRouter()
  const authStore = useAuthStore()

  const route = router.getRoutes().find(r => r.name === routeName)
  if (!route) return false

  const requiresAuth = route.meta.requiresAuth !== false
  const allowedRoles = route.meta.allowedRoles as string[] | undefined

  if (requiresAuth && !authStore.isAuthenticated) {
    return false
  }

  if (allowedRoles && allowedRoles.length > 0) {
    return authStore.userRole ? allowedRoles.includes(authStore.userRole) : false
  }

  return true
}

/**
 * Get breadcrumb items for current route
 */
export function useBreadcrumbs() {
  const route = useRoute()

  const breadcrumbs = computed(() => {
    return route.meta.breadcrumb || []
  })

  return { breadcrumbs }
}
```

---

## Lazy Loading Strategy

### Route-Level Code Splitting

All route components use dynamic imports:

```typescript
component: () => import('@/views/admin/DashboardView.vue')
```

**Benefits**:
- Initial bundle size reduced
- Faster initial page load
- Routes loaded on-demand

### Chunk Naming (Vite Config)

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'supabase': ['@supabase/supabase-js'],
          'admin': [
            './src/views/admin/DashboardView.vue',
            './src/views/admin/EmployeesView.vue'
          ],
          'scanner': [
            './src/views/scanner/ScanView.vue'
          ]
        }
      }
    }
  }
})
```

---

## Navigation Menu Structure

### Admin Navigation

```typescript
// src/utils/navigation.ts
import type { RouteLocationRaw } from 'vue-router'

export interface NavItem {
  title: string
  icon: string
  to: RouteLocationRaw
  roles: string[]
  children?: NavItem[]
}

export const adminNavigation: NavItem[] = [
  {
    title: 'Dashboard',
    icon: 'dashboard',
    to: { name: 'admin-dashboard' },
    roles: ['admin']
  },
  {
    title: 'Employees',
    icon: 'people',
    to: { name: 'admin-employees' },
    roles: ['admin']
  },
  {
    title: 'Scanners',
    icon: 'qr-code-scanner',
    to: { name: 'admin-scanners' },
    roles: ['admin']
  },
  {
    title: 'Reports',
    icon: 'assessment',
    to: { name: 'admin-reports' },
    roles: ['admin']
  },
  {
    title: 'Scan QR',
    icon: 'qr-code',
    to: { name: 'scanner-scan' },
    roles: ['admin']
  }
]

export const scannerNavigation: NavItem[] = [
  {
    title: 'Scan QR Code',
    icon: 'qr-code-scanner',
    to: { name: 'scanner-scan' },
    roles: ['admin', 'scanner']
  },
  {
    title: 'History',
    icon: 'history',
    to: { name: 'scanner-history' },
    roles: ['admin', 'scanner']
  }
]
```

### Filter Navigation by Role

```typescript
// In navigation component
import { computed } from 'vue'
import { useAuthStore } from '@/stores'
import { adminNavigation, scannerNavigation } from '@/utils/navigation'

const authStore = useAuthStore()

const navigationItems = computed(() => {
  const items = authStore.isAdmin ? adminNavigation : scannerNavigation

  return items.filter(item =>
    item.roles.includes(authStore.userRole || '')
  )
})
```

---

## Route Transitions

**App.vue**:

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<style scoped>
/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
```

---

## Route Testing Checklist

### Authentication Tests
- [ ] Unauthenticated user redirected to login
- [ ] Authenticated user cannot access login page
- [ ] Session persistence after page refresh
- [ ] Logout clears session and redirects

### Authorization Tests
- [ ] Admin can access all admin routes
- [ ] Scanner cannot access admin routes
- [ ] Scanner can access scanner routes
- [ ] Admin can access scanner routes
- [ ] Unauthorized access shows 401 page

### Navigation Tests
- [ ] Root path redirects based on role
- [ ] Breadcrumbs display correctly
- [ ] Page titles update correctly
- [ ] 404 page for invalid routes
- [ ] Back button works correctly

### Performance Tests
- [ ] Lazy loading works
- [ ] Route transitions smooth
- [ ] No layout flashing during navigation

---

## GitHub Pages Configuration

### Base URL Configuration

**vite.config.ts**:
```typescript
export default defineConfig({
  base: '/Breakfast-v3/', // Match your GitHub repo name
})
```

**Router Configuration**:
```typescript
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})
```

### 404 Fallback for SPA

**public/404.html**:
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Breakfast Counter System</title>
    <script>
      // GitHub Pages SPA redirect
      sessionStorage.redirect = location.href;
    </script>
    <meta http-equiv="refresh" content="0;URL='/Breakfast-v3/'">
  </head>
  <body>
  </body>
</html>
```

**index.html** (handle redirect):
```html
<script>
  (function() {
    var redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;
    if (redirect && redirect !== location.href) {
      history.replaceState(null, null, redirect);
    }
  })();
</script>
```

---

## Route Summary Table

| Route Path | Name | Access | Purpose |
|------------|------|--------|---------|
| `/login` | login | Public | User authentication |
| `/` | - | Any | Redirect to role-based default |
| `/admin` | admin-dashboard | Admin | Admin dashboard |
| `/admin/employees` | admin-employees | Admin | Employee list |
| `/admin/employees/create` | admin-employee-create | Admin | Create employee |
| `/admin/employees/:phone` | admin-employee-detail | Admin | Employee details |
| `/admin/employees/:phone/edit` | admin-employee-edit | Admin | Edit employee |
| `/admin/scanners` | admin-scanners | Admin | Scanner account list |
| `/admin/scanners/create` | admin-scanner-create | Admin | Create scanner |
| `/admin/reports` | admin-reports | Admin | Reports (Phase II) |
| `/scanner` | scanner-scan | Admin, Scanner | QR scanning interface |
| `/scanner/history` | scanner-history | Admin, Scanner | Scan history |
| `/unauthorized` | unauthorized | Public | 401 error page |
| `/error` | error | Public | General error page |
| `/:pathMatch(.*)*` | not-found | Public | 404 error page |
