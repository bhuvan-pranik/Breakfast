<template>
  <div class="space-y-6 p-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Reports</h1>
        <p class="text-muted-foreground">View and analyze attendance data</p>
      </div>
      
      <!-- Date Range Picker -->
      <div class="flex items-center gap-2">
        <Popover v-model:open="isDateRangeOpen">
          <PopoverTrigger as-child>
            <Button variant="outline" class="w-full sm:w-auto justify-start text-left font-normal">
              <Calendar class="mr-2 h-4 w-4" />
              <span v-if="dateRange.start && dateRange.end">
                {{ formatDate(dateRange.start) }} - {{ formatDate(dateRange.end) }}
              </span>
              <span v-else>Pick date range</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0" align="end">
            <div class="p-3 space-y-3">
              <div class="space-y-2">
                <Label>Start Date</Label>
                <Calendar
                  v-model="dateRange.start"
                  :is-disabled="(date: Date) => date > new Date() || (dateRange.end ? date > dateRange.end : false)"
                  initial-focus
                />
              </div>
              <Separator />
              <div class="space-y-2">
                <Label>End Date</Label>
                <Calendar
                  v-model="dateRange.end"
                  :is-disabled="(date: Date) => date > new Date() || (dateRange.start ? date < dateRange.start : false)"
                />
              </div>
              <Separator />
              <div class="space-y-2">
                <Label>Quick Select</Label>
                <div class="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" @click="setDateRange('today')">Today</Button>
                  <Button variant="outline" size="sm" @click="setDateRange('week')">This Week</Button>
                  <Button variant="outline" size="sm" @click="setDateRange('month')">This Month</Button>
                  <Button variant="outline" size="sm" @click="setDateRange('last7')">Last 7 Days</Button>
                  <Button variant="outline" size="sm" @click="setDateRange('last30')">Last 30 Days</Button>
                  <Button variant="outline" size="sm" @click="setDateRange('custom')">Custom</Button>
                </div>
              </div>
              <div class="flex justify-end gap-2">
                <Button variant="outline" @click="isDateRangeOpen = false">Cancel</Button>
                <Button @click="applyDateRange">Apply</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button variant="outline" @click="refreshData">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Scans</CardTitle>
          <ScanLine class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ summary.totalScans }}</div>
          <p class="text-xs text-muted-foreground">
            {{ summary.successfulScans }} successful
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Success Rate</CardTitle>
          <TrendingUp class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ summary.successRate }}%</div>
          <p class="text-xs text-muted-foreground">
            {{ summary.duplicateScans }} duplicates
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Unique Employees</CardTitle>
          <Users class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ summary.uniqueEmployees }}</div>
          <p class="text-xs text-muted-foreground">
            Active in period
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Avg Daily Scans</CardTitle>
          <BarChart class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ summary.avgDailyScans }}</div>
          <p class="text-xs text-muted-foreground">
            {{ summary.totalDays }} days
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Tabs -->
    <Tabs v-model="activeTab" class="space-y-4">
      <TabsList class="grid w-full grid-cols-2 lg:grid-cols-4">
        <TabsTrigger value="attendance">Attendance Summary</TabsTrigger>
        <TabsTrigger value="employees">Employee Reports</TabsTrigger>
        <TabsTrigger value="scanners">Scanner Reports</TabsTrigger>
        <TabsTrigger value="custom">Custom Reports</TabsTrigger>
      </TabsList>

      <!-- Attendance Summary Tab -->
      <TabsContent value="attendance" class="space-y-4">
        <Card>
          <CardHeader>
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Attendance Trends</CardTitle>
                <CardDescription>Daily attendance over selected period</CardDescription>
              </div>
              <div class="flex gap-2">
                <Button variant="outline" size="sm" @click="exportToCSV('attendance')">
                  <Download class="mr-2 h-4 w-4" />
                  CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="isLoading" class="flex items-center justify-center h-64">
              <div class="space-y-2 w-full max-w-md">
                <Skeleton class="h-4 w-full" />
                <Skeleton class="h-4 w-3/4" />
                <Skeleton class="h-4 w-1/2" />
              </div>
            </div>
            <div v-else-if="attendanceChartData.length > 0" class="h-64">
              <VisXYContainer
                :data="attendanceChartData"
                :margin="{ left: 40, right: 20, top: 20, bottom: 40 }"
              >
                <VisLine
                  :x="(d: any) => d.date"
                  :y="(d: any) => d.scans"
                  :color="['#3b82f6']"
                />
                <VisAxis
                  type="x"
                  :tick-format="(tick: any) => formatDateShort(tick)"
                />
                <VisAxis
                  type="y"
                  :tick-format="(tick: any) => tick.toString()"
                />
                <VisTooltip />
              </VisXYContainer>
            </div>
            <div v-else class="flex items-center justify-center h-64 text-muted-foreground">
              No data available for selected date range
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Attendance Records</CardTitle>
            <CardDescription>All scan records in the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="isLoading" class="space-y-2">
              <Skeleton class="h-12 w-full" />
              <Skeleton class="h-12 w-full" />
              <Skeleton class="h-12 w-full" />
            </div>
            <div v-else>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead @click="sortBy('scan_timestamp')" class="cursor-pointer">
                      Date/Time
                      <ArrowUpDown v-if="sortColumn === 'scan_timestamp'" class="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead @click="sortBy('employee_phone')" class="cursor-pointer">
                      Employee
                      <ArrowUpDown v-if="sortColumn === 'employee_phone'" class="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead @click="sortBy('scanner_id')" class="cursor-pointer">
                      Scanner
                      <ArrowUpDown v-if="sortColumn === 'scanner_id'" class="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead @click="sortBy('status')" class="cursor-pointer">
                      Status
                      <ArrowUpDown v-if="sortColumn === 'status'" class="ml-2 h-4 w-4 inline" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="record in paginatedRecords" :key="record.id">
                    <TableCell>{{ formatDateTime(record.scan_timestamp) }}</TableCell>
                    <TableCell>{{ record.employee_phone }}</TableCell>
                    <TableCell>{{ record.scanner_id }}</TableCell>
                    <TableCell>
                      <Badge :variant="getStatusVariant(record.status)">
                        {{ record.status }}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow v-if="paginatedRecords.length === 0">
                    <TableCell :colspan="4" class="text-center text-muted-foreground">
                      No records found
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <!-- Pagination -->
              <div v-if="totalPages > 1" class="flex items-center justify-between mt-4">
                <div class="text-sm text-muted-foreground">
                  Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, sortedRecords.length) }} of {{ sortedRecords.length }} records
                </div>
                <div class="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    :disabled="currentPage === 1"
                    @click="currentPage--"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    :disabled="currentPage === totalPages"
                    @click="currentPage++"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Employee Reports Tab -->
      <TabsContent value="employees" class="space-y-4">
        <Card>
          <CardHeader>
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Employee Attendance</CardTitle>
                <CardDescription>Attendance by employee</CardDescription>
              </div>
              <div class="flex gap-2">
                <Button variant="outline" size="sm" @click="exportToCSV('employees')">
                  <Download class="mr-2 h-4 w-4" />
                  CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="isLoading" class="space-y-2">
              <Skeleton class="h-12 w-full" />
              <Skeleton class="h-12 w-full" />
              <Skeleton class="h-12 w-full" />
            </div>
            <div v-else>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead @click="sortByEmployee('name')" class="cursor-pointer">
                      Employee
                      <ArrowUpDown v-if="employeeSortColumn === 'name'" class="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead @click="sortByEmployee('phone')" class="cursor-pointer">
                      Phone
                      <ArrowUpDown v-if="employeeSortColumn === 'phone'" class="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead @click="sortByEmployee('department')" class="cursor-pointer">
                      Department
                      <ArrowUpDown v-if="employeeSortColumn === 'department'" class="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead @click="sortByEmployee('totalScans')" class="cursor-pointer">
                      Total Scans
                      <ArrowUpDown v-if="employeeSortColumn === 'totalScans'" class="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead @click="sortByEmployee('successRate')" class="cursor-pointer">
                      Success Rate
                      <ArrowUpDown v-if="employeeSortColumn === 'successRate'" class="ml-2 h-4 w-4 inline" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="emp in paginatedEmployees" :key="emp.phone">
                    <TableCell class="font-medium">{{ emp.name || 'N/A' }}</TableCell>
                    <TableCell>{{ emp.phone }}</TableCell>
                    <TableCell>{{ emp.department || 'N/A' }}</TableCell>
                    <TableCell>{{ emp.totalScans }}</TableCell>
                    <TableCell>{{ emp.successRate }}%</TableCell>
                  </TableRow>
                  <TableRow v-if="paginatedEmployees.length === 0">
                    <TableCell :colspan="5" class="text-center text-muted-foreground">
                      No employee data found
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <!-- Pagination -->
              <div v-if="totalEmployeePages > 1" class="flex items-center justify-between mt-4">
                <div class="text-sm text-muted-foreground">
                  Showing {{ (currentEmployeePage - 1) * employeePageSize + 1 }} to {{ Math.min(currentEmployeePage * employeePageSize, sortedEmployees.length) }} of {{ sortedEmployees.length }} employees
                </div>
                <div class="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    :disabled="currentEmployeePage === 1"
                    @click="currentEmployeePage--"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    :disabled="currentEmployeePage === totalEmployeePages"
                    @click="currentEmployeePage++"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Scanner Reports Tab -->
      <TabsContent value="scanners" class="space-y-4">
        <Card>
          <CardHeader>
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Scanner Usage</CardTitle>
                <CardDescription>Usage statistics by scanner</CardDescription>
              </div>
              <div class="flex gap-2">
                <Button variant="outline" size="sm" @click="exportToCSV('scanners')">
                  <Download class="mr-2 h-4 w-4" />
                  CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="isLoading" class="space-y-2">
              <Skeleton class="h-12 w-full" />
              <Skeleton class="h-12 w-full" />
              <Skeleton class="h-12 w-full" />
            </div>
            <div v-else>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead @click="sortByScanner('scannerId')" class="cursor-pointer">
                      Scanner ID
                      <ArrowUpDown v-if="scannerSortColumn === 'scannerId'" class="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead @click="sortByScanner('totalScans')" class="cursor-pointer">
                      Total Scans
                      <ArrowUpDown v-if="scannerSortColumn === 'totalScans'" class="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead @click="sortByScanner('successfulScans')" class="cursor-pointer">
                      Successful
                      <ArrowUpDown v-if="scannerSortColumn === 'successfulScans'" class="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead @click="sortByScanner('duplicateScans')" class="cursor-pointer">
                      Duplicates
                      <ArrowUpDown v-if="scannerSortColumn === 'duplicateScans'" class="ml-2 h-4 w-4 inline" />
                    </TableHead>
                    <TableHead @click="sortByScanner('successRate')" class="cursor-pointer">
                      Success Rate
                      <ArrowUpDown v-if="scannerSortColumn === 'successRate'" class="ml-2 h-4 w-4 inline" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="scanner in paginatedScanners" :key="scanner.scannerId">
                    <TableCell class="font-medium">{{ scanner.scannerId }}</TableCell>
                    <TableCell>{{ scanner.totalScans }}</TableCell>
                    <TableCell>{{ scanner.successfulScans }}</TableCell>
                    <TableCell>{{ scanner.duplicateScans }}</TableCell>
                    <TableCell>{{ scanner.successRate }}%</TableCell>
                  </TableRow>
                  <TableRow v-if="paginatedScanners.length === 0">
                    <TableCell :colspan="5" class="text-center text-muted-foreground">
                      No scanner data found
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <!-- Pagination -->
              <div v-if="totalScannerPages > 1" class="flex items-center justify-between mt-4">
                <div class="text-sm text-muted-foreground">
                  Showing {{ (currentScannerPage - 1) * scannerPageSize + 1 }} to {{ Math.min(currentScannerPage * scannerPageSize, sortedScanners.length) }} of {{ sortedScanners.length }} scanners
                </div>
                <div class="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    :disabled="currentScannerPage === 1"
                    @click="currentScannerPage--"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    :disabled="currentScannerPage === totalScannerPages"
                    @click="currentScannerPage++"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Custom Reports Tab -->
      <TabsContent value="custom" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Custom Reports</CardTitle>
            <CardDescription>Create and export custom reports</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <Label>Report Type</Label>
                <Select v-model="customReportType">
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Summary</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                    <SelectItem value="monthly">Monthly Summary</SelectItem>
                    <SelectItem value="employee">Employee Details</SelectItem>
                    <SelectItem value="scanner">Scanner Details</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div class="space-y-2">
                <Label>Export Format</Label>
                <Select v-model="exportFormat">
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button @click="generateCustomReport" :disabled="isLoading">
              <FileText class="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Calendar, Download, FileText, BarChart, TrendingUp, Users, ScanLine, RefreshCw, ArrowUpDown } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/toast/use-toast'
