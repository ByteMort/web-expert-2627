import { beforeAll, describe, expect, it, vi } from "vitest";
import { app } from "../app.js";
import request from 'supertest';
import * as userService from '../services/user.service.js';

vi.mock('../services/user.service.js', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../services/user.service.js')>();
    return {
        ...actual,
        findUsers: vi.fn(actual.findUsers),
    };
});

const mongoError = () =>
    Object.assign(new Error('Database is unreachable.'), { name: 'MongoNetworkError' });

describe('GET /api/users', () => {
    const adminAgent = request.agent(app);
    const userAgent = request.agent(app);

    beforeAll(async () => {
        await adminAgent.post('/api/login').send({ username: 'MyAdmin', password: 'myPass' });
        await userAgent.post('/api/login').send({ username: 'Bob', password: 'bob123' });
    });

    it("should give 401 without token", async () => {
        const res = await request(app).get('/api/users');

        expect(res.status).toBe(401);
        expect(res.body.errors).toEqual(['Access denied. No token provided.']);
    });

    it("non-admin should not see users", async () => {
        const res = await userAgent.get('/api/users');

        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual(["You can't see all users!"]);
    });

    it("admin should get all users", async () => {
        const res = await adminAgent.get('/api/users');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.users)).toBe(true);
        expect(res.body.users.length).toBeGreaterThan(0);

        const usernames = res.body.users.map((u: any) => u.username);
        expect(usernames).toContain('MyAdmin');
        expect(usernames).toContain('Bob');
    });

    it("should forward Mongo errors to the error handler", async () => {
        vi.mocked(userService.findUsers).mockRejectedValueOnce(mongoError());

        const res = await adminAgent.get('/api/users');

        expect(res.status).toBe(500);
        expect(res.body.errors).toEqual(['Database is unreachable.']);
    });

    it("should give 400 on a normal error", async () => {
        vi.mocked(userService.findUsers).mockRejectedValueOnce(new Error('Something went wrong.'));

        const res = await adminAgent.get('/api/users');

        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual(['Something went wrong.']);
    });
});