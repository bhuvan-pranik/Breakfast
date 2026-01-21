<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEmployeeStore } from '@/stores/employee.store'
import { DEPARTMENTS } from '@/utils/constants'
import type { Employee } from '@/types'
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
import { ArrowLeft, Check, Loader2 } from 'lucide-vue-next'

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
const route = useRoute()
const employeeStore = useEmployeeStore()
const { toast } = useToast()

const phone = route.params.phone as string
const isSubmitting = ref(false)
const isLoading = ref(true)
const employee = ref<Employee | null>(null)

const form = useForm<FormData>({
  validationSchema: toTypedSchema(formSchema),
})

onMounted(async () => {
  try {
    await employeeStore.fetchEmployees()
    employee.value = employeeStore.employees.find(emp => emp.phone === phone) || null

    if (!employee.value) {
      toast({
        title: 'Error',
        description: 'Employee not found',
        variant: 'destructive',
      })
      router.push('/admin/employees')
      return
    }

    // Pre-populate form with employee data
    form.setValues({
      phone: employee.value.phone,
      name: employee.value.name || '',
      department: employee.value.department || '',
      employee_id: employee.value.employee_id || '',
      email: employee.value.email || '',
      is_active: employee.value.is_active,
    })
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to load employee data',
      variant: 'destructive',
    })
    router.push('/admin/employees')
  } finally {
    isLoading.value = false
  }
})

const handleSubmit = async (values: FormData) => {
  if (!employee.value) return

  isSubmitting.value = true

  try {
    await employeeStore.updateEmployee(employee.value.phone, values)
    toast({
      title: 'Success',
      description: 'Employee updated successfully!',
    })
    router.push('/admin/employees')
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to update employee',
      variant: 'destructive',
    })
  } finally {
    isSubmitting.value = false
  }
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
        <h1 class="text-3xl font-bold">Edit Employee</h1>
        <p class="text-muted-foreground mt-1">
          Update employee information
        </p>
      </div>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin mr-2" />
      <span>Loading employee data...</span>
    </div>

    <div v-else-if="employee">
      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
          <CardDescription>
            Update the employee details below.
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
                    disabled
                  />
                </FormControl>
                <FormDescription>
                  Phone number cannot be changed
                </FormDescription>
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
                {{ isSubmitting ? 'Updating...' : 'Update Employee' }}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
