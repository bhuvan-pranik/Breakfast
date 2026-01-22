<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAttendanceStore } from '@/stores/attendance.store'
import { useAuthStore } from '@/stores/auth.store'
import { formatTime } from '@/utils/formatters'
import type { AttendanceRecord } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, Download, Filter, RefreshCw, History } from 'lucide-vue-next'

const attendanceStore = useAttendanceStore()
const authStore = useAuthStore()

const selectedDate = ref(new Date().toISOString().split('T')[0])
const statusFilter = ref<'all' | 'success' | 'duplicate' | 'invalid'>('all')

onMounted(async () => {
  await loadHistory()
})

const loadHistory = async () => {
  if (authStore.scannerId) {
    await attendanceStore.fetchRecords({ 
      scannerId: authStore.scannerId, 
      dateFrom: selectedDate.value,
      dateTo: selectedDate.value
    })
  }
}

const filteredRecords = computed(() => {
  if (statusFilter.value === 'all') {
    return attendanceStore.records
  }
  return attendanceStore.records.filter((r: AttendanceRecord) => r.status === statusFilter.value)
})

const successCount = computed(() => 
  filteredRecords.value.filter((r: AttendanceRecord) => r.status === 'success').length
)

const duplicateCount = computed(() => 
  filteredRecords.value.filter((r: AttendanceRecord) => r.status === 'duplicate').length
)

const invalidCount = computed(() => 
  filteredRecords.value.filter((r: AttendanceRecord) => r.status === 'invalid' || r.status === 'inactive').length
)

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    success: 'default',
    duplicate: 'secondary',
    invalid: 'destructive',
    inactive: 'destructive'
  }
  return variants[status] || 'outline'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    success: 'Success',
    duplicate: 'Duplicate',
    invalid: 'Invalid',
    inactive: 'Inactive'
  }
  return labels[status] || status
}

const exportToCSV = () => {
  const headers = ['Time', 'Employee Phone', 'Status', 'Message']
  const rows = filteredRecords.value.map(record => [
    formatTime(record.scan_timestamp),
    record.employee_phone,
    getStatusLabel(record.status),
    record.validation_message || ''
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `scan-history-${selectedDate.value}.csv`
  link.click()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-8">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Scan History</h1>
          <p class="text-gray-600 mt-1">View and manage attendance scan records</p>
        </div>
        <Button variant="outline" @click="loadHistory" class="gap-2">
          <RefreshCw class="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <!-- Filters Card -->
      <Card class="shadow-sm">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Filter class="w-5 h-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter scan records by date and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Date Filter -->
            <div class="space-y-2">
              <Label for="date" class="flex items-center gap-2">
                <Calendar class="w-4 h-4" />
                Date
              </Label>
              <Input
                id="date"
                v-model="selectedDate"
                type="date"
                @change="loadHistory"
                class="w-full"
              />
            </div>

            <!-- Status Filter -->
            <div class="space-y-2">
              <Label for="status" class="flex items-center gap-2">
                <Filter class="w-4 h-4" />
                Status
              </Label>
              <Select v-model="statusFilter">
                <SelectTrigger id="status" class="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success Only</SelectItem>
                  <SelectItem value="duplicate">Duplicates Only</SelectItem>
                  <SelectItem value="invalid">Invalid Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Stats Summary -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t">
            <div class="bg-indigo-50 rounded-lg p-4 text-center border-l-4 border-indigo-500">
              <div class="text-2xl font-bold text-gray-900 mb-1">
                {{ filteredRecords.length }}
              </div>
              <div class="text-sm text-gray-600">Total Scans</div>
            </div>

            <div class="bg-green-50 rounded-lg p-4 text-center border-l-4 border-green-500">
              <div class="text-2xl font-bold text-gray-900 mb-1">
                {{ successCount }}
              </div>
              <div class="text-sm text-gray-600">Successful</div>
            </div>

            <div class="bg-orange-50 rounded-lg p-4 text-center border-l-4 border-orange-500">
              <div class="text-2xl font-bold text-gray-900 mb-1">
                {{ duplicateCount }}
              </div>
              <div class="text-sm text-gray-600">Duplicates</div>
            </div>

            <div class="bg-red-50 rounded-lg p-4 text-center border-l-4 border-red-500">
              <div class="text-2xl font-bold text-gray-900 mb-1">
                {{ invalidCount }}
              </div>
              <div class="text-sm text-gray-600">Invalid</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- History Table Card -->
      <Card class="shadow-sm">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle class="flex items-center gap-2">
                <History class="w-5 h-5" />
                Scan Records
              </CardTitle>
              <CardDescription>
                {{ filteredRecords.length }} records found for {{ selectedDate }}
              </CardDescription>
            </div>
            <Button variant="outline" @click="exportToCSV" class="gap-2" :disabled="filteredRecords.length === 0">
              <Download class="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <!-- Loading State -->
          <div v-if="attendanceStore.isLoading" class="space-y-4">
            <div v-for="i in 5" :key="i" class="flex items-center space-x-4">
              <Skeleton class="h-12 w-24" />
              <Skeleton class="h-12 flex-1" />
              <Skeleton class="h-12 w-32" />
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredRecords.length === 0" class="text-center py-12">
            <History class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500 text-lg">No scans found for this date</p>
            <p class="text-gray-400 text-sm mt-1">Try selecting a different date or adjusting filters</p>
          </div>

          <!-- Table -->
          <div v-else class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-[120px]">Time</TableHead>
                  <TableHead>Employee Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead class="w-[200px]">Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="record in filteredRecords"
                  :key="record.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <TableCell class="font-medium text-indigo-600">
                    {{ formatTime(record.scan_timestamp) }}
                  </TableCell>
                  <TableCell>
                    <div class="font-medium">{{ record.employee_phone }}</div>
                  </TableCell>
                  <TableCell>
                    <Badge :variant="getStatusVariant(record.status)">
                      {{ getStatusLabel(record.status) }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-sm text-gray-600">
                    {{ record.validation_message || '-' }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
