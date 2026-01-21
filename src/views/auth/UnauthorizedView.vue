<template>
  <div class="min-h-screen flex items-center justify-center p-5 bg-gray-50">
    <div class="text-center">
      <h1 class="text-5xl font-bold text-red-600 mb-4">403 - Access Denied</h1>
      <p class="text-xl text-gray-600 mb-8">You don't have permission to access this page.</p>
      <RouterLink 
        to="/" 
        class="inline-flex items-center justify-center px-8 py-3 bg-[#667eea] text-white rounded-lg hover:bg-[#5568d3] transition-colors duration-200"
      >
        Go to Home
      </RouterLink>
    </div>
  </div>
</template>
