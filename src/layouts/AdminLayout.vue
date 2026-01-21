<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Home,
  Users,
  ScanLine,
  BarChart,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()
const isSidebarOpen = ref(false)

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: Home, exact: true },
  { to: '/admin/employees', label: 'Employees', icon: Users },
  { to: '/admin/scanners', label: 'Scanners', icon: ScanLine },
  { to: '/admin/reports', label: 'Reports', icon: BarChart },
]

const getUserInitials = () => {
  const username = authStore.username || 'Admin'
  return username.slice(0, 2).toUpperCase()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile sidebar overlay -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-40 bg-black/50 lg:hidden"
      @click="closeSidebar"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Sidebar Header -->
      <div class="flex items-center justify-between h-16 px-4 border-b">
        <h1 class="text-lg font-semibold text-gray-900 truncate">
          Breakfast Counter
        </h1>
        <Button
          variant="ghost"
          size="icon"
          class="lg:hidden"
          @click="closeSidebar"
        >
          <X class="h-5 w-5" />
        </Button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :exact="item.exact"
          class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900 [&.router-link-active]:bg-primary/10 [&.router-link-active]:text-primary"
          @click="closeSidebar"
        >
          <component :is="item.icon" class="h-5 w-5 flex-shrink-0" />
          {{ item.label }}
        </RouterLink>

        <Separator class="my-4" />

        <RouterLink
          to="/scanner"
          class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          @click="closeSidebar"
        >
          <ScanLine class="h-5 w-5 flex-shrink-0" />
          Scanner Mode
        </RouterLink>
      </nav>
    </aside>

    <!-- Main content area -->
    <div class="lg:pl-64">
      <!-- Header -->
      <header class="sticky top-0 z-30 bg-white border-b shadow-sm">
        <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <!-- Mobile menu button -->
          <Button
            variant="ghost"
            size="icon"
            class="lg:hidden"
            @click="toggleSidebar"
          >
            <Menu class="h-5 w-5" />
          </Button>

          <!-- Page title (hidden on mobile) -->
          <h2 class="hidden lg:block text-lg font-semibold text-gray-900">
            Admin Panel
          </h2>

          <!-- Spacer for mobile -->
          <div class="lg:hidden" />

          <!-- User dropdown -->
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" class="flex items-center gap-2 px-2">
                <Avatar class="h-8 w-8">
                  <AvatarImage src="" alt="User avatar" />
                  <AvatarFallback class="bg-primary/10 text-primary text-sm">
                    {{ getUserInitials() }}
                  </AvatarFallback>
                </Avatar>
                <span class="hidden sm:inline-block text-sm font-medium text-gray-700">
                  {{ authStore.username }}
                </span>
                <ChevronDown class="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-56">
              <DropdownMenuLabel>
                <div class="flex flex-col space-y-1">
                  <p class="text-sm font-medium">{{ authStore.username }}</p>
                  <p class="text-xs text-muted-foreground">Administrator</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem class="cursor-pointer">
                <User class="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                class="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                @click="handleLogout"
              >
                <LogOut class="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <!-- Main content -->
      <main class="p-4 sm:p-6 lg:p-8">
        <div class="max-w-7xl mx-auto">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>
