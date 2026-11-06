import type { Application } from '@feathersjs/express';
import { UserService } from './user.class.js';
import { hooks as schemaHooks } from '@feathersjs/schema';
import { userExternalResolver } from './user.schema.js';

export const userPath = "/api/users";

export const user = (app: Application) => {
  app.use(userPath, new UserService);

  app.service(userPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(userExternalResolver)]
    }
  });
};
