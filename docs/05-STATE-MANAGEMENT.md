# State Management (Pinia)

## Overview
Comprehensive state management architecture using Pinia stores following the Setup Stores pattern (recommended for Vue 3 Composition API).

## Store Architecture

### Store Organization

```
src/stores/
├── index.ts              # Store registration and exports
├── auth.store.ts         # Authentication state
├── employee.store.ts     # Employee management
├── scanner.store.ts      # Scanner account management
├── attendance.store.ts   # Attendance records
└── ui.store.ts          # UI state (modals, notifications)
```

---

## 1. Auth Store

**File**: `src/stores/auth.store.ts`

**Purpose**: Manage authentication state, user session, and role-based permissions

**State Shape**:
```typescript
interface AuthState {
  user: User | null
  session: Session | null
  scannerAccount: ScannerAccount | null
  isLoading: boolean
  error: string | null
}
```

**Implementation**:
```typescript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authService } from '@/services/auth.service'
import type { User, Session } from '@supabase/supabase-js'
import type { ScannerAccount } from '@/types/auth.types'

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
```

**Persistence**: Session persisted via Supabase Auth (localStorage)

---

## 2. Employee Store

**File**: `src/stores/employee.store.ts`

**Purpose**: Manage employee data, CRUD operations, and filtering

**State Shape**:
```typescript
interface EmployeeState {
  employees: Employee[]
  selectedEmployee: Employee | null
  departments: string[]
  filters: {
    search: string
    department: string | null
    activeOnly: boolean
  }
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  isLoading: boolean
  error: string | null
}
```

