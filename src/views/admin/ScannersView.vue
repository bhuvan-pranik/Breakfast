<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useScannerStore } from '@/stores/scanner.store'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search, Filter, Power, Wifi, WifiOff, XCircle } from 'lucide-vue-next'
import type { ScannerAccount } from '@/types'

const router = useRouter()
const scannerStore = useScannerStore()
const { toast } = useToast()

const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive' | 'online' | 'offline'>('all')

onMounted(async () => {
  await scannerStore.fetchScanners()
})

const filteredScanners = computed(() => {
  let result = [...scannerStore.scanners]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(scanner =>
      scanner.username.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (statusFilter.value !== 'all') {
    if (statusFilter.value === 'online') {
      result = result.filter(scanner => isOnline(scanner))
    } else if (statusFilter.value === 'offline') {
      result = result.filter(scanner => !isOnline(scanner))
    } else {
      const isActive = statusFilter.value === 'active'
      result = result.filter(scanner => scanner.is_active === isActive)
    }
  }

  return result
})

const createScanner = () => {
  router.push('/admin/scanners/create')
}

const toggleStatus = async (scanner: ScannerAccount) => {
  try {
    if (scanner.is_active) {
      await scannerStore.deactivateScanner(scanner.id)
      toast({
        title: 'Success',
        description: `Scanner ${scanner.username} deactivated`,
      })
    } else {
      await scannerStore.activateScanner(scanner.id)
      toast({
        title: 'Success',
        description: `Scanner ${scanner.username} activated`,
      })
    }
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to update scanner status',
      variant: 'destructive',
    })
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleString()
}

const isOnline = (scanner: ScannerAccount) => {
  if (!scanner.last_login_at) return false
  const lastLogin = new Date(scanner.last_login_at)
  const now = new Date()
  const diffMinutes = (now.getTime() - lastLogin.getTime()) / (1000 * 60)
  return diffMinutes < 5 // Consider online if last login within 5 minutes
}

const getStatusBadgeVariant = (scanner: ScannerAccount) => {
  if (!scanner.is_active) return 'secondary'
  if (isOnline(scanner)) return 'default'
  return 'outline'
}

const getStatusText = (scanner: ScannerAccount) => {
  if (!scanner.is_active) return 'Inactive'
  return isOnline(scanner) ? 'Online' : 'Offline'
}

const getStatusIcon = (scanner: ScannerAccount) => {
  if (!scanner.is_active) return XCircle
  return isOnline(scanner) ? Wifi : WifiOff
}
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Scanner Management</h1>
      <Button @click="createScanner">
        <Plus class="mr-2 h-4 w-4" />
        Add Scanner
      </Button>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          v-model="searchQuery"
          placeholder="Search by username..."
          class="pl-10"
        />
      </div>

      <div class="flex items-center gap-2">
        <Filter class="h-4 w-4 text-gray-500" />
        <Select v-model="statusFilter">
          <SelectTrigger class="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="text-sm text-gray-600 self-center">
        {{ filteredScanners.length }} scanner{{ filteredScanners.length !== 1 ? 's' : '' }}
      </div>
    </div>

    <!-- Scanners Table -->
    <div class="border rounded-lg">
      <Table v-if="filteredScanners.length > 0">
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="scanner in filteredScanners" :key="scanner.id">
            <TableCell class="font-medium">{{ scanner.username }}</TableCell>
            <TableCell>{{ scanner.role }}</TableCell>
            <TableCell>
              <Badge :variant="getStatusBadgeVariant(scanner)" class="flex items-center gap-1 w-fit">
                <component :is="getStatusIcon(scanner)" class="h-3 w-3" />
                {{ getStatusText(scanner) }}
              </Badge>
            </TableCell>
            <TableCell class="text-gray-600">{{ formatDate(scanner.last_login_at) }}</TableCell>
            <TableCell>
              <Button
                @click="toggleStatus(scanner)"
                variant="outline"
                size="sm"
                :title="scanner.is_active ? 'Deactivate scanner' : 'Activate scanner'"
              >
                <Power class="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div v-else-if="scannerStore.isLoading" class="p-8 text-center">
        <div class="flex items-center justify-center gap-2">
          <Skeleton class="h-4 w-4" />
          <span>Loading scanners...</span>
        </div>
      </div>

      <div v-else class="p-8 text-center text-gray-500">
        <p class="mb-4">No scanners found</p>
        <Button @click="createScanner" variant="outline">
          <Plus class="mr-2 h-4 w-4" />
          Create First Scanner
        </Button>
      </div>
    </div>
  </div>
</template>
