import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { api } from '@/api';
import { useAuthStore } from './auth';
import type { Enrollment } from '@/types';

export const useEnrollmentStore = defineStore('enrollments', () => {
  const auth = useAuthStore();
  const enrollments = ref<Enrollment[]>([]);

  const mine = computed(() =>
    enrollments.value.filter((e) => e.user._id === auth.user?._id)
  );

  const myEnrollmentByWorkout = computed(
    () => new Map(mine.value.map((e) => [e.workout._id, e._id]))
  );

  async function fetchAll() {
    enrollments.value = await api<Enrollment[]>('/api/enrollments');
  }

  async function enroll(workoutId: string) {
    await api('/api/enrollments', { method: 'POST', body: JSON.stringify({ workout: workoutId }) });
    await fetchAll();
  }

  async function remove(enrollmentId: string) {
    await api(`/api/enrollments/${enrollmentId}`, { method: 'DELETE' });
    await fetchAll();
  }

  return { enrollments, mine, myEnrollmentByWorkout, fetchAll, enroll, remove };
});