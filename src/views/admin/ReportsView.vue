<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { attendanceService } from '@/services/attendance.service'
import { employeeService } from '@/services/employee.service'
import type { AttendanceRecord } from '@/types'

// Import extracted components
import DateRangePicker from '@/components/admin/DateRangePicker.vue'
import ReportSummaryCards from '@/components/admin/ReportSummaryCards.vue'
import AttendanceSummaryTab from '@/components/admin/AttendanceSummaryTab.vue'

const { toast } = useToast()

// State
const isLoading = ref(false)
const activeTab = ref('attendance')
const dateRange = ref<{ start: Date | null; end: Date | null }>({
  start: new Date(new Date().setDate(new Date().getDate() - 7)),
  end: new Date()
})
const records = ref<AttendanceRecord[]>([])

// Summary computed
const summary = computed(() => {
  const totalScans = records.value.length
  const successfulScans = records.value.filter(r => r.status === 'success').length
  const duplicateScans = records.value.filter(r => r.status === 'duplicate').length
  const uniqueEmployees = new Set(records.value.map(r => r.employee_phone)).size
  const successRate = totalScans > 0 ? Math.round((successfulScans / totalScans) * 100) : 0
  
  const startDate = dateRange.value.start
  const endDate = dateRange.value.end
  const totalDays = startDate && endDate 
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 1
  
  const avgDailyScans = totalDays > 0 ? Math.round(totalScans / totalDays) : 0
  
  return {
    totalScans,
    successfulScans,
    duplicateScans,
    uniqueEmployees,
    successRate,
    totalDays,
    avgDailyScans
  }
})

// Methods
const refreshData = async () => {
  if (!dateRange.value.start || !dateRange.value.end) {
    toast({
      title: 'Error',
      description: 'Please select a date range',
      variant: 'destructive'
    })
    return
  }

  isLoading.value = true
  
  try {
    const dateFrom = dateRange.value.start.toISOString().split('T')[0]
    const dateTo = dateRange.value.end.toISOString().split('T')[0]
    
    const { records: attendanceRecords } = await attendanceService.getRecords({
      dateFrom,
      dateTo,
      pageSize: 1000
    })
    records.value = attendanceRecords
    
    toast({
      title: 'Success',
      description: 'Reports refreshed successfully'
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    toast({
      title: 'Error',
      description: 'Failed to fetch reports. Please try again.',
      variant: 'destructive'
    })
  } finally {
    isLoading.value = false
  }
}

const handleDateRangeUpdate = (newRange: { start: Date | null; end: Date | null }) => {
  dateRange.value = newRange
  refreshData()
}

const exportAttendanceCSV = () => {
  let csv = 'Date,Employee Phone,Scanner ID,Status\n'
  records.value.forEach(record => {
    const date = new Date(record.scan_timestamp).toLocaleString()
    csv += `${date},${record.employee_phone},${record.scanner_id},${record.status}\n`
  })
  
  const filename = `attendance-report-${dateRange.value.start?.toISOString().split('T')[0]}-to-${dateRange.value.end?.toISOString().split('T')[0]}.csv`
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
  
  toast({
    title: 'Success',
    description: 'Report exported successfully'
  })
}

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>

<template>
  <div class="space-y-6 p-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Reports</h1>
        <p class="text-muted-foreground">View and analyze attendance data</p>
      </div>
      
      <div class="flex items-center gap-2">
        <DateRangePicker
          :start-date="dateRange.start"
          :end-date="dateRange.end"
          @update="handleDateRangeUpdate"
        />
        
        <Button variant="outline" @click="refreshData">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Summary Cards -->
    <ReportSummaryCards
      :total-scans="summary.totalScans"
      :successful-scans="summary.successfulScans"
      :success-rate="summary.successRate"
      :duplicate-scans="summary.duplicateScans"
      :unique-employees="summary.uniqueEmployees"
      :avg-daily-scans="summary.avgDailyScans"
      :total-days="summary.totalDays"
    />

    <!-- Tabs -->
    <Tabs v-model="activeTab" class="space-y-4">
      <TabsList class="grid w-full grid-cols-2 lg:grid-cols-4">
        <TabsTrigger value="attendance">Attendance Summary</TabsTrigger>
        <TabsTrigger value="employees">Employee Reports</TabsTrigger>
        <TabsTrigger value="scanners">Scanner Reports</TabsTrigger>
        <TabsTrigger value="custom">Custom Reports</TabsTrigger>
      </TabsList>

      <!-- Attendance Summary Tab -->
      <TabsContent value="attendance">
        <AttendanceSummaryTab
          :records="records"
          :is-loading="isLoading"
          @export="exportAttendanceCSV"
        />
      </TabsContent>

      <!-- Employee Reports Tab -->
      <TabsContent value="employees">
        <div class="text-center py-12 text-muted-foreground">
          Employee reports coming soon...
        </div>
      </TabsContent>

      <!-- Scanner Reports Tab -->
      <TabsContent value="scanners">
        <div class="text-center py-12 text-muted-foreground">
          Scanner reports coming soon...
        </div>
      </TabsContent>

      <!-- Custom Reports Tab -->
      <TabsContent value="custom">
        <div class="text-center py-12 text-muted-foreground">
          Custom reports coming soon...
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>
