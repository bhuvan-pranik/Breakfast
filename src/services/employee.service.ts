/**
 * Employee Service
 * Handles employee CRUD operations
 */

import { supabase } from './supabase'
import { qrcodeService } from './qrcode.service'
import type { Employee, CreateEmployeeInput, UpdateEmployeeInput } from '@/types'

class EmployeeService {
  /**
   * Get all employees
   */
  async getAll(filters?: {
    search?: string
    department?: string
    isActive?: boolean
  }): Promise<Employee[]> {
    let query = supabase.from('employees').select('*')

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
    }

    if (filters?.department) {
      query = query.eq('department', filters.department)
    }

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  /**
   * Get employee by phone
   */
  async getByPhone(phone: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('phone', phone)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data
  }

  /**
   * Get employee by QR code
   */
  async getByQRCode(qrCode: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('qr_code', qrCode)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data
  }

  /**
   * Create new employee
   */
  async create(input: CreateEmployeeInput): Promise<Employee> {
    // Generate QR code
    const qrCode = qrcodeService.generateQRCode(input.phone, input.name ?? '')

    const { data, error } = await supabase
      .from('employees')
      .insert({
        ...input,
        qr_code: qrCode,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Update employee
   */
  async update(phone: string, input: UpdateEmployeeInput): Promise<Employee> {
    // If name is being updated, regenerate QR code
    let updateData: any = { ...input }

    if (input.name) {
      const employee = await this.getByPhone(phone)
      if (employee) {
        updateData.qr_code = qrcodeService.generateQRCode(phone, input.name)
      }
    }

    const { data, error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('phone', phone)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Soft delete employee
   */
  async softDelete(phone: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .update({ is_active: false })
      .eq('phone', phone)

    if (error) throw error
  }

  /**
   * Activate employee
   */
  async activate(phone: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .update({ is_active: true })
      .eq('phone', phone)

    if (error) throw error
  }

  /**
   * Regenerate QR code for employee
   */
  async regenerateQRCode(phone: string): Promise<Employee> {
    const employee = await this.getByPhone(phone)
    if (!employee) throw new Error('Employee not found')

    const qrCode = qrcodeService.generateQRCode(phone, employee.name ?? '')

    const { data, error } = await supabase
      .from('employees')
      .update({ qr_code: qrCode })
      .eq('phone', phone)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get unique departments
   */
  async getDepartments(): Promise<string[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('department')
      .eq('is_active', true)

    if (error) throw error

    const departments = [...new Set(data?.map(e => e.department) || [])]
    return departments.sort()
  }

  /**
   * Bulk create employees (Phase II)
   */
  async bulkCreate(employees: CreateEmployeeInput[]): Promise<Employee[]> {
    const employeesWithQR = employees.map(emp => ({
      ...emp,
      qr_code: qrcodeService.generateQRCode(emp.phone, emp.name ?? ''),
      is_active: true
    }))

    const { data, error } = await supabase
      .from('employees')
      .insert(employeesWithQR)
      .select()

    if (error) throw error
    return data || []
  }
}

export const employeeService = new EmployeeService()
