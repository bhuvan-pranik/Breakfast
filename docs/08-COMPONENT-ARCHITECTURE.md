# Component Architecture

## Overview
Detailed specifications for component organization, design patterns, and reusable component library.

## Component Categories

### 1. Common Components (Dumb/Presentational)

Located in: `src/components/common/`

#### AppButton

**Purpose**: Standardized button component with variants

**Props**:
```typescript
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  icon?: string
  iconPosition?: 'left' | 'right'
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'click', event: MouseEvent): void
}
```

**Usage**:
```vue
<AppButton variant="primary" size="medium" @click="handleClick">
  Save Employee
</AppButton>
```

---

#### AppInput

**Purpose**: Form input with validation support

**Props**:
```typescript
interface Props {
  modelValue: string | number
  type?: 'text' | 'email' | 'password' | 'tel' | 'number'
  label?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  error?: string
  hint?: string
  maxlength?: number
  icon?: string
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'update:modelValue', value: string | number): void
  (e: 'blur'): void
  (e: 'focus'): void
  (e: 'enter'): void
}
```

**Usage**:
```vue
<AppInput
  v-model="employee.name"
  label="Employee Name"
  placeholder="Enter full name"
  :error="errors.name"
  required
/>
```

---

#### AppSelect

**Purpose**: Dropdown select component

**Props**:
```typescript
interface Props {
  modelValue: string | number | null
  options: Array<{ value: string | number; label: string; disabled?: boolean }>
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  clearable?: boolean
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'update:modelValue', value: string | number | null): void
  (e: 'change', value: string | number | null): void
}
```

**Usage**:
```vue
<AppSelect
  v-model="employee.department"
  :options="departmentOptions"
  label="Department"
  placeholder="Select department"
  required
/>
```

---

#### AppModal

**Purpose**: Reusable modal/dialog component

**Props**:
```typescript
interface Props {
  modelValue: boolean
  title?: string
  size?: 'small' | 'medium' | 'large' | 'fullscreen'
  closable?: boolean
  persistent?: boolean
  showFooter?: boolean
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}
```

**Slots**:
- `default`: Modal body content
- `header`: Custom header (overrides title)
- `footer`: Custom footer actions

**Usage**:
```vue
<AppModal v-model="isModalOpen" title="Create Employee" size="medium">
  <EmployeeForm @submit="handleSubmit" />

  <template #footer>
    <AppButton variant="ghost" @click="isModalOpen = false">Cancel</AppButton>
    <AppButton variant="primary" @click="handleSave">Save</AppButton>
  </template>
</AppModal>
```

---

#### AppTable

**Purpose**: Data table with sorting, pagination

**Props**:
```typescript
interface Column {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  format?: (value: any, row: any) => string
}

interface Props {
  columns: Column[]
  data: any[]
  loading?: boolean
  emptyMessage?: string
  rowKey?: string
  selectable?: boolean
  hoverable?: boolean
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'row-click', row: any): void
  (e: 'selection-change', selected: any[]): void
  (e: 'sort', column: string, direction: 'asc' | 'desc'): void
}
```

**Slots**:
- `column-{key}`: Custom column template
- `actions`: Row actions column

**Usage**:
```vue
<AppTable
  :columns="employeeColumns"
  :data="employees"
  :loading="isLoading"
  @row-click="handleRowClick"
>
  <template #column-actions="{ row }">
    <AppButton size="small" @click="editEmployee(row)">Edit</AppButton>
    <AppButton size="small" variant="danger" @click="deleteEmployee(row)">Delete</AppButton>
  </template>
</AppTable>
```

---

#### AppPagination

**Purpose**: Pagination controls

**Props**:
```typescript
interface Props {
  currentPage: number
  totalPages: number
  pageSize: number
  pageSizes?: number[]
  showPageSize?: boolean
  showTotal?: boolean
  totalItems?: number
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'update:currentPage', page: number): void
  (e: 'update:pageSize', size: number): void
}
```

**Usage**:
```vue
<AppPagination
  v-model:current-page="currentPage"
  v-model:page-size="pageSize"
  :total-pages="totalPages"
  :total-items="totalItems"
  show-total
/>
```

