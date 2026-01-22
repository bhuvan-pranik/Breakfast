/**
 * useQRScanner Composable
 * 
 * Encapsulates QR code scanning logic using html5-qrcode library.
 * Manages camera permissions, scanner lifecycle, and scan results.
 */

import { ref, onUnmounted } from 'vue'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import type { Html5QrcodeResult } from 'html5-qrcode/esm/core'
import { handleError, tryCatch } from '@/utils/error-handler'

export interface ScannerConfig {
  fps?: number
  qrbox?: number | { width: number; height: number }
  aspectRatio?: number
  disableFlip?: boolean
  videoConstraints?: MediaTrackConstraints
}

export interface ScanResult {
  decodedText: string
  result: Html5QrcodeResult
  timestamp: Date
}

const DEFAULT_CONFIG: ScannerConfig = {
  fps: 10,
  qrbox: 250,
  aspectRatio: 1.0,
  disableFlip: false
}

export function useQRScanner(elementId: string = 'qr-reader') {
  const isScanning = ref(false)
  const isPaused = ref(false)
  const error = ref<string | null>(null)
  const lastScan = ref<ScanResult | null>(null)
  const cameraId = ref<string | null>(null)
  const cameras = ref<{ id: string; label: string }[]>([])
  
  let scanner: Html5Qrcode | null = null
  let onScanCallback: ((result: ScanResult) => void) | null = null

  /**
   * Initialize scanner instance
   */
  async function initialize() {
    if (scanner) return

    try {
      scanner = new Html5Qrcode(elementId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false
      })
      error.value = null
    } catch (err) {
      const errorResult = handleError(err, { action: 'initializeScanner' })
      error.value = errorResult.userMessage
      throw err
    }
  }

  /**
   * Get available cameras
   */
  async function getCameras() {
    const [devices, errorResult] = await tryCatch(
      () => Html5Qrcode.getCameras(),
      { action: 'getCameras' }
    )

    if (errorResult) {
      error.value = errorResult.userMessage
      return []
    }

    if (devices && devices.length > 0) {
      cameras.value = devices.map(device => ({
        id: device.id,
        label: device.label || `Camera ${device.id}`
      }))
      
      // Set default camera (prefer back camera on mobile)
      const backCamera = devices.find(d => 
        d.label.toLowerCase().includes('back') || 
        d.label.toLowerCase().includes('rear')
      )
      cameraId.value = backCamera?.id || devices[0].id
    }

    return cameras.value
  }

  /**
   * Start scanning with camera
   */
  async function startScanning(
    onScan: (result: ScanResult) => void,
    config: ScannerConfig = {}
  ) {
    if (isScanning.value) {
      console.warn('Scanner is already running')
      return
    }

    await initialize()
    
    if (!scanner) {
      error.value = 'Failed to initialize scanner'
      return
    }

    // Get cameras if not already loaded
    if (cameras.value.length === 0) {
      await getCameras()
    }

    if (!cameraId.value) {
      error.value = 'No camera available'
      return
    }

    onScanCallback = onScan
    const scannerConfig = { ...DEFAULT_CONFIG, ...config }

    const [, errorResult] = await tryCatch(
      () => scanner!.start(
        cameraId.value!,
        scannerConfig,
        (decodedText, result) => {
          if (isPaused.value) return

          const scanResult: ScanResult = {
            decodedText,
            result,
            timestamp: new Date()
          }
          
          lastScan.value = scanResult
          
          if (onScanCallback) {
            onScanCallback(scanResult)
          }
        },
        (errorMessage) => {
          // Scan error (not critical - happens when no QR in frame)
          // Don't set error state for scan errors
        }
      ),
      { action: 'startScanning' }
    )

    if (errorResult) {
      error.value = errorResult.userMessage
      return
    }

    isScanning.value = true
    isPaused.value = false
    error.value = null
  }

  /**
   * Stop scanning and release camera
   */
  async function stopScanning() {
    if (!scanner || !isScanning.value) return

    const [, errorResult] = await tryCatch(
      () => scanner!.stop(),
      { action: 'stopScanning' }
    )

    if (errorResult) {
      error.value = errorResult.userMessage
    }

    isScanning.value = false
    isPaused.value = false
  }

  /**
   * Pause scanning (keeps camera active but ignores scans)
   */
  function pause() {
    isPaused.value = true
  }

  /**
   * Resume scanning
   */
  function resume() {
    isPaused.value = false
  }

  /**
   * Switch camera
   */
  async function switchCamera(newCameraId: string) {
    const wasScanning = isScanning.value
    const currentCallback = onScanCallback

    if (wasScanning && currentCallback) {
      await stopScanning()
      cameraId.value = newCameraId
      await startScanning(currentCallback)
    } else {
      cameraId.value = newCameraId
    }
  }

  /**
   * Clear scanner instance
   */
  async function clear() {
    await stopScanning()
    
    if (scanner) {
      try {
        await scanner.clear()
      } catch (err) {
        console.error('Error clearing scanner:', err)
      }
      scanner = null
    }

    lastScan.value = null
    error.value = null
    onScanCallback = null
  }

  /**
   * Check camera permissions
   */
  async function checkPermissions(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch (err) {
      error.value = 'Camera permission denied'
      return false
    }
  }

  /**
   * Request camera permissions
   */
  async function requestPermissions(): Promise<boolean> {
    return await checkPermissions()
  }

  // Cleanup on unmount
  onUnmounted(() => {
    clear()
  })

  return {
    // State
    isScanning,
    isPaused,
    error,
    lastScan,
    cameraId,
    cameras,

    // Methods
    initialize,
    getCameras,
    startScanning,
    stopScanning,
    pause,
    resume,
    switchCamera,
    clear,
    checkPermissions,
    requestPermissions
  }
}
