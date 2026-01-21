<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-neutral-900 text-white">
    <header class="bg-neutral-800 shadow-md">
      <div class="max-w-7xl mx-auto px-5 flex justify-between items-center py-4">
        <h1 class="text-2xl font-semibold">QR Code Scanner</h1>
        <div class="flex items-center gap-4">
          <span>{{ authStore.username }}</span>
          <Button @click="handleLogout" variant="destructive" size="sm">
            Logout
          </Button>
        </div>
      </div>
    </header>

    <main class="py-8">
      <RouterView />
    </main>
  </div>
</template>
