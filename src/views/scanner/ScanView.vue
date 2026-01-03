<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { useAttendanceStore } from '@/stores/attendance.store'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'

const attendanceStore = useAttendanceStore()
const authStore = useAuthStore()
const uiStore = useUIStore()

const isScanning = ref(false)
const isCameraReady = ref(false)
const lastScanTime = ref(0)
const scannedData = ref<string>('')
const scanResult = ref<{ success: boolean; message: string; employee?: any } | null>(null)

let html5QrCode: Html5Qrcode | null = null
const SCAN_COOLDOWN = 3000 // 3 seconds between scans

onMounted(async () => {
  try {
    // Fetch today's records first
    await attendanceStore.fetchTodayRecords()
    
    html5QrCode = new Html5Qrcode('qr-reader')
    await startScanning()
  } catch (error) {
    console.error('Failed to initialize scanner:', error)
    uiStore.showError('Failed to initialize camera. Please check permissions.')
  }
})

onUnmounted(async () => {
  await stopScanning()
})

const startScanning = async () => {
  if (!html5QrCode || isScanning.value) return

  try {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    }

    await html5QrCode.start(
      { facingMode: 'environment' },
      config,
      onScanSuccess,
      onScanError
    )

    isScanning.value = true
    isCameraReady.value = true
  } catch (error) {
    console.error('Error starting scanner:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Provide more specific error messages
    if (errorMessage.includes('Permission') || errorMessage.includes('NotAllowedError')) {
      uiStore.showError('Camera permission denied. Please allow camera access in your browser settings.')
    } else if (errorMessage.includes('NotFoundError') || errorMessage.includes('Device')) {
      uiStore.showError('No camera found. Please ensure your device has a camera.')
    } else if (errorMessage.includes('NotReadableError')) {
      uiStore.showError('Camera is already in use by another application.')
    } else if (errorMessage.includes('secure') || errorMessage.includes('HTTPS')) {
      uiStore.showError('Camera access requires HTTPS connection.')
    } else {
      uiStore.showError(`Failed to start camera: ${errorMessage}`)
    }
    
    isCameraReady.value = false
  }
}

const stopScanning = async () => {
  if (html5QrCode && isScanning.value) {
    try {
      await html5QrCode.stop()
      isScanning.value = false
      isCameraReady.value = false
    } catch (error) {
      console.error('Error stopping scanner:', error)
    }
  }
}

const onScanSuccess = async (decodedText: string) => {
  // Prevent rapid successive scans
  const now = Date.now()
  if (now - lastScanTime.value < SCAN_COOLDOWN) {
    return
  }
  lastScanTime.value = now

  scannedData.value = decodedText

  try {
    // Check if scanner is logged in
    if (!authStore.scannerId) {
      uiStore.showError('Please login as a scanner first')
      return
    }

    const result = await attendanceStore.recordScan(
      decodedText,
      authStore.scannerId
    )

    scanResult.value = {
      success: result.status === 'success',
      message: result.message,
      employee: result.employeeName ? { name: result.employeeName } : undefined
    }

    if (result.status === 'success') {
      uiStore.showSuccess(`✓ ${result.employeeName || 'Employee'} marked present`)
    } else if (result.status === 'duplicate') {
      uiStore.showWarning(`Already scanned: ${result.employeeName}`)
    } else if (result.status === 'inactive') {
      uiStore.showWarning(`Inactive employee: ${result.employeeName}`)
    } else {
      uiStore.showError('Invalid QR code')
    }

    // Clear result after 5 seconds
    setTimeout(() => {
      scanResult.value = null
    }, 5000)
  } catch (error) {
    console.error('Scan error:', error)
    scanResult.value = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to record attendance'
    }
    uiStore.showError('Failed to record attendance')
  }
}

const onScanError = (errorMessage: string) => {
  // Suppress continuous scanning errors
  // console.log('Scan error:', errorMessage)
}

const toggleScanning = async () => {
  if (isScanning.value) {
    await stopScanning()
  } else {
    await startScanning()
  }
}
</script>

