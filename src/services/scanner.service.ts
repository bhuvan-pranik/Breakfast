/**
 * Scanner Service
 * Handles scanner account CRUD operations
 */

import { supabase } from './supabase'
import type { ScannerAccount, CreateScannerInput, UpdateScannerInput } from '@/types'

class ScannerService {
  /**
   * Get all scanner accounts
   */
  async getAll(activeOnly = false): Promise<ScannerAccount[]> {
    let query = supabase
      .from('scanner_accounts')
      .select('*')
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  /**
   * Get scanner by ID
   */
  async getById(id: string): Promise<ScannerAccount | null> {
    const { data, error } = await supabase
      .from('scanner_accounts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  }

  /**
   * Get scanner by username
   */
  async getByUsername(username: string): Promise<ScannerAccount | null> {
    const { data, error } = await supabase
      .from('scanner_accounts')
      .select('*')
      .eq('username', username)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  }

  /**
   * Create scanner account
   */
  async create(input: CreateScannerInput): Promise<ScannerAccount> {
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
      throw new Error(scannerError.message)
    }

    return scannerAccount
  }

  /**
   * Update scanner account
   */
  async update(id: string, input: UpdateScannerInput): Promise<ScannerAccount> {
    const { data, error } = await supabase
      .from('scanner_accounts')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Deactivate scanner
   */
  async deactivate(id: string): Promise<void> {
    const { error } = await supabase
      .from('scanner_accounts')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error
  }

  /**
   * Activate scanner
   */
  async activate(id: string): Promise<void> {
    const { error } = await supabase
      .from('scanner_accounts')
      .update({ is_active: true })
      .eq('id', id)

    if (error) throw error
  }
}

export const scannerService = new ScannerService()
