<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()

const isLoading = ref(false)
const error = ref('')

const formSchema = toTypedSchema(z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
}))

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    username: '',
    password: '',
  },
})

const onSubmit = form.handleSubmit(async (values) => {
  isLoading.value = true
  error.value = ''

  try {
    const success = await authStore.login(values.username, values.password)
    
    if (success) {
      uiStore.showSuccess('Login successful')
      
      // Redirect based on role
      if (authStore.isAdmin) {
        router.push('/admin')
      } else {
        router.push('/scanner')
      }
    } else {
      error.value = authStore.error || 'Login failed'
    }
  } catch (e) {
    error.value = 'An error occurred during login'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] p-5">
    <Card class="w-full max-w-[420px] shadow-2xl">
      <CardHeader class="text-center pb-2">
        <CardTitle class="text-2xl font-bold text-gray-800">
          Breakfast Counter System
        </CardTitle>
        <CardDescription class="text-gray-600">
          QR-Based Attendance Tracking
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit="onSubmit" class="space-y-6">
          <FormField v-slot="{ componentField }" name="username">
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Enter your username"
                  :disabled="isLoading"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  :disabled="isLoading"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <Alert v-if="error" variant="destructive">
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>

          <Button 
            type="submit" 
            class="w-full bg-[#667eea] hover:bg-[#5568d3]" 
            :disabled="isLoading"
          >
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <div class="w-full p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p><strong>Note:</strong> This is an internal system. Please use your assigned credentials.</p>
        </div>
      </CardFooter>
    </Card>
  </div>
</template>
