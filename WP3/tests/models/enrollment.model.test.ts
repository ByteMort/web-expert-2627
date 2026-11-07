import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import Enrollment from '../../src/models/enrollment.model.js';


const getValidationError = async (doc: mongoose.Document<string>) => {
  try {
    await doc.validate();
    return null;
  } catch (error) {
    return error as mongoose.Error.ValidationError;
  }
};

const makeEnrollment = (overrides: Record<string, unknown> = {}) =>
  new Enrollment({
    workout: 'workout-id',
    user: 'user-id',
    ...overrides
  });

describe('Enrollment model', () => {
  it('passes validation with correct data', async () => {
    const error = await getValidationError(makeEnrollment());
    expect(error).toBeNull();
  });

  it('generates a UUID as _id', () => {
    expect(makeEnrollment()._id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('requires a workout', async () => {
    const error = await getValidationError(makeEnrollment({ workout: undefined }));
    expect(error?.errors.workout?.kind).toBe('required');
  });

  it('requires a user', async () => {
    const error = await getValidationError(makeEnrollment({ user: undefined }));
    expect(error?.errors.user?.kind).toBe('required');
  });
});