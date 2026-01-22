<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Download, ArrowUpDown } from 'lucide-vue-next'
import { VisXYContainer, VisLine, VisAxis, VisTooltip } from '@unovis/vue'
import type { AttendanceRecord } from '@/types'

interface Props {
  records: AttendanceRecord[]
  isLoading: boolean
}

interface Emits {
  (e: 'export'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const sortColumn = ref<keyof AttendanceRecord>('scan_timestamp')
const sortDirection = ref<'asc' | 'desc'>('desc')
const currentPage = ref(1)
const pageSize = 10

const chartData = computed(() => {
  const dateMap = new Map<string, number>()
  
  props.records.forEach(record => {
    const date = record.scan_date
    dateMap.set(date, (dateMap.get(date) || 0) + 1)
  })
  
  return Array.from(dateMap.entries())
    .map(([date, scans]) => ({ date: new Date(date), scans }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
})

const sortedRecords = computed(() => {
  const sorted = [...props.records].sort((a, b) => {
    const aVal = a[sortColumn.value]
    const bVal = b[sortColumn.value]
    
    // Handle null/undefined values
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1
    
    if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
  
  return sorted
})

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return sortedRecords.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(sortedRecords.value.length / pageSize))

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateShort = (date: Date | string) => {
  const dateObj = date instanceof Date ? date : new Date(date)
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getStatusVariant = (status: string) => {
  if (status === 'success') return 'default'
  if (status === 'duplicate') return 'secondary'
  return 'destructive'
}

const sortBy = (column: keyof AttendanceRecord) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'desc'
  }
}
</script>

<template>
  <div class="space-y-4">
    <Card>
      <CardHeader>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Daily attendance over selected period</CardDescription>
          </div>
          <Button variant="outline" size="sm" @click="emit('export')">
            <Download class="mr-2 h-4 w-4" />
            Export CSV
          </Button>
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
        <div v-else-if="chartData.length > 0" class="h-64">
          <VisXYContainer
            :data="chartData"
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
  </div>
</template>
