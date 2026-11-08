<script setup lang="ts">
import { ref } from 'vue';
import AdminUsers from '@/components/admin/AdminUsers.vue';
import AdminWorkouts from '@/components/admin/AdminWorkouts.vue';

const tab = ref<'workouts' | 'users'>('workouts');
</script>

<template>
  <div class="admin">
    <h1>Control Panel</h1>

    <div class="tabs">
      <button :class="{ active: tab === 'workouts' }" @click="tab = 'workouts'">Workouts</button>
      <button :class="{ active: tab === 'users' }" @click="tab = 'users'">Users</button>
    </div>

    <AdminWorkouts v-if="tab === 'workouts'" />
    <AdminUsers v-else />
  </div>
</template>

<style scoped>
.admin {
  padding: 32px;
  max-width: 1100px;
  margin: 0 auto;
}

.tabs {
  display: flex;
  gap: 8px;
  margin: 16px 0 24px;
}

.tabs button {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.tabs button.active {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}
</style>