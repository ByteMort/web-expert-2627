import { defineStore } from 'pinia';
import { ref } from 'vue';

export type User = {
  _id: string;
  username: string;
  role: 'user' | 'trainer' | 'admin';
};

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const checked = ref(false);

  async function fetchMe() {
    try {
      const res = await fetch('/api/users/me');
      user.value = res.ok ? await res.json() : null;
    } catch {
      user.value = null;
    } finally {
      checked.value = true;
    }
  }

  async function login(username: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message);
    }

    await fetchMe();
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    user.value = null;
  }

  async function register(username: string, password: string) {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const error = await res.json();
      const details = Array.isArray(error.data)
        ? error.data.map((d: { field: string; message: string }) => `${d.field} ${d.message}`).join(', ')
        : '';
      throw new Error(details || error.message);
    }

    await login(username, password);
  }

  return { user, checked, fetchMe, login, logout, register };
});