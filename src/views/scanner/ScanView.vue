<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { useAttendanceStore } from '@/stores/attendance.store'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, CameraOff, CheckCircle, XCircle, RefreshCw } from 'lucide-vue-next'

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

const onScanError = (_errorMessage: string) => {
  // Suppress continuous scanning errors
  // console.log('Scan error:', _errorMessage)
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
  <div class="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-700 p-4 md:p-8">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">QR Code Scanner</h1>
      <p class="text-white/90 text-base md:text-lg">Scan employee QR codes to mark attendance</p>
    </div>

    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Camera Card -->
      <Card class="overflow-hidden shadow-2xl">
        <CardContent class="p-0">
          <div class="relative">
            <div id="qr-reader" class="w-full"></div>
            
            <!-- Camera Placeholder -->
            <div v-if="!isCameraReady" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
              <RefreshCw class="w-12 h-12 text-indigo-500 animate-spin mb-4" />
              <p class="text-gray-600">Initializing camera...</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Scan Controls -->
      <div class="flex justify-center">
        <Button
          @click="toggleScanning"
          :variant="isScanning ? 'destructive' : 'default'"
          size="lg"
          class="min-w-[200px] shadow-lg hover:shadow-xl transition-all"
        >
          <Camera v-if="!isScanning" class="w-5 h-5 mr-2" />
          <CameraOff v-else class="w-5 h-5 mr-2" />
          {{ isScanning ? 'Stop Scanning' : 'Start Scanning' }}
        </Button>
      </div>

      <!-- Scan Result Alert -->
      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <Alert
          v-if="scanResult"
          :variant="scanResult.success ? 'default' : 'destructive'"
          class="shadow-lg"
        >
          <CheckCircle v-if="scanResult.success" class="w-6 h-6" />
          <XCircle v-else class="w-6 h-6" />
          <AlertDescription class="ml-2">
            <div v-if="scanResult.employee" class="font-semibold text-lg">
              {{ scanResult.employee.name }}
            </div>
            <div class="text-sm opacity-90">{{ scanResult.message }}</div>
          </AlertDescription>
        </Alert>
      </transition>

      <!-- Today's Statistics Card -->
      <Card class="shadow-xl">
        <CardHeader>
          <CardTitle class="text-center">Today's Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <!-- Total Scans -->
            <div class="bg-gray-50 rounded-lg p-4 text-center border-l-4 border-indigo-500">
              <div class="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {{ attendanceStore.totalScansToday }}
              </div>
              <div class="text-xs md:text-sm text-gray-600 uppercase tracking-wide">Total Scans</div>
            </div>

            <!-- Successful Scans -->
            <div class="bg-green-50 rounded-lg p-4 text-center border-l-4 border-green-500">
              <div class="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {{ attendanceStore.successfulScansToday }}
              </div>
              <div class="text-xs md:text-sm text-gray-600 uppercase tracking-wide">Successful</div>
            </div>

            <!-- Duplicate Scans -->
            <div class="bg-orange-50 rounded-lg p-4 text-center border-l-4 border-orange-500">
              <div class="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {{ attendanceStore.duplicateScansToday }}
              </div>
              <div class="text-xs md:text-sm text-gray-600 uppercase tracking-wide">Duplicates</div>
            </div>

            <!-- Invalid Scans -->
            <div class="bg-red-50 rounded-lg p-4 text-center border-l-4 border-red-500">
              <div class="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {{ attendanceStore.todayRecords.filter(r => r.status === 'invalid' || r.status === 'inactive').length }}
              </div>
              <div class="text-xs md:text-sm text-gray-600 uppercase tracking-wide">Invalid</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
