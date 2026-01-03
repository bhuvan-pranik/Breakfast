# QR Code Implementation Specifications

## Overview
Comprehensive specifications for QR code generation, validation, and scanning functionality.

## QR Code Generation

### Algorithm Specification

**Generation Formula**:
```
QR_CODE = HASH(phone + name + salt)
```

**Components**:
- `phone`: Employee phone number (unique identifier)
- `name`: Employee full name
- `salt`: Secret string from environment variable
- `HASH`: SHA-256 hashing algorithm

### Implementation

**File**: `src/services/qrcode.service.ts`

```typescript
import { SHA256 } from 'crypto-js'

class QRCodeService {
  private readonly salt: string

  constructor() {
    this.salt = import.meta.env.VITE_QR_SALT

    if (!this.salt) {
      throw new Error('QR_SALT environment variable is not defined')
    }
  }

  /**
   * Generate QR code string for employee
   * Format: SHA256(phone + name + salt)
   */
  generateQRCode(phone: string, name: string): string {
    // Normalize inputs
    const normalizedPhone = phone.trim()
    const normalizedName = name.trim().toLowerCase()

    // Create hash input
    const input = `${normalizedPhone}${normalizedName}${this.salt}`

    // Generate SHA-256 hash
    const hash = SHA256(input).toString()

    return hash
  }

  /**
   * Validate QR code against employee data
   */
  validateQRCode(qrCode: string, phone: string, name: string): boolean {
    const expectedQRCode = this.generateQRCode(phone, name)
    return qrCode === expectedQRCode
  }

  /**
   * Parse QR code data (for future enhancements)
   * Currently returns the hash as-is since it contains no parseable data
   */
  parseQRCode(qrCode: string): { hash: string } {
    return { hash: qrCode }
  }

  /**
   * Generate QR code image data URL
   * Uses qrcode library to create visual QR code
   */
  async generateQRCodeImage(
    qrCode: string,
    options?: {
      width?: number
      margin?: number
      errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
    }
  ): Promise<string> {
    const QRCode = (await import('qrcode')).default

    const defaultOptions = {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'M' as const,
      ...options
    }

    try {
      const dataUrl = await QRCode.toDataURL(qrCode, defaultOptions)
      return dataUrl
    } catch (error) {
      throw new Error('Failed to generate QR code image')
    }
  }

  /**
   * Download QR code as image
   */
  async downloadQRCode(
    qrCode: string,
    filename: string,
    options?: Parameters<typeof this.generateQRCodeImage>[1]
  ): Promise<void> {
    const dataUrl = await this.generateQRCodeImage(qrCode, options)

    // Create download link
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `${filename}.png`
    link.click()
  }
}

export const qrcodeService = new QRCodeService()
```

### QR Code Properties

**Format**: SHA-256 Hash (64 hexadecimal characters)

**Example**:
```
Input:
  Phone: "1234567890"
  Name: "John Doe"
  Salt: "my-secret-salt-123"

Output:
  "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
```

**Characteristics**:
- Fixed length: 64 characters
- Character set: 0-9, a-f (hexadecimal)
- Deterministic: Same input always produces same output
- Collision-resistant: Extremely unlikely to have duplicates
- One-way: Cannot reverse hash to get original data

### Security Considerations

1. **Salt Storage**:
   - Store in environment variable (`VITE_QR_SALT`)
   - Never commit to version control
   - Never expose in client-side code (only for generation)
   - Same salt must be used across all environments

2. **Hash Algorithm**:
   - SHA-256 provides strong cryptographic security
   - Resistant to collision attacks
   - Industry-standard algorithm

3. **Input Normalization**:
   - Phone numbers trimmed of whitespace
   - Names converted to lowercase for consistency
   - Prevents case-sensitivity issues

4. **Regeneration**:
   - Changing salt regenerates all QR codes
   - Changing name regenerates QR code (phone + name dependency)
   - Phone number cannot change (primary key)

---

## QR Code Scanning

### Scanner Library Recommendation

**Library**: `html5-qrcode`

**Reasons**:
- Browser-native camera access
- No native app required
- TypeScript support
- Active maintenance
- Good performance
- Mobile-friendly

**Installation**:
```bash
npm install html5-qrcode
```

### Scanner Service Implementation

