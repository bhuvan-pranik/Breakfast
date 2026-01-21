# Database Schema Design (Supabase/PostgreSQL)

## Overview
This document defines the complete database schema for the QR-based breakfast counter system using PostgreSQL via Supabase.

## Schema Diagram (Text Representation)

```
┌─────────────────────────┐
│      employees          │
├─────────────────────────┤
│ phone (PK)              │──┐
│ name                    │  │
│ department              │  │
│ gender                  │  │
│ qr_code (UNIQUE)        │  │
│ is_active               │  │
│ created_at              │  │
│ updated_at              │  │
└─────────────────────────┘  │
                             │
                             │ 1:N
                             │
┌─────────────────────────┐  │
│   scanner_accounts      │  │
├─────────────────────────┤  │
│ id (PK, UUID)           │──┤
│ username (UNIQUE)       │  │
│ user_id (FK → auth)     │  │
│ name                    │  │
│ location                │  │
│ description             │  │
│ is_active               │  │
│ created_at              │  │
│ last_login_at           │  │
└─────────────────────────┘  │
                             │
                             │
                             │ N:1      N:1
                             │  ┌────────┘
┌─────────────────────────┐  │  │
│   attendance_records    │  │  │
├─────────────────────────┤  │  │
│ id (PK, UUID)           │  │  │
│ employee_phone (FK)     │──┘  │
│ scanner_id (FK)         │─────┘
│ scan_timestamp          │
│ scan_date (INDEXED)     │
│ status                  │
│ validation_message      │
│ created_at              │
└─────────────────────────┘

┌─────────────────────────┐
│   auth.users (Supabase) │
├─────────────────────────┤
│ id (PK, UUID)           │──┐
│ email                   │  │
│ encrypted_password      │  │ 1:1
│ ...                     │  │
└─────────────────────────┘  │
                             │
                             └──→ scanner_accounts.user_id
```

## Table Definitions

### 1. employees

**Purpose**: Store employee information and QR code data

**Table Name**: `employees`

**Columns**:

| Column Name | Type | Constraints | Description |
|-------------|------|-------------|-------------|
| `phone` | VARCHAR(15) | PRIMARY KEY, NOT NULL | Employee phone number (unique identifier) |
| `name` | VARCHAR(255) | NOT NULL | Employee full name |
| `department` | VARCHAR(100) | NOT NULL | Employee department |
| `gender` | VARCHAR(20) | NOT NULL, CHECK (gender IN ('Male', 'Female', 'Other')) | Employee gender |
| `qr_code` | TEXT | NOT NULL, UNIQUE | Generated QR code string |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Active status (soft delete flag) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record last update timestamp |

**Indexes**:
```sql
-- Primary key index (automatic)
CREATE UNIQUE INDEX idx_employees_phone ON employees(phone);

-- Unique constraint on QR code
CREATE UNIQUE INDEX idx_employees_qr_code ON employees(qr_code);

-- Filter by active status (frequently used)
CREATE INDEX idx_employees_is_active ON employees(is_active);

-- Filter by department
CREATE INDEX idx_employees_department ON employees(department);

-- Search by name (case-insensitive)
CREATE INDEX idx_employees_name ON employees(LOWER(name));
```

**SQL Definition**:
```sql
CREATE TABLE employees (
  phone VARCHAR(15) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  qr_code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### 2. scanner_accounts

**Purpose**: Store scanner/staff user accounts (linked to Supabase Auth)

**Table Name**: `scanner_accounts`

**Columns**:

| Column Name | Type | Constraints | Description |
|-------------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique scanner account ID |
| `username` | VARCHAR(50) | NOT NULL, UNIQUE | Scanner username for display |
| `user_id` | UUID | NOT NULL, UNIQUE, FOREIGN KEY → auth.users(id) | Supabase auth user ID |
| `name` | VARCHAR(255) | NOT NULL | Scanner display name |
| `location` | VARCHAR(255) | NOT NULL | Scanner location/placement |
| `description` | TEXT | NULL | Scanner description/notes |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Account active status |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| `last_login_at` | TIMESTAMPTZ | NULL | Last successful login timestamp |

**Indexes**:
```sql
-- Primary key index (automatic)
CREATE UNIQUE INDEX idx_scanner_accounts_id ON scanner_accounts(id);

