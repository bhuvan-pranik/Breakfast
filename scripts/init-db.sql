-- Database Initialization Script for Breakfast Counter System
-- Run this in Supabase SQL Editor to create all tables and policies

-- ============================================
-- STEP 1: Create Tables
-- ============================================

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  phone VARCHAR(15) PRIMARY KEY,
  name VARCHAR(255),
  department VARCHAR(100),
  employee_id VARCHAR(50),
  email VARCHAR(255),
  qr_code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create scanner_accounts table
CREATE TABLE IF NOT EXISTS scanner_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'scanner')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ NULL
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_phone VARCHAR(15) NOT NULL REFERENCES employees(phone),
  scanner_id UUID NOT NULL REFERENCES scanner_accounts(id),
  scan_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'duplicate', 'invalid', 'inactive')),
  validation_message TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- STEP 2: Create Indexes
-- ============================================

-- Employees indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_phone ON employees(phone);
CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_qr_code ON employees(qr_code);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id) WHERE employee_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(LOWER(email)) WHERE email IS NOT NULL;

-- Scanner accounts indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_scanner_accounts_id ON scanner_accounts(id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_scanner_accounts_username ON scanner_accounts(username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_scanner_accounts_user_id ON scanner_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_scanner_accounts_role_active ON scanner_accounts(role, is_active);

-- Attendance records indexes
CREATE INDEX IF NOT EXISTS idx_attendance_employee_phone ON attendance_records(employee_phone);
CREATE INDEX IF NOT EXISTS idx_attendance_scanner_id ON attendance_records(scanner_id);
CREATE INDEX IF NOT EXISTS idx_attendance_scan_date ON attendance_records(scan_date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_records(status);
CREATE INDEX IF NOT EXISTS idx_attendance_daily_lookup ON attendance_records(employee_phone, scan_date, status);

-- ============================================
-- STEP 3: Create Triggers
-- ============================================

-- Trigger to auto-update updated_at on employees
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 4: Enable RLS
-- ============================================

ALTER TABLE IF EXISTS employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS scanner_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS attendance_records ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: Create RLS Policies
-- ============================================

-- Employees policies
DROP POLICY IF EXISTS "Admins can do anything with employees" ON employees;
CREATE POLICY "Admins can do anything with employees"
  ON employees FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scanner_accounts
      WHERE scanner_accounts.user_id = auth.uid()
      AND scanner_accounts.role = 'admin'
      AND scanner_accounts.is_active = true
    )
  );

DROP POLICY IF EXISTS "Scanners can read active employees" ON employees;
CREATE POLICY "Scanners can read active employees"
  ON employees FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM scanner_accounts
      WHERE scanner_accounts.user_id = auth.uid()
      AND scanner_accounts.is_active = true
    )
  );

-- Scanner accounts policies
DROP POLICY IF EXISTS "Allow public username lookup" ON scanner_accounts;
CREATE POLICY "Allow public username lookup"
  ON scanner_accounts FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own login time" ON scanner_accounts;
CREATE POLICY "Users can update own login time"
  ON scanner_accounts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Attendance records policies
DROP POLICY IF EXISTS "Authenticated users can insert attendance" ON attendance_records;
CREATE POLICY "Authenticated users can insert attendance"
  ON attendance_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scanner_accounts
      WHERE scanner_accounts.id = scanner_id
      AND scanner_accounts.user_id = auth.uid()
      AND scanner_accounts.is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can read all attendance" ON attendance_records;
CREATE POLICY "Admins can read all attendance"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scanner_accounts
      WHERE scanner_accounts.user_id = auth.uid()
      AND scanner_accounts.role = 'admin'
      AND scanner_accounts.is_active = true
    )
  );

DROP POLICY IF EXISTS "Scanners can read their own scans" ON attendance_records;
CREATE POLICY "Scanners can read their own scans"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scanner_accounts
      WHERE scanner_accounts.id = scanner_id
      AND scanner_accounts.user_id = auth.uid()
      AND scanner_accounts.is_active = true
    )
  );

-- ============================================
-- STEP 6: Create Admin User (Optional)
-- ============================================

-- Method: Create user first via Supabase Dashboard (Authentication → Users)
-- Then run this to link the user to scanner_accounts:

-- INSERT INTO scanner_accounts (user_id, username, role, is_active)
-- VALUES (
--   'USER_ID_FROM_SUPABASE_AUTH',
--   'admin',
--   'admin',
--   true
-- );

-- ============================================
-- Verification
-- ============================================

-- Check if tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check if RLS is enabled
SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('employees', 'scanner_accounts', 'attendance_records');
