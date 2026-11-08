<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const error = ref('');

async function handleLogin() {
  error.value = '';
  try {
    await auth.login(username.value, password.value);
    router.push({ name: 'home' });
  } catch (e) {
    error.value = (e as Error).message;
  }
}
</script>

<template>
  <div class="login-page">
    <form class="login-card" @submit.prevent="handleLogin">
      <h1>Login</h1>
      <input v-model="username" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Password" />
      <button type="submit">Login</button>
      <p v-if="error" class="error">{{ error }}</p>
      <p class="switch">
        No account yet?
        <RouterLink :to="{ name: 'register' }">Register</RouterLink>
      </p>
    </form>
  </div>
</template>

  
<style scoped src="@/assets/auth.css"></style>