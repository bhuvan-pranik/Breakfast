<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEmployeeStore } from '@/stores/employee.store'
import { DEPARTMENTS } from '@/utils/constants'
import type { Employee } from '@/types'
import BulkUploadModal from '@/components/BulkUploadModal.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { Plus, Pencil, Trash2, Eye, Search, Download } from 'lucide-vue-next'

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
    <div class="bg-card rounded-lg border p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Search</label>
          <div class="relative">
            <Search class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              v-model="searchQuery"
              placeholder="Search by name, phone, or department..."
              class="pl-9"
            />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Department</label>
          <Select v-model="selectedDepartment">
            <SelectTrigger>
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem v-for="dept in DEPARTMENTS" :key="dept" :value="dept">
                {{ dept }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Status</label>
          <Select v-model="statusFilter">
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="text-sm text-muted-foreground">
        {{ filteredEmployees.length }} employee{{ filteredEmployees.length !== 1 ? 's' : '' }} found
      </div>
    </div>

    <!-- Employees Table -->
    <div class="bg-card rounded-lg border overflow-hidden">
      <Table v-if="filteredEmployees.length > 0">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Employee ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="w-[200px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="employee in filteredEmployees" :key="employee.phone">
            <TableCell class="font-medium">{{ employee.name }}</TableCell>
            <TableCell class="font-mono">{{ employee.phone }}</TableCell>
            <TableCell>{{ employee.employee_id }}</TableCell>
            <TableCell>{{ employee.email }}</TableCell>
            <TableCell>
              <Badge variant="secondary">{{ employee.department }}</Badge>
            </TableCell>
            <TableCell>
              <Badge :variant="employee.is_active ? 'default' : 'secondary'">
                {{ employee.is_active ? 'Active' : 'Inactive' }}
              </Badge>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-1">
                <Button
                  @click="viewEmployee(employee.phone)"
                  variant="ghost"
                  size="sm"
                  title="View Details"
                >
                  <Eye class="w-4 h-4" />
                </Button>
                <Button
                  @click="editEmployee(employee.phone)"
                  variant="ghost"
                  size="sm"
                  title="Edit"
                >
                  <Pencil class="w-4 h-4" />
                </Button>
                <Button
                  @click="downloadQR(employee)"
                  variant="ghost"
                  size="sm"
                  title="Download QR"
                >
                  <Download class="w-4 h-4" />
                </Button>
                <Button
                  @click="toggleStatus(employee)"
                  variant="ghost"
                  size="sm"
                  :title="employee.is_active ? 'Deactivate' : 'Activate'"
                >
                  <span :class="employee.is_active ? 'text-red-500' : 'text-green-500'">
                    {{ employee.is_active ? '●' : '●' }}
                  </span>
                </Button>
                <Button
                  @click="confirmDeleteEmployee(employee)"
                  variant="ghost"
                  size="sm"
                  title="Delete"
                  class="text-red-600 hover:text-red-700"
                >
                  <Trash2 class="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div v-else-if="employeeStore.isLoading" class="flex flex-col items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p class="text-muted-foreground">Loading employees...</p>
      </div>

      <div v-else class="flex flex-col items-center justify-center py-12">
        <p class="text-muted-foreground mb-4">No employees found</p>
        <Button @click="createEmployee">
          <Plus class="w-4 h-4 mr-2" />
          Create First Employee
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