import { attendanceService } from '@/services/attendance.service'
import { employeeService } from '@/services/employee.service'
import type { AttendanceRecord } from '@/types'
import { VisXYContainer, VisLine, VisAxis, VisTooltip } from '@unovis/vue'

// Toast notifications
const { toast } = useToast()

// State
const isLoading = ref(false)
const isDateRangeOpen = ref(false)
const activeTab = ref('attendance')
const dateRange = ref<{ start: Date | null; end: Date | null }>({
  start: new Date(new Date().setDate(new Date().getDate() - 7)),
  end: new Date()
})

// Records
const records = ref<AttendanceRecord[]>([])
const sortColumn = ref<keyof AttendanceRecord>('scan_timestamp')
const sortDirection = ref<'asc' | 'desc'>('desc')
const currentPage = ref(1)
const pageSize = 10

// Employee data
const employees = ref<any[]>([])
const employeeSortColumn = ref('name')
const employeeSortDirection = ref<'asc' | 'desc'>('asc')
const currentEmployeePage = ref(1)
const employeePageSize = 10

// Scanner data
const scanners = ref<any[]>([])
const scannerSortColumn = ref('scannerId')
const scannerSortDirection = ref<'asc' | 'desc'>('asc')
const currentScannerPage = ref(1)
const scannerPageSize = 10

