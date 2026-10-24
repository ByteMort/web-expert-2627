import { beforeAll, describe, expect, it, vi } from "vitest";
import { app } from "../app.js";
import request from 'supertest';
import * as taskService from '../services/task.service.js';
import * as userService from '../services/user.service.js';

vi.mock('../services/task.service.js', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../services/task.service.js')>();
    return {
        ...actual,
        findTasks: vi.fn(actual.findTasks),
        findMyTasks: vi.fn(actual.findMyTasks),
        addTaskToUserS: vi.fn(actual.addTaskToUserS),
    };
});

vi.mock('../services/user.service.js', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../services/user.service.js')>();
    return {
        ...actual,
        findUsers: vi.fn(actual.findUsers),
    };
});

const mongoError = () =>
    Object.assign(new Error('Database is unreachable.'), { name: 'MongoNetworkError' });

describe('/api/task', () => {
    const adminAgent = request.agent(app);
    const userAgent = request.agent(app);
    const jackAgent = request.agent(app);

    beforeAll(async () => {
        await adminAgent.post('/api/login').send({ username: 'MyAdmin', password: 'myPass' });
        await userAgent.post('/api/login').send({ username: 'Bob', password: 'bob123' });
        await jackAgent.post('/api/login').send({ username: 'Jack', password: 'jack123' });
    });

    it("should give 401 without token", async () => {
        const res = await request(app).get('/api/tasks');

        expect(res.status).toBe(401);
        expect(res.body.errors).toEqual(['Access denied. No token provided.']);
    });

    it("should give 401 with invalid token", async () => {
        const res = await request(app)
            .get('/api/tasks')
            .set('Cookie', 'token=sahte');

        expect(res.status).toBe(401);
        expect(res.body.errors).toEqual(['Invalid or expired token. Please log in again.']);
    });

    it("admin should get all tasks", async () => {
        const res = await adminAgent.get('/api/tasks');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.tasks)).toBe(true);
    });

    it("normal user should get only own tasks", async () => {
        const res = await userAgent.get('/api/tasks');

        expect(res.status).toBe(200);
        expect(res.body.tasks[0].title).toBe('Task1');
        expect(res.body.tasks[0].completed).toBe(false);
    });

    it("user without tasks should get an empty list", async () => {
        const res = await jackAgent.get('/api/tasks');

        expect(res.status).toBe(200);
        expect(res.body.tasks).toEqual([]);
    });
});

describe('GET /api/tasks errors', () => {
    const adminAgent = request.agent(app);
    const userAgent = request.agent(app);

    beforeAll(async () => {
        await adminAgent.post('/api/login').send({ username: 'MyAdmin', password: 'myPass' });
        await userAgent.post('/api/login').send({ username: 'Bob', password: 'bob123' });
    });

    it("admin: should forward Mongo errors to the error handler", async () => {
        vi.mocked(taskService.findTasks).mockRejectedValueOnce(mongoError());

        const res = await adminAgent.get('/api/tasks');

        expect(res.status).toBe(500);
        expect(res.body.errors).toEqual(['Database is unreachable.']);
    });

    it("user: should forward Mongo errors to the error handler", async () => {
        vi.mocked(taskService.findMyTasks).mockRejectedValueOnce(mongoError());

        const res = await userAgent.get('/api/tasks');

        expect(res.status).toBe(500);
        expect(res.body.errors).toEqual(['Database is unreachable.']);
    });

    it("should give 400 on a normal error", async () => {
        vi.mocked(taskService.findTasks).mockRejectedValueOnce(new Error('Something went wrong.'));

        const res = await adminAgent.get('/api/tasks');

        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual(['Something went wrong.']);
    });
});

