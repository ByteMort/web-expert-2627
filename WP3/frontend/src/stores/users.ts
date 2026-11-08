import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { api } from '@/api';
import type { User } from './auth';

export const useUserStore = defineStore('users', () => {
  const users = ref<User[]>([]);

  const trainers = computed(() => users.value.filter((u) => u.role === 'trainer'));

  async function fetchAll() {
    users.value = await api<User[]>('/api/users');
  }

  return { users, trainers, fetchAll };
});