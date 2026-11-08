<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/users';

const userStore = useUserStore();
const error = ref('');

onMounted(async () => {
  try {
    await userStore.fetchAll();
  } catch (e) {
    error.value = (e as Error).message;
  }
});
</script>

<template>
  <p v-if="error" class="error">{{ error }}</p>
  <table class="table">
    <thead>
      <tr><th>Username</th><th>Role</th></tr>
    </thead>
    <tbody>
      <tr v-for="u in userStore.users" :key="u._id">
        <td>{{ u.username }}</td>
        <td><span class="badge" :class="u.role">{{ u.role }}</span></td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped src="@/assets/admin.css"></style>