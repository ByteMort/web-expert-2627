import { resolve } from '@feathersjs/schema';
import type { IUser } from '../../models/user.model.js';
import type { HookContext } from '@feathersjs/feathers';

export const userExternalResolver = resolve<IUser, HookContext>({
  _id: async () => undefined,
  hashedPass: async () => undefined,
  updatedAt: async () => undefined,
  createdAt: async () => undefined,
});
