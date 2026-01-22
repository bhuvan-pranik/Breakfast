<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEmployeeStore } from '@/stores/employee.store'
import { usePagination } from '@/composables/usePagination'
import type { Employee } from '@/types'
import BulkUploadModal from '@/components/BulkUploadModal.vue'
import EmployeeFilters from '@/components/employee/EmployeeFilters.vue'
import EmployeeTable from '@/components/employee/EmployeeTable.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { Plus, Download, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const router = useRouter()
const employeeStore = useEmployeeStore()
const { toast } = useToast()

const searchQuery = ref('')
const selectedDepartment = ref('all')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
const showBulkUpload = ref(false)
const employeeToDelete = ref<Employee | null>(null)
const showDeleteDialog = ref(false)

onMounted(async () => {
  await employeeStore.fetchEmployees()
})

const filteredEmployees = computed(() => {
  let result = [...employeeStore.employees]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(emp =>
      (emp.name?.toLowerCase() || '').includes(query) ||
      emp.phone.includes(query) ||
      (emp.employee_id?.toLowerCase() || '').includes(query) ||
      (emp.email?.toLowerCase() || '').includes(query) ||
      (emp.department?.toLowerCase() || '').includes(query)
    )
  }

  // Department filter
  if (selectedDepartment.value && selectedDepartment.value !== 'all') {
    result = result.filter(emp => emp.department === selectedDepartment.value)
  }

  // Status filter
  if (statusFilter.value !== 'all') {
    const isActive = statusFilter.value === 'active'
    result = result.filter(emp => emp.is_active === isActive)
  }

  return result
})

// Pagination
const {
  paginatedItems: paginatedEmployees,
  currentPage,
  pageSize,
  rangeText,
  pageNumbers,
  nextPage,
  previousPage,
  goToPage,
  setPageSize,
  hasPrevious,
  hasNext
} = usePagination(() => filteredEmployees.value, {
  initialPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100]
})

const createEmployee = () => {
  router.push('/admin/employees/create')
}

const viewEmployee = (phone: string) => {
  router.push(`/admin/employees/${phone}`)
}

const editEmployee = (phone: string) => {
  router.push(`/admin/employees/${phone}/edit`)
}

const confirmDeleteEmployee = (employee: Employee) => {
  employeeToDelete.value = employee
  showDeleteDialog.value = true
}

const deleteEmployee = async () => {
  if (!employeeToDelete.value) return

  try {
    await employeeStore.deleteEmployee(employeeToDelete.value.phone)
    toast({
      title: 'Success',
      description: 'Employee deleted successfully',
    })
    showDeleteDialog.value = false
    employeeToDelete.value = null
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to delete employee',
      variant: 'destructive',
    })
  }
}

const toggleStatus = async (employee: Employee) => {
  try {
    if (employee.is_active) {
      await employeeStore.deleteEmployee(employee.phone)
      toast({
        title: 'Success',
        description: 'Employee deactivated',
      })
    } else {
      await employeeStore.activateEmployee(employee.phone)
      toast({
        title: 'Success',
        description: 'Employee activated',
      })
    }
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to update employee status',
      variant: 'destructive',
    })
  }
}

const downloadQR = async (employee: Employee) => {
  try {
    if (!employee.qr_code) {
      toast({
        title: 'Error',
        description: 'Employee does not have a QR code',
        variant: 'destructive',
      })
      return
    }
    const { qrcodeService } = await import('@/services/qrcode.service')
    const dataUrl = await qrcodeService.generateQRCodeImage(employee.qr_code)

    const link = document.createElement('a')
    link.download = `${employee.name || employee.phone}-QR.png`
    link.href = dataUrl
    link.click()

    toast({
      title: 'Success',
      description: 'QR code downloaded',
    })
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to download QR code',
      variant: 'destructive',
    })
  }
}

const handleBulkUpload = async (_count: number) => {
  showBulkUpload.value = false
  await employeeStore.fetchEmployees()
}
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold">Employees</h1>
        <p class="text-muted-foreground mt-1">
          Manage employee records and QR codes
        </p>
      </div>
      <div class="flex gap-2">
        <Button @click="showBulkUpload = true" variant="outline">
          <Download class="w-4 h-4 mr-2" />
          Bulk Upload
        </Button>
        <Button @click="createEmployee">
          <Plus class="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>
    </div>

    <!-- Filters -->
    <EmployeeFilters
      v-model:search-query="searchQuery"
      v-model:selected-department="selectedDepartment"
      v-model:status-filter="statusFilter"
      :result-count="filteredEmployees.length"
    />

    <!-- Employees Table -->
    <EmployeeTable
      :employees="paginatedEmployees"
      :is-loading="employeeStore.isLoading"
      @view="viewEmployee"
      @edit="editEmployee"
      @delete="confirmDeleteEmployee"
      @download-qr="downloadQR"
      @toggle-status="toggleStatus"
      @create="createEmployee"
    />

    <!-- Pagination -->
    <div v-if="filteredEmployees.length > 0" class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-card rounded-lg border p-4">
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground">Rows per page:</span>
        <Select :model-value="pageSize.toString()" @update:model-value="setPageSize(Number($event))">
          <SelectTrigger class="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        <span class="text-sm text-muted-foreground ml-4">{{ rangeText }}</span>
      </div>

      <div class="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          @click="previousPage"
          :disabled="!hasPrevious"
        >
          <ChevronLeft class="w-4 h-4" />
        </Button>

        <Button
          v-for="page in pageNumbers"
          :key="page"
          variant="outline"
          size="sm"
          @click="goToPage(page)"
          :class="{ 'bg-primary text-primary-foreground': page === currentPage }"
        >
          {{ page }}
        </Button>

        <Button
          variant="outline"
          size="sm"
          @click="nextPage"
          :disabled="!hasNext"
        >
          <ChevronRight class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Employee</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {{ employeeToDelete?.name }}?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteDialog = false">
            Cancel
          </Button>
          <Button variant="destructive" @click="deleteEmployee">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Bulk Upload Modal -->
    <BulkUploadModal
      v-if="showBulkUpload"
      @close="showBulkUpload = false"
      @uploaded="handleBulkUpload"
    />
  </div>
</template>

