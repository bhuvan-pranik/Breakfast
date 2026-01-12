-- Migration: Remove gender column and add employee_id and email columns
-- Date: 2026-01-04

-- Step 1: Add new columns to employees table (nullable by default)
ALTER TABLE employees 
ADD COLUMN employee_id VARCHAR(50),
ADD COLUMN email VARCHAR(255);

-- Step 2: Make name and department nullable if they aren't already
ALTER TABLE employees 
ALTER COLUMN name DROP NOT NULL,
ALTER COLUMN department DROP NOT NULL;

-- Step 3: Remove gender column
ALTER TABLE employees 
DROP COLUMN gender;

-- Step 4: Add indexes for performance
CREATE INDEX idx_employees_employee_id ON employees(employee_id) WHERE employee_id IS NOT NULL;
CREATE INDEX idx_employees_email ON employees(LOWER(email)) WHERE email IS NOT NULL;

-- Note: All columns except phone are now nullable
-- Phone remains the primary key and required field
