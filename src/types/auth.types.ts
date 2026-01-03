/**
 * Authentication-related type definitions
 */

import type { User, Session } from '@supabase/supabase-js'
import type { ScannerAccount } from './scanner.types'

export type { User, Session }

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  user: User | null
  session: Session | null
  scannerAccount: ScannerAccount | null
}

export interface AuthState {
  user: User | null
  session: Session | null
  scannerAccount: ScannerAccount | null
  isLoading: boolean
  error: string | null
}
