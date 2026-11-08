<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
</script>

<template>
  <div class="home">
    <h1>Welcome, {{ auth.user?.username }} 👋</h1>
    <p>Browse workouts and manage your enrollments.</p>
  </div>
</template>

<style scoped>
.home {
  padding: 48px 32px;
}

.home h1 {
  margin: 0 0 8px;
}

.home p {
  color: #6b7280;
}
</style>