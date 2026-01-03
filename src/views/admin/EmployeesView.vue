<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEmployeeStore } from '@/stores/employee.store'
import { useUIStore } from '@/stores/ui.store'
import { DEPARTMENTS } from '@/utils/constants'
import type { Employee } from '@/types'
import BulkUploadModal from '@/components/BulkUploadModal.vue'

const router = useRouter()
const employeeStore = useEmployeeStore()
const uiStore = useUIStore()

const searchQuery = ref('')
const selectedDepartment = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
const showBulkUpload = ref(false)

onMounted(async () => {
  await employeeStore.fetchEmployees()
})

const filteredEmployees = computed(() => {
  let result = [...employeeStore.employees]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(emp => 
      emp.name.toLowerCase().includes(query) ||
      emp.phone.includes(query) ||
      emp.employee_id.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query)
    )
  }

  // Department filter
  if (selectedDepartment.value) {
    result = result.filter(emp => emp.department === selectedDepartment.value)
  }

  // Status filter
  if (statusFilter.value !== 'all') {
    const isActive = statusFilter.value === 'active'
    result = result.filter(emp => emp.is_active === isActive)
  }

  return result
})

const createEmployee = () => {
  router.push('/admin/employees/create')
}

const viewEmployee = (phone: string) => {
  router.push(`/admin/employees/${phone}`)
}

const editEmployee = (phone: string) => {
  router.push(`/admin/employees/${phone}/edit`)
}

const deleteEmployee = async (employee: Employee) => {
  if (!confirm(`Are you sure you want to delete ${employee.name}?`)) {
    return
  }

  try {
    await employeeStore.deleteEmployee(employee.phone)
    uiStore.showSuccess('Employee deleted successfully')
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to delete employee')
  }
}

const toggleStatus = async (employee: Employee) => {
  try {
    await employeeStore.updateEmployee(employee.phone, {
      is_active: !employee.is_active
    })
    uiStore.showSuccess(`Employee ${employee.is_active ? 'deactivated' : 'activated'}`)
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to update employee status')
  }
}

const downloadQR = async (employee: Employee) => {
  try {
    const { qrcodeService } = await import('@/services/qrcode.service')
    const dataUrl = await qrcodeService.generateQRCodeImage(employee.qr_code)
    
    const link = document.createElement('a')
    link.download = `${employee.name}-QR.png`
    link.href = dataUrl
    link.click()
    
    uiStore.showSuccess('QR code downloaded')
  } catch (error) {
    uiStore.showError('Failed to download QR code')
  }
}

const handleBulkUpload = async (count: number) => {
  showBulkUpload.value = false
  await employeeStore.fetchEmployees()
}
</script>

<template>
  <div class="employees-view">
    <div class="header">
      <h1>Employees</h1>
      <div class="header-actions">
        <button @click="showBulkUpload = true" class="btn-bulk">
          📤 Bulk Upload
        </button>
        <button @click="createEmployee" class="btn-create">
          + Add Employee
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-card">
      <div class="filters">
        <div class="filter-group">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, phone, or department..."
            class="search-input"
          />
        </div>

        <div class="filter-group">
          <select v-model="selectedDepartment" class="filter-select">
            <option value="">All Departments</option>
            <option v-for="dept in DEPARTMENTS" :key="dept" :value="dept">
              {{ dept }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <select v-model="statusFilter" class="filter-select">
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      <div class="results-count">
        {{ filteredEmployees.length }} employee{{ filteredEmployees.length !== 1 ? 's' : '' }}
      </div>
    </div>

    <!-- Employees Table -->
    <div class="table-container">
      <table v-if="filteredEmployees.length > 0" class="employees-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Employee ID</th>
            <th>Email</th>
            <th>Department</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in filteredEmployees" :key="employee.phone">
            <td class="name-cell">{{ employee.name }}</td>
            <td class="phone-cell">{{ employee.phone }}</td>
            <td>{{ employee.employee_id }}</td>
            <td>{{ employee.email }}</td>
            <td>
              <span class="department-badge">{{ employee.department }}</span>
            </td>
            <td>
              <span 
                class="status-badge" 
                :class="{ 'active': employee.is_active, 'inactive': !employee.is_active }"
              >
                {{ employee.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="actions-cell">
              <button 
                @click="viewEmployee(employee.phone)" 
                class="btn-action btn-view"
                title="View Details"
              >
                👁️
              </button>
              <button 
                @click="editEmployee(employee.phone)" 
                class="btn-action btn-edit"
                title="Edit"
              >
                ✏️
              </button>
              <button 
                @click="downloadQR(employee)" 
                class="btn-action btn-qr"
                title="Download QR"
              >
                📱
              </button>
              <button 
                @click="toggleStatus(employee)" 
                class="btn-action btn-toggle"
                :title="employee.is_active ? 'Deactivate' : 'Activate'"
              >
                {{ employee.is_active ? '🔴' : '🟢' }}
              </button>
              <button 
                @click="deleteEmployee(employee)" 
                class="btn-action btn-delete"
                title="Delete"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else-if="employeeStore.isLoading" class="empty-state">
        <div class="spinner"></div>
        <p>Loading employees...</p>
      </div>

      <div v-else class="empty-state">
        <p>No employees found</p>
        <button @click="createEmployee" class="btn-create-alt">
          Create First Employee
        </button>
      </div>
    </div>

    <!-- Bulk Upload Modal -->
    <BulkUploadModal
      v-if="showBulkUpload"
      @close="showBulkUpload = false"
      @uploaded="handleBulkUpload"
    />
  </div>
</template>

<style scoped>
.employees-view {
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 1.75rem;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-bulk {
  padding: 0.75rem 1.5rem;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-bulk:hover {
  background: #f57c00;
}

.btn-create {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-create:hover {
  background: #5568d3;
}

.filters-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.filters {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.search-input,
.filter-select {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

.results-count {
  color: #666;
  font-size: 0.9rem;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.employees-table {
  width: 100%;
  border-collapse: collapse;
}

.employees-table thead {
  background: #f5f5f5;
}

.employees-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
}

.employees-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.employees-table tbody tr:hover {
  background: #f9f9f9;
}

.employees-table td {
  padding: 1rem;
  color: #666;
}

.name-cell {
  font-weight: 500;
  color: #333;
}

.phone-cell {
  font-family: monospace;
  font-size: 0.95rem;
}

.department-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.inactive {
  background: #ffebee;
  color: #c62828;
}

.actions-cell {
  white-space: nowrap;
}

.btn-action {
  padding: 0.4rem 0.6rem;
  margin-right: 0.25rem;
  border: none;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-view:hover {
  background: #e3f2fd;
}

.btn-edit:hover {
  background: #fff3e0;
}

.btn-qr:hover {
  background: #f3e5f5;
}

.btn-toggle:hover {
  background: #e0f2f1;
}

.btn-delete:hover {
  background: #ffebee;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-create-alt {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-create-alt:hover {
  background: #5568d3;
}

@media (max-width: 1024px) {
  .filters {
    grid-template-columns: 1fr;
  }

  .employees-table {
    font-size: 0.9rem;
  }

  .employees-table th,
  .employees-table td {
    padding: 0.75rem;
  }
}

@media (max-width: 768px) {
  .employees-view {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .btn-create {
    width: 100%;
  }

  /* Make table scrollable on mobile */
  .table-container {
    overflow-x: auto;
  }

  .employees-table {
    min-width: 800px;
  }
}
</style>
