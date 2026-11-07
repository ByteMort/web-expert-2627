import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { randomUUID } from 'node:crypto';
import { app } from '../../src/app.js';
import Workout from '../../src/models/workout.model.js';
import User from '../../src/models/user.model.js';
import Enrollment from '../../src/models/enrollment.model.js';

let mongo: MongoMemoryServer;
let agent: ReturnType<typeof request.agent>;
let bobAgent: ReturnType<typeof request.agent>;
let adminAgent: ReturnType<typeof request.agent>;

let trainerId: string;

const createWorkout = (capacity = 10) =>
    Workout.create({
        title: 'Test Workout',
        trainer: trainerId,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        durationMinutes: 45,
        capacity
    });

beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1m';

    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    await app.setup();

    await User.create({ username: 'Alex', password: 'alex123' });
    await User.create({ username: 'Bob', password: 'bob123' });
    await User.create({ username: 'Alice', password: 'alice123', role: 'admin' });
    const trainer = await User.create({ username: 'Trainer1', password: 'trainer', role: 'trainer' });
    trainerId = trainer._id;

    agent = request.agent(app);
    await agent.post('/api/auth/login').send({ username: 'Alex', password: 'alex123' });

    bobAgent = request.agent(app);
    await bobAgent.post('/api/auth/login').send({ username: 'Bob', password: 'bob123' });

    adminAgent = request.agent(app);
    await adminAgent.post('/api/auth/login').send({ username: 'Alice', password: 'alice123' });
}, 60_000);

afterAll(async () => {
    await mongoose.disconnect();
    await mongo?.stop();
});

describe('POST /api/enrollments', () => {
    it('enrolls the user and increments enrolledCount', async () => {
        const w = await createWorkout();

        const res = await agent.post('/api/enrollments').send({ workout: w._id });

        expect(res.status).toBe(201);
        expect((await Workout.findById(w._id))?.enrolledCount).toBe(1);
    });

    it('rejects a second enrollment and keeps the count', async () => {
        const w = await createWorkout();
        await agent.post('/api/enrollments').send({ workout: w._id });

        const res = await agent.post('/api/enrollments').send({ workout: w._id });

        expect(res.status).toBe(400);
        expect((await Workout.findById(w._id))?.enrolledCount).toBe(1);
    });

    it('rejects a full workout', async () => {
        const w = await createWorkout(1);
        await bobAgent.post('/api/enrollments').send({ workout: w._id });

        const res = await agent.post('/api/enrollments').send({ workout: w._id });

        expect(res.status).toBe(409);
        expect(res.body.message).toBe('This workout is full');
    });

    it('rejects a past workout', async () => {
        const w = await createWorkout();
        await Workout.updateOne({ _id: w._id }, { startTime: new Date('2020-01-01') });

        const res = await agent.post('/api/enrollments').send({ workout: w._id });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Cannot enroll in a past workout');
    });

    it('rejects an unknown workout', async () => {
        const res = await agent.post('/api/enrollments').send({ workout: randomUUID() });

        expect(res.status).toBe(400);
    });

    it('rejects a user field in the body', async () => {
        const w = await createWorkout();

        const res = await agent
            .post('/api/enrollments')
            .send({ workout: w._id, user: randomUUID() });

        expect(res.status).toBe(400);
    });

    it('rolls back enrolledCount if saving the enrollment fails', async () => {
        const w = await createWorkout();
        vi.spyOn(Enrollment, 'create').mockRejectedValueOnce(new Error('db error'));

        const res = await agent.post('/api/enrollments').send({ workout: w._id });

        expect(res.status).toBe(500);
        expect((await Workout.findById(w._id))?.enrolledCount).toBe(0);
    });
});

describe('GET /api/enrollments', () => {
    it('shows a user only their own enrollments', async () => {
        const w = await createWorkout();
        await agent.post('/api/enrollments').send({ workout: w._id });
        await bobAgent.post('/api/enrollments').send({ workout: w._id });

        const res = await agent.get('/api/enrollments');

        expect(res.status).toBe(200);
        expect(
            res.body.every((e: { user: { username: string } }) => e.user.username === 'Alex')
        ).toBe(true);
    });

    it('shows an admin all enrollments', async () => {
        const res = await adminAgent.get('/api/enrollments');
        const names = res.body.map((e: { user: { username: string } }) => e.user.username);

        expect(res.status).toBe(200);
        expect(names).toEqual(expect.arrayContaining(['Alex', 'Bob']));
    });
});

describe('DELETE /api/enrollments/:id', () => {
    it('lets a user leave and decrements enrolledCount', async () => {
        const w = await createWorkout();
        const created = await agent.post('/api/enrollments').send({ workout: w._id });

        const res = await agent.delete(`/api/enrollments/${created.body._id}`);

        expect(res.status).toBe(200);
        expect((await Workout.findById(w._id))?.enrolledCount).toBe(0);
    });

    it("forbids removing someone else's enrollment", async () => {
        const w = await createWorkout();
        const created = await bobAgent.post('/api/enrollments').send({ workout: w._id });

        const res = await agent.delete(`/api/enrollments/${created.body._id}`);

        expect(res.status).toBe(403);
    });

    it('lets an admin remove any enrollment', async () => {
        const w = await createWorkout();
        const created = await bobAgent.post('/api/enrollments').send({ workout: w._id });

        const res = await adminAgent.delete(`/api/enrollments/${created.body._id}`);

        expect(res.status).toBe(200);
    });

    it('returns 404 for an unknown id', async () => {
        const res = await agent.delete(`/api/enrollments/${randomUUID()}`);

        expect(res.status).toBe(404);
    });
});

describe('Deleting a workout', () => {
    it('also removes its enrollments', async () => {
        const w = await createWorkout();
        await agent.post('/api/enrollments').send({ workout: w._id });

        await adminAgent.delete(`/api/workouts/${w._id}`);

        expect(await Enrollment.countDocuments({ workout: w._id })).toBe(0);
    });
});