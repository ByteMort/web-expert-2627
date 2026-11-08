import { useAuthStore } from '@/stores/auth';
import AdminView from '@/views/AdminView.vue';
import EnrollmentsView from '@/views/EnrollmentsView.vue';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import WorkoutsView from '@/views/WorkoutsView.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true } },
        { path: '/login', name: 'login', component: LoginView },
        { path: '/workouts', name: 'workouts', component: WorkoutsView, meta: { requiresAuth: true } },
        { path: '/enrollments', name: 'enrollments', component: EnrollmentsView, meta: { requiresAuth: true } },
        { path: '/register', name: 'register', component: RegisterView },
        { path: '/admin', name: 'admin', component: AdminView, meta: { requiresAuth: true, requiresAdmin: true } },
    ]
});

router.beforeEach(async (to) => {
    const auth = useAuthStore();

    if (!auth.checked) {
        await auth.fetchMe();
    }

    if (to.meta.requiresAuth && !auth.user) {
        return { name: 'login' };
    }

    if (to.meta.requiresAdmin && auth.user?.role !== 'admin') {
        return { name: 'home' };
    }
});

export default router;