-- Unique constraint on username
CREATE UNIQUE INDEX idx_scanner_accounts_username ON scanner_accounts(username);

-- Foreign key to auth.users
CREATE UNIQUE INDEX idx_scanner_accounts_user_id ON scanner_accounts(user_id);

-- Search by name (case-insensitive)
CREATE INDEX idx_scanner_accounts_name ON scanner_accounts(LOWER(name));

-- Filter by location
CREATE INDEX idx_scanner_accounts_location ON scanner_accounts(location);

-- Filter by active status
CREATE INDEX idx_scanner_accounts_is_active ON scanner_accounts(is_active);
```

**SQL Definition**:
```sql
CREATE TABLE scanner_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) NOT NULL UNIQUE,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ NULL
);
```

---

### 3. attendance_records

**Purpose**: Track all QR code scan events and attendance

**Table Name**: `attendance_records`

**Columns**:

| Column Name | Type | Constraints | Description |
|-------------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique scan record ID |
| `employee_phone` | VARCHAR(15) | NOT NULL, FOREIGN KEY → employees(phone) | Employee being scanned |
| `scanner_id` | UUID | NOT NULL, FOREIGN KEY → scanner_accounts(id) | Scanner who performed scan |
| `scan_timestamp` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Exact time of scan |
| `scan_date` | DATE | NOT NULL, DEFAULT CURRENT_DATE | Date of scan (for daily queries) |
| `status` | VARCHAR(20) | NOT NULL, CHECK (status IN ('success', 'duplicate', 'invalid', 'inactive')) | Scan result status |
| `validation_message` | TEXT | NULL | Detailed message for scan result |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |

**Indexes**:
```sql
-- Primary key index (automatic)
CREATE INDEX idx_attendance_records_id ON attendance_records(id);

-- Foreign key to employees
CREATE INDEX idx_attendance_records_employee_phone ON attendance_records(employee_phone);

-- Foreign key to scanner_accounts
CREATE INDEX idx_attendance_records_scanner_id ON attendance_records(scanner_id);

-- Query by date (most common query)
CREATE INDEX idx_attendance_records_scan_date ON attendance_records(scan_date);

-- Query by date range
CREATE INDEX idx_attendance_records_scan_timestamp ON attendance_records(scan_timestamp);

-- Composite index for daily duplicate checking
CREATE INDEX idx_attendance_records_employee_date ON attendance_records(employee_phone, scan_date);

-- Filter by status
CREATE INDEX idx_attendance_records_status ON attendance_records(status);

-- Composite index for successful scans by date
CREATE INDEX idx_attendance_records_success_date ON attendance_records(scan_date, status) WHERE status = 'success';
```

**SQL Definition**:
```sql
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_phone VARCHAR(15) NOT NULL REFERENCES employees(phone) ON DELETE CASCADE,
  scanner_id UUID NOT NULL REFERENCES scanner_accounts(id) ON DELETE RESTRICT,
  scan_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'duplicate', 'invalid', 'inactive')),
  validation_message TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Row Level Security (RLS) Policies

### Enable RLS on All Tables
```sql
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE scanner_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
```

### RLS Policies for `employees`

```sql
-- Policy: Admins have full access
CREATE POLICY "Admins have full access to employees"
  ON employees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scanner_accounts
      WHERE scanner_accounts.user_id = auth.uid()
        AND scanner_accounts.role = 'admin'
        AND scanner_accounts.is_active = true
    )
  );

-- Policy: Scanners can read active employees only
CREATE POLICY "Scanners can read active employees"
  ON employees
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM scanner_accounts
      WHERE scanner_accounts.user_id = auth.uid()
        AND scanner_accounts.role = 'scanner'
        AND scanner_accounts.is_active = true
    )
  );
```

### RLS Policies for `scanner_accounts`

