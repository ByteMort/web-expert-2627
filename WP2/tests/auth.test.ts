import { afterAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import {app} from '../app.js';
import User from '../models/user.model.js';
import * as authService from '../services/auth.service.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


vi.mock('../services/auth.service.js', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../services/auth.service.js')>();
    return {
        ...actual,
        logUser: vi.fn(actual.logUser),
        addUser: vi.fn(actual.addUser),
    };
});

const mongoError = () =>
    Object.assign(new Error('Database is unreachable.'), { name: 'MongoNetworkError' });

const randomLetters = (length: number) =>
    Array.from({ length }, () =>
        String.fromCharCode(97 + Math.floor(Math.random() * 26))
    ).join('');

afterAll(async () => {
    await User.deleteMany({ username: /^tst[a-z]{8}$/ });
});



describe('Post /api/login', () => {
    it("should login successfully", async () => {
        const res = await request(app)
            .post('/api/login')
            .send({
                username: 'Bob',
                password: 'bob123'
            });
        
            expect(res.status).toBe(200);
            expect(res.body.message).toContain("Login Successfull!");
    });
    it("should give error if user doesn't exist", async () => {
        const res = await request(app)
            .post('/api/login')
            .send({
                username: "Bobb",
                password: "bob123"
            });
        
        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual(["User doesn't exist."]);        
    });

    it("should give error if password is not correct", async () => {
        const res = await request(app)
            .post('/api/login')
            .send({
                username: "Bob",
                password: "bob1233"
            });
        
        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual(["Invalid credentials."]);        
    });

    it("should give error if username is empty", async () => {
        const res = await request(app)
            .post('/api/login')
            .send({
                username: "",
                password: "bob1233"
            });
        
        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual(["Username is required."]);        
    });

    it("should give error if password is empty", async () => {
        const res = await request(app)
            .post('/api/login')
            .send({
                username: "Bob",
                password: ""
            });
        
        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual(["Password is required."]);        
    });
});

describe('GET /api/logout', () => {
    it('should logout successfully', async () => {
        const res = await request(app).get('/api/logout');

        expect(res.status).toBe(200);
        expect(res.body.message).toContain('Logout Successull');
    });
});

describe('POST /api/register', () => {
    const newUsername = `tst${randomLetters(8)}`;

    it('should register successfully', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({
                username: newUsername,
                password: 'test123'
            });

        expect(res.status).toBe(201);
        expect(res.body.username).toBe(newUsername);
    });

    it('should give error if username is already taken', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({
                username: newUsername,
                password: 'test123'
            });

        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual(['Username is already taken.']);
    });

    it('should give error if username is empty', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({
                username: '',
                password: 'test123'
            });

        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual(['Username is required.']);
    });

    it('should give error if password is empty', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({
                username: 'someone',
                password: ''
            });

        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual(['Password is required.']);
    });
});

describe('Mongo errors', () => {
    it('login should forward Mongo errors to the error handler', async () => {
        vi.mocked(authService.logUser).mockRejectedValueOnce(mongoError());

        const res = await request(app)
            .post('/api/login')
            .send({ username: 'Bob', password: 'bob123' });

        expect(res.status).toBe(500);
        expect(res.body.errors).toEqual(['Database is unreachable.']);
    });

    it('register should forward Mongo errors to the error handler', async () => {
        vi.mocked(authService.addUser).mockRejectedValueOnce(mongoError());

        const res = await request(app)
            .post('/api/register')
            .send({ username: 'someone', password: 'test123' });

        expect(res.status).toBe(500);
        expect(res.body.errors).toEqual(['Database is unreachable.']);
    });
});

describe('Missing JWT secret', () => {
    it('login should fail if JWT_SECRET is not set', async () => {
        vi.stubEnv('JWT_SECRET', '');

        try {
            const res = await request(app)
                .post('/api/login')
                .send({ username: 'Bob', password: 'bob123' });

            expect(res.status).toBe(400);
            expect(res.body.errors).toEqual(['There is no key for jwt tokens in server.']);
        } finally {
            vi.unstubAllEnvs();
        }
    });
});

describe('Default role', () => {
    it('should give the default role "user" if the user has no role', async () => {
        const findOneSpy = vi.spyOn(User, 'findOne').mockResolvedValueOnce({
            _id: 'fake-id',
            username: 'NoRole',
            hashedPass: bcrypt.hashSync('pass123', 10),
            role: undefined,
        } as any);
        const signSpy = vi.spyOn(jwt, 'sign');

        try {
            const res = await request(app)
                .post('/api/login')
                .send({ username: 'NoRole', password: 'pass123' });

            expect(res.status).toBe(200);
            expect(signSpy).toHaveBeenCalledWith(
                expect.objectContaining({ role: ['user'] }),
                expect.any(String),
                expect.anything()
            );
        } finally {
            findOneSpy.mockRestore();
            signSpy.mockRestore();
        }
    });
});