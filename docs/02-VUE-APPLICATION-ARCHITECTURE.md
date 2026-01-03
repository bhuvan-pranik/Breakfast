# Vue Application Architecture

## Project Structure

```
Breakfast-v3/
├── .github/
│   └── workflows/
│       └── deploy.yml                 # GitHub Pages deployment
├── docs/                              # Project documentation
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── assets/                        # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │       ├── main.css              # Global styles
│   │       ├── variables.css         # CSS variables
│   │       └── utilities.css         # Utility classes
│   │
│   ├── components/                    # Reusable components
│   │   ├── common/                    # Shared components
│   │   │   ├── AppButton.vue
│   │   │   ├── AppInput.vue
│   │   │   ├── AppSelect.vue
│   │   │   ├── AppModal.vue
│   │   │   ├── AppTable.vue
│   │   │   ├── AppPagination.vue
│   │   │   ├── LoadingSpinner.vue
│   │   │   ├── ErrorMessage.vue
│   │   │   └── ConfirmDialog.vue
│   │   │
│   │   ├── employee/                  # Employee-specific components
│   │   │   ├── EmployeeForm.vue
│   │   │   ├── EmployeeList.vue
│   │   │   ├── EmployeeCard.vue
│   │   │   ├── EmployeeFilters.vue
│   │   │   ├── QRCodeDisplay.vue
│   │   │   └── BulkUploadModal.vue
│   │   │
│   │   ├── scanner/                   # Scanner-specific components
│   │   │   ├── QRScanner.vue
│   │   │   ├── ScanResult.vue
│   │   │   ├── ScanHistory.vue
│   │   │   └── CameraPermission.vue
│   │   │
│   │   ├── admin/                     # Admin-specific components
│   │   │   ├── ScannerAccountForm.vue
│   │   │   ├── ScannerAccountList.vue
│   │   │   ├── DashboardStats.vue
│   │   │   └── ReportFilters.vue
│   │   │
│   │   └── layout/                    # Layout components
│   │       ├── AppHeader.vue
│   │       ├── AppNavigation.vue
│   │       ├── AppSidebar.vue
│   │       └── AppFooter.vue
│   │
│   ├── composables/                   # Composition API composables
│   │   ├── useAuth.ts                # Authentication logic
│   │   ├── useQRCode.ts              # QR generation/validation
│   │   ├── useQRScanner.ts           # QR scanning logic
│   │   ├── useEmployees.ts           # Employee operations
│   │   ├── useScanners.ts            # Scanner operations
│   │   ├── useAttendance.ts          # Attendance operations
│   │   ├── useValidation.ts          # Form validation
│   │   ├── useNotification.ts        # Toast/notification system
│   │   ├── useConfirm.ts             # Confirmation dialogs
│   │   ├── usePagination.ts          # Pagination logic
│   │   ├── useDebounce.ts            # Debouncing utility
│   │   └── usePermissions.ts         # Role-based permissions
│   │
│   ├── layouts/                       # Layout wrappers
│   │   ├── AuthLayout.vue            # Login/auth pages
│   │   ├── AdminLayout.vue           # Admin dashboard layout
│   │   ├── ScannerLayout.vue         # Scanner interface layout
│   │   └── EmptyLayout.vue           # Minimal layout
│   │
│   ├── router/                        # Vue Router configuration
│   │   ├── index.ts                  # Main router config
│   │   ├── guards.ts                 # Navigation guards
│   │   └── routes.ts                 # Route definitions
│   │
│   ├── services/                      # API/Service layer
│   │   ├── supabase.ts               # Supabase client
│   │   ├── auth.service.ts           # Authentication service
│   │   ├── employee.service.ts       # Employee CRUD
│   │   ├── scanner.service.ts        # Scanner CRUD
│   │   ├── attendance.service.ts     # Attendance tracking
│   │   ├── qrcode.service.ts         # QR generation/validation
│   │   └── export.service.ts         # Data export (Phase II)
│   │
│   ├── stores/                        # Pinia stores
│   │   ├── index.ts                  # Store registration
│   │   ├── auth.store.ts             # Auth state
│   │   ├── employee.store.ts         # Employee state
│   │   ├── scanner.store.ts          # Scanner state
│   │   ├── attendance.store.ts       # Attendance state
│   │   └── ui.store.ts               # UI state (modals, toasts)
│   │
│   ├── types/                         # TypeScript type definitions
│   │   ├── index.ts                  # Type exports
│   │   ├── employee.types.ts
│   │   ├── scanner.types.ts
│   │   ├── attendance.types.ts
│   │   ├── auth.types.ts
│   │   ├── api.types.ts
│   │   └── ui.types.ts
│   │
│   ├── utils/                         # Utility functions
│   │   ├── constants.ts              # App constants
│   │   ├── validators.ts             # Validation functions
│   │   ├── formatters.ts             # Data formatting
│   │   ├── helpers.ts                # General helpers
│   │   └── crypto.ts                 # QR hashing utilities
│   │
│   ├── views/                         # Page components
│   │   ├── auth/
│   │   │   ├── LoginView.vue
│   │   │   └── UnauthorizedView.vue
│   │   │
│   │   ├── admin/
│   │   │   ├── DashboardView.vue
│   │   │   ├── EmployeesView.vue
│   │   │   ├── EmployeeDetailView.vue
│   │   │   ├── EmployeeCreateView.vue
│   │   │   ├── EmployeeEditView.vue
│   │   │   ├── ScannersView.vue
│   │   │   ├── ScannerCreateView.vue
│   │   │   └── ReportsView.vue       # Phase II
│   │   │
│   │   ├── scanner/
│   │   │   ├── ScanView.vue
│   │   │   └── ScanHistoryView.vue
│   │   │
│   │   └── errors/
│   │       ├── NotFoundView.vue
│   │       └── ErrorView.vue
│   │
│   ├── App.vue                        # Root component
│   ├── main.ts                        # Application entry point
│   └── vite-env.d.ts                 # Vite type declarations
│
├── .env.example                       # Environment variables template
├── .env.local                         # Local environment (gitignored)
├── .eslintrc.cjs                     # ESLint configuration
├── .gitignore
├── .prettierrc.json                  # Prettier configuration
├── index.html                         # HTML entry point
├── package.json
├── tsconfig.json                      # TypeScript configuration
├── tsconfig.node.json                # Node TypeScript config
├── vite.config.ts                    # Vite configuration
└── README.md
```

