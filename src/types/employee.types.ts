/**
 * Employee-related type definitions
 */

export interface Employee {
  phone: string
  name: string | null
  department: string | null
  employee_id: string | null
  email: string | null
  qr_code: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateEmployeeInput {
  phone: string
  name?: string | null
  department?: string | null
  employee_id?: string | null
  email?: string | null
}

export interface EmployeeFormData {
  phone: string
  name?: string | null
  department?: string | null
  employee_id?: string | null
  email?: string | null
  is_active: boolean
}

export interface UpdateEmployeeInput {
  name?: string
  department?: string
  employee_id?: string
  email?: string
}

export interface EmployeeFilters {
  search?: string
  department?: string
  isActive?: boolean
}

export interface EmployeePagination {
  page: number
  pageSize: number
  total: number
}
