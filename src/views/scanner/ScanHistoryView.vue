<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAttendanceStore } from '@/stores/attendance.store'
import { useAuthStore } from '@/stores/auth.store'
import { formatDate, formatTime } from '@/utils/formatters'

const attendanceStore = useAttendanceStore()
const authStore = useAuthStore()

const selectedDate = ref(new Date().toISOString().split('T')[0])
const statusFilter = ref<'all' | 'success' | 'duplicate' | 'invalid'>('all')

onMounted(async () => {
  await loadHistory()
})

const loadHistory = async () => {
  if (authStore.scannerId) {
    await attendanceStore.fetchScannerHistory(authStore.scannerId, selectedDate.value)
  }
}

const filteredRecords = computed(() => {
  if (statusFilter.value === 'all') {
    return attendanceStore.attendanceRecords
  }
  return attendanceStore.attendanceRecords.filter(r => r.status === statusFilter.value)
})

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    success: 'status-success',
    duplicate: 'status-warning',
    invalid: 'status-error',
    inactive: 'status-error'
  }
  return classes[status] || ''
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    success: 'Success',
    duplicate: 'Duplicate',
    invalid: 'Invalid',
    inactive: 'Inactive'
  }
  return labels[status] || status
}
</script>

<template>
  <div class="scan-history-view">
    <div class="header">
      <h1>Scan History</h1>
    </div>

    <div class="filters-card">
      <div class="filters">
        <div class="filter-group">
          <label for="date">Date</label>
          <input
            id="date"
            v-model="selectedDate"
            type="date"
            @change="loadHistory"
            class="date-input"
          />
        </div>

        <div class="filter-group">
          <label for="status">Status</label>
          <select id="status" v-model="statusFilter" class="status-select">
            <option value="all">All Status</option>
            <option value="success">Success Only</option>
            <option value="duplicate">Duplicates Only</option>
            <option value="invalid">Invalid Only</option>
          </select>
        </div>
      </div>

      <div class="stats-summary">
        <div class="stat">
          <span class="stat-value">{{ filteredRecords.length }}</span>
          <span class="stat-label">Total Scans</span>
        </div>
        <div class="stat success">
          <span class="stat-value">{{ filteredRecords.filter(r => r.status === 'success').length }}</span>
          <span class="stat-label">Successful</span>
        </div>
        <div class="stat warning">
          <span class="stat-value">{{ filteredRecords.filter(r => r.status === 'duplicate').length }}</span>
          <span class="stat-label">Duplicates</span>
        </div>
      </div>
    </div>

    <div class="history-container">
      <div v-if="filteredRecords.length > 0" class="history-list">
        <div
          v-for="record in filteredRecords"
          :key="record.id"
          class="history-item"
        >
          <div class="scan-time">
            {{ formatTime(record.scan_timestamp) }}
          </div>
          <div class="scan-details">
            <div class="employee-name">{{ record.employee?.name || 'Unknown' }}</div>
            <div class="employee-meta">
              <span v-if="record.employee">{{ record.employee.department }}</span>
              <span class="separator">•</span>
              <span>{{ record.employee?.phone || 'N/A' }}</span>
            </div>
          </div>
          <div class="scan-status">
            <span class="status-badge" :class="getStatusClass(record.status)">
              {{ getStatusLabel(record.status) }}
            </span>
            <p v-if="record.validation_message" class="status-message">
              {{ record.validation_message }}
            </p>
          </div>
        </div>
      </div>

      <div v-else-if="attendanceStore.isLoading" class="empty-state">
        <div class="spinner"></div>
        <p>Loading history...</p>
      </div>

      <div v-else class="empty-state">
        <p>No scans found for this date</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scan-history-view {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 1.75rem;
  color: #333;
}

.filters-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.date-input,
.status-select {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.date-input:focus,
.status-select:focus {
  outline: none;
  border-color: #667eea;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.stat {
  text-align: center;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.stat.success {
  border-left-color: #4caf50;
}

.stat.warning {
  border-left-color: #ff9800;
}

.stat-value {
  display: block;
  font-size: 1.75rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.25rem;
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  color: #666;
}

.history-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.history-list {
  max-height: 600px;
  overflow-y: auto;
}

.history-item {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.history-item:hover {
  background: #f9f9f9;
}

.scan-time {
  font-weight: 600;
  color: #667eea;
  font-size: 1.1rem;
}

.scan-details {
  flex: 1;
}

.employee-name {
  font-weight: 500;
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.employee-meta {
  color: #999;
  font-size: 0.9rem;
}

.separator {
  margin: 0 0.5rem;
}

.scan-status {
  text-align: right;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-success {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-warning {
  background: #fff3e0;
  color: #f57c00;
}

.status-error {
  background: #ffebee;
  color: #c62828;
}

.status-message {
  margin: 0.5rem 0 0 0;
  font-size: 0.85rem;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .scan-history-view {
    padding: 1rem;
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .stats-summary {
    grid-template-columns: 1fr;
  }

  .history-item {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .scan-time {
    font-size: 0.95rem;
  }

  .scan-status {
    text-align: left;
  }
}
</style>