describe('/api/task-user', () => {
    const adminAgent = request.agent(app);
    const userAgent = request.agent(app);

    beforeAll(async () => {
        await adminAgent.post('/api/login').send({ username: 'MyAdmin', password: 'myPass' });
        await userAgent.post('/api/login').send({ username: 'Bob', password: 'bob123' });
    });

    it("GET: should give 401 without token", async () => {
        const res = await request(app).get('/api/task-user');

        expect(res.status).toBe(401);
    });

    it("GET: non-admin should not be allowed", async () => {
        const res = await userAgent.get('/api/task-user');

        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual(["You aren't allowed in this page!"]);
    });

    it("GET: admin should get tasks and users", async () => {
        const res = await adminAgent.get('/api/task-user');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.tasks)).toBe(true);
        expect(Array.isArray(res.body.users)).toBe(true);
    });

    it("GET: should forward Mongo errors to the error handler", async () => {
        vi.mocked(userService.findUsers).mockRejectedValueOnce(mongoError());

        const res = await adminAgent.get('/api/task-user');

        expect(res.status).toBe(500);
        expect(res.body.errors).toEqual(['Database is unreachable.']);
    });

    it("GET: should give 400 on a normal error", async () => {
        vi.mocked(userService.findUsers).mockRejectedValueOnce(new Error('Something went wrong.'));

        const res = await adminAgent.get('/api/task-user');

        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual(['Something went wrong.']);
    });

    it("POST: non-admin should not be allowed", async () => {
        const res = await userAgent
            .post('/api/task-user')
            .send({ task_id: 'x', user_id: 'y' });

        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual(["You aren't allowed in this page!"]);
    });

    it("POST: should give error if task_id is missing", async () => {
        const res = await adminAgent
            .post('/api/task-user')
            .send({ user_id: 'y' });

        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual(['Task id is required.']);
    });

    it("POST: should give error if user_id is missing", async () => {
        const res = await adminAgent
            .post('/api/task-user')
            .send({ task_id: 'x' });

        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual(['User id is required.']);
    });

    it("POST: admin should assign a task to a user", async () => {
        const listRes = await adminAgent.get('/api/task-user');
        const task = listRes.body.tasks[0];
        const bob = listRes.body.users.find((u: any) => u.username === 'Bob');

        const res = await adminAgent
            .post('/api/task-user')
            .send({ task_id: task._id, user_id: bob._id });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Task Added to User Successfully!');
    });

    it("POST: should forward Mongo errors to the error handler", async () => {
        vi.mocked(taskService.addTaskToUserS).mockRejectedValueOnce(mongoError());

        const res = await adminAgent
            .post('/api/task-user')
            .send({ task_id: 'x', user_id: 'y' });

        expect(res.status).toBe(500);
        expect(res.body.errors).toEqual(['Database is unreachable.']);
    });

        it("POST: should give error if task does not exist", async () => {
        const listRes = await adminAgent.get('/api/task-user');
        const bob = listRes.body.users.find((u: any) => u.username === 'Bob');

        const res = await adminAgent
            .post('/api/task-user')
            .send({ task_id: 'non-existing-task', user_id: bob._id });

        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual(['There is no task with this id.']);
    });

    it("POST: should give error if user does not exist", async () => {
        const listRes = await adminAgent.get('/api/task-user');
        const task = listRes.body.tasks[0];

        const res = await adminAgent
            .post('/api/task-user')
            .send({ task_id: task._id, user_id: 'non-existing-user' });

        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual(['There is no user with this id.']);
    });
});

describe('Missing JWT secret in middleware', () => {
    it('should give 401 if JWT_SECRET is not set', async () => {
        const agent = request.agent(app);
        await agent.post('/api/login').send({ username: 'Bob', password: 'bob123' });

        vi.stubEnv('JWT_SECRET', '');

        try {
            const res = await agent.get('/api/tasks');

            expect(res.status).toBe(401);
            expect(res.body.errors).toEqual(['Invalid or expired token. Please log in again.']);
        } finally {
            vi.unstubAllEnvs();
        }
    });
});