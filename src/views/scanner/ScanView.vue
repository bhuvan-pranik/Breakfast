<template>
  <div class="scan-view">
    <div class="container">
      <h1>Scan QR Code</h1>
      <div class="scanner-container">
        <div class="placeholder">
          <p>QR Scanner interface coming soon...</p>
          <p class="note">This will use device camera to scan employee QR codes</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scan-view {
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

h1 {
  margin-bottom: 2rem;
}

.scanner-container {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 3rem;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder {
  color: #ccc;
}

.note {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #999;
}
</style>