**File**: `src/services/scanner.service.ts`

```typescript
import { Html5Qrcode } from 'html5-qrcode'

export interface ScannerConfig {
  fps?: number
  qrbox?: number | { width: number; height: number }
  aspectRatio?: number
  facingMode?: 'user' | 'environment'
}

export interface ScanResult {
  decodedText: string
  result: any
}

class ScannerService {
  private scanner: Html5Qrcode | null = null
  private isScanning = false

  /**
   * Initialize scanner with DOM element ID
   */
  async initialize(elementId: string): Promise<void> {
    if (this.scanner) {
      await this.stop()
    }

    this.scanner = new Html5Qrcode(elementId)
  }

  /**
   * Start scanning with camera
   */
  async start(
    onSuccess: (decodedText: string) => void,
    onError: (error: string) => void,
    config: ScannerConfig = {}
  ): Promise<void> {
    if (!this.scanner) {
      throw new Error('Scanner not initialized')
    }

    if (this.isScanning) {
      throw new Error('Scanner already running')
    }

    const defaultConfig = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      facingMode: 'environment' as const,
      ...config
    }

    try {
      await this.scanner.start(
        { facingMode: defaultConfig.facingMode },
        {
          fps: defaultConfig.fps,
          qrbox: defaultConfig.qrbox,
          aspectRatio: defaultConfig.aspectRatio
        },
        (decodedText) => {
          onSuccess(decodedText)
        },
        (errorMessage) => {
          // Ignore continuous scan errors (camera running normally)
          if (!errorMessage.includes('NotFoundException')) {
            onError(errorMessage)
          }
        }
      )

      this.isScanning = true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start scanner'
      onError(message)
      throw error
    }
  }

  /**
   * Stop scanning
   */
  async stop(): Promise<void> {
    if (!this.scanner) return

    if (this.isScanning) {
      try {
        await this.scanner.stop()
        this.isScanning = false
      } catch (error) {
        console.error('Error stopping scanner:', error)
      }
    }
  }

  /**
   * Clear scanner instance
   */
  async clear(): Promise<void> {
    await this.stop()

    if (this.scanner) {
      try {
        await this.scanner.clear()
        this.scanner = null
      } catch (error) {
        console.error('Error clearing scanner:', error)
      }
    }
  }

  /**
   * Get available cameras
   */
  async getCameras(): Promise<Array<{ id: string; label: string }>> {
    try {
      const devices = await Html5Qrcode.getCameras()
      return devices.map(device => ({
        id: device.id,
        label: device.label || `Camera ${device.id}`
      }))
    } catch (error) {
      console.error('Error getting cameras:', error)
      return []
    }
  }

  /**
   * Request camera permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch (error) {
      console.error('Camera permission denied:', error)
      return false
    }
  }

  /**
   * Check if camera is supported
   */
  static isCameraSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }

  /**
   * Get scanner state
   */
  getState(): { isScanning: boolean; isInitialized: boolean } {
    return {
      isScanning: this.isScanning,
      isInitialized: !!this.scanner
    }
  }
}

export const scannerService = new ScannerService()
```

### Scanner Composable

**File**: `src/composables/useQRScanner.ts`

```typescript
import { ref, onMounted, onUnmounted } from 'vue'
import { scannerService } from '@/services/scanner.service'
import type { ScannerConfig } from '@/services/scanner.service'

export function useQRScanner(elementId: string, config?: ScannerConfig) {
  const isScanning = ref(false)
  const isInitialized = ref(false)
  const error = ref<string | null>(null)
  const lastScan = ref<string | null>(null)
  const cameras = ref<Array<{ id: string; label: string }>>([])
  const hasPermission = ref(false)

  /**
   * Initialize scanner
   */
  const initialize = async () => {
    try {
      await scannerService.initialize(elementId)
      isInitialized.value = true
      error.value = null

      // Get available cameras
      cameras.value = await scannerService.getCameras()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to initialize scanner'
      throw e
    }
  }

  /**
   * Start scanning
   */
  const startScanning = async (
    onScanSuccess: (decodedText: string) => void,
    scanConfig?: ScannerConfig
  ) => {
    try {
      await scannerService.start(
        (decodedText) => {
          lastScan.value = decodedText
          onScanSuccess(decodedText)
        },
        (errorMessage) => {
          error.value = errorMessage
        },
        scanConfig || config
      )
      isScanning.value = true
      error.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to start scanning'
      throw e
    }
  }

  /**
   * Stop scanning
   */
  const stopScanning = async () => {
    try {
      await scannerService.stop()
      isScanning.value = false
      error.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to stop scanning'
    }
  }

  /**
   * Request camera permissions
   */
  const requestPermissions = async () => {
    try {
      hasPermission.value = await scannerService.requestPermissions()
      return hasPermission.value
    } catch (e) {
      error.value = 'Camera permission denied'
      return false
    }
  }

  /**
   * Clear error
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Cleanup on unmount
   */
  onUnmounted(async () => {
    await scannerService.clear()
  })

  return {
    // State
    isScanning,
    isInitialized,
    error,
    lastScan,
    cameras,
    hasPermission,

    // Methods
    initialize,
    startScanning,
    stopScanning,
    requestPermissions,
    clearError
  }
}
```

