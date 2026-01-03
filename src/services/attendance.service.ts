/**
 * Attendance Service
 * Handles attendance tracking and scanning operations
 */

import { supabase } from './supabase'
import { employeeService } from './employee.service'
import { qrcodeService } from './qrcode.service'
import type { AttendanceRecord, ScanResult, DailyReport } from '@/types'

class AttendanceService {
  /**
   * Record a scan
   */
  async recordScan(qrCode: string, scannerId: string): Promise<ScanResult> {
    // 1. Find employee by QR code
    const employee = await employeeService.getByQRCode(qrCode)

    if (!employee) {
      return {
        success: false,
        status: 'invalid',
        message: 'Invalid QR code. Employee not found.'
      }
    }

    // 2. Validate QR code
    const isValid = qrcodeService.validateQRCode(qrCode, employee.phone, employee.name)
    
    if (!isValid) {
      return {
        success: false,
        status: 'invalid',
        message: 'QR code validation failed.'
      }
    }

    // 3. Check if employee is active
    if (!employee.is_active) {
      return {
        success: false,
        status: 'inactive',
        message: 'Employee account is inactive.'
      }
    }

    // 4. Check if already scanned today
    const today = new Date().toISOString().split('T')[0]
    const { data: existingScans, error: checkError } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_phone', employee.phone)
      .eq('scan_date', today)
      .eq('status', 'success')
      .limit(1)

    if (existingScans && existingScans.length > 0) {
      // Record duplicate scan attempt
      await supabase.from('attendance_records').insert({
        employee_phone: employee.phone,
        scanner_id: scannerId,
        scan_date: today,
        status: 'duplicate',
        validation_message: 'Employee already scanned today'
      })

      return {
        success: false,
        status: 'duplicate',
        message: `${employee.name} already scanned today.`,
        employeeName: employee.name
      }
    }

    // 5. Record successful scan
    const { data: record, error } = await supabase
      .from('attendance_records')
      .insert({
        employee_phone: employee.phone,
        scanner_id: scannerId,
        scan_date: today,
        status: 'success',
        validation_message: 'Scan successful'
      })
      .select()
      .single()

    if (error) {
      throw new Error('Failed to record scan: ' + error.message)
    }

    return {
      success: true,
      status: 'success',
      message: `Welcome, ${employee.name}!`,
      employeeName: employee.name,
      timestamp: record.scan_timestamp
    }
  }

  /**
   * Check if employee has scanned today
   */
  async checkDailyAttendance(employeePhone: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0]

    const { data } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_phone', employeePhone)
      .eq('scan_date', today)
      .eq('status', 'success')
      .single()

    return !!data
  }

  /**
   * Get daily report
   */
  async getDailyReport(date?: string): Promise<DailyReport> {
    const targetDate = date || new Date().toISOString().split('T')[0]

    const { data: records, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('scan_date', targetDate)
      .order('scan_timestamp', { ascending: false })

    if (error) throw error

    const allRecords = records || []
    const successfulScans = allRecords.filter(r => r.status === 'success').length
    const duplicateScans = allRecords.filter(r => r.status === 'duplicate').length
    const invalidScans = allRecords.filter(r => r.status === 'invalid').length

    return {
      date: targetDate,
      totalScans: allRecords.length,
      successfulScans,
      duplicateScans,
      invalidScans,
      records: allRecords
    }
  }

  /**
   * Get attendance records with pagination
   */
  async getRecords(options?: {
    page?: number
    pageSize?: number
    dateFrom?: string
    dateTo?: string
    employeePhone?: string
    scannerId?: string
  }): Promise<{ records: AttendanceRecord[]; total: number }> {
    const page = options?.page || 1
    const pageSize = options?.pageSize || 50
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase.from('attendance_records').select('*', { count: 'exact' })

    if (options?.dateFrom) {
      query = query.gte('scan_date', options.dateFrom)
    }

    if (options?.dateTo) {
      query = query.lte('scan_date', options.dateTo)
    }

    if (options?.employeePhone) {
      query = query.eq('employee_phone', options.employeePhone)
    }

    if (options?.scannerId) {
      query = query.eq('scanner_id', options.scannerId)
    }

    query = query
      .order('scan_timestamp', { ascending: false })
      .range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    return {
      records: data || [],
      total: count || 0
    }
  }
}

export const attendanceService = new AttendanceService()
