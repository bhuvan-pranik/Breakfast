# Supabase Integration Specifications

## Overview
This document details the integration between the Vue.js application and Supabase backend services including Authentication, Database, and potential Real-time features.

## Supabase Setup Requirements

### 1. Supabase Project Configuration

**Project Settings**:
- **Project Name**: breakfast-counter-system
- **Database Password**: Strong password (stored securely)
- **Region**: Choose closest to deployment location
- **Pricing Plan**: Free tier sufficient for MVP (50 MB database, 500 MB bandwidth, 2 GB file storage)

**Required Services**:
- Authentication (Email/Password provider)
- Database (PostgreSQL)
- Optional: Real-time (for live attendance updates)

### 2. Environment Variables

**Frontend Environment Variables** (`.env.local`):
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key

# Application Configuration
VITE_QR_SALT=your-secret-salt-string-here
VITE_APP_NAME=Breakfast Counter System
VITE_APP_VERSION=1.0.0

# Optional: Feature Flags
VITE_ENABLE_REALTIME=false
VITE_ENABLE_ANALYTICS=false
```

**Security Notes**:
- `VITE_SUPABASE_ANON_KEY` is safe to expose (public key)
- `VITE_QR_SALT` must be kept secret, never commit to version control
- Use `.env.example` for template, `.env.local` for actual values (gitignored)

---

## Authentication Integration

### 1. Supabase Auth Configuration

**Supabase Dashboard Setup**:
1. Navigate to Authentication → Providers
2. Enable Email provider
3. Disable email confirmation (internal system)
4. Disable password recovery (admin-managed)
5. Set minimum password length: 8 characters
6. Configure site URL: Your GitHub Pages URL

**Auth Configuration**:
```typescript
// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: window.localStorage,
    storageKey: 'breakfast-counter-auth'
  }
})
```

### 2. Authentication Service

**Service Interface**:
```typescript
// src/services/auth.service.ts
import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { ScannerAccount } from '@/types/auth.types'

interface LoginCredentials {
  username: string
  password: string
}

interface AuthResponse {
  user: User | null
  session: Session | null
  scannerAccount: ScannerAccount | null
}

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

    // 2. Get user email from auth.users via user_id
    const { data: authUser, error: userError } = await supabase.auth.admin.getUserById(
      scannerAccount.user_id
    )

    if (userError || !authUser) {
      throw new Error('User account not found')
    }

    // 3. Sign in with Supabase Auth
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: authUser.user.email!,
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
   * Process:
   * 1. Create user in Supabase Auth
   * 2. Create scanner_accounts record with user_id
   */
  async createScannerAccount(
    username: string,
    email: string,
    password: string,
    role: 'admin' | 'scanner'
  ): Promise<ScannerAccount> {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    })

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Failed to create auth user')
    }

    // 2. Create scanner account record
    const { data: scannerAccount, error: accountError } = await supabase
      .from('scanner_accounts')
      .insert({
        username,
        user_id: authData.user.id,
        role,
        is_active: true
      })
      .select()
      .single()

    if (accountError) {
      // Rollback: delete auth user if scanner_accounts creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error(accountError.message)
    }

    return scannerAccount
  }
}