<template>
  <div class="scan-view">
    <div class="scan-header">
      <h1>QR Code Scanner</h1>
      <p class="scan-subtitle">Scan employee QR codes to mark attendance</p>
    </div>

    <div class="scan-container">
      <!-- Camera Preview -->
      <div class="camera-wrapper">
        <div id="qr-reader" class="qr-reader"></div>
        
        <div v-if="!isCameraReady" class="camera-placeholder">
          <div class="spinner"></div>
          <p>Initializing camera...</p>
        </div>
      </div>

      <!-- Scan Controls -->
      <div class="scan-controls">
        <button 
          @click="toggleScanning" 
          class="btn-toggle"
          :class="{ 'btn-stop': isScanning, 'btn-start': !isScanning }"
        >
          {{ isScanning ? 'Stop Scanning' : 'Start Scanning' }}
        </button>
      </div>

      <!-- Scan Result Display -->
      <transition name="fade">
        <div v-if="scanResult" class="scan-result" :class="{ 'success': scanResult.success, 'error': !scanResult.success }">
          <div class="result-icon">
            <span v-if="scanResult.success">✓</span>
            <span v-else>✗</span>
          </div>
          <div class="result-content">
            <h3 v-if="scanResult.employee">{{ scanResult.employee.name }}</h3>
            <p class="department" v-if="scanResult.employee">{{ scanResult.employee.department }}</p>
            <p class="message">{{ scanResult.message }}</p>
          </div>
        </div>
      </transition>

      <!-- Today's Statistics -->
      <div class="scan-stats">
        <h3>Today's Statistics</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-value">{{ attendanceStore.totalScansToday }}</span>
            <span class="stat-label">Total Scans</span>
          </div>
          <div class="stat-card success">
            <span class="stat-value">{{ attendanceStore.successfulScansToday }}</span>
            <span class="stat-label">Successful</span>
          </div>
          <div class="stat-card warning">
            <span class="stat-value">{{ attendanceStore.duplicateScansToday }}</span>
            <span class="stat-label">Duplicates</span>
          </div>
          <div class="stat-card error">
            <span class="stat-value">{{ attendanceStore.todayRecords.filter(r => r.status === 'invalid' || r.status === 'inactive').length }}</span>
            <span class="stat-label">Invalid</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scan-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.scan-header {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
}

.scan-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.scan-subtitle {
  font-size: 1rem;
  opacity: 0.9;
}

.scan-container {
  max-width: 600px;
  margin: 0 auto;
}

.camera-wrapper {
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  margin-bottom: 1.5rem;
}

.qr-reader {
  width: 100%;
}

.camera-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #666;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.scan-controls {
  text-align: center;
  margin-bottom: 2rem;
}

.btn-toggle {
  padding: 1rem 3rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-start {
  background: #4caf50;
  color: white;
}

.btn-start:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.3);
}

.btn-stop {
  background: #f44336;
  color: white;
}

.btn-stop:hover {
  background: #da190b;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(244, 67, 54, 0.3);
}

.scan-result {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  gap: 1rem;
  align-items: center;
}

.scan-result.success {
  border-left: 5px solid #4caf50;
}

.scan-result.error {
  border-left: 5px solid #f44336;
}

.result-icon {
  font-size: 3rem;
  font-weight: bold;
  flex-shrink: 0;
}

.scan-result.success .result-icon {
  color: #4caf50;
}

.scan-result.error .result-icon {
  color: #f44336;
}

.result-content {
  flex: 1;
}

.result-content h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  color: #333;
}

.department {
  color: #666;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.message {
  margin: 0;
  color: #888;
  font-size: 0.95rem;
}

.scan-stats {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.scan-stats h3 {
  margin: 0 0 1rem 0;
  color: #333;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-card {
  background: #f5f5f5;
  padding: 1.5rem 1rem;
  border-radius: 8px;
  text-align: center;
  border-left: 4px solid #667eea;
}

.stat-card.success {
  border-left-color: #4caf50;
}

.stat-card.warning {
  border-left-color: #ff9800;
}

.stat-card.error {
  border-left-color: #f44336;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.25rem;
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .scan-header h1 {
    font-size: 1.5rem;
  }

  .scan-view {
    padding: 1rem 0.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .btn-toggle {
    padding: 0.875rem 2rem;
    font-size: 1rem;
  }
}
</style>
