import type { HookContext } from '@feathersjs/feathers';
import { formatErrors } from '../../src/util/format-errors';
import { describe, it, expect, vi } from 'vitest';
import { BadRequest, Conflict, GeneralError, NotFound } from '@feathersjs/errors';
import User from '../../src/models/user.model';

const run = async (error: unknown) => {
    const context = { error } as HookContext;
    await formatErrors(context);
    return context.error;
};

describe('formatErrors', () => {
    describe('Ajv validation errors', () => {
        it("converts each Ajv error into { field, message }", async () => {
            const ajvError = new BadRequest('validation failed', [
                { instancePath: '/password', message: 'too short' },
                { instancePath: '', params: { missingProperty: 'username' }, message: 'required' },
                { instancePath: '', params: { additionalProperty: 'role' }, message: 'not allowed' },
                {}
            ]);

            const result = await run(ajvError);

            expect(result).toBeInstanceOf(BadRequest);
            expect(result.message).toBe('Validation failed');
            expect(result.data).toEqual([
                { field: 'password', message: 'too short' },
                { field: 'username', message: 'required' },
                { field: 'role', message: 'not allowed' },
                { field: 'body', message: 'Invalid value' }
            ]);
        });
    });

    describe('Mongoose validation errors', () => {
        it("converts each field error into { field, message }", async () => {
            const mongooseError = await new User({}).validate().catch((e) => e);

            const result = await run(mongooseError);

            expect(result).toBeInstanceOf(BadRequest);
            expect(result.data).toEqual(
                expect.arrayContaining([
                    { field: 'username', message: 'Username is required' },
                    { field: 'hashedPass', message: 'Password is required' }
                ])
            );
        });
    });

    describe('duplicate key errors (E11000)', () => {
        it("returns a Conflict with the duplicated field", async () => {
            const mongoError = Object.assign(new Error('E11000'), {
                code: 11000,
                keyValue: { username: 'bob' }
            });

            const result = await run(mongoError);

            expect(result).toBeInstanceOf(Conflict);
            expect(result.code).toBe(409);
            expect(result.message).toBe('username already exists');
        });

        it("falls back to 'field' when keyValue is missing", async () => {
            const mongoError = Object.assign(new Error('E11000'), { code: 11000 });

            const result = await run(mongoError);

            expect(result.message).toBe('field already exists');
        });
    });

    describe('unknown errors', () => {
        it('hides the details behind a GeneralError', async () => {
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const result = await run(new TypeError('something internal'));

            expect(result).toBeInstanceOf(GeneralError);
            expect(result.code).toBe(500);
            expect(result.message).toBe('Something went wrong');
            expect(spy).toHaveBeenCalled();

            spy.mockRestore();
        });
    });

    describe('Feathers errors', () => {
        it('leaves them unchanged', async () => {
            const notFound = new NotFound('User not found');

            const result = await run(notFound);

            expect(result).toBe(notFound);
        });
    });
})