<script setup lang="ts">
import { ref } from 'vue'
import { useEmployeeStore } from '@/stores/employee.store'
import { useUIStore } from '@/stores/ui.store'
import { validatePhone, validateEmail } from '@/utils/validators'
import type { EmployeeFormData, CreateEmployeeInput } from '@/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, Download, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'uploaded', count: number): void
}>()

const employeeStore = useEmployeeStore()
const uiStore = useUIStore()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isUploading = ref(false)
const uploadResults = ref<{
  successful: number
  failed: number
  skipped: number
  errors: string[]
}>({
  successful: 0,
  failed: 0,
  skipped: 0,
  errors: []
})
const showResults = ref(false)

const selectFile = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

const parseCSV = async (file: File): Promise<EmployeeFormData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        
        if (lines.length === 0) {
          reject(new Error('CSV file is empty'))
          return
        }
        
        // Skip header row
        const dataLines = lines.slice(1)
        
        const employees: EmployeeFormData[] = dataLines.map((line) => {
          const [phone, name, department, employee_id, email] = line.split(',').map(s => s.trim())
          return {
            phone: phone || '',
            name: name || null,
            department: department || null,
            employee_id: employee_id || null,
            email: email || null,
            is_active: true
          }
        })
        
        console.log(`Parsed ${employees.length} employees from CSV`)
        resolve(employees)
      } catch (error) {
        console.error('CSV parse error:', error)
        reject(new Error('Failed to parse CSV file'))
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

const uploadFile = async () => {
  if (!selectedFile.value) {
    uiStore.showError('Please select a file')
    return
  }

  if (!selectedFile.value.name.endsWith('.csv')) {
    uiStore.showError('Please upload a CSV file')
    return
  }

  isUploading.value = true
  uploadResults.value = { successful: 0, failed: 0, skipped: 0, errors: [] }

  try {
    const employees = await parseCSV(selectedFile.value)
    
    // Track phone numbers already in the CSV to detect duplicates within the file
    const phoneSet = new Set<string>()
    
    // Validate and upload each employee
    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i]!
      const rowNum = i + 2 // +2 because of header and 0-indexing
      
      try {
        // Validate - only phone is required
        if (!emp.phone || !validatePhone(emp.phone)) {
          throw new Error(`Row ${rowNum}: Invalid phone number`)
        }
        
        // Check for duplicate within CSV file
        if (phoneSet.has(emp.phone)) {
          uploadResults.value.skipped++
          uploadResults.value.errors.push(`Row ${rowNum}: Duplicate phone ${emp.phone} in CSV (skipped)`)
          continue
        }
        phoneSet.add(emp.phone)
        
        // Check if employee already exists in database
        const existingEmployee = employeeStore.employees.find(e => e.phone === emp.phone)
        if (existingEmployee) {
          uploadResults.value.skipped++
          uploadResults.value.errors.push(`Row ${rowNum}: Employee with phone ${emp.phone} already exists (skipped)`)
          continue
        }
        
        // Optional field validation
        if (emp.name && emp.name.length < 2) {
          throw new Error(`Row ${rowNum}: Name too short`)
        }
        if (emp.employee_id && emp.employee_id.length < 2) {
          throw new Error(`Row ${rowNum}: Employee ID too short`)
        }
        if (emp.email && !validateEmail(emp.email)) {
          throw new Error(`Row ${rowNum}: Invalid email format`)
        }
        
        // Create employee
        await employeeStore.createEmployee(emp as CreateEmployeeInput)
        uploadResults.value.successful++
      } catch (error: any) {
        // Check if it's a duplicate/conflict error (409)
        const errorMessage = error.message || ''
        if (errorMessage.includes('duplicate') || 
            errorMessage.includes('already exists') || 
            errorMessage.includes('unique constraint') ||
            errorMessage.includes('409') ||
            error.code === '23505') { // PostgreSQL unique violation code
          uploadResults.value.skipped++
          uploadResults.value.errors.push(`Row ${rowNum}: Employee with phone ${emp.phone} already exists (skipped)`)
        } else {
          uploadResults.value.failed++
          uploadResults.value.errors.push(error.message)
        }
        console.error(`Upload error at row ${rowNum}:`, error)
      }
    }
    
    showResults.value = true
    emit('uploaded', uploadResults.value.successful)
    
    if (uploadResults.value.successful > 0) {
      uiStore.showSuccess(`Successfully uploaded ${uploadResults.value.successful} employees`)
    }
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to upload file')
  } finally {
    isUploading.value = false
  }
}

