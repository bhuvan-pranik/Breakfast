<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useScannerStore } from '@/stores/scanner.store'
import { useUIStore } from '@/stores/ui.store'
import type { ScannerAccount } from '@/types'

const router = useRouter()
const scannerStore = useScannerStore()
const uiStore = useUIStore()

const searchQuery = ref('')
const roleFilter = ref<'all' | 'admin' | 'scanner'>('all')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

onMounted(async () => {
  await scannerStore.fetchScanners()
})

const filteredScanners = computed(() => {
  let result = [...scannerStore.scanners]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(scanner => 
      scanner.username.toLowerCase().includes(query)
    )
  }

  // Role filter
  if (roleFilter.value !== 'all') {
    result = result.filter(scanner => scanner.role === roleFilter.value)
  }

  // Status filter
  if (statusFilter.value !== 'all') {
    const isActive = statusFilter.value === 'active'
    result = result.filter(scanner => scanner.is_active === isActive)
  }

  return result
})

const createScanner = () => {
  router.push('/admin/scanners/create')
}

const toggleStatus = async (scanner: ScannerAccount) => {
  try {
    if (scanner.is_active) {
      await scannerStore.deactivateScanner(scanner.id)
      uiStore.showSuccess(`Scanner ${scanner.username} deactivated`)
    } else {
      await scannerStore.activateScanner(scanner.id)
      uiStore.showSuccess(`Scanner ${scanner.username} activated`)
    }
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to update scanner status')
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleString()
}
</script>

<template>
  <div class="scanners-view">
    <div class="header">
      <h1>Scanner Accounts</h1>
      <button @click="createScanner" class="btn-create">
        + Add Scanner
      </button>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by username..."
          class="search-input"
        />
      </div>

      <div class="filter-group">
        <label>Role:</label>
        <select v-model="roleFilter" class="filter-select">
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="scanner">Scanner</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Status:</label>
        <select v-model="statusFilter" class="filter-select">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div class="results-count">
        {{ filteredScanners.length }} scanner{{ filteredScanners.length !== 1 ? 's' : '' }}
      </div>
    </div>

    <!-- Scanners Table -->
    <div class="table-container">
      <table v-if="filteredScanners.length > 0" class="scanners-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="scanner in filteredScanners" :key="scanner.id">
            <td class="username-cell">{{ scanner.username }}</td>
            <td>
              <span class="role-badge" :class="scanner.role">
                {{ scanner.role }}
              </span>
            </td>
            <td>
              <span 
                class="status-badge" 
                :class="{ 'active': scanner.is_active, 'inactive': !scanner.is_active }"
              >
                {{ scanner.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="date-cell">{{ formatDate(scanner.created_at) }}</td>
            <td class="date-cell">{{ formatDate(scanner.last_login_at) }}</td>
            <td class="actions-cell">
              <button 
                @click="toggleStatus(scanner)" 
                class="btn-action btn-toggle"
                :title="scanner.is_active ? 'Deactivate' : 'Activate'"
              >
                {{ scanner.is_active ? '🔴' : '🟢' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else-if="scannerStore.isLoading" class="empty-state">
        <div class="spinner"></div>
        <p>Loading scanners...</p>
      </div>

      <div v-else class="empty-state">
        <p>No scanners found</p>
        <button @click="createScanner" class="btn-create-alt">
          Create First Scanner
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scanners-view {
  padding: 2rem 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0;
  font-size: 2rem;
  color: #333;
}

.btn-create {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-create:hover {
  background: #5568d3;
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #666;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.results-count {
  margin-left: auto;
  color: #666;
  font-weight: 500;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.scanners-table {
  width: 100%;
  border-collapse: collapse;
}

.scanners-table thead {
  background: #f8f9fa;
}

.scanners-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #666;
  border-bottom: 2px solid #e0e0e0;
}

.scanners-table td {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.scanners-table tbody tr:hover {
  background: #f8f9fa;
}

.username-cell {
  font-weight: 600;
  color: #333;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-badge.admin {
  background: #e3f2fd;
  color: #1976d2;
}

.role-badge.scanner {
  background: #f3e5f5;
  color: #7b1fa2;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.inactive {
  background: #ffebee;
  color: #c62828;
}

.date-cell {
  color: #666;
  font-size: 0.9rem;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.5rem;
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.3s;
}

.btn-action:hover {
  background: #f0f0f0;
}

.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  color: #999;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-create-alt {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-create-alt:hover {
  background: #5568d3;
}
</style>
