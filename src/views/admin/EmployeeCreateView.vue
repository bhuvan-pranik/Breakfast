<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useEmployeeStore } from '@/stores/employee.store'
import { useUIStore } from '@/stores/ui.store'
import { DEPARTMENTS, GENDERS } from '@/utils/constants'
import { validatePhone } from '@/utils/validators'
import type { EmployeeFormData } from '@/types'

const router = useRouter()
const employeeStore = useEmployeeStore()
const uiStore = useUIStore()

const formData = reactive<EmployeeFormData>({
  phone: '',
  name: '',
  department: '',
  gender: 'Male',
  is_active: true
})

const errors = reactive({
  phone: '',
  name: '',
  department: ''
})

const isSubmitting = ref(false)
const generatedQR = ref<string | null>(null)
const showQRPreview = ref(false)

const validateForm = (): boolean => {
  errors.phone = ''
  errors.name = ''
  errors.department = ''

  if (!formData.phone) {
    errors.phone = 'Phone number is required'
    return false
  }

  if (!validatePhone(formData.phone)) {
    errors.phone = 'Please enter a valid 10-digit phone number'
    return false
  }

  if (!formData.name || formData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
    return false
  }

  if (!formData.department) {
    errors.department = 'Department is required'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    const created = await employeeStore.createEmployee(formData)
    uiStore.showSuccess('Employee created successfully!')
    
    // Show QR code preview
    if (created && created.qr_code) {
      generatedQR.value = created.qr_code
      showQRPreview.value = true
    } else {
      // Navigate to employee list if no QR preview
      router.push('/admin/employees')
    }
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to create employee')
  } finally {
    isSubmitting.value = false
  }
}

const downloadQR = async () => {
  if (!generatedQR.value) return

  try {
    const { qrcodeService } = await import('@/services/qrcode.service')
    const dataUrl = await qrcodeService.generateQRCodeImage(generatedQR.value)
    
    const link = document.createElement('a')
    link.download = `${formData.name}-QR.png`
    link.href = dataUrl
    link.click()
  } catch (error) {
    uiStore.showError('Failed to download QR code')
  }
}

const goToList = () => {
  router.push('/admin/employees')
}

const cancel = () => {
  router.push('/admin/employees')
}
</script>

<template>
  <div class="employee-create">
    <div class="header">
      <h1>Create New Employee</h1>
      <button @click="cancel" class="btn-cancel">Cancel</button>
    </div>

    <div v-if="!showQRPreview" class="form-container">
      <form @submit.prevent="handleSubmit">
        <!-- Phone Number -->
        <div class="form-group">
          <label for="phone">Phone Number <span class="required">*</span></label>
          <input
            id="phone"
            v-model="formData.phone"
            type="tel"
            placeholder="10-digit phone number"
            :class="{ 'error': errors.phone }"
            maxlength="10"
          />
          <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
        </div>

        <!-- Name -->
        <div class="form-group">
          <label for="name">Full Name <span class="required">*</span></label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            placeholder="Employee full name"
            :class="{ 'error': errors.name }"
          />
          <span v-if="errors.phone" class="error-message">{{ errors.name }}</span>
        </div>

        <!-- Department -->
        <div class="form-group">
          <label for="department">Department <span class="required">*</span></label>
          <select
            id="department"
            v-model="formData.department"
            :class="{ 'error': errors.department }"
          >
            <option value="">Select Department</option>
            <option v-for="dept in DEPARTMENTS" :key="dept" :value="dept">
              {{ dept }}
            </option>
          </select>
          <span v-if="errors.department" class="error-message">{{ errors.department }}</span>
        </div>

        <!-- Gender -->
        <div class="form-group">
          <label for="gender">Gender</label>
          <select id="gender" v-model="formData.gender">
            <option v-for="gender in GENDERS" :key="gender" :value="gender">
              {{ gender }}
            </option>
          </select>
        </div>

        <!-- Active Status -->
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="formData.is_active" />
            <span>Active Employee</span>
          </label>
          <p class="help-text">Inactive employees cannot scan attendance</p>
        </div>

        <!-- Submit Button -->
        <div class="form-actions">
          <button type="button" @click="cancel" class="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Creating...' : 'Create Employee' }}
          </button>
        </div>
      </form>
    </div>

    <!-- QR Code Preview Modal -->
    <div v-else class="qr-preview">
      <div class="preview-card">
        <h2>✓ Employee Created Successfully!</h2>
        
        <div class="employee-info">
          <h3>{{ formData.name }}</h3>
          <p>{{ formData.department }}</p>
          <p class="phone">{{ formData.phone }}</p>
        </div>

        <div class="qr-code">
          <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${generatedQR}`" alt="QR Code" />
        </div>

        <div class="qr-actions">
          <button @click="downloadQR" class="btn btn-success">
            Download QR Code
          </button>
          <button @click="goToList" class="btn btn-primary">
            Go to Employee List
          </button>
        </div>

        <p class="qr-note">Print this QR code and give it to the employee</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.employee-create {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 1.75rem;
  color: #333;
}

.btn-cancel {
  padding: 0.5rem 1rem;
  background: #e0e0e0;
  color: #666;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-cancel:hover {
  background: #d0d0d0;
}

.form-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.required {
  color: #f44336;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input.error,
.form-group select.error {
  border-color: #f44336;
}

.error-message {
  display: block;
  color: #f44336;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.checkbox-group {
  border-top: 1px solid #e0e0e0;
  padding-top: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.help-text {
  margin: 0.5rem 0 0 1.75rem;
  font-size: 0.875rem;
  color: #666;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
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
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.qr-preview {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-card {
  text-align: center;
}

.preview-card h2 {
  color: #4caf50;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.employee-info {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.employee-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.25rem;
}

.employee-info p {
  margin: 0.25rem 0;
  color: #666;
}

.phone {
  font-family: monospace;
  font-size: 1.1rem;
}

.qr-code {
  margin: 2rem 0;
  padding: 1.5rem;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  display: inline-block;
}

.qr-code img {
  display: block;
  max-width: 300px;
  height: auto;
}

.qr-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.btn-success {
  background: #4caf50;
  color: white;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-success:hover {
  background: #45a049;
}

.qr-note {
  margin-top: 1.5rem;
  color: #666;
  font-size: 0.9rem;
  font-style: italic;
}

@media (max-width: 640px) {
  .employee-create {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .form-actions,
  .qr-actions {
    flex-direction: column;
  }

  .qr-code img {
    max-width: 250px;
  }
}
</style>
