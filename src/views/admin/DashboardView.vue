<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useEmployeeStore } from '@/stores/employee.store'
import { useScannerStore } from '@/stores/scanner.store'
import { useAttendanceStore } from '@/stores/attendance.store'
import {
  Users,
  ScanLine,
  CalendarCheck,
  TrendingUp,
  Plus,
  ArrowRight,
  RefreshCw,
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
const employeeStore = useEmployeeStore()
const scannerStore = useScannerStore()
const attendanceStore = useAttendanceStore()

const isLoading = ref(true)

const stats = computed(() => [
  {
    title: 'Total Employees',
    value: employeeStore.employees?.length ?? 0,
    description: 'Active employees in system',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Active Scanners',
    value: scannerStore.scanners?.filter(s => s.is_active)?.length ?? 0,
    description: 'Currently active scanners',
    icon: ScanLine,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: "Today's Scans",
    value: attendanceStore.todayRecords?.length ?? 0,
    description: 'Breakfast scans today',
    icon: CalendarCheck,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    title: 'Attendance Rate',
    value: calculateAttendanceRate(),
    description: 'Today\'s attendance percentage',
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    isPercentage: true,
  },
])

function calculateAttendanceRate() {
  const totalEmployees = employeeStore.employees?.length ?? 0
  const todayScans = attendanceStore.todayRecords?.length ?? 0
  if (totalEmployees === 0) return 0
  return Math.round((todayScans / totalEmployees) * 100)
}

const quickActions = [
  {
    label: 'Add Employee',
    icon: Plus,
    action: () => router.push('/admin/employees/create'),
    variant: 'default' as const,
  },
  {
    label: 'View Reports',
    icon: ArrowRight,
    action: () => router.push('/admin/reports'),
    variant: 'outline' as const,
  },
  {
    label: 'Manage Scanners',
    icon: ScanLine,
    action: () => router.push('/admin/scanners'),
    variant: 'outline' as const,
  },
]

const loadDashboardData = async () => {
  isLoading.value = true
  try {
    await Promise.all([
      employeeStore.fetchEmployees(),
      scannerStore.fetchScanners(),
      attendanceStore.fetchTodayRecords(),
    ])
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    isLoading.value = false
  }
}

const refreshData = () => {
  loadDashboardData()
}

onMounted(() => {
  loadDashboardData()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Welcome to the Breakfast Counter System Admin Panel
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        @click="refreshData"
        :disabled="isLoading"
        class="self-start sm:self-auto"
      >
        <RefreshCw :class="['h-4 w-4 mr-2', isLoading && 'animate-spin']" />
        Refresh
      </Button>
    </div>

    <!-- Statistics Cards -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card v-for="stat in stats" :key="stat.title" class="overflow-hidden">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium text-muted-foreground">
            {{ stat.title }}
          </CardTitle>
          <div :class="['p-2 rounded-lg', stat.bgColor]">
            <component :is="stat.icon" :class="['h-4 w-4', stat.color]" />
          </div>
        </CardHeader>
        <CardContent>
          <template v-if="isLoading">
            <Skeleton class="h-8 w-20 mb-1" />
            <Skeleton class="h-4 w-32" />
          </template>
          <template v-else>
            <div class="text-2xl font-bold">
              {{ stat.value }}{{ stat.isPercentage ? '%' : '' }}
            </div>
            <p class="text-xs text-muted-foreground mt-1">
              {{ stat.description }}
            </p>
          </template>
        </CardContent>
      </Card>
    </div>

    <!-- Quick Actions -->
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-3">
          <Button
            v-for="action in quickActions"
            :key="action.label"
            :variant="action.variant"
            @click="action.action"
            class="gap-2"
          >
            <component :is="action.icon" class="h-4 w-4" />
            {{ action.label }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Recent Activity Section (placeholder for future enhancement) -->
    <div class="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest breakfast scans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <template v-if="isLoading">
            <div class="space-y-3">
              <Skeleton v-for="i in 3" :key="i" class="h-12 w-full" />
            </div>
          </template>
          <template v-else-if="attendanceStore.todayRecords?.length">
            <div class="space-y-3">
              <div
                v-for="record in attendanceStore.todayRecords.slice(0, 5)"
                :key="record.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-green-100 rounded-full">
                    <CalendarCheck class="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p class="text-sm font-medium">
                      {{ record.employee_phone }}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      {{ record.status }}
                    </p>
                  </div>
                </div>
                <span class="text-xs text-muted-foreground">
                  {{ new Date(record.scan_timestamp).toLocaleTimeString() }}
                </span>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="text-center py-8 text-muted-foreground">
              <CalendarCheck class="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No scans recorded today</p>
            </div>
          </template>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Overview of system health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-green-100 rounded-full">
                  <ScanLine class="h-4 w-4 text-green-600" />
                </div>
                <span class="text-sm font-medium">Scanners Online</span>
              </div>
              <template v-if="isLoading">
                <Skeleton class="h-6 w-12" />
              </template>
              <template v-else>
                <span class="text-sm font-semibold text-green-600">
                  {{ scannerStore.scanners?.filter(s => s.is_active)?.length ?? 0 }} / {{ scannerStore.scanners?.length ?? 0 }}
                </span>
              </template>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-100 rounded-full">
                  <Users class="h-4 w-4 text-blue-600" />
                </div>
                <span class="text-sm font-medium">Registered Employees</span>
              </div>
              <template v-if="isLoading">
                <Skeleton class="h-6 w-12" />
              </template>
              <template v-else>
                <span class="text-sm font-semibold text-blue-600">
                  {{ employeeStore.employees?.length ?? 0 }}
                </span>
              </template>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-purple-100 rounded-full">
                  <TrendingUp class="h-4 w-4 text-purple-600" />
                </div>
                <span class="text-sm font-medium">Today's Attendance</span>
              </div>
              <template v-if="isLoading">
                <Skeleton class="h-6 w-12" />
              </template>
              <template v-else>
                <span class="text-sm font-semibold text-purple-600">
                  {{ calculateAttendanceRate() }}%
                </span>
              </template>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
