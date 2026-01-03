/**
 * Scanner Store
 * Manages scanner account data and operations
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { scannerService } from '@/services/scanner.service'
import type { ScannerAccount, CreateScannerInput, UpdateScannerInput } from '@/types'

export const useScannerStore = defineStore('scanner', () => {
  // ============================================================================
  // STATE
  // ============================================================================
  const scanners = ref<ScannerAccount[]>([])
  const selectedScanner = ref<ScannerAccount | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ============================================================================
  // GETTERS
  // ============================================================================
  const activeScanners = computed(() => 
    scanners.value.filter(s => s.is_active)
  )

  const inactiveScanners = computed(() => 
    scanners.value.filter(s => !s.is_active)
  )

  const scannerCount = computed(() => scanners.value.length)

  const activeScannerCount = computed(() => activeScanners.value.length)

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Fetch all scanners
   */
  async function fetchScanners(activeOnly = false): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      scanners.value = await scannerService.getAll(activeOnly)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch scanners'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch scanner by ID
   */
  async function fetchScanner(id: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      selectedScanner.value = await scannerService.getById(id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch scanner'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create new scanner
   */
  async function createScanner(input: CreateScannerInput): Promise<ScannerAccount> {
    isLoading.value = true
    error.value = null

    try {
      const scanner = await scannerService.create(input)
      scanners.value.unshift(scanner)
      return scanner
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create scanner'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update scanner
   */
  async function updateScanner(id: string, input: UpdateScannerInput): Promise<ScannerAccount> {
    isLoading.value = true
    error.value = null

    try {
      const updated = await scannerService.update(id, input)
      const index = scanners.value.findIndex(s => s.id === id)
      if (index !== -1) {
        scanners.value[index] = updated
      }
      return updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update scanner'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Deactivate scanner
   */
  async function deactivateScanner(id: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await scannerService.deactivate(id)
      const index = scanners.value.findIndex(s => s.id === id)
      if (index !== -1) {
        scanners.value[index].is_active = false
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to deactivate scanner'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Activate scanner
   */
  async function activateScanner(id: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await scannerService.activate(id)
      const index = scanners.value.findIndex(s => s.id === id)
      if (index !== -1) {
        scanners.value[index].is_active = true
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to activate scanner'
      throw e
    } finally {
      isLoading.value = false
    }
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
    scanners,
    selectedScanner,
    isLoading,
    error,

    // Getters
    activeScanners,
    inactiveScanners,
    scannerCount,
    activeScannerCount,

    // Actions
    fetchScanners,
    fetchScanner,
    createScanner,
    updateScanner,
    deactivateScanner,
    activateScanner,
    clearError
  }
})