---

#### LoadingSpinner

**Purpose**: Loading indicator

**Props**:
```typescript
interface Props {
  size?: 'small' | 'medium' | 'large'
  overlay?: boolean
  message?: string
}
```

**Usage**:
```vue
<LoadingSpinner v-if="isLoading" size="large" message="Loading employees..." />
```

---

#### ErrorMessage

**Purpose**: Error display component

**Props**:
```typescript
interface Props {
  error: string | Error | null
  dismissible?: boolean
  variant?: 'error' | 'warning' | 'info'
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'dismiss'): void
}
```

**Usage**:
```vue
<ErrorMessage :error="error" dismissible @dismiss="clearError" />
```

---

#### ConfirmDialog

**Purpose**: Confirmation modal for destructive actions

**Props**:
```typescript
interface Props {
  modelValue: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}
```

**Usage**:
```vue
<ConfirmDialog
  v-model="showDeleteConfirm"
  title="Delete Employee"
  message="Are you sure you want to delete this employee? This action cannot be undone."
  variant="danger"
  @confirm="confirmDelete"
/>
```

---

### 2. Employee Components

Located in: `src/components/employee/`

#### EmployeeForm

**Purpose**: Reusable employee create/edit form

**Props**:
```typescript
interface Props {
  employee?: Employee | null
  mode: 'create' | 'edit'
  loading?: boolean
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'submit', data: CreateEmployeeDto | UpdateEmployeeDto): void
  (e: 'cancel'): void
}
```

**Implementation**:
```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useValidation } from '@/composables/useValidation'
import type { Employee, CreateEmployeeDto } from '@/types/employee.types'

const props = defineProps<{
  employee?: Employee | null
  mode: 'create' | 'edit'
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', data: CreateEmployeeDto): void
  (e: 'cancel'): void
}>()

const formData = ref({
  phone: '',
  name: '',
  department: '',
  gender: ''
})

const { validate, errors, clearErrors } = useValidation()

// Load employee data in edit mode
watch(() => props.employee, (employee) => {
  if (employee && props.mode === 'edit') {
    formData.value = {
      phone: employee.phone,
      name: employee.name,
      department: employee.department,
      gender: employee.gender
    }
  }
}, { immediate: true })

const handleSubmit = () => {
  clearErrors()

  const isValid = validate(formData.value, {
    phone: ['required', 'phone'],
    name: ['required', 'minLength:2'],
    department: ['required'],
    gender: ['required']
  })

  if (isValid) {
    emit('submit', formData.value)
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="employee-form">
    <AppInput
      v-model="formData.phone"
      label="Phone Number"
      type="tel"
      :error="errors.phone"
      :disabled="mode === 'edit'"
      required
    />

    <AppInput
      v-model="formData.name"
      label="Full Name"
      :error="errors.name"
      required
    />

    <AppSelect
      v-model="formData.department"
      :options="departmentOptions"
      label="Department"
      :error="errors.department"
      required
    />

    <AppSelect
      v-model="formData.gender"
      :options="genderOptions"
      label="Gender"
      :error="errors.gender"
      required
    />

    <div class="form-actions">
      <AppButton type="button" variant="ghost" @click="emit('cancel')">
        Cancel
      </AppButton>
      <AppButton type="submit" variant="primary" :loading="loading">
        {{ mode === 'create' ? 'Create' : 'Update' }} Employee
      </AppButton>
    </div>
  </form>
</template>
```

---

#### EmployeeList

**Purpose**: Display list of employees with actions

**Props**:
```typescript
interface Props {
  employees: Employee[]
  loading?: boolean
  showActions?: boolean
  selectable?: boolean
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'view', employee: Employee): void
  (e: 'edit', employee: Employee): void
  (e: 'delete', employee: Employee): void
  (e: 'regenerate-qr', employee: Employee): void
  (e: 'selection-change', selected: Employee[]): void
}
```

---

#### EmployeeCard

**Purpose**: Card display for single employee

**Props**:
```typescript
interface Props {
  employee: Employee
  showActions?: boolean
  compact?: boolean
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'view'): void
  (e: 'edit'): void
  (e: 'delete'): void
}
```

