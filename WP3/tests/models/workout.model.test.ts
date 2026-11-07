import mongoose from 'mongoose';
import { describe, expect, it } from 'vitest';
import Workout from '../../src/models/workout.model';

const DAY = 24 * 60 * 60 * 1000;

const getValidationErrors = async (doc: mongoose.Document<string>) => {
    try{
        await doc.validate();
        return null;
    }catch(error){
        return error as mongoose.Error.ValidationError;
    }
};

const makeWorkout = (overrides: Record<string, unknown> = {}) =>
    new Workout({
        title: 'Workout1',
        trainer: 'trainer-id',
        startTime: new Date(Date.now() + DAY),
        durationMinutes: 45,
        capacity: 15,
        ...overrides
    });

describe('Workout model', () => {
    describe('Valid workout', () => {
        it('passes validation with correct data', async () => {
            const error = await getValidationErrors(makeWorkout());
            expect(error).toBeNull();
        });

        it('sets enrolledCount to 0 by default', () => {
            expect(makeWorkout().enrolledCount).toBe(0);
        });

        it('generates a UUID as _id', () => {
            expect(makeWorkout()._id).toMatch(/^[0-9a-f-]{36}$/);
        });
    });

    describe('title', () => {
        it('is required', async () => {
            const error = await getValidationErrors(makeWorkout({ title: undefined }));
            expect(error?.errors.title?.kind).toBe('required');
        });

        it('must be at least 2 characters', async () => {
            const error = await getValidationErrors(makeWorkout({ title: 'a' }));
            expect(error?.errors.title?.kind).toBe('minlength');
        });

        it('must be at most 35 characters', async () => {
            const error = await getValidationErrors(makeWorkout({ title: 'A'.repeat(36) }));
            expect(error?.errors.title?.kind).toBe('maxlength');
        });

        it('only allows letters, numbers and spaces', async () => {
            const error = await getValidationErrors(makeWorkout({ title: 'Yoga!' }));
            expect(error?.errors.title?.kind).toBe('invalidTitle');
        });
    });

    describe('trainer', () => {
        it('is required', async () => {
            const error = await getValidationErrors(makeWorkout({ trainer: undefined }));
            expect(error?.errors.trainer?.kind).toBe('required');
        });
    });

    describe('startTime', () => {
        it('is required', async () => {
            const error = await getValidationErrors(makeWorkout({ startTime: undefined }));
            expect(error?.errors.startTime?.kind).toBe('required');
        });

        it('must be in the future', async () => {
            const error = await getValidationErrors(makeWorkout({ startTime: new Date('2020-01-01') }));
            expect(error?.errors.startTime?.kind).toBe('pastDate');
        });

        it('rejects an invalid date', async () => {
            const error = await getValidationErrors(makeWorkout({ startTime: 'not-a-date' }));
            expect(error?.errors.startTime?.name).toBe('CastError');
        });
    });

    describe('durationMinutes', () => {
        it('must be at least 30', async () => {
            const error = await getValidationErrors(makeWorkout({ durationMinutes: 29 }));
            expect(error?.errors.durationMinutes?.kind).toBe('min');
        });

        it('must be at most 120', async () => {
            const error = await getValidationErrors(makeWorkout({ durationMinutes: 121 }));
            expect(error?.errors.durationMinutes?.kind).toBe('max');
        });
    });

    describe('capacity', () => {
        it('must be at least 1', async () => {
            const error = await getValidationErrors(makeWorkout({ capacity: 0 }));
            expect(error?.errors.capacity?.kind).toBe('min');
        });

        it('must be at most 20', async () => {
            const error = await getValidationErrors(makeWorkout({ capacity: 21 }));
            expect(error?.errors.capacity?.kind).toBe('max');
        });
    });

    describe('enrolledCount', () => {
        it('cannot be negative', async () => {
            const error = await getValidationErrors(makeWorkout({ enrolledCount: -1 }));
            expect(error?.errors.enrolledCount?.kind).toBe('min');
        });

        it('cannot exceed capacity', async () => {
            const error = await getValidationErrors(makeWorkout({ capacity: 10, enrolledCount: 11 }));
            expect(error?.errors.enrolledCount?.kind).toBe('overCapacity');
        });
    });
});