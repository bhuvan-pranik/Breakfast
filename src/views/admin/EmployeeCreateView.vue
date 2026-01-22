<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEmployeeStore } from '@/stores/employee.store'
import { DEPARTMENTS } from '@/utils/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/components/ui/toast'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { ArrowLeft, Download, Check } from 'lucide-vue-next'

// Form validation schema
const formSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  department: z
    .string()
    .min(1, 'Department is required'),
  employee_id: z
    .string()
    .min(2, 'Employee ID is required')
    .max(50, 'Employee ID must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  is_active: z.boolean().default(true),
})

type FormData = z.infer<typeof formSchema>

const router = useRouter()
const employeeStore = useEmployeeStore()
const { toast } = useToast()

const isSubmitting = ref(false)
const generatedQR = ref<string | null>(null)
const showQRPreview = ref(false)

const form = useForm<FormData>({
  validationSchema: toTypedSchema(formSchema),
  initialValues: {
    phone: '',
    name: '',
    department: '',
    employee_id: '',
    email: '',
    is_active: true,
  },
})

const handleSubmit = async (values: FormData) => {
  isSubmitting.value = true

  try {
    const created = await employeeStore.createEmployee(values)
    toast({
      title: 'Success',
      description: 'Employee created successfully!',
    })

    // Show QR code preview
    if (created && created.qr_code) {
      generatedQR.value = created.qr_code
      showQRPreview.value = true
    } else {
      // Navigate to employee list if no QR preview
      router.push('/admin/employees')
    }
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to create employee',
      variant: 'destructive',
    })
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
    link.download = `${form.values.name}-QR.png`
    link.href = dataUrl
    link.click()

    toast({
      title: 'Success',
      description: 'QR code downloaded',
    })
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to download QR code',
      variant: 'destructive',
    })
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
  <div class="container mx-auto py-8 px-4 max-w-2xl">
    <div class="flex items-center gap-4 mb-8">
      <Button variant="ghost" @click="cancel">
        <ArrowLeft class="w-4 h-4 mr-2" />
        Back
      </Button>
      <div>
        <h1 class="text-3xl font-bold">Create New Employee</h1>
        <p class="text-muted-foreground mt-1">
          Add a new employee to the system
        </p>
      </div>
    </div>

    <div v-if="!showQRPreview">
      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
          <CardDescription>
            Fill in the employee details below. All fields are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form :validation-schema="formSchema" @submit="form.handleSubmit(handleSubmit)" class="space-y-6">
            <FormField v-slot="{ componentField }" name="phone">
              <FormItem>
                <FormLabel>Phone Number *</FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="tel"
                    placeholder="10-digit phone number"
                    maxlength="10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="name">
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="text"
                    placeholder="Employee full name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="department">
              <FormItem>
                <FormLabel>Department *</FormLabel>
                <Select v-model="componentField.modelValue" @update:modelValue="componentField.onChange">
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem v-for="dept in DEPARTMENTS" :key="dept" :value="dept">
                      {{ dept }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="employee_id">
              <FormItem>
                <FormLabel>Employee ID *</FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="text"
                    placeholder="Employee ID"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="email">
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="email"
                    placeholder="employee@example.com"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="is_active">
              <FormItem class="flex flex-row items-center justify-between rounded-lg border p-4">
                <div class="space-y-0.5">
                  <FormLabel class="text-base">Active Employee</FormLabel>
                  <FormDescription>
                    Inactive employees cannot scan attendance
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    v-bind="componentField"
                    :checked="componentField.modelValue"
                  />
                </FormControl>
              </FormItem>
            </FormField>

            <div class="flex gap-4 pt-4">
              <Button type="button" variant="outline" @click="cancel" class="flex-1">
                Cancel
              </Button>
              <Button type="submit" :disabled="isSubmitting" class="flex-1">
                <Check class="w-4 h-4 mr-2" v-if="!isSubmitting" />
                {{ isSubmitting ? 'Creating...' : 'Create Employee' }}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>

    <!-- QR Code Preview -->
    <div v-else>
      <Card class="text-center">
        <CardHeader>
          <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check class="w-8 h-8 text-green-600" />
          </div>
          <CardTitle class="text-2xl">Employee Created Successfully!</CardTitle>
          <CardDescription>
            The employee has been added to the system
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="bg-muted rounded-lg p-4">
            <h3 class="font-semibold text-lg">{{ form.values.name }}</h3>
            <p class="text-muted-foreground">{{ form.values.department }}</p>
            <p class="font-mono text-sm">{{ form.values.phone }}</p>
          </div>

          <div class="bg-white border rounded-lg p-6 inline-block">
            <img
              :src="`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${generatedQR}`"
              alt="QR Code"
              class="max-w-full h-auto"
            />
          </div>

          <div class="flex gap-4">
            <Button @click="downloadQR" variant="outline" class="flex-1">
              <Download class="w-4 h-4 mr-2" />
              Download QR Code
            </Button>
            <Button @click="goToList" class="flex-1">
              Go to Employee List
            </Button>
          </div>

          <p class="text-sm text-muted-foreground">
            Print this QR code and give it to the employee for attendance scanning
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

