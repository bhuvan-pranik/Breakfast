/**
 * Attendance Store
 * Manages attendance records and scanning operations
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { attendanceService } from '@/services/attendance.service'
import type { AttendanceRecord, ScanResult, DailyReport } from '@/types'

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
    return records.value.filter((r: AttendanceRecord) => r.scan_date === today)
  })

  const successfulScansToday = computed(() => 
    todayRecords.value.filter((r: AttendanceRecord) => r.status === 'success').length
  )

  const duplicateScansToday = computed(() => 
    todayRecords.value.filter((r: AttendanceRecord) => r.status === 'duplicate').length
  )

  const totalScansToday = computed(() => todayRecords.value.length)

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Record a scan
   */
  async function recordScan(qrCode: string, scannerId: string): Promise<ScanResult> {
    isScanning.value = true
    error.value = null

    try {
      const result = await attendanceService.recordScan(qrCode, scannerId)
      lastScanResult.value = result

      // Refresh today's records if successful
      if (result.success) {
        await fetchTodayRecords()
      }

      return result
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to record scan'
      throw e
    } finally {
      isScanning.value = false
    }
  }

  /**
   * Fetch today's records
   */
  async function fetchTodayRecords(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const today = new Date().toISOString().split('T')[0]
      dailyReport.value = await attendanceService.getDailyReport(today)
      records.value = dailyReport.value.records
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch records'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch daily report
   */
  async function fetchDailyReport(date?: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      dailyReport.value = await attendanceService.getDailyReport(date)
      records.value = dailyReport.value.records
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch daily report'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch records with filters
   */
  async function fetchRecords(options?: {
    page?: number
    pageSize?: number
    dateFrom?: string
    dateTo?: string
    employeePhone?: string
    scannerId?: string
  }): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const { records: fetchedRecords } = await attendanceService.getRecords(options)
      records.value = fetchedRecords
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch records'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear last scan result
   */
  function clearLastScanResult(): void {
    lastScanResult.value = null
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
    records,
    dailyReport,
    lastScanResult,
    isLoading,
    isScanning,
    error,

    // Getters
    todayRecords,
    successfulScansToday,
    duplicateScansToday,
    totalScansToday,

    // Actions
    recordScan,
    fetchTodayRecords,
    fetchDailyReport,
    fetchRecords,
    clearLastScanResult,
    clearError
  }
})