// Custom report
const customReportType = ref('daily')
const exportFormat = ref('csv')

// Summary
const summary = computed(() => {
  const totalScans = records.value.length
  const successfulScans = records.value.filter(r => r.status === 'success').length
  const duplicateScans = records.value.filter(r => r.status === 'duplicate').length
  const invalidScans = records.value.filter(r => r.status === 'invalid').length
  
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
    invalidScans,
    uniqueEmployees,
    successRate,
    totalDays,
    avgDailyScans
  }
})

// Chart data
const attendanceChartData = computed(() => {
  const dateMap = new Map<string, number>()
  
  records.value.forEach(record => {
    const date = record.scan_date
    dateMap.set(date, (dateMap.get(date) || 0) + 1)
  })
  
  return Array.from(dateMap.entries())
    .map(([date, scans]) => ({ date: new Date(date), scans }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
})

// Sorted records
const sortedRecords = computed(() => {
  return [...records.value].sort((a, b) => {
    const aVal = a[sortColumn.value]
    const bVal = b[sortColumn.value]
    
    if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
})

// Paginated records
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return sortedRecords.value.slice(start, end)
})

// Total pages
const totalPages = computed(() => {
  return Math.ceil(sortedRecords.value.length / pageSize)
})

// Sorted employees
const sortedEmployees = computed(() => {
  return [...employees.value].sort((a, b) => {
    const aVal = a[employeeSortColumn.value]
    const bVal = b[employeeSortColumn.value]
    
    if (aVal < bVal) return employeeSortDirection.value === 'asc' ? -1 : 1
    if (aVal > bVal) return employeeSortDirection.value === 'asc' ? 1 : -1
    return 0
  })
})

// Paginated employees
const paginatedEmployees = computed(() => {
  const start = (currentEmployeePage.value - 1) * employeePageSize
  const end = start + employeePageSize
  return sortedEmployees.value.slice(start, end)
})

// Total employee pages
const totalEmployeePages = computed(() => {
  return Math.ceil(sortedEmployees.value.length / employeePageSize)
})

// Sorted scanners
const sortedScanners = computed(() => {
  return [...scanners.value].sort((a, b) => {
    const aVal = a[scannerSortColumn.value]
    const bVal = b[scannerSortColumn.value]
    
    if (aVal < bVal) return scannerSortDirection.value === 'asc' ? -1 : 1
    if (aVal > bVal) return scannerSortDirection.value === 'asc' ? 1 : -1
    return 0
  })
})

// Paginated scanners
const paginatedScanners = computed(() => {
  const start = (currentScannerPage.value - 1) * scannerPageSize
  const end = start + scannerPageSize
  return sortedScanners.value.slice(start, end)
})

// Total scanner pages
const totalScannerPages = computed(() => {
  return Math.ceil(sortedScanners.value.length / scannerPageSize)
})

// Methods
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatDateTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'success':
      return 'default'
    case 'duplicate':
      return 'secondary'
    case 'invalid':
      return 'destructive'
    case 'inactive':
      return 'outline'
    default:
      return 'default'
  }
}

