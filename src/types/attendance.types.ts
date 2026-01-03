/**
 * Attendance record type definitions
 */

export type ScanStatus = 'success' | 'duplicate' | 'invalid' | 'inactive'

export interface AttendanceRecord {
  id: string
  employee_phone: string
  scanner_id: string
  scan_timestamp: string
  scan_date: string
  status: ScanStatus
  validation_message: string | null
  created_at: string
}

export interface ScanResult {
  success: boolean
  status: ScanStatus
  message: string
  employeeName?: string
  timestamp?: string
}

export interface DailyReport {
  date: string
  totalScans: number
  successfulScans: number
  duplicateScans: number
  invalidScans: number
  records: AttendanceRecord[]
}
