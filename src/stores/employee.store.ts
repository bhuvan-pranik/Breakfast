/**
 * Employee Store
 * Manages employee data and operations
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { employeeService } from '@/services/employee.service'
import type { Employee, CreateEmployeeInput, UpdateEmployeeInput, EmployeeFilters } from '@/types'

export const useEmployeeStore = defineStore('employee', () => {
  // ============================================================================
  // STATE
  // ============================================================================
  const employees = ref<Employee[]>([])
  const selectedEmployee = ref<Employee | null>(null)
  const departments = ref<string[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const filters = ref<EmployeeFilters>({
    search: '',
    department: undefined,
    isActive: true
  })

  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: 0
  })

  // ============================================================================
  // GETTERS
  // ============================================================================
  const activeEmployees = computed(() => 
    employees.value.filter((e: Employee) => e.is_active)
  )

  const inactiveEmployees = computed(() => 
    employees.value.filter((e: Employee) => !e.is_active)
  )

  const filteredEmployees = computed(() => {
    let filtered = employees.value

    // Filter by active status
    if (filters.value.isActive !== undefined) {
      filtered = filtered.filter((e: Employee) => e.is_active === filters.value.isActive)
    }

    // Filter by department
    if (filters.value.department) {
      filtered = filtered.filter((e: Employee) => e.department === filters.value.department)
    }

    // Filter by search
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter((e: Employee) => 
        (e.name?.toLowerCase() || '').includes(search) ||
        e.phone.includes(search)
      )
    }

    return filtered
  })

  const paginatedEmployees = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    return filteredEmployees.value.slice(start, end)
  })

  const totalPages = computed(() => 
    Math.ceil(filteredEmployees.value.length / pagination.value.pageSize)
  )

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
      employees.value = await employeeService.getAll()
      pagination.value.total = employees.value.length
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch employees'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch employee by phone
   */
  async function fetchEmployee(phone: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      selectedEmployee.value = await employeeService.getByPhone(phone)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch employee'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create new employee
   */
  async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
    isLoading.value = true
    error.value = null

    try {
      const employee = await employeeService.create(input)
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
   * Update employee
   */
  async function updateEmployee(phone: string, input: UpdateEmployeeInput): Promise<Employee> {
    isLoading.value = true
    error.value = null

    try {
      const updated = await employeeService.update(phone, input)
      const index = employees.value.findIndex((e: Employee) => e.phone === phone)
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
   * Delete employee (soft delete)
   */
  async function deleteEmployee(phone: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await employeeService.softDelete(phone)
      const index = employees.value.findIndex((e: Employee) => e.phone === phone)
      if (index !== -1 && employees.value[index]) {
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
   * Activate employee
   */
  async function activateEmployee(phone: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await employeeService.activate(phone)
      const index = employees.value.findIndex((e: Employee) => e.phone === phone)
      if (index !== -1 && employees.value[index]) {
        employees.value[index].is_active = true
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to activate employee'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Regenerate QR code
   */
  async function regenerateQRCode(phone: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const updated = await employeeService.regenerateQRCode(phone)
      const index = employees.value.findIndex((e: Employee) => e.phone === phone)
      if (index !== -1) {
        employees.value[index] = updated
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to regenerate QR code'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch departments
   */
  async function fetchDepartments(): Promise<void> {
    try {
      departments.value = await employeeService.getDepartments()
    } catch (e) {
      console.error('Failed to fetch departments:', e)
    }
  }

  /**
   * Set filters
   */
  function setFilters(newFilters: Partial<EmployeeFilters>): void {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1 // Reset to first page
  }

  /**
   * Set page
   */
  function setPage(page: number): void {
    pagination.value.page = page
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
    isLoading,
    error,
    filters,
    pagination,

    // Getters
    activeEmployees,
    inactiveEmployees,
    filteredEmployees,
    paginatedEmployees,
    totalPages,

    // Actions
    fetchEmployees,
    fetchEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    activateEmployee,
    regenerateQRCode,
    fetchDepartments,
    setFilters,
    setPage,
    clearError
  }
})