---

#### EmployeeFilters

**Purpose**: Filter controls for employee list

**Props**:
```typescript
interface Props {
  modelValue: {
    search: string
    department: string | null
    activeOnly: boolean
  }
  departments: string[]
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'update:modelValue', filters: any): void
  (e: 'clear'): void
}
```

---

#### QRCodeDisplay

**Purpose**: Display and download employee QR code

(Detailed in QR Code Implementation doc)

---

#### BulkUploadModal

**Purpose**: CSV/Excel bulk upload interface

**Props**:
```typescript
interface Props {
  modelValue: boolean
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'upload', employees: CreateEmployeeDto[]): void
}
```

**Features**:
- File upload (CSV/XLS)
- Preview parsed data
- Validation before upload
- Error reporting for invalid rows

---

### 3. Scanner Components

Located in: `src/components/scanner/`

#### QRScanner

**Purpose**: Camera-based QR code scanner

(Detailed in QR Code Implementation doc)

---

#### ScanResult

**Purpose**: Display scan result with employee info

**Props**:
```typescript
interface Props {
  result: {
    success: boolean
    status: 'success' | 'duplicate' | 'invalid' | 'inactive'
    message: string
    employeeName: string | null
  } | null
  autoDismiss?: boolean
  dismissDelay?: number
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'dismiss'): void
  (e: 'retry'): void
}
```

**Implementation**:
```vue
<script setup lang="ts">
import { watch, ref } from 'vue'

const props = withDefaults(defineProps<{
  result: any
  autoDismiss?: boolean
  dismissDelay?: number
}>(), {
  autoDismiss: true,
  dismissDelay: 3000
})

const emit = defineEmits<{
  (e: 'dismiss'): void
  (e: 'retry'): void
}>()

const isVisible = ref(false)

watch(() => props.result, (result) => {
  if (result) {
    isVisible.value = true

    if (props.autoDismiss && result.success) {
      setTimeout(() => {
        emit('dismiss')
        isVisible.value = false
      }, props.dismissDelay)
    }
  }
}, { immediate: true })
</script>

<template>
  <transition name="fade">
    <div v-if="isVisible && result" :class="['scan-result', result.status]">
      <div class="result-icon">
        <span v-if="result.success">✓</span>
        <span v-else>✗</span>
      </div>

      <div class="result-content">
        <h3 v-if="result.employeeName" class="employee-name">
          {{ result.employeeName }}
        </h3>
        <p class="result-message">{{ result.message }}</p>
      </div>

      <button v-if="!result.success" @click="emit('retry')" class="retry-button">
        Scan Again
      </button>
    </div>
  </transition>
</template>

<style scoped>
.scan-result {
  padding: 24px;
  border-radius: 8px;
  text-align: center;
  animation: slideIn 0.3s ease;
}

.scan-result.success {
  background-color: #d4edda;
  border: 2px solid #28a745;
}

.scan-result.duplicate,
.scan-result.invalid,
.scan-result.inactive {
  background-color: #f8d7da;
  border: 2px solid #dc3545;
}

.result-icon span {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.employee-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.result-message {
  font-size: 16px;
  color: #666;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
```

---

#### ScanHistory

**Purpose**: Display recent scans for current scanner

**Props**:
```typescript
interface Props {
  scannerId: string
  limit?: number
}
```

---

#### CameraPermission

**Purpose**: Request and manage camera permissions

**Emits**:
```typescript
interface Emits {
  (e: 'granted'): void
  (e: 'denied'): void
}
```

---

### 4. Admin Components

Located in: `src/components/admin/`

#### ScannerAccountForm

**Purpose**: Create/edit scanner accounts

**Props**:
```typescript
interface Props {
  scanner?: ScannerAccount | null
  mode: 'create' | 'edit'
  loading?: boolean
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'submit', data: CreateScannerDto): void
  (e: 'cancel'): void
}
```

---

#### ScannerAccountList

**Purpose**: Display list of scanner accounts

**Props**:
```typescript
interface Props {
  scanners: ScannerAccount[]
  loading?: boolean
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'edit', scanner: ScannerAccount): void
  (e: 'deactivate', scanner: ScannerAccount): void
  (e: 'activate', scanner: ScannerAccount): void
}
```

