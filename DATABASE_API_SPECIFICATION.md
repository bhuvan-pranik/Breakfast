# Database Schema & API Specification

**Version:** 1.0.0
**Date:** January 3, 2026
**Backend**: Supabase (PostgreSQL + Auth)

---

## Table of Contents

1. [Database Schema](#1-database-schema)
2. [Row Level Security (RLS) Policies](#2-row-level-security-rls-policies)
3. [API Endpoints](#3-api-endpoints)
4. [Authentication Flow](#4-authentication-flow)
5. [Data Validation Rules](#5-data-validation-rules)
6. [QR Code Generation](#6-qr-code-generation)

---

## 1. Database Schema

### 1.1 Tables Overview

```
┌─────────────────────┐
│   auth.users        │  (Supabase Auth - built-in)
│  - id (uuid)        │
│  - email            │
│  - role (metadata)  │
└─────────────────────┘
         │
         │ (1:1 for scanners)
         │
         ▼
┌─────────────────────┐      ┌─────────────────────┐
│   scanners          │      │   employees         │
│  - id               │      │  - id               │
│  - user_id (FK)     │      │  - phone (unique)   │
│  - username         │      │  - name             │
│  - name             │      │  - department       │
│  - active           │      │  - gender           │
│  - created_at       │      │  - qr_code          │
│  - last_login       │      │  - active           │
└─────────────────────┘      │  - created_at       │
                             │  - updated_at       │
                             └─────────────────────┘
                                      │
                                      │ (1:many)
                                      │
                                      ▼
                             ┌─────────────────────┐
                             │   scans             │
                             │  - id               │
                             │  - employee_id (FK) │
                             │  - scanned_at       │
                             │  - scanner_id (FK)  │
                             │  - status           │
                             └─────────────────────┘
```

---

### 1.2 Table: `employees`

**Description**: Stores employee information and QR codes.

```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(50) NOT NULL,
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  qr_code TEXT UNIQUE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_employees_phone ON employees(phone);
CREATE INDEX idx_employees_active ON employees(active);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_qr_code ON employees(qr_code);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER employees_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

**Columns**:
- `id`: UUID, primary key
- `phone`: 10-digit phone number, unique identifier
- `name`: Employee full name
- `department`: Department name (Engineering, HR, Sales, etc.)
- `gender`: Gender (male, female, other, prefer_not_to_say)
- `qr_code`: QR code string (hashed), unique
- `active`: Active status (true = active, false = inactive/soft deleted)
- `created_at`: Timestamp when employee was created
- `updated_at`: Timestamp when employee was last updated

**Constraints**:
- `phone` must be unique
- `qr_code` must be unique
- `gender` must be one of allowed values

---

### 1.3 Table: `scanners`

**Description**: Stores scanner/staff account information.

```sql
CREATE TABLE scanners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_scanners_user_id ON scanners(user_id);
CREATE INDEX idx_scanners_username ON scanners(username);
CREATE INDEX idx_scanners_active ON scanners(active);
```

**Columns**:
- `id`: UUID, primary key
- `user_id`: Foreign key to `auth.users` (Supabase Auth)
- `username`: Scanner username (for display)
- `name`: Display name for scanner (e.g., "Counter 1")
- `active`: Active status
- `created_at`: Timestamp when scanner account was created
- `last_login`: Timestamp of last login

**Relationships**:
- `user_id` references `auth.users.id` (1:1 relationship)

---

### 1.4 Table: `scans`

**Description**: Stores scan records (attendance log).

```sql
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  scanner_id UUID REFERENCES scanners(id) ON DELETE SET NULL,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status VARCHAR(20) NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error')),
  error_message TEXT,
  CONSTRAINT unique_employee_scan_per_day UNIQUE (employee_id, DATE(scanned_at))
);

-- Indexes
CREATE INDEX idx_scans_employee_id ON scans(employee_id);
CREATE INDEX idx_scans_scanner_id ON scans(scanner_id);
CREATE INDEX idx_scans_scanned_at ON scans(scanned_at);
CREATE INDEX idx_scans_date ON scans(DATE(scanned_at));
```

**Columns**:
- `id`: UUID, primary key
- `employee_id`: Foreign key to `employees`
- `scanner_id`: Foreign key to `scanners` (nullable, for tracking which scanner was used)
- `scanned_at`: Timestamp when QR code was scanned
- `status`: Scan status (success or error)
- `error_message`: Error message if scan failed (nullable)

**Constraints**:
- `unique_employee_scan_per_day`: Ensures one scan per employee per day (calendar date)
- This constraint enforces the business rule at database level

**Relationships**:
- `employee_id` references `employees.id`
- `scanner_id` references `scanners.id`

---

### 1.5 Table: `departments` (Optional - Phase II)

**Description**: Stores department list for normalization.

```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_departments_name ON departments(name);
CREATE INDEX idx_departments_active ON departments(active);

-- Migrate employees to use department_id
ALTER TABLE employees ADD COLUMN department_id UUID REFERENCES departments(id);
-- Then migrate data and drop old department column
```

**Note**: In MVP, `department` is a string column in `employees` table. In Phase II, normalize to a separate table for better management.

---

## 2. Row Level Security (RLS) Policies

Supabase uses Row Level Security (RLS) to control data access at the database level.

### 2.1 Enable RLS

```sql
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE scanners ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
```

---

### 2.2 Policies for `employees`

**Admin: Full access**
```sql
-- Admin can read all employees
CREATE POLICY admin_read_employees ON employees
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- Admin can insert employees
CREATE POLICY admin_insert_employees ON employees
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);

-- Admin can update employees
CREATE POLICY admin_update_employees ON employees
FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);

-- Admin can delete employees
CREATE POLICY admin_delete_employees ON employees
FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin'
);
```

**Scanner: Read-only access (needed for scan validation)**
```sql
-- Scanner can read active employees (for QR validation)
CREATE POLICY scanner_read_employees ON employees
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'scanner'
  AND active = true
);
```

---

### 2.3 Policies for `scanners`

**Admin: Full access**
```sql
-- Admin can read all scanners
CREATE POLICY admin_read_scanners ON scanners
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- Admin can insert scanners
CREATE POLICY admin_insert_scanners ON scanners
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);

