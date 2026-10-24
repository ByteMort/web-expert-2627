import { describe, expect, it, vi } from 'vitest';
import { globalErrorHandler, parseErrorMessages } from '../middlewares/error.middleware.js';

describe('parseErrorMessages', () => {
    it('should return all messages of a ValidationError', () => {
        const err = {
            name: 'ValidationError',
            errors: {
                username: { message: "Username can't be more than 15 characters." },
                password: { message: 'Password is too short.' },
            },
        };

        expect(parseErrorMessages(err)).toEqual([
            "Username can't be more than 15 characters.",
            'Password is too short.',
        ]);
    });

    it('should handle duplicate key errors', () => {
        expect(parseErrorMessages({ code: 11000 })).toEqual(['Username is already taken.']);
    });

    it('should return the message of a normal Error', () => {
        expect(parseErrorMessages(new Error('Something went wrong.'))).toEqual(['Something went wrong.']);
    });

    it('should return a default message if the error is not an Error', () => {
        expect(parseErrorMessages('just a string')).toEqual(['An unexpected error occurred.']);
    });
});

describe('globalErrorHandler', () => {
    const createRes = () => ({
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    }) as any;

    it('should use the statusCode and message of the error', () => {
        const res = createRes();
        const err = Object.assign(new Error('Not found.'), { statusCode: 404 });

        globalErrorHandler(err, {} as any, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ errors: ['Not found.'] });
    });

    it('should fall back to 500 and a default message', () => {
        const res = createRes();

        globalErrorHandler({}, {} as any, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ errors: ['A server error has occurred.'] });
    });
});