## Architecture Patterns

### 1. Component Organization Strategy

#### Smart Components (Container Components)
**Location**: `src/views/`

**Responsibilities**:
- Manage application state through Pinia stores
- Handle business logic and data fetching
- Orchestrate child components
- Manage route parameters and navigation
- Handle side effects (API calls, localStorage)

**Example**: `EmployeesView.vue`
```typescript
// Fetches data, manages state, handles CRUD operations
// Delegates presentation to child components
```

#### Dumb Components (Presentational Components)
**Location**: `src/components/`

**Responsibilities**:
- Receive data via props
- Emit events for user interactions
- Focus on UI rendering and styling
- Stateless or local UI state only
- Highly reusable across views

**Example**: `EmployeeCard.vue`
```typescript
// Receives employee data as prop
// Emits edit/delete/view events
// No direct API calls or store access
```

### 2. Composition API Patterns

#### Script Setup Pattern (Standard)
```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Employee } from '@/types/employee.types'

// Props with TypeScript
interface Props {
  employee: Employee
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editable: false
})

// Emits with TypeScript
interface Emits {
  (e: 'update', employee: Employee): void
  (e: 'delete', id: string): void
}

const emit = defineEmits<Emits>()

// Reactive state
const isLoading = ref(false)

// Computed properties
const displayName = computed(() => {
  return props.employee.name.toUpperCase()
})

// Methods
const handleUpdate = () => {
  emit('update', props.employee)
}

// Lifecycle
onMounted(() => {
  // Component mounted logic
})
</script>
```

#### Composable Pattern
```typescript
// src/composables/useEmployees.ts
import { ref, computed } from 'vue'
import { useEmployeeStore } from '@/stores/employee.store'
import type { Employee, CreateEmployeeDto } from '@/types/employee.types'

export function useEmployees() {
  const store = useEmployeeStore()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const employees = computed(() => store.employees)
  const activeEmployees = computed(() => store.activeEmployees)

  const fetchEmployees = async () => {
    isLoading.value = true
    error.value = null
    try {
      await store.fetchEmployees()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch employees'
    } finally {
      isLoading.value = false
    }
  }

  const createEmployee = async (data: CreateEmployeeDto) => {
    isLoading.value = true
    error.value = null
    try {
      await store.createEmployee(data)
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create employee'
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    employees,
    activeEmployees,
    isLoading,
    error,
    fetchEmployees,
    createEmployee
  }
}
```

### 3. State Management Architecture (Pinia)

