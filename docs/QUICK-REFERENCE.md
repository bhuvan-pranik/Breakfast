# Quick Reference Card

## Essential Commands

```bash
# Development
npm run dev                 # Start dev server (localhost:5173)
npm run build              # Build for production
npm run preview            # Preview production build

# Code Quality
npm run lint               # Run ESLint
npm run format             # Run Prettier
npm run type-check         # TypeScript type checking

# Testing
npm run test               # Run tests
npm run test:coverage      # Run tests with coverage
```

---

## Project Structure (Key Folders)

```
Breakfast-v3/
├── src/
│   ├── components/        # Reusable UI components
│   ├── composables/       # Composition API logic
│   ├── layouts/           # Page layouts
│   ├── router/            # Vue Router config
│   ├── services/          # API/service layer
│   ├── stores/            # Pinia state stores
│   ├── types/             # TypeScript types
│   ├── utils/             # Helper functions
│   └── views/             # Page components
├── docs/                  # Documentation
└── public/                # Static assets
```

---

## Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Vue | 3.4+ | UI Framework |
| TypeScript | 5.0+ | Type Safety |
| Vite | 5.0+ | Build Tool |
| Pinia | 2.1+ | State Management |
| Vue Router | 4.0+ | Routing |
| Supabase | Latest | Backend (Auth + DB) |
| qrcode | 1.5+ | QR Generation |
| html5-qrcode | 2.3+ | QR Scanning |

---

## Environment Variables

```env
# Required
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_QR_SALT=your-secret-salt-32-chars-min

# Optional
VITE_APP_NAME=Breakfast Counter System
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEBUG=true
```

---

## Database Tables

### employees
- **PK**: phone (VARCHAR)
- **Columns**: name, department, gender, qr_code, is_active
- **QR Code**: SHA-256(phone + name + salt)

### scanner_accounts
- **PK**: id (UUID)
- **Columns**: username, user_id (FK → auth.users), role, is_active
- **Roles**: 'admin' | 'scanner'

### attendance_records
- **PK**: id (UUID)
- **Columns**: employee_phone (FK), scanner_id (FK), scan_timestamp, scan_date, status
- **Statuses**: 'success' | 'duplicate' | 'invalid' | 'inactive'

---

## User Roles & Permissions

| Feature | Admin | Scanner |
|---------|:-----:|:-------:|
| Manage Employees | ✓ | ✗ |
| Manage Scanners | ✓ | ✗ |
| Scan QR Codes | ✓ | ✓ |
| View Reports | ✓ | ✗ |
| View Own History | ✓ | ✓ |

---

## Routes

### Public
- `/login` - Login page

### Admin Only
- `/admin` - Dashboard
- `/admin/employees` - Employee list
- `/admin/employees/create` - Create employee
- `/admin/employees/:phone` - Employee details
- `/admin/employees/:phone/edit` - Edit employee
- `/admin/scanners` - Scanner list
- `/admin/scanners/create` - Create scanner
- `/admin/reports` - Reports (Phase II)

### Admin & Scanner
- `/scanner` - QR scan interface
- `/scanner/history` - Scan history

---

## Key Composables

```typescript
// Authentication
const { login, logout, isAuthenticated, userRole } = useAuth()

// Validation
const { validate, errors, clearErrors } = useValidation()

// QR Scanner
const { startScanning, stopScanning, lastScan } = useQRScanner('element-id')

// Employees
const { employees, fetchEmployees, createEmployee } = useEmployees()

// Notifications
const { showSuccess, showError } = useNotification()
```

---

## Pinia Stores

```typescript
// Auth Store
import { useAuthStore } from '@/stores'
const authStore = useAuthStore()
authStore.login(username, password)

// Employee Store
import { useEmployeeStore } from '@/stores'
const employeeStore = useEmployeeStore()
await employeeStore.fetchEmployees()

// Attendance Store
import { useAttendanceStore } from '@/stores'
const attendanceStore = useAttendanceStore()
await attendanceStore.recordScan(phone, scannerId, qrCode)

// UI Store
import { useUIStore } from '@/stores'
const uiStore = useUIStore()
uiStore.showSuccess('Operation completed')
```

---

## Common Validation Rules

```typescript
validate(formData, {
  phone: ['required', 'phone'],
  name: ['required', 'minLength:2', 'maxLength:255'],
  email: ['required', 'email'],
  password: ['required', 'password'],
  confirmPassword: ['required', 'match:password'],
  department: ['required'],
  gender: ['required']
})
```

---

## QR Code Operations

### Generate QR Code
```typescript
import { qrcodeService } from '@/services/qrcode.service'

// Generate hash
const qrCode = qrcodeService.generateQRCode(phone, name)

// Generate image
const imageUrl = await qrcodeService.generateQRCodeImage(qrCode, {
  width: 300,
  errorCorrectionLevel: 'M'
})

// Download QR code
await qrcodeService.downloadQRCode(qrCode, 'employee-name', { width: 600 })
```

