/**
 * usePagination Composable
 * 
 * Provides reusable pagination logic for lists and tables.
 */

import { ref, computed, watch } from 'vue'

export interface PaginationOptions {
  initialPage?: number
  initialPageSize?: number
  pageSizeOptions?: number[]
}

const DEFAULT_OPTIONS: Required<PaginationOptions> = {
  initialPage: 1,
  initialPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100]
}

export function usePagination<T>(
  items: () => T[],
  options: PaginationOptions = {}
) {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  const currentPage = ref(opts.initialPage)
  const pageSize = ref(opts.initialPageSize)
  const pageSizeOptions = ref(opts.pageSizeOptions)

  /**
   * Total number of items
   */
  const totalItems = computed(() => items().length)

  /**
   * Total number of pages
   */
  const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value) || 1)

  /**
   * Current page items
   */
  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return items().slice(start, end)
  })

  /**
   * Check if there's a previous page
   */
  const hasPrevious = computed(() => currentPage.value > 1)

  /**
   * Check if there's a next page
   */
  const hasNext = computed(() => currentPage.value < totalPages.value)

  /**
   * Current range display (e.g., "1-10 of 50")
   */
  const rangeStart = computed(() => {
    if (totalItems.value === 0) return 0
    return (currentPage.value - 1) * pageSize.value + 1
  })

  const rangeEnd = computed(() => {
    const end = currentPage.value * pageSize.value
    return Math.min(end, totalItems.value)
  })

  const rangeText = computed(() => {
    if (totalItems.value === 0) return 'No items'
    return `${rangeStart.value}-${rangeEnd.value} of ${totalItems.value}`
  })

  /**
   * Go to specific page
   */
  function goToPage(page: number) {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
  }

  /**
   * Go to next page
   */
  function nextPage() {
    if (hasNext.value) {
      currentPage.value++
    }
  }

  /**
   * Go to previous page
   */
  function previousPage() {
    if (hasPrevious.value) {
      currentPage.value--
    }
  }

  /**
   * Go to first page
   */
  function firstPage() {
    currentPage.value = 1
  }

  /**
   * Go to last page
   */
  function lastPage() {
    currentPage.value = totalPages.value
  }

  /**
   * Change page size
   */
  function setPageSize(size: number) {
    pageSize.value = size
    // Reset to first page when changing page size
    currentPage.value = 1
  }

  /**
   * Reset pagination to initial state
   */
  function reset() {
    currentPage.value = opts.initialPage
    pageSize.value = opts.initialPageSize
  }

  /**
   * Get page numbers for pagination UI
   */
  const pageNumbers = computed(() => {
    const pages: number[] = []
    const maxVisible = 5
    const half = Math.floor(maxVisible / 2)

    let start = Math.max(1, currentPage.value - half)
    let end = Math.min(totalPages.value, start + maxVisible - 1)

    // Adjust start if we're near the end
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  })

  // Watch totalItems and adjust current page if needed
  watch(totalItems, () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = Math.max(1, totalPages.value)
    }
  })

  return {
    // State
    currentPage,
    pageSize,
    pageSizeOptions,
    totalItems,
    totalPages,
    paginatedItems,
    hasPrevious,
    hasNext,
    rangeStart,
    rangeEnd,
    rangeText,
    pageNumbers,

    // Methods
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setPageSize,
    reset
  }
}
