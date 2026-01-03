/**
 * API response type definitions
 */

export interface ApiResponse<T = any> {
  data: T | null
  error: ApiError | null
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface SupabaseError {
  message: string
  details: string
  hint: string
  code: string
}
