<template>
  <div class="min-h-screen flex items-center justify-center p-5 bg-gray-50">
    <div class="text-center">
      <h1 class="text-5xl font-bold text-red-600 mb-4">500 - Server Error</h1>
      <p class="text-xl text-gray-600 mb-8">Something went wrong. Please try again later.</p>
      <RouterLink 
        to="/" 
        class="inline-flex items-center justify-center px-8 py-3 bg-[#667eea] text-white rounded-lg hover:bg-[#5568d3] transition-colors duration-200"
      >
        Go to Home
      </RouterLink>
    </div>
  </div>
</template>
