import { resolve } from '@feathersjs/schema';
import type { IUser } from '../../models/user.model.js';
import type { HookContext } from '@feathersjs/feathers';
import { getValidator, Type, type Static } from '@feathersjs/typebox';
import { dataValidator } from '../../util/validators.js';

export const userExternalResolver = resolve<IUser, HookContext>({
  _id: async () => undefined,
  hashedPass: async () => undefined,
  updatedAt: async () => undefined,
  createdAt: async () => undefined,
});

const registerDataSchema = Type.Object(
  {
    username: Type.String({ minLength: 2, maxLength: 15}),
    password: Type.String({ minLength: 6, maxLength: 20 })
  },
  { $id: 'RegisterData', additionalProperties: false }
);

export type RegisterData = Static<typeof registerDataSchema>;

export const registerValidator = getValidator(registerDataSchema, dataValidator);