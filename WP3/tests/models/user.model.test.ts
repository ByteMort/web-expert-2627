import { describe, it, expect } from 'vitest';
import User from '../../src/models/user.model';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const getValidationError = async (doc: mongoose.Document<string>) => {
  try {
    await doc.validate();
    return null;
  } catch (error) {
    return error as mongoose.Error.ValidationError;
  }
};

describe("User mode", () => {
  describe('valid user', () => {
    it("passes validation with correct data", async () => {
      const user = new User({ username: 'test', password: 'test123' });
      const error = await getValidationError(user);
      expect(error).toBeNull();
    });

    it("hashes the password into hashedPass", async () => {
      const user = new User({ username: 'test', password: 'test123' });
      expect(user.hashedPass).toBeDefined();
      expect(user.hashedPass).not.toBe('test123');
      expect(await bcrypt.compare('test123', user.hashedPass)).toBe(true);
    });
    
    it("sets role to 'user' by default", () => {
      const user = new User({ username: 'test', password: 'test123' });
      expect(user.role).toBe('user');
    });

    it('generates a UUID as _id', () => {
      const user = new User({ username: 'test', password: 'test123' });
      expect(user._id).toMatch(/^[0-9a-f-]{36}$/);
    });
  });

  describe('username', () => {
    it("is required", async () => {
      const user = new User({ password: 'test123' });
      const error = await getValidationError(user);
      expect(error?.errors.username).toBeDefined();
      expect(error?.errors.username?.kind).toBe('required');
    });

    it("must be at least 2 characters", async () => {
      const user = new User({ username: 'a', password: 'test123' });
      const error = await getValidationError(user);
      expect(error?.errors.username).toBeDefined();
      expect(error?.errors.username?.kind).toBe('minlength');
    });

    it("must be shorter than 15 characters", async () => {
      const user = new User({ username: 'thisIsMyUserName', password: 'test123' });
      const error = await getValidationError(user);
      expect(error?.errors.username).toBeDefined();
      expect(error?.errors.username?.kind).toBe('maxlength');
    });

    it("cannot contain 'admin'", async () => {
      const user = new User({ username: 'superadmin', password: 'test123' });
      const error = await getValidationError(user);
      expect(error?.errors.username).toBeDefined();
      expect(error?.errors.username?.kind).toBe('invalidUsername');
    });
    
    it("only allows letters and numbers", async () => {
      const user = new User({ username: 'my username', password: 'test123' });
      const error = await getValidationError(user);
      expect(error?.errors.username).toBeDefined();
      expect(error?.errors.username?.kind).toBe('invalidUsername');
    });
  });

  describe('password', () => {
    it("is required (hashedPass)", async () => {
      const user = new User({ username: 'test'});
      const error = await getValidationError(user);
      expect(error?.errors.hashedPass).toBeDefined();
      expect(error?.errors.hashedPass?.kind).toBe('required');
    });

    it("is required", async () => {
      const user = new User({ username: 'test', password: '' });
      const error = await getValidationError(user);
      expect(error?.errors.password).toBeDefined();
      expect(error?.errors.password?.kind).toBe('required');
    });

    it("must be at least 6 characters", async () => {
      const user = new User({ username: 'test', password: 'test' });
      const error = await getValidationError(user);
      expect(error?.errors.password).toBeDefined();
      expect(error?.errors.password?.kind).toBe('minlength');
    });

    it("must be shorter than 20 characters", async () => {
      const user = new User({ username: 'test', password: 'testtesttesttesttesttesttest' });
      const error = await getValidationError(user);
      expect(error?.errors.password).toBeDefined();
      expect(error?.errors.password?.kind).toBe('maxlength');
    });
  });

  describe('role', () => {
    it("rejects values outside the enum", async () => {
      const user = new User({ username: 'test', password: 'test123', role: 'superuser'});
      const error = await getValidationError(user);
      expect(error?.errors.role).toBeDefined();
      expect(error?.errors.role?.kind).toBe('enum');
    })
  });
});
