<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useWorkoutStore } from '@/stores/workouts';
import { useEnrollmentStore } from '@/stores/enrollments';
import type { Workout } from '@/types';

const workoutStore = useWorkoutStore();
const enrollmentStore = useEnrollmentStore();
const error = ref('');

async function load() {
  await Promise.all([workoutStore.fetchAll(), enrollmentStore.fetchAll()]);
}

async function run(action: () => Promise<void>) {
  error.value = '';
  try {
    await action();
    await load();
  } catch (e) {
    error.value = (e as Error).message;
  }
}

const isEnrolled = (w: Workout) => enrollmentStore.myEnrollmentByWorkout.has(w._id);
const isPast = (w: Workout) => new Date(w.startTime) <= new Date();
const isFull = (w: Workout) => w.enrolledCount >= w.capacity;

function enroll(w: Workout) {
  run(() => enrollmentStore.enroll(w._id));
}

function leave(w: Workout) {
  const id = enrollmentStore.myEnrollmentByWorkout.get(w._id);
  if (id) run(() => enrollmentStore.remove(id));
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });

onMounted(() => run(async () => {}));
</script>

<template>
  <div class="page">
    <h1>Workouts</h1>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="workoutStore.workouts.length === 0" class="empty">No workouts planned yet.</p>

    <div class="grid">
      <div
        v-for="w in workoutStore.workouts"
        :key="w._id"
        class="card"
        :class="{ past: isPast(w) }"
      >
        <div class="card-head">
          <h2>{{ w.title }}</h2>
          <span v-if="isEnrolled(w)" class="tag enrolled">Enrolled</span>
          <span v-else-if="isFull(w)" class="tag full">Full</span>
        </div>

        <p class="meta">🗓 {{ formatDate(w.startTime) }}</p>
        <p class="meta">⏱ {{ w.durationMinutes }} min</p>
        <p class="meta">🧑‍🏫 {{ w.trainer?.username }}</p>

        <div class="spots">
          <div class="bar">
            <div class="fill" :style="{ width: (w.enrolledCount / w.capacity) * 100 + '%' }"></div>
          </div>
          <span>{{ w.enrolledCount }} / {{ w.capacity }}</span>
        </div>

        <button v-if="isEnrolled(w)" class="btn leave" :disabled="isPast(w)" @click="leave(w)">
          Leave
        </button>
        <button v-else class="btn enroll" :disabled="isPast(w) || isFull(w)" @click="enroll(w)">
          {{ isPast(w) ? 'Finished' : isFull(w) ? 'Full' : 'Enroll' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { padding: 32px; max-width: 1100px; margin: 0 auto; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.15s, box-shadow 0.15s;
}
.card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1); }
.card.past { opacity: 0.55; }

.card-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.card-head h2 { margin: 0; font-size: 18px; }

.tag { padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 500; }
.tag.enrolled { background: #dcfce7; color: #15803d; }
.tag.full { background: #fee2e2; color: #b91c1c; }

.meta { margin: 0; font-size: 14px; color: #4b5563; }

.spots { display: flex; align-items: center; gap: 10px; margin: 6px 0; font-size: 13px; color: #6b7280; }
.bar { flex: 1; height: 6px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
.fill { height: 100%; background: #2563eb; transition: width 0.3s; }

.btn { margin-top: auto; padding: 10px; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; }
.btn.enroll { background: #2563eb; color: white; }
.btn.enroll:hover:not(:disabled) { background: #1d4ed8; }
.btn.leave { background: #fee2e2; color: #b91c1c; }
.btn:disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; }

.error { color: #dc2626; }
.empty { color: #6b7280; }
</style>