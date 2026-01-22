<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScanLine, TrendingUp, Users, BarChart } from 'lucide-vue-next'

interface Props {
  totalScans: number
  successfulScans: number
  successRate: number
  duplicateScans: number
  uniqueEmployees: number
  avgDailyScans: number
  totalDays: number
}

defineProps<Props>()
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Total Scans</CardTitle>
        <ScanLine class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">{{ totalScans }}</div>
        <p class="text-xs text-muted-foreground">
          {{ successfulScans }} successful
        </p>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Success Rate</CardTitle>
        <TrendingUp class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">{{ successRate }}%</div>
        <p class="text-xs text-muted-foreground">
          {{ duplicateScans }} duplicates
        </p>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Unique Employees</CardTitle>
        <Users class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">{{ uniqueEmployees }}</div>
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
        <div class="text-2xl font-bold">{{ avgDailyScans }}</div>
        <p class="text-xs text-muted-foreground">
          {{ totalDays }} days
        </p>
      </CardContent>
    </Card>
  </div>
</template>