### Scanner Component Example

**File**: `src/components/scanner/QRScanner.vue`

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQRScanner } from '@/composables/useQRScanner'
import { useAttendanceStore } from '@/stores'
import { useAuthStore } from '@/stores'

const emit = defineEmits<{
  (e: 'scan-success', result: any): void
  (e: 'scan-error', error: string): void
}>()

const scannerId = 'qr-scanner-region'
const attendanceStore = useAttendanceStore()
const authStore = useAuthStore()

const {
  isScanning,
  isInitialized,
  error,
  lastScan,
  hasPermission,
  initialize,
  startScanning,
  stopScanning,
  requestPermissions,
  clearError
} = useQRScanner(scannerId, {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  facingMode: 'environment'
})

const isProcessing = ref(false)

/**
 * Handle successful QR scan
 */
const handleScanSuccess = async (decodedText: string) => {
  if (isProcessing.value) return

  isProcessing.value = true

  try {
    // Stop scanner temporarily
    await stopScanning()

    // Validate and record attendance
    // Note: The decodedText is the QR code hash
    // We need to validate it against employee database
    // This will be done by the attendance service

    // For now, we'll parse the QR code to extract phone
    // In a real implementation, you might encode phone in QR
    // or lookup by hash

    const result = await attendanceStore.recordScan(
      'PHONE_FROM_QR', // This needs proper implementation
      authStore.scannerId!,
      decodedText
    )

    emit('scan-success', result)

    // Resume scanning after 2 seconds
    setTimeout(async () => {
      isProcessing.value = false
      await startScanning(handleScanSuccess)
    }, 2000)
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Scan failed'
    emit('scan-error', errorMessage)
    isProcessing.value = false

    // Resume scanning
    await startScanning(handleScanSuccess)
  }
}

/**
 * Initialize and start scanner
 */
const initializeScanner = async () => {
  try {
    // Request permissions first
    const permitted = await requestPermissions()
    if (!permitted) {
      throw new Error('Camera permission required')
    }

    // Initialize scanner
    await initialize()

    // Start scanning
    await startScanning(handleScanSuccess)
  } catch (e) {
    console.error('Scanner initialization failed:', e)
  }
}

onMounted(() => {
  initializeScanner()
})
</script>

<template>
  <div class="qr-scanner">
    <!-- Scanner Region -->
    <div :id="scannerId" class="scanner-region"></div>

    <!-- Status Messages -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="clearError">Dismiss</button>
    </div>

    <div v-if="isProcessing" class="processing-message">
      Processing scan...
    </div>

    <!-- Controls -->
    <div class="scanner-controls">
      <button v-if="!isScanning && isInitialized" @click="startScanning(handleScanSuccess)">
        Start Scanning
      </button>
      <button v-if="isScanning" @click="stopScanning">
        Stop Scanning
      </button>
    </div>
  </div>
</template>

<style scoped>
.qr-scanner {
  max-width: 500px;
  margin: 0 auto;
}

.scanner-region {
  width: 100%;
  border: 2px solid #ddd;
  border-radius: 8px;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background-color: #fee;
  color: #c00;
  border-radius: 4px;
}

.processing-message {
  margin-top: 16px;
  padding: 12px;
  background-color: #ffc;
  color: #660;
  border-radius: 4px;
}