export const authService = new AuthService()
```

### 3. Auth State Management (Pinia Store)

```typescript
// src/stores/auth.store.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authService } from '@/services/auth.service'
import type { User, Session } from '@supabase/supabase-js'
import type { ScannerAccount } from '@/types/auth.types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const scannerAccount = ref<ScannerAccount | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!session.value)
  const userRole = computed(() => scannerAccount.value?.role || null)
  const isAdmin = computed(() => userRole.value === 'admin')
  const isScanner = computed(() => userRole.value === 'scanner')
  const username = computed(() => scannerAccount.value?.username || null)

  // Actions
  async function login(username: string, password: string) {
    isLoading.value = true
    error.value = null

    try {
      const authResponse = await authService.login({ username, password })
      user.value = authResponse.user
      session.value = authResponse.session
      scannerAccount.value = authResponse.scannerAccount
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await authService.logout()
      user.value = null
      session.value = null
      scannerAccount.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Logout failed'
    }
  }

  async function checkAuth() {
    try {
      const authResponse = await authService.getCurrentUser()
      if (authResponse) {
        user.value = authResponse.user
        session.value = authResponse.session
        scannerAccount.value = authResponse.scannerAccount
      }
    } catch (e) {
      console.error('Auth check failed:', e)
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    user,
    session,
    scannerAccount,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    userRole,
    isAdmin,
    isScanner,
    username,
    // Actions
    login,
    logout,
    checkAuth,
    clearError
  }
})
```

---

## Database Operations

### 1. Employee Service with Supabase

```typescript
// src/services/employee.service.ts
import { supabase } from './supabase'
import type { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '@/types/employee.types'
import { qrcodeService } from './qrcode.service'

class EmployeeService {
  private readonly table = 'employees'

  /**
   * Get all employees with optional filtering
   */
  async getAll(options?: {
    activeOnly?: boolean
    department?: string
    search?: string
  }): Promise<Employee[]> {
    let query = supabase.from(this.table).select('*')

    if (options?.activeOnly) {
      query = query.eq('is_active', true)
    }

    if (options?.department) {
      query = query.eq('department', options.department)
    }

    if (options?.search) {
      query = query.or(
        `name.ilike.%${options.search}%,phone.ilike.%${options.search}%`
      )
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as Employee[]
  }

  /**
   * Get employee by phone
   */
  async getByPhone(phone: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('phone', phone)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(error.message)
    }

    return data as Employee
  }

  /**
   * Create new employee
   */
  async create(dto: CreateEmployeeDto): Promise<Employee> {
    // Generate QR code
    const qrCode = qrcodeService.generateQRCode(dto.phone, dto.name)

    const { data, error } = await supabase
      .from(this.table)
      .insert({
        phone: dto.phone,
        name: dto.name,
        department: dto.department,
        gender: dto.gender,
        qr_code: qrCode,
        is_active: true
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Employee
  }

  /**
   * Update employee
   */
  async update(phone: string, dto: UpdateEmployeeDto): Promise<Employee> {
    const updateData: any = { ...dto }

    // Regenerate QR code if name changed
    if (dto.name) {
      updateData.qr_code = qrcodeService.generateQRCode(phone, dto.name)
    }

    const { data, error } = await supabase
      .from(this.table)
      .update(updateData)
      .eq('phone', phone)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Employee
  }

  /**
   * Soft delete employee
   */
  async softDelete(phone: string): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .update({ is_active: false })
      .eq('phone', phone)

    if (error) throw new Error(error.message)
  }

  /**
   * Reactivate employee
   */
  async activate(phone: string): Promise<Employee> {
    const { data, error } = await supabase
      .from(this.table)
      .update({ is_active: true })
      .eq('phone', phone)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Employee
  }

  /**
   * Regenerate QR code for employee
   */
  async regenerateQRCode(phone: string): Promise<Employee> {
    const employee = await this.getByPhone(phone)
    if (!employee) throw new Error('Employee not found')

    const qrCode = qrcodeService.generateQRCode(phone, employee.name)

    const { data, error } = await supabase
      .from(this.table)
      .update({ qr_code: qrCode })
      .eq('phone', phone)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Employee
  }

  /**
   * Bulk create employees
   */
  async bulkCreate(employees: CreateEmployeeDto[]): Promise<Employee[]> {
    const employeesWithQR = employees.map(emp => ({
      ...emp,
      qr_code: qrcodeService.generateQRCode(emp.phone, emp.name),
      is_active: true
    }))

    const { data, error } = await supabase
      .from(this.table)
      .insert(employeesWithQR)
      .select()

    if (error) throw new Error(error.message)
    return data as Employee[]
  }

  /**
   * Get departments list (distinct values)
   */
  async getDepartments(): Promise<string[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('department')
      .eq('is_active', true)

    if (error) throw new Error(error.message)

    const departments = [...new Set(data.map(d => d.department))]
    return departments.sort()
  }
}

export const employeeService = new EmployeeService()
```

### 2. Attendance Service with Database Functions

```typescript
// src/services/attendance.service.ts
import { supabase } from './supabase'
import type { AttendanceRecord, DailyReport, ScanResult } from '@/types/attendance.types'

class AttendanceService {
  private readonly table = 'attendance_records'

  /**
   * Record attendance scan using database function
   */
  async recordScan(
    employeePhone: string,
    scannerId: string,
    qrCode: string
  ): Promise<ScanResult> {
    const { data, error } = await supabase.rpc('record_attendance_scan', {
      p_employee_phone: employeePhone,
      p_scanner_id: scannerId,
      p_qr_code: qrCode
    })

    if (error) throw new Error(error.message)

    return data[0] as ScanResult
  }

  /**
   * Check if employee has scanned today
   */
  async checkDailyAttendance(
    employeePhone: string,
    date?: string
  ): Promise<{ hasScanned: boolean; scanCount: number; lastScanTime: string | null }> {
    const { data, error } = await supabase.rpc('check_daily_attendance', {
      p_employee_phone: employeePhone,
      p_scan_date: date || new Date().toISOString().split('T')[0]
    })

    if (error) throw new Error(error.message)

    return {
      hasScanned: data[0].has_scanned,
      scanCount: data[0].scan_count,
      lastScanTime: data[0].last_scan_time
    }
  }

  /**
   * Get daily attendance report
   */
  async getDailyReport(date?: string): Promise<DailyReport> {
    const { data, error } = await supabase.rpc('get_daily_attendance_report', {
      p_date: date || new Date().toISOString().split('T')[0]
    })

    if (error) throw new Error(error.message)

    return data[0] as DailyReport
  }

  /**
   * Get attendance records with pagination
   */
  async getRecords(options?: {
    startDate?: string
    endDate?: string
    employeePhone?: string
    scannerId?: string
    status?: string
    limit?: number
    offset?: number
  }): Promise<{ records: AttendanceRecord[]; count: number }> {
    let query = supabase.from(this.table).select('*, employees(name, department)', { count: 'exact' })

    if (options?.startDate) {
      query = query.gte('scan_date', options.startDate)
    }

    if (options?.endDate) {
      query = query.lte('scan_date', options.endDate)
    }

    if (options?.employeePhone) {
      query = query.eq('employee_phone', options.employeePhone)
    }

    if (options?.scannerId) {
      query = query.eq('scanner_id', options.scannerId)
    }

    if (options?.status) {
      query = query.eq('status', options.status)
    }

    const limit = options?.limit || 50
    const offset = options?.offset || 0

    const { data, error, count } = await query
      .order('scan_timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw new Error(error.message)

    return {
      records: data as AttendanceRecord[],
      count: count || 0
    }
  }

  /**
   * Get attendance statistics for date range
   */
  async getStatistics(startDate: string, endDate: string): Promise<{
    totalScans: number
    uniqueEmployees: number
    successfulScans: number
    duplicateScans: number
    invalidScans: number
    dailyBreakdown: Array<{ date: string; count: number }>
  }> {
    const { data, error } = await supabase
      .from(this.table)
      .select('scan_date, status, employee_phone')
      .gte('scan_date', startDate)
      .lte('scan_date', endDate)

    if (error) throw new Error(error.message)

    const totalScans = data.length
    const uniqueEmployees = new Set(data.map(r => r.employee_phone)).size
    const successfulScans = data.filter(r => r.status === 'success').length
    const duplicateScans = data.filter(r => r.status === 'duplicate').length
    const invalidScans = data.filter(r => r.status === 'invalid').length

    // Daily breakdown
    const dailyMap = new Map<string, number>()
    data.forEach(record => {
      const count = dailyMap.get(record.scan_date) || 0
      dailyMap.set(record.scan_date, count + 1)
    })

    const dailyBreakdown = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      totalScans,
      uniqueEmployees,
      successfulScans,
      duplicateScans,
      invalidScans,
      dailyBreakdown
    }
  }
}

export const attendanceService = new AttendanceService()
```

---

## Real-time Subscriptions (Optional)

### Real-time Attendance Updates

**Use Case**: Live attendance dashboard showing scans as they happen

```typescript
// src/composables/useRealtimeAttendance.ts
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/services/supabase'
import type { AttendanceRecord } from '@/types/attendance.types'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtimeAttendance(date?: string) {
  const records = ref<AttendanceRecord[]>([])
  const isConnected = ref(false)
  let channel: RealtimeChannel | null = null

  const subscribe = () => {
    const scanDate = date || new Date().toISOString().split('T')[0]

    channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance_records',
          filter: `scan_date=eq.${scanDate}`
        },
        (payload) => {
          const newRecord = payload.new as AttendanceRecord
          records.value.unshift(newRecord)
        }
      )
      .subscribe((status) => {
        isConnected.value = status === 'SUBSCRIBED'
      })
  }

  const unsubscribe = () => {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
      isConnected.value = false
    }
  }

  onMounted(() => {
    subscribe()
  })

  onUnmounted(() => {
    unsubscribe()
  })

  return {
    records,
    isConnected,
    subscribe,
    unsubscribe
  }
}
```

---

## Error Handling Strategy

### Supabase Error Types

```typescript
// src/utils/supabase-errors.ts
export enum SupabaseErrorCode {
  PGRST116 = 'PGRST116', // Not found
  PGRST301 = 'PGRST301', // Unique constraint violation
  PGRST204 = 'PGRST204', // Foreign key constraint violation
  '23505' = '23505', // PostgreSQL unique violation
  '23503' = '23503', // PostgreSQL foreign key violation
}