const setDateRange = (preset: string) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  switch (preset) {
    case 'today':
      dateRange.value = { start: today, end: today }
      break
    case 'week':
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      dateRange.value = { start: startOfWeek, end: today }
      break
    case 'month':
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      dateRange.value = { start: startOfMonth, end: today }
      break
    case 'last7':
      const last7 = new Date(today)
      last7.setDate(today.getDate() - 6)
      dateRange.value = { start: last7, end: today }
      break
    case 'last30':
      const last30 = new Date(today)
      last30.setDate(today.getDate() - 29)
      dateRange.value = { start: last30, end: today }
      break
    case 'custom':
      // Keep current selection
      break
  }
}

const applyDateRange = () => {
  isDateRangeOpen.value = false
  refreshData()
}

const sortBy = (column: keyof AttendanceRecord) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

const sortByEmployee = (column: string) => {
  if (employeeSortColumn.value === column) {
    employeeSortDirection.value = employeeSortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    employeeSortColumn.value = column
    employeeSortDirection.value = 'asc'
  }
}

const sortByScanner = (column: string) => {
  if (scannerSortColumn.value === column) {
    scannerSortDirection.value = scannerSortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    scannerSortColumn.value = column
    scannerSortDirection.value = 'asc'
  }
}

const refreshData = async () => {
  if (!dateRange.value.start || !dateRange.value.end) {
    toast({
      title: 'Error',
      description: 'Please select a valid date range',
      variant: 'destructive'
    })
    return
  }
  
  if (dateRange.value.start > dateRange.value.end) {
    toast({
      title: 'Error',
      description: 'Start date must be before end date',
      variant: 'destructive'
    })
    return
  }
  
  isLoading.value = true
  
  try {
    const dateFrom = dateRange.value.start.toISOString().split('T')[0]
    const dateTo = dateRange.value.end.toISOString().split('T')[0]
    
    // Fetch attendance records
    const { records: attendanceRecords } = await attendanceService.getRecords({
      dateFrom,
      dateTo,
      pageSize: 1000
    })
    records.value = attendanceRecords
    
    // Fetch employee data
    const allEmployees = await employeeService.getAll({ isActive: true })
    
    // Calculate employee statistics
    employees.value = allEmployees.map(emp => {
      const empRecords = records.value.filter(r => r.employee_phone === emp.phone)
      const totalScans = empRecords.length
      const successfulScans = empRecords.filter(r => r.status === 'success').length
      const successRate = totalScans > 0 ? Math.round((successfulScans / totalScans) * 100) : 0
      
      return {
        name: emp.name,
        phone: emp.phone,
        department: emp.department,
        totalScans,
        successRate
      }
    }).filter(emp => emp.totalScans > 0)
    
    // Calculate scanner statistics
    const scannerMap = new Map<string, any>()
    records.value.forEach(record => {
      const scannerId = record.scanner_id
      if (!scannerMap.has(scannerId)) {
        scannerMap.set(scannerId, {
          scannerId,
          totalScans: 0,
          successfulScans: 0,
          duplicateScans: 0,
          invalidScans: 0
        })
      }
      const scanner = scannerMap.get(scannerId)!
      scanner.totalScans++
      if (record.status === 'success') scanner.successfulScans++
      else if (record.status === 'duplicate') scanner.duplicateScans++
      else if (record.status === 'invalid') scanner.invalidScans++
    })
    
    scanners.value = Array.from(scannerMap.values()).map(scanner => ({
      ...scanner,
      successRate: scanner.totalScans > 0 
        ? Math.round((scanner.successfulScans / scanner.totalScans) * 100) 
        : 0
    }))
    
    // Reset pagination
    currentPage.value = 1
    currentEmployeePage.value = 1
    currentScannerPage.value = 1
    
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

const exportToCSV = (type: string) => {
  let csv = ''
  let filename = ''
  
  if (type === 'attendance') {
    csv = 'Date,Employee Phone,Scanner ID,Status\n'
    records.value.forEach(record => {
      csv += `${formatDateTime(record.scan_timestamp)},${record.employee_phone},${record.scanner_id},${record.status}\n`
    })
    filename = `attendance-report-${dateRange.value.start?.toISOString().split('T')[0]}-to-${dateRange.value.end?.toISOString().split('T')[0]}.csv`
  } else if (type === 'employees') {
    csv = 'Name,Phone,Department,Total Scans,Success Rate\n'
    employees.value.forEach(emp => {
      csv += `${emp.name || 'N/A'},${emp.phone},${emp.department || 'N/A'},${emp.totalScans},${emp.successRate}%\n`
    })
    filename = `employee-report-${dateRange.value.start?.toISOString().split('T')[0]}-to-${dateRange.value.end?.toISOString().split('T')[0]}.csv`
  } else if (type === 'scanners') {
    csv = 'Scanner ID,Total Scans,Successful,Duplicates,Success Rate\n'
    scanners.value.forEach(scanner => {
      csv += `${scanner.scannerId},${scanner.totalScans},${scanner.successfulScans},${scanner.duplicateScans},${scanner.successRate}%\n`
    })
    filename = `scanner-report-${dateRange.value.start?.toISOString().split('T')[0]}-to-${dateRange.value.end?.toISOString().split('T')[0]}.csv`
  }
  
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

const generateCustomReport = async () => {
  isLoading.value = true
  
  try {
    if (exportFormat.value === 'csv') {
      exportToCSV(customReportType.value)
    } else {
      // JSON export
      const data = {
        reportType: customReportType.value,
        dateRange: {
          start: dateRange.value.start?.toISOString(),
          end: dateRange.value.end?.toISOString()
        },
        summary: summary.value,
        records: records.value,
        employees: employees.value,
        scanners: scanners.value
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `custom-report-${customReportType.value}-${dateRange.value.start?.toISOString().split('T')[0]}.json`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast({
        title: 'Success',
        description: 'Custom report generated successfully'
      })
    }
  } catch (error) {
    console.error('Error generating custom report:', error)
    toast({
      title: 'Error',
      description: 'Failed to generate custom report. Please try again.',
      variant: 'destructive'
    })
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  refreshData()
})

// Watch for tab changes
watch(activeTab, () => {
  // Reset pagination when switching tabs
  currentPage.value = 1
  currentEmployeePage.value = 1
  currentScannerPage.value = 1
})
</script>
