import type { Application } from '@feathersjs/express';
import { UserService } from './user.class.js';
import { hooks as schemaHooks } from '@feathersjs/schema';
import { registerValidator, userExternalResolver } from './user.schema.js';
import { requireAdmin } from '../../hooks/require-admin.js';

export const userPath = "/api/users";

export const user = (app: Application) => {
  app.use(userPath, new UserService);

  app.service(userPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(userExternalResolver)]
    },
    before: {
      find: [requireAdmin],
      create: [schemaHooks.validateData(registerValidator)]
    }
  });
};
