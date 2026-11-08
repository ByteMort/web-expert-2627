<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useEnrollmentStore } from '@/stores/enrollments';
import type { Enrollment } from '@/types';

const auth = useAuthStore();
const enrollmentStore = useEnrollmentStore();
const error = ref('');

const isAdmin = computed(() => auth.user?.role === 'admin');

const sorted = computed(() =>
  [...enrollmentStore.enrollments].sort(
    (a, b) => new Date(a.workout.startTime).getTime() - new Date(b.workout.startTime).getTime()
  )
);

async function load() {
  try {
    await enrollmentStore.fetchAll();
  } catch (e) {
    error.value = (e as Error).message;
  }
}

async function remove(e: Enrollment) {
  const text = isAdmin.value
    ? `Remove ${e.user.username} from "${e.workout.title}"?`
    : `Leave "${e.workout.title}"?`;
  if (!confirm(text)) return;

  error.value = '';
  try {
    await enrollmentStore.remove(e._id);
  } catch (err) {
    error.value = (err as Error).message;
  }
}

const isPast = (e: Enrollment) => new Date(e.workout.startTime) <= new Date();

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });

onMounted(load);
</script>

<template>
  <div class="page">
    <h1>{{ isAdmin ? 'All Enrollments' : 'My Enrollments' }}</h1>
    <p v-if="error" class="error">{{ error }}</p>

    <p v-if="sorted.length === 0" class="empty">
      No enrollments yet.
      <RouterLink :to="{ name: 'workouts' }">Browse workouts</RouterLink>
    </p>

    <ul v-else class="list">
      <li v-for="e in sorted" :key="e._id" class="item" :class="{ past: isPast(e) }">
        <div>
          <h2>{{ e.workout.title }}</h2>
          <p class="meta">🗓 {{ formatDate(e.workout.startTime) }}</p>
          <p v-if="isAdmin" class="meta">👤 {{ e.user.username }}</p>
        </div>

        <span v-if="isPast(e)" class="tag">Finished</span>
        <button v-else class="remove" @click="remove(e)">
          {{ isAdmin ? 'Remove' : 'Leave' }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.page { padding: 32px; max-width: 800px; margin: 0 auto; }

.list { list-style: none; padding: 0; margin: 24px 0 0; display: flex; flex-direction: column; gap: 12px; }

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #2563eb;
}
.item.past { opacity: 0.55; border-left-color: #9ca3af; }
.item h2 { margin: 0 0 4px; font-size: 17px; }

.meta { margin: 0; font-size: 14px; color: #4b5563; }

.remove { padding: 8px 14px; border: none; border-radius: 8px; background: #fee2e2; color: #b91c1c; font-weight: 500; cursor: pointer; }
.remove:hover { background: #fecaca; }

.tag { padding: 4px 10px; border-radius: 999px; font-size: 12px; background: #e5e7eb; color: #6b7280; }

.error { color: #dc2626; }
.empty { color: #6b7280; }
</style>