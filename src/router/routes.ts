/**
 * Route definitions
 */

import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  // ============================================================================
  // ROOT REDIRECT
  // ============================================================================
  {
    path: '/',
    redirect: '/login'
  },

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

  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('@/views/auth/UnauthorizedView.vue'),
    meta: {
      requiresAuth: false,
      title: 'Unauthorized'
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
          title: 'Dashboard'
        }
      },

      // Employee Management
      {
        path: 'employees',
        name: 'admin-employees',
        component: () => import('@/views/admin/EmployeesView.vue'),
        meta: {
          title: 'Employees'
        }
      },
      {
        path: 'employees/create',
        name: 'admin-employee-create',
        component: () => import('@/views/admin/EmployeeCreateView.vue'),
        meta: {
          title: 'Create Employee'
        }
      },
      {
        path: 'employees/:phone',
        name: 'admin-employee-detail',
        component: () => import('@/views/admin/EmployeeDetailView.vue'),
        meta: {
          title: 'Employee Details'
        }
      },
      {
        path: 'employees/:phone/edit',
        name: 'admin-employee-edit',
        component: () => import('@/views/admin/EmployeeEditView.vue'),
        meta: {
          title: 'Edit Employee'
        }
      },

      // Scanner Account Management
      {
        path: 'scanners',
        name: 'admin-scanners',
        component: () => import('@/views/admin/ScannersView.vue'),
        meta: {
          title: 'Scanners'
        }
      },
      {
        path: 'scanners/create',
        name: 'admin-scanner-create',
        component: () => import('@/views/admin/ScannerCreateView.vue'),
        meta: {
          title: 'Create Scanner'
        }
      },

      // Reports (Phase II)
      {
        path: 'reports',
        name: 'admin-reports',
        component: () => import('@/views/admin/ReportsView.vue'),
        meta: {
          title: 'Reports'
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
          title: 'Scan QR Code'
        }
      },

      // Scan History
      {
        path: 'history',
        name: 'scanner-history',
        component: () => import('@/views/scanner/ScanHistoryView.vue'),
        meta: {
          title: 'Scan History'
        }
      }
    ]
  },

  // ============================================================================
  // ERROR ROUTES
  // ============================================================================
  {
    path: '/error',
    name: 'error',
    component: () => import('@/views/errors/ErrorView.vue'),
    meta: {
      requiresAuth: false,
      title: 'Error'
    }
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/errors/NotFoundView.vue'),
    meta: {
      requiresAuth: false,
      title: 'Page Not Found'
    }
  }
]
