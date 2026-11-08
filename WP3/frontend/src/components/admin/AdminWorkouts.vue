<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useWorkoutStore } from '@/stores/workouts';
import { useUserStore } from '@/stores/users';
import type { Workout, WorkoutInput } from '@/types';

const workoutStore = useWorkoutStore();
const userStore = useUserStore();

const editingId = ref<string | null>(null);
const error = ref('');

const emptyForm: WorkoutInput = { title: '', trainer: '', startTime: '', durationMinutes: 60, capacity: 10 };
const form = reactive<WorkoutInput>({ ...emptyForm });

// "2026-12-01T09:00:00Z" → "2026-12-01T10:00" (datetime-local formatı, yerel saat)
function toLocalInput(iso: string) {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function resetForm() {
  Object.assign(form, emptyForm);
  editingId.value = null;
}

function startEdit(w: Workout) {
  editingId.value = w._id;
  Object.assign(form, {
    title: w.title,
    trainer: w.trainer._id,
    startTime: toLocalInput(w.startTime),
    durationMinutes: w.durationMinutes,
    capacity: w.capacity
  });
}

async function submit() {
  error.value = '';
  const data = { ...form, startTime: new Date(form.startTime).toISOString() };

  try {
    if (editingId.value) {
      await workoutStore.update(editingId.value, data);
    } else {
      await workoutStore.create(data);
    }
    resetForm();
  } catch (e) {
    error.value = (e as Error).message;
  }
}

async function remove(w: Workout) {
  if (!confirm(`Delete "${w.title}"?`)) return;
  error.value = '';
  try {
    await workoutStore.remove(w._id);
  } catch (e) {
    error.value = (e as Error).message;
  }
}

onMounted(async () => {
  try {
    await Promise.all([workoutStore.fetchAll(), userStore.fetchAll()]);
  } catch (e) {
    error.value = (e as Error).message;
  }
});
</script>

<template>
  <form class="form" @submit.prevent="submit">
    <h2>{{ editingId ? 'Edit workout' : 'New workout' }}</h2>
    <div class="grid">
      <label>Title <input v-model="form.title" required /></label>
      <label>Trainer
        <select v-model="form.trainer" required>
          <option value="" disabled>Choose a trainer</option>
          <option v-for="t in userStore.trainers" :key="t._id" :value="t._id">{{ t.username }}</option>
        </select>
      </label>
      <label>Start <input v-model="form.startTime" type="datetime-local" required /></label>
      <label>Duration (min) <input v-model.number="form.durationMinutes" type="number" /></label>
      <label>Capacity <input v-model.number="form.capacity" type="number" /></label>
    </div>
    <div class="actions">
      <button type="submit" class="primary">{{ editingId ? 'Save' : 'Create' }}</button>
      <button v-if="editingId" type="button" @click="resetForm">Cancel</button>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
  </form>

  <table class="table">
    <thead>
      <tr><th>Title</th><th>Trainer</th><th>Start</th><th>Duration</th><th>Spots</th><th></th></tr>
    </thead>
    <tbody>
      <tr v-for="w in workoutStore.workouts" :key="w._id">
        <td>{{ w.title }}</td>
        <td>{{ w.trainer?.username }}</td>
        <td>{{ new Date(w.startTime).toLocaleString() }}</td>
        <td>{{ w.durationMinutes }} min</td>
        <td>{{ w.enrolledCount }} / {{ w.capacity }}</td>
        <td class="row-actions">
          <button @click="startEdit(w)">Edit</button>
          <button class="danger" @click="remove(w)">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped src="@/assets/admin.css"></style>