-- Admin can update scanners
CREATE POLICY admin_update_scanners ON scanners
FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- Admin can delete scanners
CREATE POLICY admin_delete_scanners ON scanners
FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin'
);
```

**Scanner: Read own profile**
```sql
-- Scanner can read their own profile
CREATE POLICY scanner_read_own_profile ON scanners
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

-- Scanner can update their own last_login
CREATE POLICY scanner_update_own_last_login ON scanners
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid()
);
```

---

### 2.4 Policies for `scans`

**Admin: Full access**
```sql
-- Admin can read all scans
CREATE POLICY admin_read_scans ON scans
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin'
);
```

**Scanner: Insert scans only**
```sql
-- Scanner can insert scans
CREATE POLICY scanner_insert_scans ON scans
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'role' = 'scanner'
);

-- Scanner can read scans they created (optional, for recent activity)
CREATE POLICY scanner_read_own_scans ON scans
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'scanner'
  AND scanner_id IN (
    SELECT id FROM scanners WHERE user_id = auth.uid()
  )
);
```

---

### 2.5 User Metadata for Roles

Supabase stores user metadata in `auth.users`. Store role in `raw_user_meta_data`:

```sql
-- Set role on user creation (via Supabase Admin API or trigger)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"admin"')
WHERE email = 'admin@example.com';

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"scanner"')
WHERE id = 'scanner-user-id';
```

**Access role in RLS policies**:
```sql
auth.jwt() ->> 'role' = 'admin'
```

---

## 3. API Endpoints

All API calls use Supabase client library. Below are logical API operations.

### 3.1 Authentication

#### POST `/auth/login`
**Description**: Login user (admin or scanner)

**Request**:
```typescript
{
  email: string; // Or username (map to email)
  password: string;
}
```

**Response** (Success):
```typescript
{
  user: {
    id: string;
    email: string;
    role: 'admin' | 'scanner';
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}
```

**Response** (Error):
```typescript
{
  error: {
    message: "Invalid login credentials";
  };
}
```

**Implementation**:
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: username, // Or map username to email
  password: password,
});
```

---

#### POST `/auth/logout`
**Description**: Logout user

**Response**:
```typescript
{
  success: true;
}
```

**Implementation**:
```typescript
await supabase.auth.signOut();
```

---

### 3.2 Employees API

#### GET `/api/employees`
**Description**: Get list of employees with optional filters

**Query Parameters**:
```typescript
{
  search?: string; // Search by name or phone
  department?: string; // Filter by department
  active?: boolean; // Filter by active status
  page?: number; // Pagination
  pageSize?: number; // Items per page
  sortBy?: string; // Column to sort by
  sortOrder?: 'asc' | 'desc';
}
```

**Response**:
```typescript
{
  data: Array<{
    id: string;
    phone: string;
    name: string;
    department: string;
    gender: string;
    qr_code: string;
    active: boolean;
    created_at: string;
    updated_at: string;
  }>;
  total: number;
  page: number;
  pageSize: number;
}
```

**Implementation**:
```typescript
let query = supabase
  .from('employees')
  .select('*', { count: 'exact' });

// Apply filters
if (search) {
  query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
}
if (department) {
  query = query.eq('department', department);
}
if (active !== undefined) {
  query = query.eq('active', active);
}

// Sorting
query = query.order(sortBy || 'created_at', { ascending: sortOrder === 'asc' });

// Pagination
const from = (page - 1) * pageSize;
const to = from + pageSize - 1;
query = query.range(from, to);

const { data, error, count } = await query;
```

---

#### GET `/api/employees/:id`
**Description**: Get single employee by ID

**Response**:
```typescript
{
  id: string;
  phone: string;
  name: string;
  department: string;
  gender: string;
  qr_code: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}
```

**Implementation**:
```typescript
const { data, error } = await supabase
  .from('employees')
  .select('*')
  .eq('id', id)
  .single();
```

---

#### POST `/api/employees`
**Description**: Create new employee

**Request**:
```typescript
{
  phone: string; // 10 digits
  name: string;
  department: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
}
```

**Response**:
```typescript
{
  id: string;
  phone: string;
  name: string;
  department: string;
  gender: string;
  qr_code: string; // Generated
  active: boolean; // Default true
  created_at: string;
  updated_at: string;
}
```

**Implementation**:
```typescript
// Generate QR code
const qrCode = generateQRCode(phone);

const { data, error } = await supabase
  .from('employees')
  .insert({
    phone,
    name,
    department,
    gender,
    qr_code: qrCode,
  })
  .select()
  .single();
```

**Validation**:
- Phone: 10 digits, unique
- Name: min 2 chars, max 100 chars
- Department: required
- Gender: one of allowed values

---

#### PATCH `/api/employees/:id`
**Description**: Update employee

**Request**:
```typescript
{
  name?: string;
  department?: string;
  gender?: string;
  active?: boolean;
}
```

**Response**: Updated employee object

**Implementation**:
```typescript
const { data, error } = await supabase
  .from('employees')
  .update(updateData)
  .eq('id', id)
  .select()
  .single();
```

**Note**: `phone` cannot be updated (unique identifier)

---

#### DELETE `/api/employees/:id`
**Description**: Delete employee (soft delete recommended)

**Response**:
```typescript
{
  success: true;
}
```

**Implementation** (Soft delete):
```typescript
const { error } = await supabase
  .from('employees')
  .update({ active: false })
  .eq('id', id);
```

**Implementation** (Hard delete):
```typescript
const { error } = await supabase
  .from('employees')
  .delete()
  .eq('id', id);
```

---

#### POST `/api/employees/:id/regenerate-qr`
**Description**: Regenerate QR code for employee

**Response**:
```typescript
{
  qr_code: string; // New QR code
}
```

**Implementation**:
```typescript
const newQRCode = generateQRCode(employee.phone); // New salt/timestamp

const { data, error } = await supabase
  .from('employees')
  .update({ qr_code: newQRCode })
  .eq('id', id)
  .select('qr_code')
  .single();
```

---

#### POST `/api/employees/bulk-upload`
**Description**: Bulk upload employees from CSV

**Request**:
```typescript
{
  file: File; // CSV file
}
```

**Response**:
```typescript
{
  success: number; // Count of successful imports
  errors: Array<{
    row: number;
    message: string;
  }>;
}
```

**Implementation**:
- Parse CSV file
- Validate each row
- Insert valid rows
- Return errors for invalid rows

---

### 3.3 Scanners API

#### GET `/api/scanners`
**Description**: Get list of scanner accounts

**Response**:
```typescript
{
  data: Array<{
    id: string;
    user_id: string;
    username: string;
    name: string;
    active: boolean;
    created_at: string;
    last_login: string;
  }>;
}
```

---

#### POST `/api/scanners`
**Description**: Create scanner account

**Request**:
```typescript
{
  username: string;
  name?: string;
  password: string;
}
```

**Response**:
```typescript
{
  id: string;
  username: string;
  name: string;
  active: boolean;
  created_at: string;
}
```

**Implementation**:
```typescript
// 1. Create auth user
const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
  email: `${username}@breakfast-scanner.local`, // Fake email
  password: password,
  email_confirm: true,
  user_metadata: {
    role: 'scanner',
    username: username,
  },
});

// 2. Create scanner record
const { data: scanner, error } = await supabase
  .from('scanners')
  .insert({
    user_id: authUser.user.id,
    username,
    name,
  })
  .select()
  .single();
```

**Note**: Use Supabase Admin API to create user (requires service role key on backend)

---

#### PATCH `/api/scanners/:id`
**Description**: Update scanner (activate/deactivate)

**Request**:
```typescript
{
  active?: boolean;
  name?: string;
}
```

**Response**: Updated scanner object

---

#### DELETE `/api/scanners/:id`
**Description**: Delete scanner account

**Implementation**:
```typescript
// 1. Delete scanner record (will cascade delete user via ON DELETE CASCADE)
const { error } = await supabase
  .from('scanners')
  .delete()
  .eq('id', id);

// Or, if using soft delete
const { error } = await supabase
  .from('scanners')
  .update({ active: false })
  .eq('id', id);
```

---

### 3.4 Scans API

#### POST `/api/scan`
**Description**: Submit QR code scan

**Request**:
```typescript
{
  qr_code: string; // QR code data from scanner
}
```

**Response** (Success):
```typescript
{
  status: 'success';
  employee: {
    id: string;
    name: string;
    phone: string;
    department: string;
  };
  scan: {
    id: string;
    scanned_at: string;
  };
}
```

**Response** (Error):
```typescript
{
  status: 'error';
  error: 'invalid_qr' | 'employee_inactive' | 'already_scanned';
  message: string;
  employee?: {
    name: string; // For already_scanned error
  };
  last_scan?: string; // Timestamp of last scan (for already_scanned)
}
```

**Implementation** (Supabase Function or Edge Function):
```typescript
async function handleScan(qrCode: string, scannerId: string) {
  // 1. Find employee by QR code
  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('*')
    .eq('qr_code', qrCode)
    .single();

  if (employeeError || !employee) {
    return {
      status: 'error',
      error: 'invalid_qr',
      message: 'Invalid QR code',
    };
  }

  // 2. Check if employee is active
  if (!employee.active) {
    return {
      status: 'error',
      error: 'employee_inactive',
      message: 'Employee account inactive',
      employee: { name: employee.name },
    };
  }

  // 3. Check if already scanned today
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const { data: existingScan } = await supabase
    .from('scans')
    .select('scanned_at')
    .eq('employee_id', employee.id)
    .gte('scanned_at', `${today}T00:00:00`)
    .lte('scanned_at', `${today}T23:59:59`)
    .maybeSingle();

  if (existingScan) {
    return {
      status: 'error',
      error: 'already_scanned',
      message: 'Already scanned today',
      employee: { name: employee.name },
      last_scan: existingScan.scanned_at,
    };
  }

  // 4. Create scan record
  const { data: scan, error: scanError } = await supabase
    .from('scans')
    .insert({
      employee_id: employee.id,
      scanner_id: scannerId,
      status: 'success',
    })
    .select()
    .single();

  if (scanError) {
    // Handle constraint violation (race condition)
    if (scanError.code === '23505') { // Unique constraint violation
      return {
        status: 'error',
        error: 'already_scanned',
        message: 'Already scanned today',
        employee: { name: employee.name },
      };
    }
    throw scanError;
  }

  // 5. Return success
  return {
    status: 'success',
    employee: {
      id: employee.id,
      name: employee.name,
      phone: employee.phone,
      department: employee.department,
    },
    scan: {
      id: scan.id,
      scanned_at: scan.scanned_at,
    },
  };
}
```

**Note**: Implement as Supabase Edge Function for server-side validation and security.

---

#### GET `/api/scans`
**Description**: Get scan history (admin only)

**Query Parameters**:
```typescript
{
  date?: string; // YYYY-MM-DD
  from_date?: string;
  to_date?: string;
  employee_id?: string;
  department?: string;
  page?: number;
  pageSize?: number;
}
```

**Response**:
```typescript
{
  data: Array<{
    id: string;
    employee: {
      id: string;
      name: string;
      phone: string;
      department: string;
    };
    scanner: {
      id: string;
      name: string;
    };
    scanned_at: string;
    status: string;
  }>;
  total: number;
  stats: {
    total_scans: number;
    success_scans: number;
    error_scans: number;
  };
}
```

**Implementation**:
```typescript
let query = supabase
  .from('scans')
  .select(`
    *,
    employee:employees(id, name, phone, department),
    scanner:scanners(id, name)
  `, { count: 'exact' });

// Apply filters
if (date) {
  query = query.gte('scanned_at', `${date}T00:00:00`)
               .lte('scanned_at', `${date}T23:59:59`);
}
if (from_date && to_date) {
  query = query.gte('scanned_at', `${from_date}T00:00:00`)
               .lte('scanned_at', `${to_date}T23:59:59`);
}
if (employee_id) {
  query = query.eq('employee_id', employee_id);
}

// Pagination
const from = (page - 1) * pageSize;
const to = from + pageSize - 1;
query = query.range(from, to);

const { data, error, count } = await query;
```

---

## 4. Authentication Flow

### 4.1 Login Flow

```
Client                          Supabase Auth
  │                                   │
  ├─ POST /auth/login ───────────────>│
  │  { email, password }              │
  │                                   │
  │<─ Session + User ──────────────────┤
  │  { access_token, user }           │
  │                                   │
  ├─ Store session in localStorage    │
  │                                   │
  ├─ Check user role (user.role)      │
  │                                   │
  └─ Redirect to appropriate page     │
     - Admin → /admin/dashboard       │
     - Scanner → /scanner             │
```

### 4.2 Role-Based Access Control

**Frontend**:
```typescript
// Router guard
router.beforeEach(async (to, from, next) => {
  const { user, checkAuth } = useAuth();

  if (to.meta.requiresAuth) {
    if (!checkAuth()) {
      return next('/login');
    }

    // Check role
    const requiredRole = to.meta.role;
    if (requiredRole && user.value?.role !== requiredRole) {
      return next('/403'); // Forbidden
    }
  }

  next();
});
```

**Route Definitions**:
```typescript
const routes = [
  { path: '/login', component: LoginView },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: 'dashboard', component: DashboardView },
      { path: 'employees', component: EmployeesView },
      // ...
    ],
  },
  {
    path: '/scanner',
    component: ScannerView,
    meta: { requiresAuth: true, role: 'scanner' },
  },
];
```

---

## 5. Data Validation Rules

### 5.1 Employee Validation

**Phone**:
- Required
- Exactly 10 digits
- Numeric only
- Unique (database constraint)
- Regex: `/^\d{10}$/`

**Name**:
- Required
- Min length: 2 characters
- Max length: 100 characters
- Trim whitespace
- Regex: `/^[a-zA-Z\s.'-]+$/` (letters, spaces, common name characters)

**Department**:
- Required
- One of predefined departments (or any string in MVP)
- Max length: 50 characters

**Gender**:
- Required
- One of: `male`, `female`, `other`, `prefer_not_to_say`

**Active**:
- Boolean
- Default: `true`

---

### 5.2 Scanner Validation

**Username**:
- Required
- Min length: 3 characters
- Max length: 50 characters
- Alphanumeric + underscore only
- Unique (database constraint)
- Regex: `/^[a-zA-Z0-9_]+$/`

**Password**:
- Required
- Min length: 8 characters
- Must contain:
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character (optional in MVP)
- Regex: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/`

**Name**:
- Optional
- Max length: 100 characters

---

### 5.3 CSV Upload Validation

**File**:
- File type: `.csv` or `.xlsx`
- Max file size: 5 MB
- Max rows: 1000 (configurable)

**CSV Format**:
```csv
phone,name,department,gender
9876543210,John Doe,Engineering,Male
```

**Row Validation**:
- Each field validated as per employee validation rules
- Duplicate phone numbers within file: reject
- Missing required fields: reject
- Invalid data types: reject

**Error Reporting**:
```typescript
{
  row: 3, // Row number in CSV (1-indexed, excluding header)
  field: 'phone',
  message: 'Phone number must be 10 digits',
}
```

---

## 6. QR Code Generation

### 6.1 QR Code Format

**Data Structure**:
```
{phone}:{salt}:{timestamp}
```

**Hashed Output** (stored in database):
```
SHA256({phone}:{salt}:{timestamp})
```

**Example**:
```
Input: 9876543210:random-salt-abc123:1704240000
Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

**QR Code String** (displayed to user):
```
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

### 6.2 QR Code Generation Function

```typescript
import crypto from 'crypto';

function generateQRCode(phone: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  const data = `${phone}:${salt}:${timestamp}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return hash;
}
```

**Properties**:
- Unique per employee (even if phone same, salt different)
- Cannot be reverse-engineered to get phone number
- Permanent (unless regenerated)
- Database lookup required to validate (QR → employee mapping)

### 6.3 QR Code Regeneration

**When to Regenerate**:
- Employee QR code compromised
- Admin manually requests regeneration
- Employee lost QR code (optional: issue duplicate vs. regenerate)

**Process**:
1. Generate new QR code (new salt + timestamp)
2. Update `employees.qr_code` in database
3. Old QR code immediately invalid (database constraint: unique QR code)
4. Employee must receive new QR code (print or digital)

---

## Database Migration Scripts

### Initial Schema Setup

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(50) NOT NULL,
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  qr_code TEXT UNIQUE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create scanners table
CREATE TABLE scanners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login TIMESTAMPTZ
);

-- Create scans table
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  scanner_id UUID REFERENCES scanners(id) ON DELETE SET NULL,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status VARCHAR(20) NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error')),
  error_message TEXT,
  CONSTRAINT unique_employee_scan_per_day UNIQUE (employee_id, DATE(scanned_at))
);

-- Create indexes
CREATE INDEX idx_employees_phone ON employees(phone);
CREATE INDEX idx_employees_active ON employees(active);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_qr_code ON employees(qr_code);

CREATE INDEX idx_scanners_user_id ON scanners(user_id);
CREATE INDEX idx_scanners_username ON scanners(username);
CREATE INDEX idx_scanners_active ON scanners(active);

CREATE INDEX idx_scans_employee_id ON scans(employee_id);
CREATE INDEX idx_scans_scanner_id ON scans(scanner_id);
CREATE INDEX idx_scans_scanned_at ON scans(scanned_at);
CREATE INDEX idx_scans_date ON scans(DATE(scanned_at));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to employees table
CREATE TRIGGER employees_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE scanners ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (see section 2 above)
-- ... (all policies from section 2)
```

---

**End of Database & API Specification**

This document provides a comprehensive specification for the database schema, API endpoints, authentication, and data validation for the Breakfast Counter QR System. Use this as a reference during backend setup and frontend API integration.
