/**
 * Employee-related type definitions
 */

export interface Employee {
  phone: string
  name: string
  department: string
  gender: 'Male' | 'Female' | 'Other'
  qr_code: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateEmployeeInput {
  phone: string
  name: string
  department: string
  gender: 'Male' | 'Female' | 'Other'
}

export interface UpdateEmployeeInput {
  name?: string
  department?: string
  gender?: 'Male' | 'Female' | 'Other'
}

export interface EmployeeFilters {
  search?: string
  department?: string
  gender?: string
  isActive?: boolean
}

export interface EmployeePagination {
  page: number
  pageSize: number
  total: number
}
