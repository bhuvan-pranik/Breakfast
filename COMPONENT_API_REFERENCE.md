# Component API Reference

**Version:** 1.0.0
**Date:** January 3, 2026

---

## Table of Contents

1. [Primitive Components](#1-primitive-components)
2. [Composite Components](#2-composite-components)
3. [Feature Components](#3-feature-components)
4. [Layout Components](#4-layout-components)
5. [Utility Composables](#5-utility-composables)

---

## 1. Primitive Components

### 1.1 Button

**File**: `src/components/primitives/Button.vue`

**Description**: Primary interactive element for user actions with multiple variants and states.

**Props**:
```typescript
interface ButtonProps {
  // Visual variant
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';

  // Size
  size?: 'sm' | 'base' | 'lg';

  // State
  disabled?: boolean;
  loading?: boolean;

  // Layout
  fullWidth?: boolean;

  // Icons
  leftIcon?: Component;
  rightIcon?: Component;

  // HTML attributes
  type?: 'button' | 'submit' | 'reset';

  // Accessibility
  ariaLabel?: string; // Required if no text content
}
```

**Events**:
```typescript
{
  click: (event: MouseEvent) => void;
}
```

**Slots**:
```typescript
{
  default: () => VNode; // Button text/content
  leftIcon: () => VNode; // Override leftIcon prop
  rightIcon: () => VNode; // Override rightIcon prop
}
```

**Usage**:
```vue
<!-- Basic -->
<Button>Click me</Button>

<!-- With variant and size -->
<Button variant="primary" size="lg">Save Changes</Button>

<!-- With loading state -->
<Button :loading="isSubmitting" @click="handleSubmit">
  Submit
</Button>

<!-- With icons -->
<Button :leftIcon="PlusIcon">Add Employee</Button>

<!-- Icon only (requires aria-label) -->
<Button variant="ghost" :leftIcon="XIcon" ariaLabel="Close" />

<!-- Destructive action -->
<Button variant="destructive" @click="handleDelete">
  Delete
</Button>
```

**CSS Classes** (via cva):
```typescript
const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-500/30 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
        secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-400',
        outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 active:bg-primary-100',
        ghost: 'text-primary-600 hover:bg-primary-50 active:bg-primary-100',
        destructive: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-700',
        link: 'text-primary-600 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 py-1.5 text-sm',
        base: 'h-10 px-4 py-2 text-base',
        lg: 'h-12 px-5 py-2.5 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'base',
    },
  }
);
```

---

### 1.2 Input

**File**: `src/components/primitives/Input.vue`

**Description**: Text input field with validation states and icon support.

**Props**:
```typescript
interface InputProps {
  // HTML input type
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search' | 'url';

  // Size
  size?: 'sm' | 'base' | 'lg';

  // Value (v-model)
  modelValue?: string | number;

  // Attributes
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  autocomplete?: string;
  maxlength?: number;
  min?: number; // For type="number"
  max?: number; // For type="number"
  step?: number; // For type="number"

  // Validation
  error?: boolean;
  errorMessage?: string;

  // Icons
  leftIcon?: Component;
  rightIcon?: Component;

  // Accessibility
  ariaLabel?: string; // Required if no label
  ariaDescribedBy?: string; // Link to hint/error
}
```

**Events**:
```typescript
{
  'update:modelValue': (value: string | number) => void;
  blur: (event: FocusEvent) => void;
  focus: (event: FocusEvent) => void;
  input: (event: InputEvent) => void;
}
```

**Slots**:
```typescript
{
  leftIcon: () => VNode;
  rightIcon: () => VNode;
}
```

**Usage**:
```vue
<!-- Basic -->
<Input v-model="name" placeholder="Enter name" />

<!-- With label (using FormField) -->
<FormField label="Phone Number" required>
  <Input
    v-model="phone"
    type="tel"
    placeholder="10-digit phone number"
    autocomplete="tel"
  />
</FormField>

<!-- With error state -->
<Input
  v-model="email"
  type="email"
  :error="!!emailError"
  :errorMessage="emailError"
  aria-describedby="email-error"
/>
<span id="email-error" v-if="emailError" class="text-error-600 text-sm">
  {{ emailError }}
</span>

<!-- With icons -->
<Input
  v-model="search"
  type="search"
  :leftIcon="SearchIcon"
  placeholder="Search employees..."
/>

<!-- Password with toggle visibility -->
<Input
  :type="showPassword ? 'text' : 'password'"
  v-model="password"
  :rightIcon="showPassword ? EyeOffIcon : EyeIcon"
  @click:rightIcon="showPassword = !showPassword"
/>
```

---

### 1.3 Badge

**File**: `src/components/primitives/Badge.vue`

**Description**: Display status indicators, counts, or labels.

**Props**:
```typescript
interface BadgeProps {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'base' | 'lg';
  dot?: boolean; // Show colored dot before text
  removable?: boolean; // Show X icon
}
```

**Events**:
```typescript
{
  remove: () => void; // Emitted when X icon clicked
}
```

**Slots**:
```typescript
{
  default: () => VNode; // Badge text
}
```

**Usage**:
```vue
<!-- Status badges -->
<Badge variant="success">Active</Badge>
<Badge variant="error">Inactive</Badge>

<!-- With dot -->
<Badge variant="success" dot>Online</Badge>

<!-- Removable (for filters/tags) -->
<Badge variant="info" removable @remove="handleRemove">
  Engineering
</Badge>

<!-- Sizes -->
<Badge size="sm">Small</Badge>
<Badge size="lg">Large</Badge>
```

---

### 1.4 Card

**File**: `src/components/primitives/Card.vue`

**Description**: Container component for related content.

**Props**:
```typescript
interface CardProps {
  variant?: 'default' | 'elevated' | 'outline';
  padding?: 'none' | 'sm' | 'base' | 'lg';
  hover?: boolean; // Hover effect for clickable cards
  asChild?: boolean; // Render as child component (e.g., <a>)
}
```

**Slots**:
```typescript
{
  default: () => VNode; // Card content
}
```

**Subcomponents**:

**CardHeader**:
```typescript
interface CardHeaderProps {
  title: string;
  subtitle?: string;
}
```

**CardContent**: Container, no props

**CardFooter**: Container, no props

**Usage**:
```vue
<!-- Basic card -->
<Card>
  <CardHeader title="Employee Details" />
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

<!-- Elevated card with hover -->
<Card variant="elevated" hover>
  <CardContent>
    Clickable card
  </CardContent>
</Card>

<!-- No padding (for tables) -->
<Card padding="none">
  <Table>...</Table>
</Card>
```

---

### 1.5 Modal/Dialog

**File**: `src/components/primitives/Modal.vue`

**Description**: Overlay dialog for focused interactions. Built on Radix Vue Dialog.

**Props**:
```typescript
interface ModalProps {
  open: boolean; // Control visibility
  size?: 'sm' | 'base' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean; // Default: true
  closeOnEscape?: boolean; // Default: true
  showCloseButton?: boolean; // Default: true
  title?: string; // For aria-labelledby
  description?: string; // For aria-describedby
}
```

**Events**:
```typescript
{
  'update:open': (open: boolean) => void; // Emitted when modal closed
  close: () => void; // Alias for update:open(false)
}
```

**Slots**:
```typescript
{
  default: () => VNode; // Modal content
  title: () => VNode; // Override title prop
  description: () => VNode; // Override description prop
}
```

**Subcomponents**:

**ModalHeader**:
```vue
<ModalHeader>
  <template #title>Custom Title</template>
  <template #subtitle>Optional subtitle</template>
</ModalHeader>
```

**ModalContent**: Container

**ModalFooter**: Container for action buttons

**Usage**:
```vue
<template>
  <Button @click="isOpen = true">Open Modal</Button>

  <Modal
    v-model:open="isOpen"
    title="Add Employee"
    description="Enter employee details"
  >
    <ModalContent>
      <EmployeeForm @submit="handleSubmit" />
    </ModalContent>
    <ModalFooter>
      <Button variant="secondary" @click="isOpen = false">Cancel</Button>
      <Button @click="handleSave">Save</Button>
    </ModalFooter>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isOpen = ref(false);
</script>
```

---

### 1.6 Select/Dropdown

**File**: `src/components/primitives/Select.vue`

**Description**: Selection from a list of options. Built on Radix Vue Select.

**Props**:
```typescript
interface SelectProps {
  modelValue?: string | number;
  placeholder?: string;
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  size?: 'sm' | 'base' | 'lg';
  disabled?: boolean;
  error?: boolean;
  searchable?: boolean; // Allow typing to filter
  multiple?: boolean; // Multi-select (returns array)
  ariaLabel?: string;
}
```

**Events**:
```typescript
{
  'update:modelValue': (value: string | number | Array<string | number>) => void;
  change: (value: string | number | Array<string | number>) => void;
}
```

**Usage**:
```vue
<!-- Basic select -->
<Select
  v-model="department"
  :options="departmentOptions"
  placeholder="Select department"
/>

<!-- With FormField -->
<FormField label="Department" required>
  <Select
    v-model="department"
    :options="[
      { value: 'eng', label: 'Engineering' },
      { value: 'hr', label: 'Human Resources' },
      { value: 'sales', label: 'Sales' },
    ]"
  />
</FormField>

<!-- Searchable -->
<Select
  v-model="employee"
  :options="employeeOptions"
  searchable
  placeholder="Search employee..."
/>

<!-- Multi-select -->
<Select
  v-model="selectedDepartments"
  :options="departmentOptions"
  multiple
  placeholder="Select departments"
/>
```

---

### 1.7 Checkbox

**File**: `src/components/primitives/Checkbox.vue`

**Description**: Boolean selection control. Built on Radix Vue Checkbox.

**Props**:
```typescript
interface CheckboxProps {
  modelValue?: boolean;
  checked?: boolean; // Alternative to modelValue
  indeterminate?: boolean; // For "select all" scenarios
  disabled?: boolean;
  label?: string;
  ariaLabel?: string; // Required if no label
}
```

**Events**:
```typescript
{
  'update:modelValue': (checked: boolean) => void;
  change: (checked: boolean) => void;
}
```

**Usage**:
```vue
<!-- Basic checkbox -->
<Checkbox v-model="isActive" label="Active" />

<!-- Indeterminate (select all) -->
<Checkbox
  :checked="allSelected"
  :indeterminate="someSelected"
  @change="handleSelectAll"
  label="Select All"
/>

<!-- Disabled -->
<Checkbox v-model="agreed" label="I agree to terms" disabled />
```

---

### 1.8 RadioGroup

**File**: `src/components/primitives/RadioGroup.vue`

**Description**: Single selection from multiple options. Built on Radix Vue RadioGroup.

**Props**:
```typescript
interface RadioGroupProps {
  modelValue?: string | number;
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  ariaLabel?: string; // Required
}
```

**Events**:
```typescript
{
  'update:modelValue': (value: string | number) => void;
  change: (value: string | number) => void;
}
```

**Usage**:
```vue
<RadioGroup
  v-model="gender"
  :options="[
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'na', label: 'Prefer not to say' },
  ]"
  orientation="horizontal"
  ariaLabel="Gender"
/>
```

---

### 1.9 Table

**File**: `src/components/primitives/Table.vue`

**Description**: Basic semantic table structure.

**Props**:
```typescript
interface TableProps {
  striped?: boolean; // Alternating row colors
  hoverable?: boolean; // Hover effect on rows
  bordered?: boolean; // Cell borders
  compact?: boolean; // Reduced padding
}
```

**Subcomponents**:
- `TableHead`: Table header
- `TableHeader`: Header cell (`<th>`)
- `TableBody`: Table body
- `TableRow`: Table row
- `TableCell`: Table cell (`<td>`)

**Usage**:
```vue
<Table striped hoverable>
  <TableHead>
    <TableRow>
      <TableHeader>Name</TableHeader>
      <TableHeader>Phone</TableHeader>
      <TableHeader>Status</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow v-for="employee in employees" :key="employee.id">
      <TableCell>{{ employee.name }}</TableCell>
      <TableCell>{{ employee.phone }}</TableCell>
      <TableCell>
        <Badge :variant="employee.active ? 'success' : 'default'">
          {{ employee.active ? 'Active' : 'Inactive' }}
        </Badge>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

### 1.10 Toast/Notification

**File**: `src/components/primitives/Toast.vue`

**Description**: Temporary feedback messages. Built on Radix Vue Toast.

**Props**:
```typescript
interface ToastProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number; // Auto-dismiss in ms (default 5000)
  action?: {
    label: string;
    onClick: () => void;
  };
  closable?: boolean; // Show close button (default true)
}
```

**Usage via Composable**:
```typescript
// src/composables/useToast.ts
import { useToast as useToastPrimitive } from '@/components/primitives/Toast';

const { toast } = useToast();

// In component
toast({
  variant: 'success',
  title: 'Employee added',
  description: 'John Doe has been added successfully.',
});

toast({
  variant: 'error',
  title: 'Error',
  description: 'Failed to save employee.',
  duration: 7000,
});

// With action
toast({
  variant: 'info',
  title: 'Employee deactivated',
  action: {
    label: 'Undo',
    onClick: () => handleUndo(),
  },
});
```

---

## 2. Composite Components

### 2.1 DataTable

**File**: `src/components/composite/DataTable.vue`

**Description**: Advanced data table with sorting, filtering, pagination, and row selection.

**Props**:
```typescript
interface DataTableColumn<T> {
  key: string; // Property key in data object
  label: string; // Column header
  sortable?: boolean;
  filterable?: boolean;
  width?: string; // CSS width (e.g., '200px', '20%')
  align?: 'left' | 'center' | 'right';
  render?: (row: T, column: DataTableColumn<T>) => VNode; // Custom cell renderer
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  selectable?: boolean; // Show checkboxes
  loading?: boolean; // Show loading skeleton
  emptyState?: Component | string; // Empty state component/text

  // Pagination
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  };

  // Bulk actions
  bulkActions?: Array<{
    label: string;
    icon?: Component;
    variant?: ButtonProps['variant'];
    onClick: (selectedRows: T[]) => void;
  }>;

  // Row actions
  rowActions?: Array<{
    label: string;
    icon?: Component;
    variant?: 'default' | 'destructive';
    onClick: (row: T) => void;
  }>;
}
```

**Events**:
```typescript
{
  'selection-change': (selectedRows: T[]) => void;
  'row-click': (row: T) => void;
  'sort': (column: string, direction: 'asc' | 'desc') => void;
}
```

**Slots**:
```typescript
{
  [columnKey: string]: (props: { row: T }) => VNode; // Custom cell content
  'empty-state': () => VNode;
  'bulk-actions': (props: { selectedRows: T[] }) => VNode;
}
```

**Usage**:
```vue
<template>
  <DataTable
    :columns="columns"
    :data="employees"
    :loading="loading"
    selectable
    :pagination="pagination"
    :bulkActions="bulkActions"
    :rowActions="rowActions"
    @selection-change="handleSelectionChange"
  >
    <!-- Custom cell renderer via slot -->
    <template #status="{ row }">
      <Badge :variant="row.active ? 'success' : 'default'">
        {{ row.active ? 'Active' : 'Inactive' }}
      </Badge>
    </template>

    <!-- Custom empty state -->
    <template #empty-state>
      <EmptyState
        icon="users"
        title="No employees yet"
        description="Get started by adding your first employee"
      >
        <Button @click="openAddEmployeeModal">Add Employee</Button>
      </EmptyState>
    </template>
  </DataTable>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { DataTableColumn } from '@/components/composite/DataTable.vue';

const employees = ref([...]);
const loading = ref(false);
const selectedRows = ref([]);

const columns: DataTableColumn<Employee>[] = [
  { key: 'phone', label: 'Phone', sortable: true },
  { key: 'name', label: 'Name', sortable: true, filterable: true },
  { key: 'department', label: 'Department', filterable: true },
  { key: 'gender', label: 'Gender' },
  { key: 'status', label: 'Status' }, // Custom render via slot
];

const pagination = computed(() => ({
  page: currentPage.value,
  pageSize: 25,
  total: totalEmployees.value,
  onPageChange: (page: number) => {
    currentPage.value = page;
    fetchEmployees();
  },
}));

const bulkActions = [
  {
    label: 'Deactivate',
    variant: 'secondary',
    onClick: (rows) => handleBulkDeactivate(rows),
  },
  {
    label: 'Delete',
    variant: 'destructive',
    onClick: (rows) => handleBulkDelete(rows),
  },
];

const rowActions = [
  {
    label: 'Edit',
    icon: EditIcon,
    onClick: (row) => openEditModal(row),
  },
  {
    label: 'Deactivate',
    onClick: (row) => handleDeactivate(row),
  },
  {
    label: 'Delete',
    variant: 'destructive',
    onClick: (row) => handleDelete(row),
  },
];
</script>
```

---

### 2.2 FormField

**File**: `src/components/composite/FormField.vue`

**Description**: Wrapper for form inputs with label, hint, and error message.

**Props**:
```typescript
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string; // Error message
  hint?: string; // Helper text
  htmlFor?: string; // Link label to input
}
```

**Slots**:
```typescript
{
  default: () => VNode; // Input component
  label: () => VNode; // Custom label
  hint: () => VNode; // Custom hint
  error: () => VNode; // Custom error
}
```

**Usage**:
```vue
<FormField
  label="Phone Number"
  required
  :error="phoneError"
  hint="10-digit phone number"
  htmlFor="phone-input"
>
  <Input
    id="phone-input"
    v-model="phone"
    type="tel"
    :error="!!phoneError"
    @blur="validatePhone"
  />
</FormField>
```

---

### 2.3 SearchInput

**File**: `src/components/composite/SearchInput.vue`

**Description**: Input optimized for search with clear button and debounce.

**Props**:
```typescript
interface SearchInputProps {
  modelValue?: string;
  placeholder?: string;
  debounce?: number; // ms (default 300)
  loading?: boolean; // Show loading spinner
}
```

**Events**:
```typescript
{
  'update:modelValue': (value: string) => void;
  search: (query: string) => void; // Emitted after debounce
  clear: () => void;
}
```

**Usage**:
```vue
<SearchInput
  v-model="searchQuery"
  placeholder="Search employees..."
  :loading="isSearching"
  @search="handleSearch"
/>
```

---

### 2.4 Pagination

**File**: `src/components/composite/Pagination.vue`

**Description**: Navigate between pages of data.

**Props**:
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize?: number;
  variant?: 'simple' | 'full' | 'compact';
  showPageSize?: boolean;
  pageSizeOptions?: number[]; // [10, 25, 50, 100]
}
```

**Events**:
```typescript
{
  'page-change': (page: number) => void;
  'page-size-change': (pageSize: number) => void;
}
```

**Usage**:
```vue
<Pagination
  :currentPage="1"
  :totalPages="10"
  variant="full"
  showPageSize
  :pageSizeOptions="[10, 25, 50]"
  @page-change="handlePageChange"
  @page-size-change="handlePageSizeChange"
/>
```

---

### 2.5 FileUpload

**File**: `src/components/composite/FileUpload.vue`

**Description**: File upload with drag-and-drop and validation.

**Props**:
```typescript
interface FileUploadProps {
  accept?: string; // MIME types or extensions (.csv, .xlsx)
  multiple?: boolean;
  maxSize?: number; // bytes
  maxFiles?: number;
  variant?: 'dropzone' | 'button';
}
```

**Events**:
```typescript
{
  'files-selected': (files: File[]) => void;
  error: (error: string) => void;
}
```

**Usage**:
```vue
<FileUpload
  accept=".csv,.xlsx"
  :maxSize="5 * 1024 * 1024"
  variant="dropzone"
  @files-selected="handleFiles"
  @error="handleError"
/>
```

---

### 2.6 StatusIndicator

**File**: `src/components/composite/StatusIndicator.vue`

**Description**: Visual status display.

**Props**:
```typescript
interface StatusIndicatorProps {
  status: 'active' | 'inactive' | 'success' | 'error' | 'warning' | 'info';
  variant?: 'dot' | 'dot-text' | 'badge' | 'pulse';
  label?: string;
  size?: 'sm' | 'base' | 'lg';
}
```

**Usage**:
```vue
<StatusIndicator status="active" variant="dot-text" label="Active" />
<StatusIndicator status="error" variant="pulse" label="Offline" />
```

---

## 3. Feature Components

### 3.1 QRScanner

**File**: `src/components/feature/QRScanner.vue`

**Description**: Camera-based QR code scanner with real-time detection.

**Props**:
```typescript
interface QRScannerProps {
  enabled?: boolean; // Can pause scanning
  scanDelay?: number; // ms between scans (prevent duplicates, default 1000)
  showTorch?: boolean; // Show torch/flashlight button
  showCameraSwitch?: boolean; // Show camera switch button
}
```

**Events**:
```typescript
{
  scan: (qrCode: string) => Promise<void>; // Called when QR detected
  error: (error: Error) => void; // Camera or detection errors
}
```

**Usage**:
```vue
<template>
  <QRScanner
    :enabled="!isProcessing"
    showTorch
    showCameraSwitch
    @scan="handleScan"
    @error="handleError"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useScanAPI } from '@/composables/useScanAPI';

const isProcessing = ref(false);
const { submitScan } = useScanAPI();

async function handleScan(qrCode: string) {
  isProcessing.value = true;
  try {
    const result = await submitScan(qrCode);
    // Show result
  } catch (error) {
    // Handle error
  } finally {
    isProcessing.value = false;
  }
}
</script>
```

---

### 3.2 QRCodeDisplay

**File**: `src/components/feature/QRCodeDisplay.vue`

**Description**: Display and download QR code.

**Props**:
```typescript
interface QRCodeDisplayProps {
  value: string; // QR code data
  size?: 'sm' | 'base' | 'lg' | 'xl'; // 128, 256, 384, 512 px
  showDownload?: boolean;
  showPrint?: boolean;
  label?: string; // Employee name below QR
  logoUrl?: string; // Center logo overlay (optional)
}
```

**Events**:
```typescript
{
  download: () => void;
  print: () => void;
}
```

**Usage**:
```vue
<QRCodeDisplay
  :value="employee.qrCode"
  size="lg"
  showDownload
  showPrint
  :label="employee.name"
  @download="handleDownload"
/>
```

---

### 3.3 ScanResultDisplay

**File**: `src/components/feature/ScanResultDisplay.vue`

**Description**: Display scan result (success or error).

**Props**:
```typescript
interface ScanResultDisplayProps {
  status: 'success' | 'error';
  employeeName?: string;
  message: string;
  timestamp?: Date;
  autoDismiss?: number; // ms, auto-close after delay (default 3000)
}
```

**Events**:
```typescript
{
  dismiss: () => void;
}
```

**Usage**:
```vue
<ScanResultDisplay
  status="success"
  employeeName="John Doe"
  message="Scan successful!"
  :timestamp="new Date()"
  :autoDismiss="3000"
  @dismiss="handleDismiss"
/>

<ScanResultDisplay
  status="error"
  message="Already scanned today"
  :autoDismiss="3000"
/>
```

---

### 3.4 EmployeeForm

**File**: `src/components/feature/EmployeeForm.vue`

**Description**: Form to create/edit employee.

**Props**:
```typescript
interface EmployeeFormData {
  id?: string;
  phone: string;
  name: string;
  department: string;
  gender: string;
  active: boolean;
}

interface EmployeeFormProps {
  mode: 'create' | 'edit';
  initialData?: EmployeeFormData;
  loading?: boolean;
}
```

**Events**:
```typescript
{
  submit: (data: EmployeeFormData) => Promise<void>;
  cancel: () => void;
}
```

**Usage**:
```vue
<EmployeeForm
  mode="create"
  :loading="isSubmitting"
  @submit="handleSubmit"
  @cancel="closeModal"
/>

<EmployeeForm
  mode="edit"
  :initialData="selectedEmployee"
  :loading="isSubmitting"
  @submit="handleUpdate"
  @cancel="closeModal"
/>
```

---

### 3.5 BulkUploadModal

**File**: `src/components/feature/BulkUploadModal.vue`

**Description**: Upload CSV/XLS to import employees.

**Props**:
```typescript
interface BulkUploadModalProps {
  open: boolean;
}
```

**Events**:
```typescript
{
  'update:open': (open: boolean) => void;
  upload: (file: File) => Promise<{
    success: number;
    errors: Array<{ row: number; message: string }>;
  }>;
}
```

**Usage**:
```vue
<BulkUploadModal
  v-model:open="showBulkUpload"
  @upload="handleBulkUpload"
/>
```

---

### 3.6 ScannerAccountForm

**File**: `src/components/feature/ScannerAccountForm.vue`

**Description**: Form to create scanner account.

**Props**:
```typescript
interface ScannerFormData {
  username: string;
  name?: string;
  password: string;
  confirmPassword: string;
}

interface ScannerAccountFormProps {
  loading?: boolean;
}
```

**Events**:
```typescript
{
  submit: (data: ScannerFormData) => Promise<void>;
  cancel: () => void;
}
```

**Usage**:
```vue
<ScannerAccountForm
  :loading="isSubmitting"
  @submit="handleCreateScanner"
  @cancel="closeModal"
/>
```

---

## 4. Layout Components

### 4.1 AppHeader

**File**: `src/components/layout/AppHeader.vue`

**Description**: Application header with logo, user info, and logout.

**Props**:
```typescript
interface AppHeaderProps {
  showSidebar?: boolean; // Show hamburger menu for mobile
  userName?: string;
  userRole?: 'admin' | 'scanner';
}
```

**Events**:
```typescript
{
  'toggle-sidebar': () => void;
  logout: () => void;
}
```

---

### 4.2 Sidebar

**File**: `src/components/layout/Sidebar.vue`

**Description**: Navigation sidebar for admin.

**Props**:
```typescript
interface SidebarProps {
  open?: boolean; // For mobile
  activeRoute?: string;
}
```

**Events**:
```typescript
{
  'update:open': (open: boolean) => void;
  navigate: (route: string) => void;
}
```

---

### 4.3 MainLayout

**File**: `src/components/layout/MainLayout.vue`

**Description**: Main layout wrapper with header and sidebar.

**Props**:
```typescript
interface MainLayoutProps {
  role: 'admin' | 'scanner';
}
```

**Slots**:
```typescript
{
  default: () => VNode; // Page content
}
```

---

## 5. Utility Composables

### 5.1 useAuth

**File**: `src/composables/useAuth.ts`

```typescript
export function useAuth() {
  const user = ref<User | null>(null);
  const loading = ref(false);

  async function login(username: string, password: string): Promise<void> {
    // Login logic
  }

  async function logout(): Promise<void> {
    // Logout logic
  }

  function checkAuth(): boolean {
    // Check if user is authenticated
  }

  function hasRole(role: 'admin' | 'scanner'): boolean {
    // Check user role
  }

  return {
    user,
    loading,
    login,
    logout,
    checkAuth,
    hasRole,
  };
}
```

---

### 5.2 useEmployees

**File**: `src/composables/useEmployees.ts`

```typescript
export function useEmployees() {
  const employees = ref<Employee[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function fetchEmployees(filters?: EmployeeFilters): Promise<void> {
    // Fetch employees
  }

  async function createEmployee(data: EmployeeFormData): Promise<Employee> {
    // Create employee
  }

  async function updateEmployee(id: string, data: EmployeeFormData): Promise<Employee> {
    // Update employee
  }

  async function deleteEmployee(id: string): Promise<void> {
    // Delete employee
  }

  async function toggleActive(id: string, active: boolean): Promise<void> {
    // Activate/deactivate employee
  }

  async function regenerateQR(id: string): Promise<string> {
    // Regenerate QR code
  }

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    toggleActive,
    regenerateQR,
  };
}
```

---

### 5.3 useQRScanner

**File**: `src/composables/useQRScanner.ts`

```typescript
export function useQRScanner() {
  const stream = ref<MediaStream | null>(null);
  const scanning = ref(false);
  const error = ref<Error | null>(null);

  async function requestCamera(): Promise<void> {
    // Request camera permission
  }

  async function startScanning(onScan: (qrCode: string) => void): Promise<void> {
    // Start QR scanning
  }

  function stopScanning(): void {
    // Stop scanning and release camera
  }

  function toggleTorch(enabled: boolean): void {
    // Toggle flashlight
  }

  function switchCamera(): void {
    // Switch between front/back camera
  }

  return {
    stream,
    scanning,
    error,
    requestCamera,
    startScanning,
    stopScanning,
    toggleTorch,
    switchCamera,
  };
}
```

---

### 5.4 useToast

**File**: `src/composables/useToast.ts`

```typescript
export function useToast() {
  function toast(options: ToastOptions): void {
    // Show toast notification
  }

  function success(title: string, description?: string): void {
    toast({ variant: 'success', title, description });
  }

  function error(title: string, description?: string): void {
    toast({ variant: 'error', title, description });
  }

  function warning(title: string, description?: string): void {
    toast({ variant: 'warning', title, description });
  }

  function info(title: string, description?: string): void {
    toast({ variant: 'info', title, description });
  }

  return {
    toast,
    success,
    error,
    warning,
    info,
  };
}
```

---

**End of Component API Reference**

This comprehensive reference provides detailed TypeScript interfaces and usage examples for all components in the Breakfast Counter QR System. Use this as a guide during implementation to ensure consistency and type safety.
