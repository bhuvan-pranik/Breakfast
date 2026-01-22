<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Eye, Download, Plus } from 'lucide-vue-next'
import type { Employee } from '@/types'

interface Props {
  employees: Employee[]
  isLoading?: boolean
}

interface Emits {
  (e: 'view', phone: string): void
  (e: 'edit', phone: string): void
  (e: 'delete', employee: Employee): void
  (e: 'download-qr', employee: Employee): void
  (e: 'toggle-status', employee: Employee): void
  (e: 'create'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div class="bg-card rounded-lg border overflow-hidden">
    <Table v-if="employees.length > 0">
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
        <TableRow v-for="employee in employees" :key="employee.phone">
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
                @click="emit('view', employee.phone)"
                variant="ghost"
                size="sm"
                title="View Details"
              >
                <Eye class="w-4 h-4" />
              </Button>
              <Button
                @click="emit('edit', employee.phone)"
                variant="ghost"
                size="sm"
                title="Edit"
              >
                <Pencil class="w-4 h-4" />
              </Button>
              <Button
                @click="emit('download-qr', employee)"
                variant="ghost"
                size="sm"
                title="Download QR"
              >
                <Download class="w-4 h-4" />
              </Button>
              <Button
                @click="emit('toggle-status', employee)"
                variant="ghost"
                size="sm"
                :title="employee.is_active ? 'Deactivate' : 'Activate'"
              >
                <span :class="employee.is_active ? 'text-red-500' : 'text-green-500'">
                  {{ employee.is_active ? '●' : '●' }}
                </span>
              </Button>
              <Button
                @click="emit('delete', employee)"
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

    <div v-else-if="isLoading" class="flex flex-col items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
      <p class="text-muted-foreground">Loading employees...</p>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-12">
      <p class="text-muted-foreground mb-4">No employees found</p>
      <Button @click="emit('create')">
        <Plus class="w-4 h-4 mr-2" />
        Create First Employee
      </Button>
    </div>
  </div>
</template>
