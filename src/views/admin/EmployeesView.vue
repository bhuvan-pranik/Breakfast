<template>
  <div class="employees-view">
    <h1>Employees</h1>
    <p>Manage employee records and QR codes</p>
    <div class="placeholder">
      <p>Employee management coming soon...</p>
      <RouterLink to="/admin/employees/create" class="btn">Create Employee</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.employees-view {
  padding: 2rem 0;
}

.placeholder {
  margin-top: 2rem;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  text-align: center;
}

.btn {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 6px;
}
</style>
