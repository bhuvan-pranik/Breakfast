<script setup lang="ts">
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-vue-next'
import { DEPARTMENTS } from '@/utils/constants'

interface Props {
  searchQuery: string
  selectedDepartment: string
  statusFilter: 'all' | 'active' | 'inactive'
  resultCount: number
}

interface Emits {
  (e: 'update:searchQuery', value: string): void
  (e: 'update:selectedDepartment', value: string): void
  (e: 'update:statusFilter', value: 'all' | 'active' | 'inactive'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div class="bg-card rounded-lg border p-6 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div class="space-y-2">
        <label class="text-sm font-medium">Search</label>
        <div class="relative">
          <Search class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            :model-value="searchQuery"
            @update:model-value="emit('update:searchQuery', $event)"
            placeholder="Search by name, phone, or department..."
            class="pl-9"
          />
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium">Department</label>
        <Select
          :model-value="selectedDepartment"
          @update:model-value="emit('update:selectedDepartment', $event)"
        >
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
        <Select
          :model-value="statusFilter"
          @update:model-value="emit('update:statusFilter', $event as 'all' | 'active' | 'inactive')"
        >
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
      {{ resultCount }} employee{{ resultCount !== 1 ? 's' : '' }} found
    </div>
  </div>
</template>
