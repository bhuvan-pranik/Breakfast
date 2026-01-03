<script setup lang="ts">
import { ref } from 'vue'
import { useEmployeeStore } from '@/stores/employee.store'
import { useUIStore } from '@/stores/ui.store'
import { validatePhone, validateEmail } from '@/utils/validators'
import type { EmployeeFormData } from '@/types'

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
        
        const employees: EmployeeFormData[] = dataLines.map((line, index) => {
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
      const emp = employees[i]
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
        await employeeStore.createEmployee(emp)
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
  <div class="bulk-upload-modal">
    <div class="modal-overlay" @click="close"></div>
    
    <div class="modal-content">
      <div class="modal-header">
        <h2>Bulk Upload Employees</h2>
        <button @click="close" class="btn-close">×</button>
      </div>

      <div v-if="!showResults" class="modal-body">
        <div class="instructions">
          <h3>Instructions:</h3>
          <ol>
            <li>Download the CSV template</li>
            <li>Fill in employee details (phone, name, department, gender)</li>
            <li>Upload the completed file</li>
          </ol>
        </div>

        <button @click="downloadTemplate" class="btn btn-secondary">
          📥 Download Template
        </button>

        <div class="file-upload-area">
          <input
            ref="fileInput"
            type="file"
            accept=".csv"
            @change="handleFileSelect"
            style="display: none"
          />
          
          <div v-if="!selectedFile" @click="selectFile" class="upload-placeholder">
            <div class="upload-icon">📄</div>
            <p>Click to select CSV file</p>
            <p class="file-note">or drag and drop</p>
          </div>

          <div v-else class="selected-file">
            <div class="file-info">
              <span class="file-name">{{ selectedFile.name }}</span>
              <span class="file-size">{{ (selectedFile.size / 1024).toFixed(2) }} KB</span>
            </div>
            <button @click="selectFile" class="btn-change">Change File</button>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="close" class="btn btn-secondary">Cancel</button>
          <button 
            @click="uploadFile" 
            class="btn btn-primary"
            :disabled="!selectedFile || isUploading"
          >
            {{ isUploading ? 'Uploading...' : 'Upload Employees' }}
          </button>
        </div>
      </div>

      <div v-else class="modal-body results">
        <div class="results-summary">
          <h3>Upload Results</h3>
          <div class="stats">
            <div class="stat success">
              <span class="stat-value">{{ uploadResults.successful }}</span>
              <span class="stat-label">Successful</span>
            </div>
            <div class="stat warning">
              <span class="stat-value">{{ uploadResults.skipped }}</span>
              <span class="stat-label">Skipped (Duplicates)</span>
            </div>
            <div class="stat error">
              <span class="stat-value">{{ uploadResults.failed }}</span>
              <span class="stat-label">Failed</span>
            </div>
          </div>
        </div>

        <div v-if="uploadResults.errors.length > 0" class="errors-list">
          <h4>Errors:</h4>
          <ul>
            <li v-for="(error, index) in uploadResults.errors" :key="index">
              {{ error }}
            </li>
          </ul>
        </div>

        <button @click="close" class="btn btn-primary">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bulk-upload-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.btn-close:hover {
  background: #e0e0e0;
}

.modal-body {
  padding: 2rem;
}

.instructions {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.instructions h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #333;
}

.instructions ol {
  margin: 0;
  padding-left: 1.5rem;
  color: #666;
}

.instructions li {
  margin-bottom: 0.5rem;
}

.file-upload-area {
  margin: 2rem 0;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 2rem;
  transition: border-color 0.3s;
}

.file-upload-area:hover {
  border-color: #667eea;
}

.upload-placeholder {
  text-align: center;
  cursor: pointer;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.upload-placeholder p {
  margin: 0.5rem 0;
  color: #666;
}

.file-note {
  font-size: 0.875rem;
  color: #999;
}

.selected-file {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-info {
  display: flex;
  flex-direction: column;
}

.file-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
}

.file-size {
  font-size: 0.875rem;
  color: #999;
}

.btn-change {
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-change:hover {
  background: #e0e0e0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary {
  background: #e0e0e0;
  color: #666;
  width: 100%;
  margin-bottom: 1.5rem;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.btn-primary {
  background: #667eea;
  color: white;
  width: 100%;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.results-summary {
  text-align: center;
  margin-bottom: 2rem;
}

.results-summary h3 {
  margin: 0 0 1.5rem 0;
  color: #333;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}

.stat {
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.stat.success {
  background: #e8f5e9;
  border-left: 4px solid #4caf50;
}

.stat.warning {
  background: #fff3e0;
  border-left: 4px solid #ff9800;
}

.stat.error {
  background: #ffebee;
  border-left: 4px solid #f44336;
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
  font-size: 0.9rem;
  color: #666;
}

.errors-list {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #fff3e0;
  border-radius: 8px;
  border-left: 4px solid #ff9800;
}

.errors-list h4 {
  margin: 0 0 1rem 0;
  color: #e65100;
}

.errors-list ul {
  margin: 0;
  padding-left: 1.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.errors-list li {
  margin-bottom: 0.5rem;
  color: #f57c00;
}
</style>
