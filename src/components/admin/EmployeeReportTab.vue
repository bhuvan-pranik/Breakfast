<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Download, Search, ArrowUpDown } from 'lucide-vue-next'
import { useEmployeeStore } from '@/stores/employee.store'
import type { AttendanceRecord } from '@/types'

interface Props {
  records: AttendanceRecord[]
  isLoading?: boolean
}

interface EmployeeStats {
  phone: string
  name: string
  totalScans: number
  successfulScans: number
  duplicateScans: number
  attendanceRate: number
  firstScan?: string
  lastScan?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'export'): void
}>()

const employeeStore = useEmployeeStore()

// State
const searchQuery = ref('')
const sortBy = ref<keyof EmployeeStats>('name')
const sortOrder = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const pageSize = 10

// Fetch employees on mount
onMounted(async () => {
  await employeeStore.fetchEmployees()
})

// Compute employee statistics
const employeeStats = computed<EmployeeStats[]>(() => {
  const statsMap = new Map<string, EmployeeStats>()
  
  props.records.forEach(record => {
    if (!statsMap.has(record.employee_phone)) {
      // Find employee name from store
      const employee = employeeStore.employees.find(e => e.phone === record.employee_phone)
      
      statsMap.set(record.employee_phone, {
        phone: record.employee_phone,
        name: employee?.name || 'Unknown',
        totalScans: 0,
        successfulScans: 0,
        duplicateScans: 0,
        attendanceRate: 0,
        firstScan: record.scan_timestamp,
        lastScan: record.scan_timestamp
      })
    }
    
    const stats = statsMap.get(record.employee_phone)!
    stats.totalScans++
    
    if (record.status === 'success') {
      stats.successfulScans++
    } else if (record.status === 'duplicate') {
      stats.duplicateScans++
    }
    
    // Update first and last scan
    if (record.scan_timestamp < stats.firstScan!) {
      stats.firstScan = record.scan_timestamp
    }
    if (record.scan_timestamp > stats.lastScan!) {
      stats.lastScan = record.scan_timestamp
    }
  })
  
  // Calculate attendance rate (successful scans / total days)
  const totalDays = new Set(props.records.map(r => r.scan_date)).size
  statsMap.forEach(stats => {
    stats.attendanceRate = totalDays > 0 
      ? Math.round((stats.successfulScans / totalDays) * 100)
      : 0
  })
  
  return Array.from(statsMap.values())
})

// Filter and sort
const filteredStats = computed(() => {
  let filtered = employeeStats.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(s => 
      s.phone.toLowerCase().includes(query) ||
      s.name.toLowerCase().includes(query)
    )
  }
  
  // Sort
  filtered = [...filtered].sort((a, b) => {
    const aVal = a[sortBy.value]
    const bVal = b[sortBy.value]
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder.value === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder.value === 'asc' ? aVal - bVal : bVal - aVal
    }
    
    return 0
  })
  
  return filtered
})

// Pagination
const paginatedStats = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredStats.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(filteredStats.value.length / pageSize))

// Methods
const toggleSort = (column: keyof EmployeeStats) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'desc'
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const getAttendanceRateBadge = (rate: number) => {
  if (rate >= 90) return 'default'
  if (rate >= 70) return 'secondary'
  return 'destructive'
}

const exportEmployeeReport = () => {
  emit('export')
}
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <div>
          <CardTitle>Employee Attendance Report</CardTitle>
          <CardDescription>Individual employee attendance statistics</CardDescription>
        </div>
        <Button @click="exportEmployeeReport" variant="outline" size="sm">
          <Download class="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      
      <!-- Search -->
      <div class="relative mt-4">
        <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="Search by phone or name..."
          class="pl-8"
        />
      </div>
    </CardHeader>
    
    <CardContent>
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8 text-muted-foreground">
        Loading employee reports...
      </div>
      
      <!-- Empty State -->
      <div v-else-if="employeeStats.length === 0" class="text-center py-8 text-muted-foreground">
        No employee data available for the selected date range
      </div>
      
      <!-- Table -->
      <div v-else>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" size="sm" @click="toggleSort('name')">
                    Employee Name
                    <ArrowUpDown class="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" @click="toggleSort('totalScans')">
                    Total Scans
                    <ArrowUpDown class="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" @click="toggleSort('successfulScans')">
                    Successful
                    <ArrowUpDown class="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" @click="toggleSort('duplicateScans')">
                    Duplicates
                    <ArrowUpDown class="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" @click="toggleSort('attendanceRate')">
                    Attendance Rate
                    <ArrowUpDown class="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>First Scan</TableHead>
                <TableHead>Last Scan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="stat in paginatedStats" :key="stat.phone">
                <TableCell class="font-medium">
                  <div>{{ stat.name }}</div>
                  <div class="text-xs text-muted-foreground">{{ stat.phone }}</div>
                </TableCell>
                <TableCell>{{ stat.totalScans }}</TableCell>
                <TableCell>
                  <Badge variant="default">{{ stat.successfulScans }}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{{ stat.duplicateScans }}</Badge>
                </TableCell>
                <TableCell>
                  <Badge :variant="getAttendanceRateBadge(stat.attendanceRate)">
                    {{ stat.attendanceRate }}%
                  </Badge>
                </TableCell>
                <TableCell class="text-sm text-muted-foreground">
                  {{ stat.firstScan ? formatDate(stat.firstScan) : '-' }}
                </TableCell>
                <TableCell class="text-sm text-muted-foreground">
                  {{ stat.lastScan ? formatDate(stat.lastScan) : '-' }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between mt-4">
          <p class="text-sm text-muted-foreground">
            Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, filteredStats.length) }} of {{ filteredStats.length }} employees
          </p>
          
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              Previous
            </Button>
            <span class="text-sm">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
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
</template>
