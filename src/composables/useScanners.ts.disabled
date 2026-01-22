/**
 * useScanners Composable
 * 
 * Wraps the scanner store with convenient methods and reactive state.
 */

import { storeToRefs } from 'pinia'
import { useScannerStore } from '@/stores/scanner.store'
import { tryCatch } from '@/utils/error-handler'
import type { CreateScannerData, UpdateScannerData } from '@/types/scanner.types'

export function useScanners() {
  const scannerStore = useScannerStore()

  const {
    scanners,
    currentScanner,
    isLoading,
    error
  } = storeToRefs(scannerStore)

  /**
   * Fetch all scanners
   */
  async function fetchScanners(force = false) {
    const [, errorResult] = await tryCatch(
      () => scannerStore.fetchScanners(force),
      { action: 'fetchScanners', component: 'useScanners' }
    )

    return errorResult ? { success: false, error: errorResult.userMessage } : { success: true }
  }

  /**
   * Fetch single scanner by ID
   */
  async function fetchScanner(id: string) {
    const [scanner, errorResult] = await tryCatch(
      () => scannerStore.fetchScanner(id),
      { action: 'fetchScanner', component: 'useScanners' }
    )

    return errorResult
      ? { success: false, error: errorResult.userMessage }
      : { success: true, data: scanner }
  }

  /**
   * Create new scanner account
   */
  async function createScanner(data: CreateScannerData) {
    const [scanner, errorResult] = await tryCatch(
      () => scannerStore.createScanner(data),
      { action: 'createScanner', component: 'useScanners' }
    )

    return errorResult
      ? { success: false, error: errorResult.userMessage }
      : { success: true, data: scanner }
  }

  /**
   * Update scanner account
   */
  async function updateScanner(id: string, data: UpdateScannerData) {
    const [scanner, errorResult] = await tryCatch(
      () => scannerStore.updateScanner(id, data),
      { action: 'updateScanner', component: 'useScanners' }
    )

    return errorResult
      ? { success: false, error: errorResult.userMessage }
      : { success: true, data: scanner }
  }

  /**
   * Delete scanner account
   */
  async function deleteScanner(id: string) {
    const [, errorResult] = await tryCatch(
      () => scannerStore.deleteScanner(id),
      { action: 'deleteScanner', component: 'useScanners' }
    )

    return errorResult
      ? { success: false, error: errorResult.userMessage }
      : { success: true }
  }

  /**
   * Activate scanner account
   */
  async function activateScanner(id: string) {
    const [scanner, errorResult] = await tryCatch(
      () => scannerStore.activate(id),
      { action: 'activateScanner', component: 'useScanners' }
    )

    return errorResult
      ? { success: false, error: errorResult.userMessage }
      : { success: true, data: scanner }
  }

  /**
   * Deactivate scanner account
   */
  async function deactivateScanner(id: string) {
    const [scanner, errorResult] = await tryCatch(
      () => scannerStore.deactivate(id),
      { action: 'deactivateScanner', component: 'useScanners' }
    )

    return errorResult
      ? { success: false, error: errorResult.userMessage }
      : { success: true, data: scanner }
  }

  return {
    // State
    scanners,
    currentScanner,
    isLoading,
    error,

    // Methods
    fetchScanners,
    fetchScanner,
    createScanner,
    updateScanner,
    deleteScanner,
    activateScanner,
    deactivateScanner
  }
}