**Implementation**:
```typescript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { employeeService } from '@/services/employee.service'
import type { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '@/types/employee.types'

export const useEmployeeStore = defineStore('employee', () => {
  // ============================================================================
  // STATE
  // ============================================================================
  const employees = ref<Employee[]>([])
  const selectedEmployee = ref<Employee | null>(null)
  const departments = ref<string[]>([])

  const filters = ref({
    search: '',
    department: null as string | null,
    activeOnly: true
  })

  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: 0
  })

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ============================================================================
  // GETTERS
  // ============================================================================

  /**
   * Active employees only
   */
  const activeEmployees = computed(() =>
    employees.value.filter(e => e.is_active)
  )

  /**
   * Inactive employees only
   */
  const inactiveEmployees = computed(() =>
    employees.value.filter(e => !e.is_active)
  )

  /**
   * Employee count
   */
  const employeeCount = computed(() => employees.value.length)

  const activeEmployeeCount = computed(() => activeEmployees.value.length)

  /**
   * Filtered employees based on current filters
   */
  const filteredEmployees = computed(() => {
    let result = [...employees.value]

    // Filter by active status
    if (filters.value.activeOnly) {
      result = result.filter(e => e.is_active)
    }

    // Filter by department
    if (filters.value.department) {
      result = result.filter(e => e.department === filters.value.department)
    }

    // Filter by search term
    if (filters.value.search) {
      const searchLower = filters.value.search.toLowerCase()
      result = result.filter(e =>
        e.name.toLowerCase().includes(searchLower) ||
        e.phone.includes(searchLower)
      )
    }

    return result
  })

  /**
   * Paginated employees
   */
  const paginatedEmployees = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    return filteredEmployees.value.slice(start, end)
  })

  /**
   * Total pages
   */
  const totalPages = computed(() =>
    Math.ceil(filteredEmployees.value.length / pagination.value.pageSize)
  )

  /**
   * Get employee by phone
   */
  const getEmployeeByPhone = computed(() => {
    return (phone: string) => employees.value.find(e => e.phone === phone)
  })

  /**
   * Get employees by department
   */
  const getEmployeesByDepartment = computed(() => {
    return (department: string) =>
      employees.value.filter(e => e.department === department && e.is_active)
  })

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Fetch all employees
   */
  async function fetchEmployees(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const data = await employeeService.getAll()
      employees.value = data
      pagination.value.total = data.length
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch employees'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch single employee by phone
   */
  async function fetchEmployee(phone: string): Promise<Employee | null> {
    isLoading.value = true
    error.value = null

    try {
      const employee = await employeeService.getByPhone(phone)
      if (employee) {
        // Update in local array if exists
        const index = employees.value.findIndex(e => e.phone === phone)
        if (index !== -1) {
          employees.value[index] = employee
        } else {
          employees.value.push(employee)
        }
      }
      return employee
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch employee'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create new employee
   */
  async function createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
    isLoading.value = true
    error.value = null

    try {
      const employee = await employeeService.create(dto)
      employees.value.unshift(employee)
      pagination.value.total++
      return employee
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create employee'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update existing employee
   */
  async function updateEmployee(phone: string, dto: UpdateEmployeeDto): Promise<Employee> {
    isLoading.value = true
    error.value = null

    try {
      const updated = await employeeService.update(phone, dto)
      const index = employees.value.findIndex(e => e.phone === phone)

      if (index !== -1) {
        employees.value[index] = updated
      }

      if (selectedEmployee.value?.phone === phone) {
        selectedEmployee.value = updated
      }

      return updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update employee'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Soft delete employee
   */
  async function deleteEmployee(phone: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await employeeService.softDelete(phone)
      const index = employees.value.findIndex(e => e.phone === phone)

      if (index !== -1) {
        employees.value[index].is_active = false
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete employee'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reactivate employee
   */
  async function activateEmployee(phone: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const updated = await employeeService.activate(phone)
      const index = employees.value.findIndex(e => e.phone === phone)

      if (index !== -1) {
        employees.value[index] = updated
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to activate employee'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Regenerate QR code for employee
   */
  async function regenerateQRCode(phone: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const updated = await employeeService.regenerateQRCode(phone)
      const index = employees.value.findIndex(e => e.phone === phone)

      if (index !== -1) {
        employees.value[index] = updated
      }

      if (selectedEmployee.value?.phone === phone) {
        selectedEmployee.value = updated
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to regenerate QR code'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Bulk create employees
   */
  async function bulkCreateEmployees(dtos: CreateEmployeeDto[]): Promise<Employee[]> {
    isLoading.value = true
    error.value = null

    try {
      const created = await employeeService.bulkCreate(dtos)
      employees.value.unshift(...created)
      pagination.value.total += created.length
      return created
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to bulk create employees'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch departments list
   */
  async function fetchDepartments(): Promise<void> {
    try {
      const depts = await employeeService.getDepartments()
      departments.value = depts
    } catch (e) {
      console.error('Failed to fetch departments:', e)
    }
  }

  /**
   * Select employee
   */
  function selectEmployee(employee: Employee | null): void {
    selectedEmployee.value = employee
  }

  /**
   * Update filters
   */
  function setFilters(newFilters: Partial<typeof filters.value>): void {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1 // Reset to first page when filters change
  }

  /**
   * Clear filters
   */
  function clearFilters(): void {
    filters.value = {
      search: '',
      department: null,
      activeOnly: true
    }
    pagination.value.page = 1
  }

  /**
   * Set page
   */
  function setPage(page: number): void {
    pagination.value.page = page
  }

  /**
   * Set page size
   */
  function setPageSize(size: number): void {
    pagination.value.pageSize = size
    pagination.value.page = 1
  }

  /**
   * Clear error
   */
  function clearError(): void {
    error.value = null
  }

  // ============================================================================
  // RETURN
  // ============================================================================
  return {
    // State
    employees,
    selectedEmployee,
    departments,
    filters,
    pagination,
    isLoading,
    error,

    // Getters
    activeEmployees,
    inactiveEmployees,
    employeeCount,
    activeEmployeeCount,
    filteredEmployees,
    paginatedEmployees,
    totalPages,
    getEmployeeByPhone,
    getEmployeesByDepartment,

    // Actions
    fetchEmployees,
    fetchEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    activateEmployee,
    regenerateQRCode,
    bulkCreateEmployees,
    fetchDepartments,
    selectEmployee,
    setFilters,
    clearFilters,
    setPage,
    setPageSize,
    clearError
  }
})
```

**Persistence**: None (data fetched from Supabase on demand)

---

## 3. Scanner Store

**File**: `src/stores/scanner.store.ts`

**Purpose**: Manage scanner accounts (admin feature)

**State Shape**:
```typescript
interface ScannerState {
  scanners: ScannerAccount[]
  selectedScanner: ScannerAccount | null
  isLoading: boolean
  error: string | null
}
```

