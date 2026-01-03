/**
 * Scanner account type definitions
 */

export interface ScannerAccount {
  id: string
  username: string
  user_id: string
  role: 'admin' | 'scanner'
  is_active: boolean
  created_at: string
  last_login_at: string | null
}

export interface CreateScannerInput {
  username: string
  password: string
  role: 'admin' | 'scanner'
}

export interface UpdateScannerInput {
  username?: string
  role?: 'admin' | 'scanner'
  is_active?: boolean
}
