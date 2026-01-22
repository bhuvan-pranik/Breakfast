<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Calendar as CalendarIcon } from 'lucide-vue-next'

interface Props {
  startDate: Date | null
  endDate: Date | null
}

interface Emits {
  (e: 'update', payload: { start: Date | null; end: Date | null }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = ref(false)
const localStart = ref(props.startDate)
const localEnd = ref(props.endDate)

const formatDate = (date: Date | null) => {
  if (!date) return ''
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const setQuickRange = (type: string) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let start: Date
  let end: Date = new Date(today)
  
  switch (type) {
    case 'today':
      start = new Date(today)
      break
    case 'week':
      start = new Date(today)
      start.setDate(today.getDate() - today.getDay())
      break
    case 'month':
      start = new Date(today.getFullYear(), today.getMonth(), 1)
      break
    case 'last7':
      start = new Date(today)
      start.setDate(today.getDate() - 6)
      break
    case 'last30':
      start = new Date(today)
      start.setDate(today.getDate() - 29)
      break
    default:
      return
  }
  
  localStart.value = start
  localEnd.value = end
}

const apply = () => {
  // Ensure dates are Date objects, not strings
  const start = localStart.value ? (localStart.value instanceof Date ? localStart.value : new Date(localStart.value)) : null
  const end = localEnd.value ? (localEnd.value instanceof Date ? localEnd.value : new Date(localEnd.value)) : null
  emit('update', { start, end })
  isOpen.value = false
}

const cancel = () => {
  localStart.value = props.startDate
  localEnd.value = props.endDate
  isOpen.value = false
}
</script>

<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <Button variant="outline" class="w-full sm:w-auto justify-start text-left font-normal">
        <CalendarIcon class="mr-2 h-4 w-4" />
        <span v-if="startDate && endDate">
          {{ formatDate(startDate) }} - {{ formatDate(endDate) }}
        </span>
        <span v-else>Pick date range</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0 max-h-[80vh] overflow-y-auto" align="end" side="top">
      <div class="p-3 space-y-3">
        <div class="space-y-2">
          <Label>Start Date</Label>
          <Calendar
            v-model="localStart"
            :is-disabled="(date: Date) => date > new Date() || (localEnd ? date > localEnd : false)"
            initial-focus
          />
        </div>
        <Separator />
        <div class="space-y-2">
          <Label>End Date</Label>
          <Calendar
            v-model="localEnd"
            :is-disabled="(date: Date) => date > new Date() || (localStart ? date < localStart : false)"
          />
        </div>
        <Separator />
        <div class="space-y-2">
          <Label>Quick Select</Label>
          <div class="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" @click="setQuickRange('today')">Today</Button>
            <Button variant="outline" size="sm" @click="setQuickRange('week')">This Week</Button>
            <Button variant="outline" size="sm" @click="setQuickRange('month')">This Month</Button>
            <Button variant="outline" size="sm" @click="setQuickRange('last7')">Last 7 Days</Button>
            <Button variant="outline" size="sm" @click="setQuickRange('last30')">Last 30 Days</Button>
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="cancel">Cancel</Button>
          <Button @click="apply">Apply</Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