export function parseSupabaseError(error: any): string {
  switch (error.code) {
    case SupabaseErrorCode.PGRST116:
      return 'Record not found'
    case SupabaseErrorCode.PGRST301:
    case '23505':
      return 'A record with this information already exists'
    case SupabaseErrorCode.PGRST204:
    case '23503':
      return 'Cannot delete record with dependencies'
    default:
      return error.message || 'An unexpected error occurred'
  }
}
```

---

## Performance Optimization

### 1. Query Optimization
- Use `.select()` to specify only needed columns
- Use `.single()` when expecting one result
- Use `.range()` for pagination
- Create appropriate indexes (defined in database schema)

### 2. Caching Strategy
- Store frequently accessed data in Pinia stores
- Cache department lists and other reference data
- Invalidate cache on mutations

### 3. Connection Pooling
- Managed automatically by Supabase
- Default pool size: 15 connections (Free tier)

---

## Security Checklist

- [x] RLS policies enabled on all tables
- [x] Anonymous key used (safe for client-side)
- [x] Service role key NEVER exposed to frontend
- [x] Auth session stored in localStorage with custom key
- [x] HTTPS enforced by Supabase
- [x] Input validation before database operations
- [x] QR salt stored in environment variable
- [x] Password minimum length enforced
- [x] SQL injection prevention via parameterized queries

---

## Supabase Dashboard Configuration

### Tables Created
1. employees
2. scanner_accounts
3. attendance_records

### Database Functions Created
1. `check_daily_attendance()`
2. `get_daily_attendance_report()`
3. `record_attendance_scan()`
4. `update_updated_at_column()` (trigger function)

### RLS Policies Created
- employees: 2 policies (admin full, scanner read active)
- scanner_accounts: 3 policies (admin full, scanner read own, scanner update own)
- attendance_records: 3 policies (admin full, scanner insert, scanner read own)

### Auth Configuration
- Email provider enabled
- Email confirmation disabled
- Password recovery disabled
- Minimum password length: 8

---

## Testing Supabase Integration

### Test Checklist

1. **Authentication**
   - [ ] Admin login
   - [ ] Scanner login
   - [ ] Invalid credentials
   - [ ] Session persistence
   - [ ] Logout

2. **Employee Operations**
   - [ ] Create employee
   - [ ] Update employee
   - [ ] Soft delete
   - [ ] Reactivate
   - [ ] Regenerate QR code
   - [ ] Bulk upload

3. **Attendance**
   - [ ] Successful scan
   - [ ] Duplicate scan detection
   - [ ] Invalid QR code
   - [ ] Inactive employee
   - [ ] Daily report generation

4. **Authorization**
   - [ ] Admin can access all features
   - [ ] Scanner cannot access admin features
   - [ ] RLS policies enforced
