import type { Application } from '@feathersjs/express';
import { WorkoutService } from './workout.class.js';
import { hooks as schemaHooks } from '@feathersjs/schema';
import { createWorkoutValidator, patchWorkoutValidator, workoutExternalResolver } from './workout.schema.js';
import { requireAdmin } from '../../hooks/require-admin.js';

export const workoutPath = "/api/workouts";

export const workout = (app: Application) => {
    app.use(workoutPath, new WorkoutService);

    app.service(workoutPath).hooks({
        around: {
            all: [ schemaHooks.resolveExternal(workoutExternalResolver) ]
        },
        before: {
            create: [ requireAdmin, schemaHooks.validateData(createWorkoutValidator) ],
            remove: [requireAdmin],
            patch: [requireAdmin, schemaHooks.validateData(patchWorkoutValidator)]
        }
    });
};