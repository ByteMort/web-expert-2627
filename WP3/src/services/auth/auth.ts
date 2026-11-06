import type { Application } from '@feathersjs/express';
import { hooks as schemaHooks } from '@feathersjs/schema';
import { AuthService } from './auth.class.js';
import { loginDataValidator } from './auth.schema.js';
import { clearAuthCookie, setAuthCookie } from '../../middlewares/auth-cookie.js';

export const authPath = '/api/auth/login';

export const auth = (app: Application) => {
  app.post('/api/auth/logout', clearAuthCookie);
  app.use(authPath, new AuthService(), setAuthCookie);

  app.service(authPath).hooks({
      before: {
          create: [
              schemaHooks.validateData(loginDataValidator)
          ]
      }
  });
};
