<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useScannerStore } from '@/stores/scanner.store'
import { useUIStore } from '@/stores/ui.store'
import { validateUsername, validatePassword } from '@/utils/validators'
import type { CreateScannerInput } from '@/types'

const router = useRouter()
const scannerStore = useScannerStore()
const uiStore = useUIStore()

const formData = reactive<CreateScannerInput>({
  username: '',
  password: '',
  role: 'scanner'
})

const confirmPassword = ref('')

const errors = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const isSubmitting = ref(false)

const validateForm = (): boolean => {
  errors.username = ''
  errors.password = ''
  errors.confirmPassword = ''

  if (!formData.username || formData.username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters'
    return false
  }

  if (!validateUsername(formData.username)) {
    errors.username = 'Username can only contain letters, numbers, and underscores'
    return false
  }

  if (!formData.password || formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
    return false
  }

  if (!validatePassword(formData.password)) {
    errors.password = 'Password must contain uppercase, lowercase, number, and special character'
    return false
  }

  if (formData.password !== confirmPassword.value) {
    errors.confirmPassword = 'Passwords do not match'
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
    await scannerStore.createScanner(formData)
    uiStore.showSuccess('Scanner account created successfully!')
    router.push('/admin/scanners')
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to create scanner account')
  } finally {
    isSubmitting.value = false
  }
}

const cancel = () => {
  router.push('/admin/scanners')
}
</script>

<template>
  <div class="scanner-create">
    <div class="header">
      <h1>Create Scanner Account</h1>
      <button @click="cancel" class="btn-cancel">Cancel</button>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <!-- Username -->
        <div class="form-group">
          <label for="username">Username <span class="required">*</span></label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            placeholder="Enter username"
            :class="{ 'error': errors.username }"
            autocomplete="off"
          />
          <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
          <p class="help-text">Letters, numbers, and underscores only. Minimum 3 characters.</p>
        </div>

        <!-- Role -->
        <div class="form-group">
          <label for="role">Role <span class="required">*</span></label>
          <select id="role" v-model="formData.role">
            <option value="admin">Admin</option>
            <option value="scanner">Scanner</option>
          </select>
          <p class="help-text">Admins have full access. Scanners can only scan QR codes.</p>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="password">Password <span class="required">*</span></label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="Enter password"
            :class="{ 'error': errors.password }"
            autocomplete="new-password"
          />
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          <p class="help-text">Minimum 8 characters with uppercase, lowercase, number, and special character.</p>
        </div>

        <!-- Confirm Password -->
        <div class="form-group">
          <label for="confirmPassword">Confirm Password <span class="required">*</span></label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            :class="{ 'error': errors.confirmPassword }"
            autocomplete="new-password"
          />
          <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
        </div>

        <!-- Submit Button -->
        <div class="form-actions">
          <button type="button" @click="cancel" class="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Creating...' : 'Create Scanner' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.scanner-create {
  padding: 2rem 0;
  max-width: 600px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0;
  font-size: 2rem;
  color: #333;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: #e0e0e0;
  color: #666;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-cancel:hover {
  background: #d0d0d0;
}

.form-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.required {
  color: #f44336;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
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
  margin-top: 0.25rem;
  color: #f44336;
  font-size: 0.875rem;
}

.help-text {
  margin-top: 0.25rem;
  color: #999;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
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
</style>
