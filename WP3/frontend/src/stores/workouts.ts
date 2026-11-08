import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/api';
import type { Workout, WorkoutInput } from '@/types';
import { socket } from '@/socket';

export const useWorkoutStore = defineStore('workouts', () => {
  const workouts = ref<Workout[]>([]);

  async function fetchAll() {
    workouts.value = await api<Workout[]>('/api/workouts');
  }

  async function create(data: WorkoutInput) {
    await api('/api/workouts', { method: 'POST', body: JSON.stringify(data) });
    await fetchAll();
  }

  async function update(id: string, data: WorkoutInput) {
    await api(`/api/workouts/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    await fetchAll();
  }

  async function remove(id: string) {
    await api(`/api/workouts/${id}`, { method: 'DELETE' });
    await fetchAll();
  }

  const events = [
    'api/workouts created',
    'api/workouts patched',
    'api/workouts removed',
    'api/enrollments created',
    'api/enrollments removed'
  ];

  for (const event of events) {
    socket.on(event, () => {
      fetchAll().catch(() => {});
    });
  }

  return { workouts, fetchAll, create, update, remove };
});