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

  // Cache management
  const lastFetchTime = ref<number>(0)
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // ============================================================================
  // GETTERS
  // ============================================================================
  const activeScanners = computed(() => 
    scanners.value.filter((s: ScannerAccount) => s.is_active)
  )

  const inactiveScanners = computed(() => 
    scanners.value.filter((s: ScannerAccount) => !s.is_active)
  )

  const scannerCount = computed(() => scanners.value.length)

  const activeScannerCount = computed(() => activeScanners.value.length)

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Fetch all scanners
   * @param activeOnly - Only fetch active scanners
   * @param force - Force refresh, bypassing cache
   */
  async function fetchScanners(activeOnly = false, force = false): Promise<void> {
    // Use cache if available and not expired (unless force refresh)
    if (!force && scanners.value.length > 0) {
      const cacheAge = Date.now() - lastFetchTime.value
      if (cacheAge < CACHE_DURATION) {
        return // Use cached data
      }
    }

    isLoading.value = true
    error.value = null

    try {
      scanners.value = await scannerService.getAll(activeOnly)
      lastFetchTime.value = Date.now()
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
      lastFetchTime.value = Date.now() // Update cache timestamp
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
      const index = scanners.value.findIndex((s: ScannerAccount) => s.id === id)
      if (index !== -1) {
        scanners.value[index] = updated
      }
      lastFetchTime.value = Date.now() // Update cache timestamp
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
      const index = scanners.value.findIndex((s: ScannerAccount) => s.id === id)
      if (index !== -1 && scanners.value[index]) {
        scanners.value[index].is_active = false
      }
      lastFetchTime.value = Date.now() // Update cache timestamp
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
      const index = scanners.value.findIndex((s: ScannerAccount) => s.id === id)
      if (index !== -1 && scanners.value[index]) {
        scanners.value[index].is_active = true
      }
      lastFetchTime.value = Date.now() // Update cache timestamp
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
