import { resolve } from '@feathersjs/schema';
import type { IEnrollment } from '../../models/enrollment.model.js';
import type { HookContext } from '@feathersjs/feathers';
import { getValidator, Type, type Static } from '@feathersjs/typebox';
import { dataValidator } from '../../util/validators.js';

export const enrollmentExternalResolver = resolve<IEnrollment, HookContext>({
    updatedAt: async () => undefined,
    createdAt: async () => undefined,
});

const createEnrollmentSchema = Type.Object(
    {
        workout: Type.String({ format: 'uuid' })
    },
    { $id: 'CreateEnrollment', additionalProperties: false }
);
export type CreateEnrollment = Static<typeof createEnrollmentSchema>;
export const createEnrollmentValidator = getValidator(createEnrollmentSchema, dataValidator);