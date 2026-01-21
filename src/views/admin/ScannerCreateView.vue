<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useScannerStore } from '@/stores/scanner.store'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-vue-next'
import { object, string, boolean, enum as zenum } from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import type { CreateScannerInput } from '@/types'

const router = useRouter()
const scannerStore = useScannerStore()
const { toast } = useToast()

const schema = object({
  username: string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character'),
  confirmPassword: string(),
  role: zenum(['admin', 'scanner']),
  is_active: boolean()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

const { handleSubmit, isSubmitting } = useForm<CreateScannerInput & { confirmPassword: string }>({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    username: '',
    password: '',
    confirmPassword: '',
    role: 'scanner',
    is_active: true
  }
})

const onSubmit = handleSubmit(async (values) => {
  try {
    const { confirmPassword, ...scannerData } = values
    await scannerStore.createScanner(scannerData)
    toast({
      title: 'Success',
      description: 'Scanner account created successfully!',
    })
    router.push('/admin/scanners')
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to create scanner account',
      variant: 'destructive',
    })
  }
})

const cancel = () => {
  router.push('/admin/scanners')
}
</script>

<template>
  <div class="container mx-auto py-8 px-4 max-w-2xl">
    <div class="flex items-center gap-4 mb-8">
      <Button variant="outline" size="sm" @click="cancel">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Back
      </Button>
      <h1 class="text-3xl font-bold">Create Scanner Account</h1>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Scanner Details</CardTitle>
        <CardDescription>
          Create a new scanner account for attendance tracking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form @submit="onSubmit" class="space-y-6">
          <FormField v-slot="{ componentField }" name="username">
            <FormItem>
              <FormLabel>Username *</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  placeholder="Enter username"
                  autocomplete="off"
                />
              </FormControl>
              <FormDescription>
                Letters, numbers, and underscores only. Minimum 3 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="role">
            <FormItem>
              <FormLabel>Role *</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="scanner">Scanner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Scanner can only scan QR codes. Admin has full access.
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel>Password *</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="password"
                  placeholder="Enter password"
                  autocomplete="new-password"
                />
              </FormControl>
              <FormDescription>
                Minimum 8 characters with uppercase, lowercase, number, and special character.
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="confirmPassword">
            <FormItem>
              <FormLabel>Confirm Password *</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="password"
                  placeholder="Re-enter password"
                  autocomplete="new-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="is_active">
            <FormItem class="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  v-bind="componentField"
                  :checked="componentField.modelValue"
                />
              </FormControl>
              <div class="space-y-1 leading-none">
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  Enable this scanner account immediately
                </FormDescription>
              </div>
            </FormItem>
          </FormField>

          <div class="flex gap-4 pt-4">
            <Button type="button" variant="outline" @click="cancel" class="flex-1">
              Cancel
            </Button>
            <Button type="submit" :disabled="isSubmitting" class="flex-1">
              {{ isSubmitting ? 'Creating...' : 'Create Scanner' }}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  </div>
</template>
