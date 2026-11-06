import { MongoMemoryServer } from 'mongodb-memory-server';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../src/app';
import User from '../../src/models/user.model';

let mongo: MongoMemoryServer;

beforeAll(async () => {
    process.env.JWT_SECRET = 'test-server';
    process.env.JWT_EXPIRES_IN = '1m';

    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    await app.setup();

    await User.create({ username: 'Alex', password: 'alex123' });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongo?.stop();
});

describe('POST /api/auth/login', () => {
    it("logs in with correct credentials", async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'Alex', password: 'alex123' });
        
        expect(res.status).toBe(201);
        expect(res.body.message).toBe(`Login attempt for Alex`);
        expect(res.body).not.toHaveProperty('accessToken');

        const cookies = res.headers['set-cookie'];
        expect(cookies).toBeDefined();
        expect(cookies[0]).toContain('token=');
        expect(cookies[0]).toContain('HttpOnly');
    });

    it("rejects an unknown username", async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'Fred', password: 'alex123' });

        expect(res.status).toBe(401);
        expect(res.body.name).toBe('NotAuthenticated');
        expect(res.body.message).toBe("Invalid username or password");
        expect(res.headers['set-cookie']).toBeUndefined();
    });

    it("rejects an unknown password", async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'Alex', password: 'alex12345' });

        expect(res.status).toBe(401);
        expect(res.body.name).toBe('NotAuthenticated');
        expect(res.body.message).toBe("Invalid username or password");
        expect(res.headers['set-cookie']).toBeUndefined();
    });

    it('returns 500 when JWT variables are missing', async () => {
        const originalSecret = process.env.JWT_SECRET;
        delete process.env.JWT_SECRET;

        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

        try {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'Alex', password: 'alex123' });

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Something went wrong');
            expect(spy).toHaveBeenCalled();
        } finally {
            process.env.JWT_SECRET = originalSecret;
            spy.mockRestore();
        }
    });
});

describe('POST /api/auth/logout', () => {
  it('clears the token cookie', async () => {
    const agent = request.agent(app);
    await agent
      .post('/api/auth/login')
      .send({ username: 'Alex', password: 'alex123' });

    const res = await agent.post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logout successful');

    const cookies = res.headers['set-cookie'];
    expect(cookies[0]).toContain('token=;');
  });

  it('blocks protected routes after logout', async () => {
    const agent = request.agent(app);
    await agent
      .post('/api/auth/login')
      .send({ username: 'Alex', password: 'alex123' });

    await agent.post('/api/auth/logout');

    const res = await agent.get('/api/users');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Not authenticated");
  });
});