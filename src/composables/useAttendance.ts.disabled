/**
 * useAttendance Composable
 * 
 * Wraps the attendance store with convenient methods and reactive state.
 */

import { storeToRefs } from 'pinia'
import { useAttendanceStore } from '@/stores/attendance.store'
import { tryCatch } from '@/utils/error-handler'
import type { AttendanceFilters } from '@/types/attendance.types'

export function useAttendance() {
  const attendanceStore = useAttendanceStore()

  const {
    records,
    todayRecords,
    isLoading,
    error,
    filters,
    stats
  } = storeToRefs(attendanceStore)

  /**
   * Record a scan
   */
  async function recordScan(qrCodeHash: string) {
    const [result, errorResult] = await tryCatch(
      () => attendanceStore.recordScan(qrCodeHash),
      { action: 'recordScan', component: 'useAttendance' }
    )

    return errorResult
      ? { success: false, error: errorResult.userMessage }
      : { success: true, data: result }
  }

  /**
   * Check if employee has scanned today
   */
  async function checkDailyAttendance(employeeId: string) {
    const [hasScanned, errorResult] = await tryCatch(
      () => attendanceStore.checkDailyAttendance(employeeId),
      { action: 'checkDailyAttendance', component: 'useAttendance' }
    )

    return errorResult
      ? { success: false, error: errorResult.userMessage }
      : { success: true, data: hasScanned }
  }

  /**
   * Fetch today's attendance records
   */
  async function fetchTodayRecords() {
    const [, errorResult] = await tryCatch(
      () => attendanceStore.fetchTodayRecords(),
      { action: 'fetchTodayRecords', component: 'useAttendance' }
    )

    return errorResult
      ? { success: false, error: errorResult.userMessage }
      : { success: true }
  }

  /**
   * Fetch attendance records with filters
   */
  async function fetchRecords(filters?: AttendanceFilters) {
    const [, errorResult] = await tryCatch(
      () => attendanceStore.fetchRecords(filters),
      { action: 'fetchRecords', component: 'useAttendance' }
    )

    return errorResult
      ? { success: false, error: errorResult.userMessage }
      : { success: true }
  }

  /**
   * Get daily report
   */
  async function getDailyReport(date?: Date) {
    const [report, errorResult] = await tryCatch(
      () => attendanceStore.getDailyReport(date),
      { action: 'getDailyReport', component: 'useAttendance' }
    )

    return errorResult
      ? { success: false, error: errorResult.userMessage }
      : { success: true, data: report }
  }

  /**
   * Get date range report
   */
  async function getDateRangeReport(startDate: Date, endDate: Date) {
    const [report, errorResult] = await tryCatch(
      () => attendanceStore.getDateRangeReport(startDate, endDate),
      { action: 'getDateRangeReport', component: 'useAttendance' }
    )

    return errorResult
      ? { success: false, error: errorResult.userMessage }
      : { success: true, data: report }
  }

  /**
   * Set date filter
   */
  function setDateFilter(startDate?: Date, endDate?: Date) {
    attendanceStore.setFilter({
      startDate,
      endDate
    })
  }

  /**
   * Set employee filter
   */
  function setEmployeeFilter(employeeId?: string) {
    attendanceStore.setFilter({ employeeId })
  }

  /**
   * Set scanner filter
   */
  function setScannerFilter(scannerId?: string) {
    attendanceStore.setFilter({ scannerId })
  }

  /**
   * Clear all filters
   */
  function clearFilters() {
    attendanceStore.clearFilters()
  }

  return {
    // State
    records,
    todayRecords,
    isLoading,
    error,
    filters,
    stats,

    // Methods
    recordScan,
    checkDailyAttendance,
    fetchTodayRecords,
    fetchRecords,
    getDailyReport,
    getDateRangeReport,
    setDateFilter,
    setEmployeeFilter,
    setScannerFilter,
    clearFilters
  }
}
