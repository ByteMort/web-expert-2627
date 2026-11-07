import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../../src/app';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import Workout from '../../src/models/workout.model';
import User from '../../src/models/user.model';
import { randomUUID } from 'node:crypto';

let mongo: MongoMemoryServer;
let agent: ReturnType<typeof request.agent>;
let adminAgent: ReturnType<typeof request.agent>;

let workoutId: string;
let trainerId: string;

beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1m';

    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    await app.setup();

    await User.create({ username: 'Alex', password: 'alex123' });
    const trainer = await User.create({ username: 'Trainer1', password: 'trainer', role: 'trainer' });
    await User.create({ username: 'Alice', password: 'alice123', role: 'admin' });

    const workout = await Workout.create({
        title: 'Morning Yoga',
        trainer: trainer._id,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        durationMinutes: 60,
        capacity: 10
    });
    workoutId = workout._id;
    trainerId = trainer._id;

    agent = request.agent(app);
    await agent
        .post('/api/auth/login')
        .send({ username: 'Alex', password: 'alex123' });

    adminAgent = request.agent(app);
    await adminAgent
        .post('/api/auth/login')
        .send({ username: 'Alice', password: 'alice123' });

}, 60_000);

afterAll(async () => {
    await mongoose.disconnect();
    await mongo?.stop();
})

const validBody = () => ({
    title: 'Evening Boxing',
    trainer: trainerId,
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 45,
    capacity: 12
});

const createTestWorkout = () =>
    Workout.create({
        title: 'Patch Me',
        trainer: trainerId,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        durationMinutes: 45,
        capacity: 10
    });

describe('Get and Find Workout', () => {
    it('returns all workouts with the trainer populated', async () => {
        const res = await agent.get('/api/workouts');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

        const yoga = res.body.find((w: { title: string }) => w.title === 'Morning Yoga');
        expect(yoga).toBeDefined();
        expect(yoga.trainer.username).toBe('Trainer1');
        expect(yoga.trainer).not.toHaveProperty('hashedPass');
    });

    it('returns a single workout', async () => {
        const res = await agent.get(`/api/workouts/${workoutId}`);

        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Morning Yoga');
        expect(res.body.trainer.username).toBe('Trainer1');
    });

    it('returns 404 for an unknown id', async () => {
        const res = await agent.get('/api/workouts/unknown-id');

        expect(res.status).toBe(404);
    });
});

describe('POST /api/workouts', () => {
    it('lets an admin create a workout', async () => {
        const res = await adminAgent.post('/api/workouts').send(validBody());

        expect(res.status).toBe(201);
        expect(res.body.title).toBe('Evening Boxing');
        expect(res.body.enrolledCount).toBe(0);
    });

    it('forbids a normal user', async () => {
        const res = await agent.post('/api/workouts').send(validBody());

        expect(res.status).toBe(403);
    });

    it('rejects invalid data', async () => {
        const res = await adminAgent
            .post('/api/workouts')
            .send({ ...validBody(), capacity: 50 });

        expect(res.status).toBe(400);
    });

    it('rejects enrolledCount in the body', async () => {
        const res = await adminAgent
            .post('/api/workouts')
            .send({ ...validBody(), enrolledCount: 5 });

        expect(res.status).toBe(400);
    });

    it('rejects a trainer id that is not a trainer', async () => {
        const res = await adminAgent
            .post('/api/workouts')
            .send({ ...validBody(), trainer: randomUUID() });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('There is no trainer with this id');
    });
});

describe('DELETE /api/workouts/:id', () => {
    it('lets an admin delete a workout', async () => {
        const toDelete = await Workout.create({
            title: 'Temp Workout',
            trainer: trainerId,
            startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
            durationMinutes: 30,
            capacity: 5
        });

        const res = await adminAgent.delete(`/api/workouts/${toDelete._id}`);
        expect(res.status).toBe(200);

        const check = await agent.get(`/api/workouts/${toDelete._id}`);
        expect(check.status).toBe(404);
    });

    it('forbids a normal user', async () => {
        const res = await agent.delete(`/api/workouts/${workoutId}`);

        expect(res.status).toBe(403);
    });

    it('returns 404 for an unknown id', async () => {
        const res = await adminAgent.delete('/api/workouts/unknown-id');

        expect(res.status).toBe(404);
    });
});

describe('PATCH /api/workouts/:id', () => {
    it('lets an admin update a single field', async () => {
        const workout = await createTestWorkout();

        const res = await adminAgent
            .patch(`/api/workouts/${workout._id}`)
            .send({ capacity: 15 });

        expect(res.status).toBe(200);
        expect(res.body.capacity).toBe(15);
        expect(res.body.title).toBe('Patch Me');
    });

    it('forbids a normal user', async () => {
        const workout = await createTestWorkout();

        const res = await agent
            .patch(`/api/workouts/${workout._id}`)
            .send({ capacity: 15 });

        expect(res.status).toBe(403);
    });

    it('rejects invalid data', async () => {
        const workout = await createTestWorkout();

        const res = await adminAgent
            .patch(`/api/workouts/${workout._id}`)
            .send({ capacity: 50 });

        expect(res.status).toBe(400);
    });

    it('runs model validators on update', async () => {
        const workout = await createTestWorkout();

        const res = await adminAgent
            .patch(`/api/workouts/${workout._id}`)
            .send({ startTime: '2020-01-01T10:00:00Z' });

        expect(res.status).toBe(400);
    });

    it('rejects a trainer id that is not a trainer', async () => {
        const workout = await createTestWorkout();

        const res = await adminAgent
            .patch(`/api/workouts/${workout._id}`)
            .send({ trainer: randomUUID() });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('There is no trainer with this id');
    });

    it('returns 404 for an unknown id', async () => {
        const res = await adminAgent
            .patch('/api/workouts/unknown-id')
            .send({ capacity: 15 });

        expect(res.status).toBe(404);
    });
});