const downloadTemplate = () => {
  const csv = `phone,name,department,employee_id,email
1234567890,John Doe,Engineering,EMP001,john@example.com
9876543210,Jane Smith,Marketing,EMP002,jane@example.com`
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'employees-template.csv'
  link.click()
  URL.revokeObjectURL(url)
}

const close = () => {
  emit('close')
}
</script>

<template>
  <Dialog :open="true" @update:open="close">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Bulk Upload Employees</DialogTitle>
        <DialogDescription>
          Upload multiple employees at once using a CSV file
        </DialogDescription>
      </DialogHeader>

      <div v-if="!showResults" class="space-y-6">
        <!-- Instructions -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol class="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Download the CSV template</li>
              <li>Fill in employee details (phone, name, department, employee_id, email)</li>
              <li>Upload the completed file</li>
            </ol>
          </CardContent>
        </Card>

        <!-- Download Template Button -->
        <Button @click="downloadTemplate" variant="outline" class="w-full">
          <Download class="mr-2 h-4 w-4" />
          Download Template
        </Button>

        <!-- File Upload Area -->
        <div
          class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 transition-colors hover:border-primary/50 cursor-pointer"
          @click="selectFile"
        >
          <input
            ref="fileInput"
            type="file"
            accept=".csv"
            @change="handleFileSelect"
            class="hidden"
          />
          
          <div v-if="!selectedFile" class="text-center">
            <FileText class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p class="text-sm font-medium">Click to select CSV file</p>
            <p class="text-xs text-muted-foreground mt-1">or drag and drop</p>
          </div>

          <div v-else class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <FileText class="h-8 w-8 text-primary" />
              <div>
                <p class="text-sm font-medium">{{ selectedFile.name }}</p>
                <p class="text-xs text-muted-foreground">{{ (selectedFile.size / 1024).toFixed(2) }} KB</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" @click.stop="selectFile">
              Change
            </Button>
          </div>
        </div>

        <!-- Actions -->
        <DialogFooter>
          <Button variant="outline" @click="close">Cancel</Button>
          <Button 
            @click="uploadFile" 
            :disabled="!selectedFile || isUploading"
          >
            <Upload v-if="!isUploading" class="mr-2 h-4 w-4" />
            {{ isUploading ? 'Uploading...' : 'Upload Employees' }}
          </Button>
        </DialogFooter>
      </div>

      <!-- Results -->
      <div v-else class="space-y-6">
        <div class="text-center">
          <h3 class="text-xl font-semibold mb-6">Upload Results</h3>
          
          <div class="grid grid-cols-3 gap-4 mb-6">
            <Card class="border-l-4 border-l-green-500">
              <CardContent class="pt-6 text-center">
                <CheckCircle class="mx-auto h-8 w-8 text-green-500 mb-2" />
                <p class="text-3xl font-bold">{{ uploadResults.successful }}</p>
                <p class="text-sm text-muted-foreground">Successful</p>
              </CardContent>
            </Card>
            
            <Card class="border-l-4 border-l-orange-500">
              <CardContent class="pt-6 text-center">
                <AlertTriangle class="mx-auto h-8 w-8 text-orange-500 mb-2" />
                <p class="text-3xl font-bold">{{ uploadResults.skipped }}</p>
                <p class="text-sm text-muted-foreground">Skipped</p>
              </CardContent>
            </Card>
            
            <Card class="border-l-4 border-l-red-500">
              <CardContent class="pt-6 text-center">
                <AlertCircle class="mx-auto h-8 w-8 text-red-500 mb-2" />
                <p class="text-3xl font-bold">{{ uploadResults.failed }}</p>
                <p class="text-sm text-muted-foreground">Failed</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <!-- Errors List -->
        <Alert v-if="uploadResults.errors.length > 0" variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Errors</AlertTitle>
          <AlertDescription>
            <ul class="list-disc list-inside mt-2 max-h-48 overflow-y-auto space-y-1">
              <li v-for="(error, index) in uploadResults.errors" :key="index">
                {{ error }}
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button @click="close">Close</Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>
