import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { app } from '../../src/app';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../../src/models/user.model';
import jwt from 'jsonwebtoken';

let mongo: MongoMemoryServer;
let agent: ReturnType<typeof request.agent>;
let adminAgent: ReturnType<typeof request.agent>;

beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1m';

    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    await app.setup();

    await User.create({ username: 'Alex', password: 'alex123' });
    await User.create({ username: 'Alice', password: 'alice123', role: 'admin' });

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
});

describe('GET /api/users/me', () => {
    it("returns username and role", async () => {
        const res = await agent.get('/api/users/me');

        expect(res.status).toBe(200);
        expect(res.body.username).toBe('Alex');
        expect(res.body.role).toBe('user');
        expect(res.body).not.toHaveProperty('hashedPass');
        expect(res.body).not.toHaveProperty('password');
        expect(res.body).not.toHaveProperty('updatedAt');
        expect(res.body).not.toHaveProperty('createdAt');
    });

    it("returns 404 when the user no longer exists", async () => {
        await User.create({ username: 'Ghost', password: 'ghost123' });

        const ghostAgent = request.agent(app);
        await ghostAgent
            .post('/api/auth/login')
            .send({ username: 'Ghost', password: 'ghost123' });

        await User.deleteOne({ username: 'Ghost' });

        const res = await ghostAgent.get('/api/users/me');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('User not found');
    });

    it("return forbidden when there is invalid path", async () => {
        const res = await agent.get('/api/users/test');

        expect(res.status).toBe(403);
        expect(res.body.message).toBe("This is forbidden path");
    });
});

describe('Get /api/users', () => {
    it("return users", async () => {
        const res = await adminAgent.get('/api/users');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        const usernames = res.body.map((u: { username: string }) => u.username);
        expect(usernames).toEqual(expect.arrayContaining(['Alex', 'Alice']));
    });

    it("returns forbidden when user is not admin", async () => {
        const res = await agent.get('/api/users');

        expect(res.status).toBe(403);
        expect(res.body.message).toBe("Admin access required");
    })
});

describe('Post /api/users', () => {
    it("adds user successfully", async () => {
        const res = await request(app)
            .post('/api/users')
            .send({ username: 'Test', password: 'test123' });
        
        expect(res.status).toBe(201);
        expect(res.body.username).toBe('Test');
        expect(res.body.role).toBe('user');
        expect(res.body).not.toHaveProperty('hashedPass');
        expect(res.body).not.toHaveProperty('password');
    });
});

const getMe = (token: string) =>
    request(app).get('/api/users/me').set('Cookie', `token=${token}`);

describe('authentication on Get /api/users/me', () => {
    it("rejects a malformed token", async () => {
        const res = await getMe('not-a-jwt');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Invalid or expired token");
    });
    it('rejects a string payload', async () => {
        const token = jwt.sign('just-a-string', 'test-secret');
        const res = await getMe(token);
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid token');
    });
    it('rejects a token without sub', async () => {
        const token = jwt.sign({ role: 'user' }, 'test-secret');
        const res = await getMe(token);
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid token');
    });
    it('returns 500 when JWT_SECRET is missing', async () => {
        delete process.env.JWT_SECRET;
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

        try {
            const res = await getMe('anything');

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Something went wrong');
        } finally {
            process.env.JWT_SECRET = 'test-secret';
            spy.mockRestore();
        }
    });
});