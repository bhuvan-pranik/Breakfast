<template>
  <div class="not-found-view">
    <div class="content">
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <RouterLink to="/" class="btn-home">Go to Home</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.not-found-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.content {
  text-align: center;
}

.content h1 {
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.content p {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 2rem;
}

.btn-home {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.2s;
}

.btn-home:hover {
  background: #5568d3;
}
</style>
