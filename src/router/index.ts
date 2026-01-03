/**
 * Vue Router configuration
 */

import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { setupNavigationGuards } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
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