#### Store Pattern (Setup Stores)
```typescript
// src/stores/employee.store.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { employeeService } from '@/services/employee.service'
import type { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '@/types/employee.types'

export const useEmployeeStore = defineStore('employee', () => {
  // State
  const employees = ref<Employee[]>([])
  const selectedEmployee = ref<Employee | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeEmployees = computed(() =>
    employees.value.filter(e => e.is_active)
  )

  const employeeCount = computed(() => employees.value.length)

  const getEmployeeByPhone = computed(() => {
    return (phone: string) => employees.value.find(e => e.phone === phone)
  })

  // Actions
  async function fetchEmployees() {
    isLoading.value = true
    error.value = null
    try {
      const data = await employeeService.getAll()
      employees.value = data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function createEmployee(dto: CreateEmployeeDto) {
    const employee = await employeeService.create(dto)
    employees.value.push(employee)
    return employee
  }

  async function updateEmployee(phone: string, dto: UpdateEmployeeDto) {
    const updated = await employeeService.update(phone, dto)
    const index = employees.value.findIndex(e => e.phone === phone)
    if (index !== -1) {
      employees.value[index] = updated
    }
    return updated
  }

  async function deleteEmployee(phone: string) {
    await employeeService.softDelete(phone)
    const index = employees.value.findIndex(e => e.phone === phone)
    if (index !== -1) {
      employees.value[index].is_active = false
    }
  }

  function selectEmployee(employee: Employee | null) {
    selectedEmployee.value = employee
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    employees,
    selectedEmployee,
    isLoading,
    error,
    // Getters
    activeEmployees,
    employeeCount,
    getEmployeeByPhone,
    // Actions
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    selectEmployee,
    clearError
  }
})
```

### 4. Service Layer Pattern

#### Service Structure
```typescript
// src/services/employee.service.ts
import { supabase } from './supabase'
import type { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '@/types/employee.types'
import { qrcodeService } from './qrcode.service'

class EmployeeService {
  private readonly tableName = 'employees'

  async getAll(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as Employee[]
  }

  async getByPhone(phone: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('phone', phone)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(error.message)
    }
    return data as Employee
  }

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    // Generate QR code
    const qrCode = qrcodeService.generateQRCode(dto.phone, dto.name)

    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        ...dto,
        qr_code: qrCode,
        is_active: true
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Employee
  }

  async update(phone: string, dto: UpdateEmployeeDto): Promise<Employee> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(dto)
      .eq('phone', phone)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Employee
  }

  async softDelete(phone: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({ is_active: false })
      .eq('phone', phone)

    if (error) throw new Error(error.message)
  }

  async regenerateQRCode(phone: string, name: string): Promise<Employee> {
    const qrCode = qrcodeService.generateQRCode(phone, name)

    const { data, error } = await supabase
      .from(this.tableName)
      .update({ qr_code: qrCode })
      .eq('phone', phone)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Employee
  }
}

export const employeeService = new EmployeeService()
```

### 5. Routing Architecture

#### Route Organization
- **Lazy Loading**: All route components loaded on-demand
- **Nested Routes**: Layouts wrap child routes
- **Meta Fields**: Store authentication requirements, roles, page titles
- **Navigation Guards**: Centralized authentication and authorization

#### Route Structure Pattern
```typescript
// src/router/routes.ts
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      layout: 'auth',
      requiresAuth: false,
      title: 'Login'
    }
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['admin']
    },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { title: 'Dashboard' }
      },
      {
        path: 'employees',
        name: 'admin-employees',
        component: () => import('@/views/admin/EmployeesView.vue'),
        meta: { title: 'Employees' }
      }
      // ... more admin routes
    ]
  },
  {
    path: '/scanner',
    component: () => import('@/layouts/ScannerLayout.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['admin', 'scanner']
    },
    children: [
      {
        path: '',
        name: 'scanner-scan',
        component: () => import('@/views/scanner/ScanView.vue'),
        meta: { title: 'Scan QR Code' }
      }
    ]
  }
]
```

## Build and Development Configuration

### Vite Configuration
- Path aliases for clean imports (`@/` → `src/`)
- Environment variable handling
- Build optimization for production
- GitHub Pages deployment configuration
- Development proxy for Supabase (optional)

### TypeScript Configuration
- Strict mode enabled
- Path mappings matching Vite aliases
- Vue 3 type declarations
- Composition API type support

## Performance Optimization Strategies

1. **Code Splitting**: Route-level lazy loading
2. **Component Lazy Loading**: Heavy components loaded on-demand
3. **Virtual Scrolling**: For large employee/attendance lists
4. **Computed Caching**: Efficient derived state computation
5. **Debounced Search**: Reduce API calls during filtering
6. **Pagination**: Limit data fetched per request
7. **Image Optimization**: Compress and lazy-load images
8. **Bundle Analysis**: Regular bundle size monitoring

## Development Workflow

1. **Component Development**: Bottom-up (dumb → smart components)
2. **Type-First**: Define TypeScript types before implementation
3. **Service Layer First**: Build and test services before UI
4. **Store Integration**: Connect stores after service layer complete
5. **View Assembly**: Combine components in views
6. **Route Configuration**: Wire up navigation last
