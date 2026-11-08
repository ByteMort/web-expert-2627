<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');

async function handleRegister() {
  error.value = '';

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  try {
    await auth.register(username.value, password.value);
    router.push({ name: 'home' });
  } catch (e) {
    error.value = (e as Error).message;
  }
}
</script>

<template>
  <div class="login-page">
    <form class="login-card" @submit.prevent="handleRegister">
      <h1>Register</h1>
      <input v-model="username" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Password" />
      <input v-model="confirmPassword" type="password" placeholder="Confirm password" />
      <button type="submit">Create account</button>
      <p v-if="error" class="error">{{ error }}</p>
      <p class="switch">
        Already have an account?
        <RouterLink :to="{ name: 'login' }">Login</RouterLink>
      </p>
    </form>
  </div>
</template>

<style scoped src="@/assets/auth.css"></style>