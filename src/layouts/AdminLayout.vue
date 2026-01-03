<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="admin-layout">
    <header class="header">
      <div class="container">
        <h1>Breakfast Counter System - Admin</h1>
        <div class="user-info">
          <span>Welcome, {{ authStore.username }}</span>
          <button @click="handleLogout" class="btn-logout">Logout</button>
        </div>
      </div>
    </header>

    <nav class="nav">
      <div class="container">
        <RouterLink to="/admin" class="nav-link">Dashboard</RouterLink>
        <RouterLink to="/admin/employees" class="nav-link">Employees</RouterLink>
        <RouterLink to="/admin/scanners" class="nav-link">Scanners</RouterLink>
        <RouterLink to="/admin/reports" class="nav-link">Reports</RouterLink>
        <RouterLink to="/scanner" class="nav-link">Scanner Mode</RouterLink>
      </div>
    </nav>

    <main class="main">
      <div class="container">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 20px;
}

.header h1 {
  font-size: 1.5rem;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-logout {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-logout:hover {
  background: #c82333;
}

.nav {
  background: #667eea;
}

.nav .container {
  display: flex;
  gap: 0;
}

.nav-link {
  padding: 1rem 1.5rem;
  color: white;
  text-decoration: none;
  transition: background 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.1);
}

.main {
  padding: 2rem 0;
}
</style>