```sql
-- Policy: Admins have full access
CREATE POLICY "Admins have full access to scanner_accounts"
  ON scanner_accounts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scanner_accounts sa
      WHERE sa.user_id = auth.uid()
        AND sa.role = 'admin'
        AND sa.is_active = true
    )
  );

-- Policy: Scanners can read their own account
CREATE POLICY "Scanners can read their own account"
  ON scanner_accounts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Scanners can update their own last_login_at
CREATE POLICY "Scanners can update their own last_login"
  ON scanner_accounts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### RLS Policies for `attendance_records`

```sql
-- Policy: Admins have full access
CREATE POLICY "Admins have full access to attendance_records"
  ON attendance_records
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scanner_accounts
      WHERE scanner_accounts.user_id = auth.uid()
        AND scanner_accounts.role = 'admin'
        AND scanner_accounts.is_active = true
    )
  );

-- Policy: Scanners can insert attendance records
CREATE POLICY "Scanners can insert attendance_records"
  ON attendance_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scanner_accounts
      WHERE scanner_accounts.user_id = auth.uid()
        AND scanner_accounts.is_active = true
        AND scanner_accounts.id = scanner_id
    )
  );

-- Policy: Scanners can read their own scan records
CREATE POLICY "Scanners can read their own attendance_records"
  ON attendance_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scanner_accounts
      WHERE scanner_accounts.user_id = auth.uid()
        AND scanner_accounts.is_active = true
        AND scanner_accounts.id = scanner_id
    )
  );
```

---

## Database Functions

### 1. Check Daily Attendance Status

**Purpose**: Check if employee has already scanned today

```sql
CREATE OR REPLACE FUNCTION check_daily_attendance(
  p_employee_phone VARCHAR(15),
  p_scan_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  has_scanned BOOLEAN,
  scan_count INTEGER,
  last_scan_time TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) > 0 AS has_scanned,
    COUNT(*)::INTEGER AS scan_count,
    MAX(scan_timestamp) AS last_scan_time
  FROM attendance_records
  WHERE employee_phone = p_employee_phone
    AND scan_date = p_scan_date
    AND status = 'success';
END;
$$ LANGUAGE plpgsql STABLE;
```

### 2. Get Daily Attendance Report

**Purpose**: Retrieve attendance statistics for a specific date

```sql
CREATE OR REPLACE FUNCTION get_daily_attendance_report(
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  total_employees BIGINT,
  total_scanned BIGINT,
  total_success BIGINT,
  total_duplicate BIGINT,
  total_invalid BIGINT,
  attendance_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM employees WHERE is_active = true) AS total_employees,
    COUNT(DISTINCT employee_phone) AS total_scanned,
    COUNT(*) FILTER (WHERE status = 'success') AS total_success,
    COUNT(*) FILTER (WHERE status = 'duplicate') AS total_duplicate,
    COUNT(*) FILTER (WHERE status = 'invalid') AS total_invalid,
    ROUND(
      (COUNT(DISTINCT employee_phone)::NUMERIC /
       NULLIF((SELECT COUNT(*) FROM employees WHERE is_active = true), 0)) * 100,
      2
    ) AS attendance_percentage
  FROM attendance_records
  WHERE scan_date = p_date;
END;
$$ LANGUAGE plpgsql STABLE;
```

### 3. Record Attendance Scan

**Purpose**: Centralized function to record and validate scan

```sql
CREATE OR REPLACE FUNCTION record_attendance_scan(
  p_employee_phone VARCHAR(15),
  p_scanner_id UUID,
  p_qr_code TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  status VARCHAR(20),
  message TEXT,
  employee_name VARCHAR(255)
) AS $$
DECLARE
  v_employee RECORD;
  v_has_scanned BOOLEAN;
  v_status VARCHAR(20);
  v_message TEXT;
