# Quick Start Guide - Database Setup

This guide will help you set up the Supabase database for the Breakfast Counter System.

## Prerequisites

- Supabase account (sign up at https://supabase.com)
- Access to Supabase SQL Editor

## Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in:
   - **Name**: breakfast-counter-system
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your location
4. Click "Create new project"
5. Wait for project to be ready (~2 minutes)

## Step 2: Get API Credentials

1. Go to **Settings** → **API**
2. Copy these values to your `.env.local`:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public** key → `VITE_SUPABASE_ANON_KEY`
https://tztgrttjuawbqvwzteae.supabase.co
## Step 3: Create Database Tables

Navigate to **SQL Editor** in Supabase dashboard and run these scripts in order:

### A. Create Employees Table

```sql
-- Create employees table
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

-- Create indexes
CREATE UNIQUE INDEX idx_employees_phone ON employees(phone);
CREATE UNIQUE INDEX idx_employees_qr_code ON employees(qr_code);
CREATE INDEX idx_employees_is_active ON employees(is_active);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_name ON employees(LOWER(name));

-- Create trigger for updated_at
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

### B. Create Scanner Accounts Table

```sql
-- Create scanner_accounts table
CREATE TABLE scanner_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'scanner')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ NULL
);

-- Create indexes
CREATE UNIQUE INDEX idx_scanner_accounts_id ON scanner_accounts(id);
CREATE UNIQUE INDEX idx_scanner_accounts_username ON scanner_accounts(username);
CREATE UNIQUE INDEX idx_scanner_accounts_user_id ON scanner_accounts(user_id);
CREATE INDEX idx_scanner_accounts_role_active ON scanner_accounts(role, is_active);
```

### C. Create Attendance Records Table

```sql
-- Create attendance_records table
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_phone VARCHAR(15) NOT NULL REFERENCES employees(phone),
  scanner_id UUID NOT NULL REFERENCES scanner_accounts(id),
  scan_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'duplicate', 'invalid', 'inactive')),
  validation_message TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_attendance_employee_phone ON attendance_records(employee_phone);
CREATE INDEX idx_attendance_scanner_id ON attendance_records(scanner_id);
CREATE INDEX idx_attendance_scan_date ON attendance_records(scan_date);
CREATE INDEX idx_attendance_status ON attendance_records(status);
CREATE INDEX idx_attendance_daily_lookup ON attendance_records(employee_phone, scan_date, status);
```

## Step 4: Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE scanner_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Employees policies
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
CREATE POLICY "Admins can manage scanner accounts"
ON scanner_accounts FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM scanner_accounts sa
    WHERE sa.user_id = auth.uid()
    AND sa.role = 'admin'
    AND sa.is_active = true
  )
);

CREATE POLICY "Users can read their own scanner account"
ON scanner_accounts FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Attendance records policies
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
```

## Step 5: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. **Disable** email confirmation (internal system):
   - Go to **Authentication** → **Email Templates**
   - Turn off "Enable email confirmations"
4. Set password requirements:
   - Go to **Authentication** → **Settings**
   - Minimum password length: 8

## Step 6: Create First Admin User

### Method 1: Via Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Fill in:
   - **Email**: admin@breakfast-system.local
   - **Password**: (create a strong password)
   - **Auto Confirm User**: Yes
4. Click **Create user**
5. Copy the User ID

Now link to scanner_accounts:

```sql
-- Replace 'USER_ID_HERE' with the actual UUID from step 4
INSERT INTO scanner_accounts (user_id, username, role, is_active)
VALUES (
  'USER_ID_HERE',
  'admin',
  'admin',
  true
);
```

### Method 2: Via SQL (Alternative)

```sql
-- Note: This requires admin privileges
-- Signup a user first, then run:
INSERT INTO scanner_accounts (user_id, username, role, is_active)
SELECT 
  id,
  'admin',
  'admin',
  true
FROM auth.users
WHERE email = 'admin@breakfast-system.local';
```

## Step 7: Test Connection

1. Update your `.env.local` file:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_QR_SALT=your-secret-salt-min-32-chars
```

2. Generate QR salt:
```bash
openssl rand -base64 32
```

3. Start the app:
```bash
bun run dev
```

4. Login with:
   - **Username**: admin
   - **Password**: (password you created)

## Step 8: Create Test Employee (Optional)

```sql
-- Insert a test employee
-- Note: QR code must be generated by the app for correct hash
INSERT INTO employees (phone, name, department, gender, qr_code, is_active)
VALUES (
  '1234567890',
  'Test Employee',
  'Engineering',
  'Male',
  'temporary-qr-code-will-be-regenerated',
  true
);
```

Then use the app's "Regenerate QR Code" feature to generate the correct QR code.

## Verification Checklist

- [ ] Supabase project created
- [ ] API credentials copied to .env.local
- [ ] All 3 tables created
- [ ] All indexes created
- [ ] RLS enabled on all tables
- [ ] RLS policies created
- [ ] Email authentication configured
- [ ] Admin user created
- [ ] Admin account linked in scanner_accounts
- [ ] App connects successfully
- [ ] Can login as admin

## Troubleshooting

### Can't login
- Verify user exists in auth.users
- Verify scanner_accounts entry exists with correct user_id
- Check username matches
- Ensure is_active = true

### RLS errors
- Verify policies are created correctly
- Check user has appropriate role
- Ensure user_id matches between auth.users and scanner_accounts

### Connection errors
- Verify SUPABASE_URL is correct
- Verify SUPABASE_ANON_KEY is the anon/public key
- Check network connection

## Next Steps

Once database is set up:
1. Login to the app
2. Create employees via the UI
3. Download/print employee QR codes
4. Create scanner accounts
5. Test scanning functionality

---

**Need Help?** Refer to `/docs/03-DATABASE-SCHEMA.md` for complete schema documentation.
