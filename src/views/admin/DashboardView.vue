<template>
  <div class="dashboard-view">
    <h1>Admin Dashboard</h1>
    <p>Welcome to the Breakfast Counter System Admin Panel</p>
    
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Employees</h3>
        <p class="stat-value">-</p>
      </div>
      <div class="stat-card">
        <h3>Active Scanners</h3>
        <p class="stat-value">-</p>
      </div>
      <div class="stat-card">
        <h3>Today's Scans</h3>
        <p class="stat-value">-</p>
      </div>
      <div class="stat-card">
        <h3>Attendance Rate</h3>
        <p class="stat-value">-</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-view {
  padding: 2rem 0;
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}
</style>
