/**
 * Main application entry point
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { validateEnv } from './config/env'
import './style.css'

// Validate environment variables
try {
  validateEnv()
} catch (error) {
  console.error('Environment validation failed:', error)
  alert('Application configuration error. Please check the console for details.')
}

const app = createApp(App)

// Install Pinia store
app.use(createPinia())

// Install Vue Router
app.use(router)

// Mount app
app.mount('#app')