**Implementation**:
```typescript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { scannerService } from '@/services/scanner.service'
import type { ScannerAccount, CreateScannerDto, UpdateScannerDto } from '@/types/scanner.types'

export const useScannerStore = defineStore('scanner', () => {
  // ============================================================================
  // STATE
  // ============================================================================
  const scanners = ref<ScannerAccount[]>([])
  const selectedScanner = ref<ScannerAccount | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ============================================================================
  // GETTERS
  // ============================================================================
  const activeScanners = computed(() =>
    scanners.value.filter(s => s.is_active)
  )

  const scannerCount = computed(() => scanners.value.length)

  const activeScannerCount = computed(() => activeScanners.value.length)

  const getScannerById = computed(() => {
    return (id: string) => scanners.value.find(s => s.id === id)
  })

  // ============================================================================
  // ACTIONS
  // ============================================================================

  async function fetchScanners(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const data = await scannerService.getAll()
      scanners.value = data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch scanners'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function createScanner(dto: CreateScannerDto): Promise<ScannerAccount> {
    isLoading.value = true
    error.value = null

    try {
      const scanner = await scannerService.create(dto)
      scanners.value.unshift(scanner)
      return scanner
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create scanner'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function updateScanner(id: string, dto: UpdateScannerDto): Promise<ScannerAccount> {
    isLoading.value = true
    error.value = null

    try {
      const updated = await scannerService.update(id, dto)
      const index = scanners.value.findIndex(s => s.id === id)

      if (index !== -1) {
        scanners.value[index] = updated
      }

      return updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update scanner'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function deactivateScanner(id: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await scannerService.deactivate(id)
      const index = scanners.value.findIndex(s => s.id === id)

      if (index !== -1) {
        scanners.value[index].is_active = false
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to deactivate scanner'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function activateScanner(id: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await scannerService.activate(id)
      const index = scanners.value.findIndex(s => s.id === id)

      if (index !== -1) {
        scanners.value[index].is_active = true
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to activate scanner'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  function selectScanner(scanner: ScannerAccount | null): void {
    selectedScanner.value = scanner
  }

  function clearError(): void {
    error.value = null
  }

  // ============================================================================
  // RETURN
  // ============================================================================
  return {
    // State
    scanners,
    selectedScanner,
    isLoading,
    error,

    // Getters
    activeScanners,
    scannerCount,
    activeScannerCount,
    getScannerById,

    // Actions
    fetchScanners,
    createScanner,
    updateScanner,
    deactivateScanner,
    activateScanner,
    selectScanner,
    clearError
  }
})
```

---

## 4. Attendance Store

**File**: `src/stores/attendance.store.ts`

**Purpose**: Manage attendance records and scanning operations

**Implementation**:
```typescript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { attendanceService } from '@/services/attendance.service'
import type { AttendanceRecord, ScanResult, DailyReport } from '@/types/attendance.types'

export const useAttendanceStore = defineStore('attendance', () => {
  // ============================================================================
  // STATE
  // ============================================================================
  const records = ref<AttendanceRecord[]>([])
  const dailyReport = ref<DailyReport | null>(null)
  const lastScanResult = ref<ScanResult | null>(null)
  const isLoading = ref(false)
  const isScanning = ref(false)
  const error = ref<string | null>(null)

  // ============================================================================
  // GETTERS
  // ============================================================================
  const todayRecords = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return records.value.filter(r => r.scan_date === today)
  })

  const successfulScansToday = computed(() =>
    todayRecords.value.filter(r => r.status === 'success').length
  )

  // ============================================================================
  // ACTIONS
  // ============================================================================

  async function recordScan(
    employeePhone: string,
    scannerId: string,
    qrCode: string
  ): Promise<ScanResult> {
    isScanning.value = true
    error.value = null

    try {
      const result = await attendanceService.recordScan(employeePhone, scannerId, qrCode)
      lastScanResult.value = result

      // Optionally fetch latest records
      await fetchTodayRecords()

      return result
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to record scan'
      throw e
    } finally {
      isScanning.value = false
    }
  }

  async function fetchTodayRecords(): Promise<void> {
    isLoading.value = true

    try {
      const today = new Date().toISOString().split('T')[0]
      const { records: data } = await attendanceService.getRecords({
        startDate: today,
        endDate: today,
        limit: 1000
      })
      records.value = data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch records'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDailyReport(date?: string): Promise<void> {
    isLoading.value = true

    try {
      const report = await attendanceService.getDailyReport(date)
      dailyReport.value = report
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch daily report'
    } finally {
      isLoading.value = false
    }
  }

  function clearLastScanResult(): void {
    lastScanResult.value = null
  }

  function clearError(): void {
    error.value = null
  }

  // ============================================================================
  // RETURN
  // ============================================================================
  return {
    // State
    records,
    dailyReport,
    lastScanResult,
    isLoading,
    isScanning,
    error,

    // Getters
    todayRecords,
    successfulScansToday,

    // Actions
    recordScan,
    fetchTodayRecords,
    fetchDailyReport,
    clearLastScanResult,
    clearError
  }
})
```