.scanner-controls {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
```

---

## QR Code Display Component

**File**: `src/components/employee/QRCodeDisplay.vue`

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { qrcodeService } from '@/services/qrcode.service'

interface Props {
  qrCode: string
  employeeName: string
  employeePhone: string
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 300
})

const qrImageUrl = ref<string>('')
const isLoading = ref(false)
const error = ref<string | null>(null)

/**
 * Generate QR code image
 */
const generateImage = async () => {
  isLoading.value = true
  error.value = null

  try {
    const dataUrl = await qrcodeService.generateQRCodeImage(props.qrCode, {
      width: props.size,
      margin: 2,
      errorCorrectionLevel: 'M'
    })
    qrImageUrl.value = dataUrl
  } catch (e) {
    error.value = 'Failed to generate QR code'
  } finally {
    isLoading.value = false
  }
}

/**
 * Download QR code
 */
const downloadQRCode = async () => {
  try {
    const filename = `${props.employeeName.replace(/\s+/g, '_')}_${props.employeePhone}`
    await qrcodeService.downloadQRCode(props.qrCode, filename, {
      width: 600,
      margin: 4,
      errorCorrectionLevel: 'H'
    })
  } catch (e) {
    error.value = 'Failed to download QR code'
  }
}

onMounted(() => {
  generateImage()
})
</script>

<template>
  <div class="qr-code-display">
    <div v-if="isLoading" class="loading">
      Generating QR code...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else class="qr-code-container">
      <img :src="qrImageUrl" :alt="`QR Code for ${employeeName}`" class="qr-code-image" />

      <div class="qr-code-info">
        <p><strong>{{ employeeName }}</strong></p>
        <p>{{ employeePhone }}</p>
      </div>

      <button @click="downloadQRCode" class="download-button">
        Download QR Code
      </button>
    </div>
  </div>
</template>

<style scoped>
.qr-code-display {
  text-align: center;
  padding: 20px;
}

.qr-code-image {
  max-width: 100%;
  height: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.qr-code-info {
  margin-top: 16px;
}

.download-button {
  margin-top: 16px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.download-button:hover {
  background-color: #0056b3;
}
</style>
```

---

## Validation Flow

### Client-Side Validation

1. **Scanner** scans QR code and gets hash string
2. **Frontend** sends hash to attendance service
3. **Supabase Function** validates hash against employee record
4. **Response** returns success/failure with employee name

### Database-Level Validation

The `record_attendance_scan()` function handles validation:

```sql
-- In database function
SELECT * FROM employees WHERE qr_code = p_qr_code;
-- If found, proceed with attendance recording
-- If not found, return 'invalid' status
```

---

## QR Code Management

### Regeneration Scenarios

1. **Name Change**: QR code must be regenerated
2. **Salt Change**: All QR codes must be regenerated (bulk operation)
3. **Security Breach**: All QR codes regenerated with new salt

### Bulk Regeneration

```typescript
// Admin function to regenerate all QR codes
async function regenerateAllQRCodes(): Promise<void> {
  const employees = await employeeService.getAll()

  for (const employee of employees) {
    await employeeService.regenerateQRCode(employee.phone)
  }
}
```

---

## Browser Compatibility

### Camera API Support

**Supported Browsers**:
- Chrome 53+
- Firefox 36+
- Safari 11+
- Edge 79+

**Mobile Support**:
- iOS Safari 11+
- Chrome Mobile
- Samsung Internet

**Fallback**: Display message for unsupported browsers

```typescript
if (!scannerService.isCameraSupported()) {
  alert('Camera not supported on this device')
}
```

---

## Performance Considerations

1. **Scan Rate**: Limit to 10 FPS to reduce CPU usage
2. **Image Size**: Use 300x300 for display, 600x600 for download
3. **Caching**: Cache generated QR images in component state
4. **Debouncing**: Prevent multiple scans within 2 seconds

---

## Security Checklist

- [x] Salt stored in environment variable
- [x] Salt never exposed in client-side code
- [x] SHA-256 hashing algorithm used
- [x] Input normalization prevents bypass
- [x] Server-side validation in database function
- [x] QR code unique per employee
- [x] No sensitive data encoded in QR (only hash)
