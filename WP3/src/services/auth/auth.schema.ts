import { getValidator, Type, type Static } from '@feathersjs/typebox';
import { dataValidator } from '../../util/validators.js';

const loginDataSchema = Type.Object(
    {
        username: Type.String({ minLength: 2, maxLength: 15 }),
        password: Type.String({ minLength: 6, maxLength: 20 })
    }, 
    { $id: 'LoginData', additionalProperties: false }
);

export type LoginData = Static<typeof loginDataSchema>;

export const loginDataValidator = getValidator(loginDataSchema, dataValidator);