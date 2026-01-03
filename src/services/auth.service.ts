/**
 * Authentication Service
 * Handles user authentication and session management
 */

import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { ScannerAccount, LoginCredentials, AuthResponse } from '@/types'

class AuthService {
  /**
   * Login with username/password
   * Process:
   * 1. Query scanner_accounts table for username
   * 2. Get associated user_id (email stored in auth.users)
   * 3. Sign in with Supabase Auth using email
   * 4. Update last_login_at timestamp
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // 1. Find scanner account by username
    const { data: scannerAccount, error: accountError } = await supabase
      .from('scanner_accounts')
      .select('id, username, user_id, role, is_active')
      .eq('username', credentials.username)
      .eq('is_active', true)
      .single()

    if (accountError || !scannerAccount) {
      throw new Error('Invalid username or account inactive')
    }

    // 2. Construct email using consistent pattern
    // Since admin API requires service_role key (not available in frontend),
    // we use a consistent email pattern: username@breakfast-system.local
    const email = `${credentials.username}@breakfast-system.local`
    
    // 3. Sign in with Supabase Auth
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: credentials.password
    })

    if (signInError) {
      throw new Error('Invalid credentials')
    }

    // 4. Update last_login_at
    await supabase
      .from('scanner_accounts')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', scannerAccount.id)

    return {
      user: authData.user,
      session: authData.session,
      scannerAccount
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  }

  /**
   * Get current user with scanner account details
   */
  async getCurrentUser(): Promise<AuthResponse | null> {
    const session = await this.getCurrentSession()
    if (!session?.user) return null

    const { data: scannerAccount } = await supabase
      .from('scanner_accounts')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    return {
      user: session.user,
      session,
      scannerAccount: scannerAccount || null
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session)
    })
  }

  /**
   * Create new scanner account (Admin only)
   */
  async createScannerAccount(input: {
    username: string
    password: string
    role: 'admin' | 'scanner'
  }): Promise<ScannerAccount> {
    // Create user in Supabase Auth
    const email = `${input.username}@breakfast-system.local`
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: input.password
    })

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Failed to create auth user')
    }

    // Create scanner account record
    const { data: scannerAccount, error: scannerError } = await supabase
      .from('scanner_accounts')
      .insert({
        user_id: authData.user.id,
        username: input.username,
        role: input.role,
        is_active: true
      })
      .select()
      .single()

    if (scannerError) {
      // Rollback: delete auth user if scanner account creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error(scannerError.message)
    }

    return scannerAccount
  }
}

export const authService = new AuthService()
