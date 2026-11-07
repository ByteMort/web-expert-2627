import { resolve } from '@feathersjs/schema';
import type { IWorkout } from '../../models/workout.model.js';
import type { HookContext } from '@feathersjs/feathers';
import { getValidator, Type, type Static} from '@feathersjs/typebox';
import { dataValidator } from '../../util/validators.js';

export const workoutExternalResolver = resolve<IWorkout, HookContext>({
    updatedAt: async () => undefined,
    createdAt: async () => undefined,
});


const createWorkoutSchema = Type.Object(
    {
        title: Type.String({ minLength: 2, maxLength: 35}),
        trainer: Type.String({ format: 'uuid' }),
        startTime: Type.String({ format: 'date-time' }),
        durationMinutes: Type.Integer({ minimum: 30, maximum: 120 }),
        capacity: Type.Integer({ minimum: 1, maximum: 20 }),
    },
    { $id: 'CreateWorkout', additionalProperties: false }
);
export type CreateWorkout = Static<typeof createWorkoutSchema>;
export const createWorkoutValidator = getValidator(createWorkoutSchema, dataValidator);


const patchWorkoutSchema = Type.Partial(
    createWorkoutSchema,
    {
        $id: 'PatchWorkout',
        additionalProperties: false
    }
);
export type PatchWorkout = Static<typeof patchWorkoutSchema>;
export const patchWorkoutValidator = getValidator(patchWorkoutSchema, dataValidator);