---

#### DashboardStats

**Purpose**: Display key metrics on dashboard

**Props**:
```typescript
interface Props {
  stats: {
    totalEmployees: number
    activeEmployees: number
    todayAttendance: number
    attendancePercentage: number
  }
  loading?: boolean
}
```

---

#### ReportFilters

**Purpose**: Filters for reports (Phase II)

**Props**:
```typescript
interface Props {
  modelValue: {
    startDate: string
    endDate: string
    department: string | null
    status: string | null
  }
}
```

---

### 5. Layout Components

Located in: `src/components/layout/`

#### AppHeader

**Purpose**: Top navigation header

**Props**:
```typescript
interface Props {
  title?: string
  showUserMenu?: boolean
}
```

**Emits**:
```typescript
interface Emits {
  (e: 'logout'): void
  (e: 'toggle-sidebar'): void
}
```

---

#### AppNavigation

**Purpose**: Main navigation menu

**Props**:
```typescript
interface Props {
  items: NavItem[]
  collapsed?: boolean
}
```

---

#### AppSidebar

**Purpose**: Sidebar container for navigation

**Props**:
```typescript
interface Props {
  visible: boolean
  width?: string
}
```

---

#### AppFooter

**Purpose**: Application footer

---

## Component Design Patterns

### 1. Props Down, Events Up

All data flows down through props, changes flow up through events.

```vue
<!-- Parent -->
<EmployeeForm
  :employee="selectedEmployee"
  :loading="isLoading"
  @submit="handleSubmit"
  @cancel="handleCancel"
/>
```

### 2. Composable Pattern

Extract reusable logic into composables:

```typescript
// useEmployees.ts
export function useEmployees() {
  const store = useEmployeeStore()
  // ... logic
  return { employees, fetchEmployees, createEmployee }
}
```

### 3. Provide/Inject for Deep Props

Use for deeply nested components:

```vue
<!-- Layout -->
<script setup>
provide('layout', {
  toggleSidebar,
  isSidebarOpen
})
</script>

<!-- Deep child -->
<script setup>
const layout = inject('layout')
</script>
```

### 4. Slots for Flexibility

Provide slots for customization:

```vue
<AppModal>
  <template #header>
    <CustomHeader />
  </template>

  <template #default>
    <ModalBody />
  </template>

  <template #footer>
    <CustomActions />
  </template>
</AppModal>
```

---

## Component Testing Strategy

### Unit Testing

```typescript
import { mount } from '@vue/test-utils'
import AppButton from '@/components/common/AppButton.vue'

describe('AppButton', () => {
  it('renders correctly', () => {
    const wrapper = mount(AppButton, {
      slots: {
        default: 'Click Me'
      }
    })
    expect(wrapper.text()).toBe('Click Me')
  })

  it('emits click event', async () => {
    const wrapper = mount(AppButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('is disabled when loading', () => {
    const wrapper = mount(AppButton, {
      props: { loading: true }
    })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })
})
```

---

## Component Performance Optimization

1. **v-once**: For static content
2. **v-memo**: For expensive list items
3. **Lazy Loading**: Load heavy components on demand
4. **Debounce**: For input handlers
5. **Virtual Scrolling**: For long lists

```vue
<template>
  <!-- Static content -->
  <div v-once>{{ staticContent }}</div>

  <!-- Memoized list items -->
  <div v-for="item in items" :key="item.id" v-memo="[item.id, item.updatedAt]">
    <ExpensiveComponent :item="item" />
  </div>
</template>
```

---

## Accessibility Guidelines

1. **Semantic HTML**: Use proper HTML elements
2. **ARIA Labels**: Add labels for screen readers
3. **Keyboard Navigation**: Support Tab, Enter, Escape
4. **Focus Management**: Manage focus in modals
5. **Color Contrast**: Meet WCAG AA standards

```vue
<button
  type="button"
  :aria-label="`Edit employee ${employee.name}`"
  :aria-pressed="isActive"
  @click="handleClick"
  @keydown.enter="handleClick"
>
  Edit
</button>
```