BEGIN
  -- Check if employee exists and get details
  SELECT * INTO v_employee
  FROM employees
  WHERE phone = p_employee_phone;

  -- Employee not found
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'invalid'::VARCHAR(20), 'Employee not found', NULL::VARCHAR(255);
    RETURN;
  END IF;

  -- Validate QR code
  IF v_employee.qr_code != p_qr_code THEN
    INSERT INTO attendance_records (employee_phone, scanner_id, status, validation_message)
    VALUES (p_employee_phone, p_scanner_id, 'invalid', 'Invalid QR code');

    RETURN QUERY SELECT false, 'invalid'::VARCHAR(20), 'Invalid QR code', v_employee.name;
    RETURN;
  END IF;

  -- Check if employee is active
  IF NOT v_employee.is_active THEN
    INSERT INTO attendance_records (employee_phone, scanner_id, status, validation_message)
    VALUES (p_employee_phone, p_scanner_id, 'inactive', 'Employee account is inactive');

    RETURN QUERY SELECT false, 'inactive'::VARCHAR(20), 'Employee account is inactive', v_employee.name;
    RETURN;
  END IF;

  -- Check if already scanned today
  SELECT has_scanned INTO v_has_scanned
  FROM check_daily_attendance(p_employee_phone, CURRENT_DATE);

  IF v_has_scanned THEN
    INSERT INTO attendance_records (employee_phone, scanner_id, status, validation_message)
    VALUES (p_employee_phone, p_scanner_id, 'duplicate', 'Already scanned today');

    RETURN QUERY SELECT false, 'duplicate'::VARCHAR(20), 'Already scanned today', v_employee.name;
    RETURN;
  END IF;

  -- Record successful scan
  INSERT INTO attendance_records (employee_phone, scanner_id, status, validation_message)
  VALUES (p_employee_phone, p_scanner_id, 'success', 'Attendance recorded successfully');

  RETURN QUERY SELECT true, 'success'::VARCHAR(20), 'Attendance recorded successfully', v_employee.name;
  RETURN;
END;
$$ LANGUAGE plpgsql;
```

---

## Data Migration Considerations

### Initial Data Seeding

```sql
-- Create default admin account (manual step after Supabase Auth user creation)
-- Assuming admin user created in Supabase Auth with id: 'ADMIN_USER_UUID'
INSERT INTO scanner_accounts (username, user_id, role, is_active)
VALUES ('admin', 'ADMIN_USER_UUID', 'admin', true);

-- Sample employee data (for testing)
-- Note: QR codes should be generated by application
INSERT INTO employees (phone, name, department, gender, qr_code, is_active)
VALUES
  ('1234567890', 'John Doe', 'Engineering', 'Male', 'GENERATED_QR_CODE_1', true),
  ('0987654321', 'Jane Smith', 'HR', 'Female', 'GENERATED_QR_CODE_2', true);
```

### Database Backup Strategy

1. **Supabase Automatic Backups**: Enabled by default (retention depends on plan)
2. **Manual Exports**: Regular CSV/JSON exports for critical tables
3. **Point-in-Time Recovery**: Available through Supabase dashboard

---

## Performance Considerations

1. **Indexing Strategy**: All foreign keys and frequently queried columns indexed
2. **Partitioning** (Future): Consider partitioning `attendance_records` by date if data grows large
3. **Materialized Views** (Future): For complex reporting queries
4. **Connection Pooling**: Managed by Supabase
5. **Query Optimization**: Use EXPLAIN ANALYZE for slow queries

---

## Database Size Estimates

### Assumptions
- 500 employees
- 10 scanners
- 365 days/year
- 80% daily attendance rate

### Storage Estimates
- **employees**: 500 rows × ~500 bytes = ~250 KB
- **scanner_accounts**: 10 rows × ~200 bytes = ~2 KB
- **attendance_records**: 500 × 0.8 × 365 = 146,000 rows/year
  - 146,000 rows × ~300 bytes = ~44 MB/year

**Total Year 1**: ~45 MB (negligible for PostgreSQL)

---

## Database Constraints Summary

| Constraint Type | Table | Description |
|----------------|-------|-------------|
| PRIMARY KEY | employees | phone |
| UNIQUE | employees | qr_code |
| CHECK | employees | gender IN ('Male', 'Female', 'Other') |
| PRIMARY KEY | scanner_accounts | id |
| UNIQUE | scanner_accounts | username, user_id |
| FOREIGN KEY | scanner_accounts | user_id → auth.users(id) |
| CHECK | scanner_accounts | role IN ('admin', 'scanner') |
| PRIMARY KEY | attendance_records | id |
| FOREIGN KEY | attendance_records | employee_phone → employees(phone) |
| FOREIGN KEY | attendance_records | scanner_id → scanner_accounts(id) |
| CHECK | attendance_records | status IN ('success', 'duplicate', 'invalid', 'inactive') |
