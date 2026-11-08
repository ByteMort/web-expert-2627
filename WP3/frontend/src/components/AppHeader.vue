<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();
const menuOpen = ref(false);

async function handleLogout() {
  menuOpen.value = false;
  await auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <header class="header">
    <RouterLink :to="{ name: 'home' }" class="brand">GymBook</RouterLink>

    <nav class="nav">
      <RouterLink :to="{ name: 'workouts' }">Workouts</RouterLink>
      <RouterLink :to="{ name: 'enrollments' }">My Enrollments</RouterLink>
      <RouterLink v-if="auth.user?.role === 'admin'" :to="{ name: 'admin' }">Admin</RouterLink>
    </nav>

    <div class="profile">
      <button class="avatar" @click="menuOpen = !menuOpen">
        {{ auth.user?.username.charAt(0).toUpperCase() }}
      </button>

      <div v-if="menuOpen" class="menu">
        <p class="menu-name">{{ auth.user?.username }}</p>
        <p class="menu-role">{{ auth.user?.role }}</p>
        <button class="logout" @click="handleLogout">Logout</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 0 32px;
  height: 64px;
  background: white;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
}

.brand {
  font-size: 20px;
  font-weight: 700;
  color: #2563eb;
  text-decoration: none;
}

.nav {
  display: flex;
  gap: 24px;
  flex: 1;
}

.nav a {
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  padding: 6px 0;
  border-bottom: 2px solid transparent;
}

.nav a:hover {
  color: #111827;
}

.nav a.router-link-active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

.profile {
  position: relative;
}

.avatar {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.menu {
  position: absolute;
  right: 0;
  top: 48px;
  min-width: 180px;
  padding: 12px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}

.menu-name {
  margin: 0;
  font-weight: 600;
}

.menu-role {
  margin: 2px 0 12px;
  font-size: 13px;
  color: #6b7280;
  text-transform: capitalize;
}

.logout {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: #fee2e2;
  color: #b91c1c;
  font-weight: 500;
  cursor: pointer;
}

.logout:hover {
  background: #fecaca;
}
</style>