---

## 5. UI Store

**File**: `src/stores/ui.store.ts`

**Purpose**: Manage UI state (modals, notifications, loading indicators)

**Implementation**:
```typescript
import { ref } from 'vue'
import { defineStore } from 'pinia'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

export const useUIStore = defineStore('ui', () => {
  // ============================================================================
  // STATE
  // ============================================================================
  const notifications = ref<Notification[]>([])
  const isGlobalLoading = ref(false)
  const activeModal = ref<string | null>(null)

  // ============================================================================
  // ACTIONS
  // ============================================================================

  function showNotification(
    type: NotificationType,
    message: string,
    duration = 3000
  ): void {
    const id = `notification-${Date.now()}-${Math.random()}`
    const notification: Notification = { id, type, message, duration }

    notifications.value.push(notification)

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
  }

  function removeNotification(id: string): void {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  function showSuccess(message: string): void {
    showNotification('success', message)
  }

  function showError(message: string): void {
    showNotification('error', message, 5000)
  }

  function showWarning(message: string): void {
    showNotification('warning', message)
  }

  function showInfo(message: string): void {
    showNotification('info', message)
  }

  function setGlobalLoading(loading: boolean): void {
    isGlobalLoading.value = loading
  }

  function openModal(modalName: string): void {
    activeModal.value = modalName
  }

  function closeModal(): void {
    activeModal.value = null
  }

  function isModalOpen(modalName: string): boolean {
    return activeModal.value === modalName
  }

  // ============================================================================
  // RETURN
  // ============================================================================
  return {
    // State
    notifications,
    isGlobalLoading,
    activeModal,

    // Actions
    showNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    setGlobalLoading,
    openModal,
    closeModal,
    isModalOpen
  }
})
```

---

## Store Registration

**File**: `src/stores/index.ts`

```typescript
export { useAuthStore } from './auth.store'
export { useEmployeeStore } from './employee.store'
export { useScannerStore } from './scanner.store'
export { useAttendanceStore } from './attendance.store'
export { useUIStore } from './ui.store'
```

---

## Store Usage Patterns

### In Components (Composition API)

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useEmployeeStore } from '@/stores'

const employeeStore = useEmployeeStore()

// Extract reactive state (use storeToRefs to maintain reactivity)
const { employees, isLoading, error } = storeToRefs(employeeStore)

// Actions can be destructured directly (they're not reactive)
const { fetchEmployees, createEmployee } = employeeStore

// Or use computed for getters
const { activeEmployees } = storeToRefs(employeeStore)
</script>
```

### Cross-Store Communication

```typescript
// In one store, access another store
import { useUIStore } from './ui.store'

export const useEmployeeStore = defineStore('employee', () => {
  const uiStore = useUIStore()

  async function createEmployee(dto: CreateEmployeeDto) {
    try {
      const employee = await employeeService.create(dto)
      employees.value.push(employee)
      uiStore.showSuccess('Employee created successfully')
      return employee
    } catch (e) {
      uiStore.showError('Failed to create employee')
      throw e
    }
  }

  return { createEmployee }
})
```

---

## State Persistence Strategy

| Store | Persistence | Mechanism |
|-------|-------------|-----------|
| auth | Yes | Supabase Auth (localStorage) |
| employee | No | Fetch on demand |
| scanner | No | Fetch on demand |
| attendance | No | Fetch on demand |
| ui | Partial | Notifications (in-memory only) |

---

## Store Testing Considerations

1. **Mock Services**: Mock service layer for unit testing stores
2. **Test Actions**: Verify state changes after actions
3. **Test Getters**: Ensure computed values calculate correctly
4. **Test Error Handling**: Verify error states set appropriately
5. **Test Side Effects**: Verify API calls made with correct parameters

---

## Performance Optimization

1. **Lazy Loading**: Stores loaded only when needed
2. **Selective Reactivity**: Use `shallowRef` for large arrays if performance issues arise
3. **Debounced Actions**: Debounce search/filter actions
4. **Optimistic Updates**: Update UI immediately, sync with server asynchronously
5. **Cached Getters**: Computed properties automatically cached by Vue
