import type { Application } from '@feathersjs/express';
import { hooks as schemaHooks } from '@feathersjs/schema';
import { AuthService } from './auth.class.js';
import { loginDataValidator } from './auth.schema.js';

export const authPath = 'api/auth/login';

export const auth = (app: Application) => {
    app.use(authPath, new AuthService(), {
        methods: ['create']
    });
    
    app.service(authPath).hooks({
        before: {
            create: [
                schemaHooks.validateData(loginDataValidator)
            ]
        }
    });
};

