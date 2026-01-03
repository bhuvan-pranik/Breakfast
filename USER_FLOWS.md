# User Flows - Breakfast Counter QR System

**Version:** 1.0.0
**Date:** January 3, 2026

---

## Table of Contents

1. [Admin User Flows](#1-admin-user-flows)
2. [Scanner User Flows](#2-scanner-user-flows)
3. [Employee Interaction Flows](#3-employee-interaction-flows)
4. [Error & Edge Case Flows](#4-error--edge-case-flows)

---

## 1. Admin User Flows

### 1.1 Admin Login Flow

```
START: User navigates to application
  ↓
[Login Page Displayed]
  ↓
User enters username + password
  ↓
User clicks "Login" button
  ↓
<Validation>
  ├─ Invalid credentials
  │    ↓
  │  Show error toast: "Invalid username or password"
  │    ↓
  │  Return to login form
  │
  └─ Valid credentials
       ↓
     <Check user role>
       ├─ Role: Admin
       │    ↓
       │  Redirect to /admin/dashboard
       │    ↓
       │  END (Admin Dashboard)
       │
       └─ Role: Scanner
            ↓
          Redirect to /scanner
            ↓
          END (Scanner View)
```

**Key Points**:
- Single login page for both roles
- Role-based redirection after successful authentication
- Error handling: invalid credentials show toast
- Remember session (Supabase handles this)

---

### 1.2 Create New Employee Flow

```
START: Admin on Employees List page
  ↓
Admin clicks "Add Employee" button
  ↓
[Employee Form Modal opens]
  ↓
Form fields displayed (empty):
  - Phone number *
  - Name *
  - Department *
  - Gender *
  ↓
Admin fills form fields
  ↓
<Client-side validation on blur>
  - Phone: 10 digits, numeric
  - Name: min 2 chars
  - Department: selected
  - Gender: selected
  ↓
Admin clicks "Save" button
  ↓
<Final validation>
  ├─ Validation errors exist
  │    ↓
  │  Show error messages below fields
  │  Focus first error field
  │  Keep modal open
  │
  └─ All fields valid
       ↓
     Submit to Supabase
       ↓
     <Backend processing>
       ├─ Phone number already exists
       │    ↓
       │  Return error: "Phone number already registered"
       │    ↓
       │  Show error toast
       │  Keep modal open
       │
       └─ Success
            ↓
          Generate QR code (backend)
          Insert employee record (active by default)
            ↓
          Return success + employee data
            ↓
          Close modal
          Refresh employee list (new employee appears)
          Show success toast: "Employee added successfully"
            ↓
          END
```

**Key Points**:
- Modal-based form (doesn't leave page)
- Real-time validation on field blur
- QR code auto-generated on backend
- Employee active by default
- Success feedback: toast + updated list

---

### 1.3 Edit Employee Flow

```
START: Admin on Employees List page
  ↓
Admin clicks "Edit" action on employee row
  ↓
[Employee Form Modal opens]
  ↓
Form fields pre-filled with employee data:
  - Phone number (read-only)
  - Name
  - Department
  - Gender
  - Active status (checkbox)
  ↓
Admin modifies fields
  ↓
Admin clicks "Save" button
  ↓
<Validation> (same as create)
  ↓
Submit to Supabase (UPDATE)
  ↓
<Backend processing>
  ├─ Error (e.g., network)
  │    ↓
  │  Show error toast
  │  Keep modal open
  │
  └─ Success
       ↓
     Update employee record
       ↓
     Close modal
     Refresh employee list (changes reflected)
     Show success toast: "Employee updated successfully"
       ↓
     END
```

**Key Points**:
- Phone number read-only (unique identifier, cannot change)
- Active status editable here
- Pre-filled form data
- Update operation, not create

---

### 1.4 Deactivate/Activate Employee Flow

```
START: Admin on Employees List page
  ↓
Admin clicks "Deactivate" action on active employee
  (or "Activate" on inactive employee)
  ↓
[Confirmation Dialog opens]
  Title: "Deactivate Employee?"
  Message: "John Doe will not be able to scan their QR code."
  Actions: [Cancel] [Deactivate]
  ↓
<User decision>
  ├─ Click "Cancel"
  │    ↓
  │  Close dialog
  │  No changes
  │  END
  │
  └─ Click "Deactivate"
       ↓
     Submit to Supabase (UPDATE active = false)
       ↓
     <Backend processing>
       ├─ Error
       │    ↓
       │  Show error toast
       │  Close dialog
       │
       └─ Success
            ↓
          Update employee record (active = false)
            ↓
          Close dialog
          Refresh employee list (status badge changes to "Inactive")
          Show success toast: "Employee deactivated"
            ↓
          END
```

**Key Points**:
- Confirmation required (destructive-ish action)
- Soft delete (active flag, not permanent deletion)
- Badge updates to "Inactive" (gray)
- Action label changes to "Activate" for inactive employees

---

### 1.5 Bulk Upload Employees (CSV) Flow

```
START: Admin on Employees List page
  ↓
Admin clicks "Bulk Upload" button
  ↓
[Bulk Upload Modal opens]
  ↓
Modal displays:
  - File upload dropzone
  - Instructions: "Upload CSV file (phone, name, department, gender)"
  - Download template link
  ↓
Admin drags CSV file or clicks to select
  ↓
<File validation>
  ├─ Invalid file type (not .csv)
  │    ↓
  │  Show error: "Please upload a CSV file"
  │  Reject file
  │
  └─ Valid CSV file
       ↓
     Display file name + size
     Parse CSV (client-side preview)
       ↓
     <CSV parsing>
       ├─ Parse error (malformed CSV)
       │    ↓
       │  Show error: "Invalid CSV format"
       │  Allow user to upload different file
       │
       └─ Parse success
            ↓
          Display preview table (first 5 rows)
          Show total row count: "50 employees will be imported"
            ↓
          Admin reviews preview
            ↓
          Admin clicks "Import" button
            ↓
          Show progress bar (0%)
          Submit to backend API
            ↓
          <Backend processing>
            ├─ Validation errors (some rows invalid)
            │    ↓
            │  Backend validates each row
            │  Returns:
            │    - Success count: 45
            │    - Error list: [{row: 3, error: "Invalid phone"}, ...]
            │    ↓
            │  Update progress bar (100%)
            │  Display results:
            │    - Success: "45 employees imported"
            │    - Errors: List of row-level errors
            │  Show "Download Error Report" button
            │    ↓
            │  [Close] button enabled
            │    ↓
            │  Admin reviews, clicks "Close"
            │    ↓
            │  Close modal
            │  Refresh employee list (new employees appear)
            │  Show success toast: "45 employees imported, 5 failed"
            │    ↓
            │  END
            │
            └─ Complete success (all rows valid)
                 ↓
               Import all employees
               Generate QR codes (backend)
                 ↓
               Update progress bar (100%)
               Display success: "50 employees imported successfully"
                 ↓
               Auto-close modal after 2 seconds (or [Close] button)
                 ↓
               Refresh employee list
               Show success toast: "50 employees imported"
                 ↓
               END
```

**Key Points**:
- CSV format: `phone,name,department,gender`
- Client-side preview before import
- Backend validates each row
- Partial success supported (some succeed, some fail)
- Error reporting: row number + error message
- Progress indicator during upload
- Template download available

**CSV Template Example**:
```csv
phone,name,department,gender
9876543210,John Doe,Engineering,Male
9876543211,Jane Smith,HR,Female
9876543212,Bob Johnson,Marketing,Male
```

---

### 1.6 Regenerate QR Code Flow

```
START: Admin on Employees List page
  ↓
Admin clicks "Regenerate QR" action on employee row
  ↓
[Confirmation Dialog opens]
  Title: "Regenerate QR Code?"
  Message: "This will create a new QR code. The old QR code will no longer work."
  Actions: [Cancel] [Regenerate]
  ↓
<User decision>
  ├─ Click "Cancel"
  │    ↓
  │  Close dialog
  │  No changes
  │  END
  │
  └─ Click "Regenerate"
       ↓
     Submit to backend API
       ↓
     Backend generates new QR code string
     (new hash based on phone + new salt + timestamp)
       ↓
     Update employee record with new QR code
       ↓
     Return new QR code
       ↓
     Close confirmation dialog
     Open QR Code Display Modal
       ↓
     Display new QR code (large, 256px)
     Employee name below
     [Download] [Print] [Close] buttons
       ↓
     Show success toast: "QR code regenerated"
       ↓
     END (admin can download/print new QR)
```

**Key Points**:
- Confirmation required (invalidates old QR)
- New QR code generated (different hash)
- Automatic display of new QR code
- Old QR code immediately invalid

---

### 1.7 Create Scanner Account Flow

```
START: Admin on Scanners List page
  ↓
Admin clicks "Create Scanner Account" button
  ↓
[Scanner Account Form Modal opens]
  ↓
Form fields displayed (empty):
  - Username *
  - Name (optional, display name)
  - Password *
  - Confirm Password *
  ↓
Admin fills form fields
  ↓
<Client-side validation>
  - Username: min 3 chars, alphanumeric + underscore
  - Password: min 8 chars, 1 uppercase, 1 number
  - Confirm password: matches password
  ↓
Admin clicks "Create Account" button
  ↓
<Final validation>
  ↓
Submit to Supabase Auth
  ↓
<Backend processing>
  ├─ Username already exists
  │    ↓
  │  Return error: "Username already taken"
  │  Show error toast
  │  Keep modal open
  │
  └─ Success
       ↓
     Create scanner account (role: scanner)
     Insert scanner record in database
       ↓
     Close modal
     Refresh scanners list (new scanner appears)
     Show success toast: "Scanner account created"
       ↓
     Optional: Display password to admin one time
     (Admin should save/share with scanner user)
       ↓
     END
```

**Key Points**:
- Scanner role assigned on creation
- Password requirements enforced
- Username must be unique
- Optional: Show password to admin for sharing
- Scanner can login immediately

---

### 1.8 View Daily Attendance Report (Phase II)

```
START: Admin on Reports page
  ↓
Default view: Today's attendance
  ↓
Display:
  - Total scans today: 45
  - Unique employees: 45 (or fewer if duplicates attempted)
  - Time range: earliest scan to latest scan
  - Data table: Employee name, Phone, Scan time
  ↓
Admin can:
  - Export to CSV
  - Change date (date picker)
  - Filter by department
  - Search employee name
  ↓
Admin selects actions (e.g., export)
  ↓
Download CSV file: "attendance-2026-01-03.csv"
  ↓
END
```

**Key Points**:
- Default to today's date
- Shows all successful scans
- Failed scans not shown (or separate section)
- Export functionality
- Filterable and searchable

---

## 2. Scanner User Flows

### 2.1 Scanner Login Flow

```
START: Scanner user navigates to application
  ↓
[Login Page Displayed]
  ↓
Scanner enters username + password (provided by admin)
  ↓
Scanner clicks "Login" button
  ↓
<Validation>
  ├─ Invalid credentials
  │    ↓
  │  Show error toast: "Invalid username or password"
  │  Return to login form
  │
  └─ Valid credentials
       ↓
     <Check user role>
       ├─ Role: Admin
       │    ↓
       │  Redirect to /admin/dashboard
       │
       └─ Role: Scanner
            ↓
          Redirect to /scanner
            ↓
          END (Scanner View loaded)
```

**Key Points**:
- Same login page as admin
- Role-based redirection
- Scanner lands directly in scanning interface

---

### 2.2 Scan QR Code - Success Flow

```
START: Scanner user on Scanner View
  ↓
[QR Scanner initialized]
  ↓
Camera permission requested (if first time)
  ↓
<Permission result>
  ├─ Permission denied
  │    ↓
  │  Show error message: "Camera access required to scan QR codes"
  │  Show "Request Permission Again" button
  │  END (stuck until permission granted)
  │
  └─ Permission granted
       ↓
     Camera preview displayed (fullscreen)
     Scan guide overlay shown
     Text: "Position QR code within frame"
       ↓
     Scanner ready, waiting for QR code
       ↓
     Employee approaches, shows QR code
       ↓
     QR code enters camera view
       ↓
     <QR detection>
       ├─ QR detected and decoded
       │    ↓
       │  Extract QR code string
       │  Show scanning indicator (visual feedback)
       │    ↓
       │  Send QR string to backend API
       │  (POST /api/scan with QR code data)
       │    ↓
       │  <Backend validation>
       │    ├─ QR code valid
       │    │  Employee found
       │    │  Employee active
       │    │  Not scanned today
       │    │    ↓
       │    │  Create scan record (timestamp)
       │    │  Return success + employee data
       │    │    ↓
       │    │  [Scanner receives success response]
       │    │    ↓
       │    │  Haptic feedback (vibration)
       │    │  Optional: Audio beep (success sound)
       │    │    ↓
       │    │  Display ScanResultDisplay component:
       │    │    - Large green checkmark icon
       │    │    - Employee name: "John Doe"
       │    │    - Message: "Scan successful!"
       │    │    - Timestamp
       │    │    ↓
       │    │  Auto-dismiss after 3 seconds
       │    │  (or user taps "Scan Next")
       │    │    ↓
       │    │  Return to scanner ready state
       │    │    ↓
       │    │  END (ready for next scan)
       │    │
       │    └─ Validation error (see 2.3 Error Flows)
       │
       └─ No QR detected / scanning
            ↓
          Continue scanning (loop back)
```

**Key Points**:
- Fullscreen camera interface
- Real-time QR detection
- Immediate feedback (haptic + visual)
- Employee name displayed on success
- Auto-return to scanning (3 seconds)
- Backend validates all rules

---

### 2.3 Scan QR Code - Error Flows

#### 2.3.1 Invalid QR Code

```
QR code scanned
  ↓
Backend receives QR string
  ↓
<Validation>
  QR code format invalid OR
  QR code not found in database
  ↓
Return error: "Invalid QR code"
  ↓
[Scanner receives error response]
  ↓
Display ScanResultDisplay component:
  - Large red X icon
  - Message: "Invalid QR code"
  - Sub-message: "Please contact admin"
  ↓
Auto-dismiss after 3 seconds
  ↓
Return to scanner ready state
```

#### 2.3.2 Employee Inactive

```
QR code scanned
  ↓
Backend validates QR code (valid)
  ↓
Find employee by QR code
  ↓
<Check employee status>
  Employee.active = false
  ↓
Return error: "Employee inactive"
  ↓
[Scanner receives error response]
  ↓
Display ScanResultDisplay component:
  - Large red X icon
  - Employee name: "John Doe" (optional, or hide for privacy)
  - Message: "Employee account inactive"
  - Sub-message: "Please contact admin"
  ↓
Auto-dismiss after 3 seconds
  ↓
Return to scanner ready state
```

#### 2.3.3 Already Scanned Today

```
QR code scanned
  ↓
Backend validates QR code (valid)
  ↓
Find employee (active)
  ↓
<Check scan history>
  Scan record exists for today (same date)
  ↓
Return error: "Already scanned today"
  ↓
[Scanner receives error response]
  ↓
Display ScanResultDisplay component:
  - Large red X icon (or warning icon, amber)
  - Employee name: "John Doe"
  - Message: "Already scanned today"
  - Sub-message: "Scanned at 8:30 AM"
  ↓
Auto-dismiss after 3 seconds
  ↓
Return to scanner ready state
```

**Key Points**:
- All errors show employee name (for staff awareness)
- Clear error messages
- Auto-dismiss to keep flow moving
- Scanner staff cannot override errors (backend enforced)

---

### 2.4 Scanner Logout Flow

```
START: Scanner user on Scanner View
  ↓
Scanner clicks "Logout" button (top-right)
  ↓
<Optional: Confirmation dialog>
  "Are you sure you want to logout?"
  [Cancel] [Logout]
  ↓
Confirm logout
  ↓
Supabase sign out
  ↓
Redirect to /login
  ↓
END
```

**Key Points**:
- Simple logout button
- Optional confirmation (can be skipped if single-user device)
- Clears session
- Returns to login page

---

## 3. Employee Interaction Flows

### 3.1 Employee Receives QR Code

```
START: Admin creates employee account
  ↓
QR code generated (backend)
  ↓
Admin downloads/prints QR code
  ↓
Admin distributes QR code to employee
  (Physical printout or digital image)
  ↓
Employee receives QR code
  ↓
Employee can:
  - Print and laminate (recommended)
  - Save on phone (screenshot)
  - Keep digital copy
  ↓
END (employee ready to use QR code)
```

**Key Points**:
- QR code is permanent (unless regenerated)
- Employee doesn't need app/account
- QR code works from print or phone screen

---

### 3.2 Employee Uses QR Code at Breakfast Counter

```
START: Employee arrives at breakfast counter
  ↓
Scanner staff ready at scanner device
  ↓
Employee shows QR code:
  - Physical card/printout
  - OR phone screen displaying QR code
  ↓
Scanner staff points camera at QR code
  ↓
<Scanner detects QR code> (see 2.2 Success Flow or 2.3 Error Flows)
  ↓
Scanner staff sees result:
  - Success: "John Doe - Scan successful!"
  - Error: "Already scanned today" or "Invalid QR code"
  ↓
Scanner staff communicates result to employee
  ↓
<Outcome>
  ├─ Success
  │    ↓
  │  Employee proceeds to get breakfast
  │  END
  │
  └─ Error
       ↓
     Employee does NOT get breakfast
     (or staff follows manual process/escalation)
       ↓
     END
```

**Key Points**:
- Employee shows QR code (passive action)
- Scanner staff operates scanner
- No employee interaction with system required
- Scanner staff communicates result verbally

---

## 4. Error & Edge Case Flows

### 4.1 Network Error During Scan

```
QR code scanned
  ↓
Send to backend API
  ↓
<Network error>
  - Request timeout
  - Server unreachable
  - No internet connection
  ↓
[Scanner receives error or timeout]
  ↓
Display error:
  - Red X icon
  - Message: "Network error"
  - Sub-message: "Please check connection and try again"
  ↓
Manual dismiss (no auto-dismiss, staff needs to acknowledge)
  ↓
Scanner staff can retry:
  - Ask employee to show QR code again
  - Scan again
  ↓
<Retry> (loop back to scan flow)
```

**Key Points**:
- Network errors don't allow scan (always online requirement)
- Staff must retry
- No offline mode in MVP

---

### 4.2 Camera Permission Revoked Mid-Session

```
Scanner user on Scanner View (camera active)
  ↓
<User or system revokes camera permission>
  ↓
Camera preview stops
  ↓
Display error:
  - "Camera access lost"
  - "Please grant camera permission and refresh page"
  ↓
[Request Permission] button shown
  ↓
Scanner staff clicks button
  ↓
Permission prompt appears
  ↓
<User decision>
  ├─ Grant permission
  │    ↓
  │  Refresh scanner (reinitialize camera)
  │  Return to ready state
  │
  └─ Deny permission
       ↓
     Stuck in error state (cannot scan)
       ↓
     Scanner staff must troubleshoot or use different device
```

---

### 4.3 Multiple Scanners - Concurrent Scans

```
Scenario: Two scanner devices operating simultaneously
  ↓
Employee A scans at Scanner 1 (8:00:00 AM)
Employee B scans at Scanner 2 (8:00:01 AM)
  ↓
Both requests sent to backend (nearly simultaneous)
  ↓
<Backend processing (database transaction)>
  ↓
Both scans succeed (if different employees)
  ↓
Each scanner shows success for their respective employee
  ↓
END (no conflict)
```

**Edge Case: Same Employee, Two Scanners**

```
Employee tries to scan at Scanner 1 AND Scanner 2
(attempting to scan twice within seconds)
  ↓
Scan 1 hits backend first (8:00:00.100 AM)
  ↓
Backend creates scan record
  ↓
Scan 1 returns success
  ↓
Scan 2 hits backend (8:00:00.300 AM)
  ↓
Backend checks: scan record already exists for today
  ↓
Scan 2 returns error: "Already scanned today"
  ↓
Scanner 1: Shows success
Scanner 2: Shows error (already scanned)
  ↓
END (database constraint prevents duplicate scans)
```

**Key Points**:
- Database constraint ensures one scan per employee per day
- Race condition handled by database (unique constraint or transaction isolation)
- Second scan fails gracefully

---

### 4.4 Session Timeout (Scanner Inactive)

```
Scanner user logged in
  ↓
No activity for extended period (e.g., 2 hours)
  ↓
<Session expires (Supabase auth)>
  ↓
Next scan attempt:
  ↓
API request fails (401 Unauthorized)
  ↓
Frontend detects unauthorized response
  ↓
Display message: "Session expired. Please login again."
  ↓
Auto-redirect to /login after 3 seconds
  ↓
Scanner user must login again
  ↓
END
```

**Key Points**:
- Session timeout handled by Supabase
- Automatic redirect to login
- No data loss (scan records already saved)

---

### 4.5 Admin Deletes Employee While QR Code In Use

```
Scenario: Employee has QR code, admin deletes employee account
  ↓
Employee tries to scan QR code
  ↓
Backend validates QR code
  ↓
<Check employee record>
  Employee not found (deleted)
  ↓
Return error: "Invalid QR code"
  ↓
Scanner shows error: "Invalid QR code"
  ↓
END (employee cannot scan)
```

**Alternative: Soft Delete (Recommended)**

```
Admin "deletes" employee (actually sets active = false)
  ↓
Employee tries to scan QR code
  ↓
Backend validates QR code
  ↓
Employee found, but active = false
  ↓
Return error: "Employee inactive"
  ↓
Scanner shows error: "Employee account inactive"
  ↓
END
```

**Key Points**:
- Soft delete preferred (preserves history)
- Hard delete makes QR code invalid immediately
- No orphaned QR codes

---

### 4.6 QR Code Print Quality Poor

```
Employee shows QR code (printed, faded/damaged)
  ↓
Scanner camera attempts to detect QR code
  ↓
<QR detection fails>
  - Low contrast
  - Damaged/torn
  - Dirty/smudged
  ↓
No QR code detected (continues scanning)
  ↓
Scanner staff sees no response (still scanning)
  ↓
Scanner staff can:
  - Adjust lighting (use torch button)
  - Clean QR code surface
  - Ask employee for alternative (digital on phone)
  - Manual lookup (Phase II: search employee by phone/name)
  ↓
<Retry with better conditions>
  ├─ QR detected successfully
  │    ↓
  │  Proceed with normal flow
  │
  └─ Still cannot detect
       ↓
     Escalate: Admin regenerates QR code
     Employee gets new QR code (print or digital)
       ↓
     END
```

**Key Points**:
- QR code detection reliability important
- Error correction level helps (Medium level)
- Fallback: manual lookup or regenerate QR

---

## Flow Diagrams Summary

### Admin Key Flows
1. Login → Dashboard
2. Dashboard → Manage Employees → Create/Edit/Deactivate
3. Dashboard → Manage Scanners → Create Scanner Account
4. Employees → Bulk Upload CSV → Import with Validation
5. Employees → Regenerate QR Code → New QR Generated

### Scanner Key Flows
1. Login → Scanner View
2. Scanner View → Scan QR Code → Success (Employee Name Displayed)
3. Scanner View → Scan QR Code → Error (Already Scanned/Invalid/Inactive)
4. Scanner View → Logout

### Employee Passive Flows
1. Receive QR Code → Use at Counter (Scanned by Staff)
2. QR Code → Success → Get Breakfast
3. QR Code → Error → Denied (Manual Escalation)

---

**End of User Flows Documentation**

This document provides comprehensive flow diagrams for all user interactions in the Breakfast Counter QR System. Use these flows as a guide during implementation and testing.