### Scan QR Code
```vue
<script setup>
const { startScanning } = useQRScanner('scanner-element')

const handleScanSuccess = async (decodedText) => {
  // decodedText is the QR hash
  await attendanceStore.recordScan(employeePhone, scannerId, decodedText)
}

await startScanning(handleScanSuccess)
</script>

<template>
  <div id="scanner-element"></div>
</template>
```

---

## Error Handling Pattern

```typescript
// Service layer
async function createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .insert(dto)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new ConflictError('Employee already exists')
    }
    throw new Error(getUserFriendlyMessage(error))
  }

  return data
}

// Component usage
try {
  await createEmployee(formData)
  uiStore.showSuccess('Employee created')
} catch (error) {
  uiStore.showError(error.message)
}
```

---

## Component Patterns

### Dumb Component (Presentational)
```vue
<script setup lang="ts">
interface Props {
  employee: Employee
  editable?: boolean
}

const props = defineProps<Props>()

interface Emits {
  (e: 'edit', employee: Employee): void
  (e: 'delete', employee: Employee): void
}

const emit = defineEmits<Emits>()
</script>

<template>
  <div class="employee-card">
    <h3>{{ employee.name }}</h3>
    <p>{{ employee.phone }}</p>
    <button v-if="editable" @click="emit('edit', employee)">Edit</button>
  </div>
</template>
```

### Smart Component (Container)
```vue
<script setup lang="ts">
import { useEmployeeStore } from '@/stores'

const employeeStore = useEmployeeStore()

onMounted(() => {
  employeeStore.fetchEmployees()
})

const handleEdit = (employee: Employee) => {
  router.push({ name: 'admin-employee-edit', params: { phone: employee.phone } })
}
</script>

<template>
  <EmployeeCard
    v-for="employee in employeeStore.employees"
    :key="employee.phone"
    :employee="employee"
    editable
    @edit="handleEdit"
  />
</template>
```

---

## Supabase Quick Reference

### Query Examples
```typescript
// Select all
const { data } = await supabase.from('employees').select('*')

// Select with filter
const { data } = await supabase
  .from('employees')
  .select('*')
  .eq('is_active', true)

// Insert
const { data } = await supabase
  .from('employees')
  .insert({ phone, name, department, gender, qr_code })
  .select()
  .single()

// Update
const { data } = await supabase
  .from('employees')
  .update({ name: 'New Name' })
  .eq('phone', '1234567890')
  .select()
  .single()

// Call function
const { data } = await supabase.rpc('record_attendance_scan', {
  p_employee_phone: phone,
  p_scanner_id: scannerId,
  p_qr_code: qrCode
})
```

---

## Security Checklist

- [x] Environment variables in `.gitignore`
- [x] Secrets in GitHub Secrets (production)
- [x] QR salt minimum 32 characters
- [x] HTTPS enforced (GitHub Pages + Supabase)
- [x] Row Level Security (RLS) enabled
- [x] Input validation (frontend + backend)
- [x] Password complexity enforced
- [x] JWT tokens for authentication
- [x] No sensitive data in QR codes
- [x] Audit logging enabled

---

## Deployment

### Local Build
```bash
npm run build
npm run preview  # Test production build locally
```

### GitHub Pages (Automatic)
1. Push to `main` branch
2. GitHub Actions builds automatically
3. Deploys to `https://username.github.io/Breakfast-v3/`

### Required GitHub Secrets
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_QR_SALT`

---

## Troubleshooting

### Environment variables not loading
```bash
# Ensure file is named .env.local
ls -la | grep .env

# Restart dev server
# Ctrl+C to stop, then npm run dev
```

### Supabase connection fails
```typescript
// Check credentials
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
```

### QR scanner not working
- Check camera permissions
- Ensure HTTPS (required for camera access)
- Verify browser compatibility

### Build fails
```bash
# Type check
npm run type-check

# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## Common Supabase Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 23505 | Unique violation | Check for duplicate phone/username |
| 23503 | Foreign key violation | Verify referenced record exists |
| PGRST116 | Not found | Record doesn't exist |
| 42501 | Insufficient privilege | Check RLS policies |

---

## Performance Tips

1. **Lazy Load Routes**: All routes use dynamic imports
2. **Pagination**: Limit database queries (default: 20 items)
3. **Debounce Search**: Wait 500ms before searching
4. **Index Database**: All foreign keys and frequent queries indexed
5. **Cache Stores**: Pinia stores cache fetched data
6. **Optimize Images**: Compress QR codes before download
7. **Virtual Scrolling**: For lists with 100+ items

---

## Useful Links

- [Full Documentation](./00-README.md)
- [Database Schema](./03-DATABASE-SCHEMA.md)
- [Component Architecture](./08-COMPONENT-ARCHITECTURE.md)
- [Implementation Checklist](./12-IMPLEMENTATION-CHECKLIST.md)
- [Vue 3 Docs](https://vuejs.org/)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev/)

---

## Support

**Issues?** Check documentation first, then:
1. Review specific topic documentation
2. Check browser console for errors
3. Review Supabase logs
4. Verify environment variables
5. Create GitHub issue

---

**Last Updated**: 2026-01-03
**Version**: 1.0.0
