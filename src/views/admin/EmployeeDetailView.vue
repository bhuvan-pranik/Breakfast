<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEmployeeStore } from '@/stores/employee.store'
import { useAttendanceStore } from '@/stores/attendance.store'
import type { Employee } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import { ArrowLeft, Pencil, Download, QrCode, Calendar, Clock, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const employeeStore = useEmployeeStore()
const attendanceStore = useAttendanceStore()
const { toast } = useToast()

const phone = route.params.phone as string
const isLoading = ref(true)
const employee = ref<Employee | null>(null)

onMounted(async () => {
  try {
    await employeeStore.fetchEmployees()
    employee.value = employeeStore.employees.find(emp => emp.phone === phone) || null

    if (!employee.value) {
      toast({
        title: 'Error',
        description: 'Employee not found',
        variant: 'destructive',
      })
      router.push('/admin/employees')
      return
    }

    // Fetch attendance records for this employee (last 30 days)
    await attendanceStore.fetchRecords({
      employeePhone: phone,
      pageSize: 50
    })
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to load employee data',
      variant: 'destructive',
    })
    router.push('/admin/employees')
  } finally {
    isLoading.value = false
  }
})

const attendanceRecords = computed(() => {
  return attendanceStore.records.filter((record: any) => record.employee_phone === phone)
})

const editEmployee = () => {
  router.push(`/admin/employees/${phone}/edit`)
}

const downloadQR = async () => {
  if (!employee.value?.qr_code) {
    toast({
      title: 'Error',
      description: 'Employee does not have a QR code',
      variant: 'destructive',
    })
    return
  }

  try {
    const { qrcodeService } = await import('@/services/qrcode.service')
    const dataUrl = await qrcodeService.generateQRCodeImage(employee.value.qr_code)

    const link = document.createElement('a')
    link.download = `${employee.value.name || employee.value.phone}-QR.png`
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

const regenerateQR = async () => {
  if (!employee.value) return

  try {
    await employeeStore.regenerateQRCode(employee.value.phone)
    toast({
      title: 'Success',
      description: 'QR code regenerated successfully',
    })
    // Refresh employee data
    await employeeStore.fetchEmployees()
    employee.value = employeeStore.employees.find(emp => emp.phone === phone) || null
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to regenerate QR code',
      variant: 'destructive',
    })
  }
}

const goBack = () => {
  router.push('/admin/employees')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="flex items-center gap-4 mb-8">
      <Button variant="ghost" @click="goBack">
        <ArrowLeft class="w-4 h-4 mr-2" />
        Back to Employees
      </Button>
      <div class="flex-1">
        <h1 class="text-3xl font-bold">Employee Details</h1>
        <p class="text-muted-foreground mt-1">
          View and manage employee information
        </p>
      </div>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin mr-2" />
      <span>Loading employee data...</span>
    </div>

    <div v-else-if="employee" class="space-y-6">
      <!-- Employee Header Card -->
      <Card>
        <CardHeader>
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle class="text-2xl">{{ employee.name }}</CardTitle>
              <CardDescription class="text-lg">
                {{ employee.department }} • {{ employee.employee_id }}
              </CardDescription>
            </div>
            <div class="flex items-center gap-2">
              <Badge :variant="employee.is_active ? 'default' : 'secondary'">
                {{ employee.is_active ? 'Active' : 'Inactive' }}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="flex flex-wrap gap-4">
            <Button @click="editEmployee">
              <Pencil class="w-4 h-4 mr-2" />
              Edit Employee
            </Button>
            <Button @click="downloadQR" variant="outline">
              <Download class="w-4 h-4 mr-2" />
              Download QR
            </Button>
            <Button @click="regenerateQR" variant="outline">
              <QrCode class="w-4 h-4 mr-2" />
              Regenerate QR
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Tabs for organizing information -->
      <Tabs default-value="details" class="w-full">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="qr-code">QR Code</TabsTrigger>
          <TabsTrigger value="attendance">Attendance History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p class="text-lg">{{ employee.name }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Phone Number</label>
                  <p class="text-lg font-mono">{{ employee.phone }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Employee ID</label>
                  <p class="text-lg">{{ employee.employee_id }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Email</label>
                  <p class="text-lg">{{ employee.email }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Department</label>
                  <p class="text-lg">{{ employee.department }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge :variant="employee.is_active ? 'default' : 'secondary'" class="mt-1">
                    {{ employee.is_active ? 'Active' : 'Inactive' }}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr-code" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
              <CardDescription>
                This QR code is used for attendance scanning
              </CardDescription>
            </CardHeader>
            <CardContent class="text-center space-y-4">
              <div v-if="employee.qr_code" class="bg-white border rounded-lg p-6 inline-block">
                <img
                  :src="`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${employee.qr_code}`"
                  alt="Employee QR Code"
                  class="max-w-full h-auto"
                />
              </div>
              <div v-else class="text-muted-foreground">
                No QR code available for this employee
              </div>

              <div class="flex justify-center gap-4">
                <Button @click="downloadQR" :disabled="!employee.qr_code">
                  <Download class="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
                <Button @click="regenerateQR" variant="outline">
                  <QrCode class="w-4 h-4 mr-2" />
                  Regenerate QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>
                Recent attendance records for this employee
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="attendanceRecords.length === 0" class="text-center py-8 text-muted-foreground">
                No attendance records found
              </div>
              <div v-else>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scanner</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="record in attendanceRecords.slice(0, 20)" :key="record.id">
                      <TableCell>
                        <div class="flex items-center gap-2">
                          <Calendar class="w-4 h-4 text-muted-foreground" />
                          {{ formatDate(record.created_at) }}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div class="flex items-center gap-2">
                          <Clock class="w-4 h-4 text-muted-foreground" />
                          {{ formatTime(record.created_at) }}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{{ record.status }}</Badge>
                      </TableCell>
                      <TableCell>{{ record.scanner_id || 'N/A' }}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <p v-if="attendanceRecords.length > 20" class="text-sm text-muted-foreground mt-4">
                  Showing latest 20 records out of {{ attendanceRecords.length }} total
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>
