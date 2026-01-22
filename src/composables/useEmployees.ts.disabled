/**
 * useEmployees Composable
 * 
 * Wraps the employee store with convenient methods and reactive state.
 */

import { storeToRefs } from 'pinia'
import { useEmployeeStore } from '@/stores/employee.store'
import { tryCatch } from '@/utils/error-handler'
import type { CreateEmployeeData, UpdateEmployeeData, Employee } from '@/types/employee.types'

export function useEmployees() {
  const employeeStore = useEmployeeStore()

  const {
    employees,
    filteredEmployees,
    currentEmployee,
    isLoading,
    error,
    filters,
    pagination
  } = storeToRefs(employeeStore)

  /**
   * Fetch all employees
   */
  async function fetchEmployees(force = false) {
    const [, errorResult] = await tryCatch(
      () => employeeStore.fetchEmployees(force),
      { action: 'fetchEmployees', component: 'useEmployees' }
    )

    return errorResult ? { success: false, error: errorResult.userMessage } : { success: true }
  }

  /**
   * Fetch single employee by ID
   */
  async function fetchEmployee(id: string) {
    const [employee, errorResult] = await tryCatch(
      () => employeeStore.fetchEmployee(id),
      { action: 'fetchEmployee', component: 'useEmployees' }
    )

    return errorResult 
      ? { success: false, error: errorResult.userMessage }
      : { success: true, data: employee }
  }

  /**
   * Create new employee
   */
  async function createEmployee(data: CreateEmployeeData) {
    const [employee, errorResult] = await tryCatch(
      () => employeeStore.createEmployee(data),
      { action: 'createEmployee', component: 'useEmployees' }
    )

    return errorResult
      ? { success: false, error: errorResult.userMessage }
      : { success: true, data: employee }
  }

  /**
   * Update employee
   */
  async function updateEmployee(id: string, data: UpdateEmployeeData) {
    const [employee, errorResult] = await tryCatch(
      () => employeeStore.updateEmployee(id, data),
      { action: 'updateEmployee', component: 'useEmployees' }
    )

    return errorResult
      ? { success: false, error: errorResult.userMessage }
      : { success: true, data: employee }
  }

  /**
   * Delete employee
   */
  async function deleteEmployee(id: string) {
    const [, errorResult] = await tryCatch(
      () => employeeStore.deleteEmployee(id),
      { action: 'deleteEmployee', component: 'useEmployees' }
    )

    return errorResult
      ? { success: false, error: errorResult.userMessage }
      : { success: true }
  }

  /**
   * Bulk create employees
   */
  async function bulkCreateEmployees(employees: CreateEmployeeData[]) {
    const [results, errorResult] = await tryCatch(
      () => employeeStore.bulkCreate(employees),
      { action: 'bulkCreateEmployees', component: 'useEmployees' }
    )

    return errorResult
      ? { success: false, error: errorResult.userMessage }
      : { success: true, data: results }
  }

  /**
   * Regenerate QR code for employee
   */
  async function regenerateQRCode(id: string) {
    const [employee, errorResult] = await tryCatch(
      () => employeeStore.regenerateQRCode(id),
      { action: 'regenerateQRCode', component: 'useEmployees' }
    )

    return errorResult
      ? { success: false, error: errorResult.userMessage }
      : { success: true, data: employee }
  }

  /**
   * Set search filter
   */
  function setSearch(search: string) {
    employeeStore.setFilter('search', search)
  }

  /**
   * Set department filter
   */
  function setDepartment(department: string) {
    employeeStore.setFilter('department', department)
  }

  /**
   * Set status filter
   */
  function setStatus(status: 'active' | 'inactive' | 'all') {
    employeeStore.setFilter('status', status)
  }

  /**
   * Clear all filters
   */
  function clearFilters() {
    employeeStore.clearFilters()
  }

  /**
   * Get departments list
   */
  async function getDepartments() {
    const [departments, errorResult] = await tryCatch(
      () => employeeStore.getDepartments(),
      { action: 'getDepartments', component: 'useEmployees' }
    )

    return errorResult
      ? { success: false, error: errorResult.userMessage }
      : { success: true, data: departments }
  }

  return {
    // State
    employees,
    filteredEmployees,
    currentEmployee,
    isLoading,
    error,
    filters,
    pagination,

    // Methods
    fetchEmployees,
    fetchEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    bulkCreateEmployees,
    regenerateQRCode,
    setSearch,
    setDepartment,
    setStatus,
    clearFilters,
    getDepartments
  }
}
