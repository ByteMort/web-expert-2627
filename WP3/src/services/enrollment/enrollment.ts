import type { Application } from '@feathersjs/express';
import { EnrollmentService } from './enrollment.class.js';
import { createEnrollmentValidator, enrollmentExternalResolver } from './enrollment.schema.js';
import { hooks as schemaHooks } from '@feathersjs/schema';

export const enrollmentPath = "/api/enrollments";

export const enrollment = (app: Application) => {
    app.use(enrollmentPath, new EnrollmentService);

    app.service(enrollmentPath).hooks({
        around: {
            all: [ schemaHooks.resolveExternal(enrollmentExternalResolver) ]
        },
        before: {
            create: [ schemaHooks.validateData(createEnrollmentValidator) ]
        }
    });
};