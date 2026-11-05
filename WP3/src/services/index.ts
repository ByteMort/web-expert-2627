import type { Application } from '@feathersjs/express';
import { auth } from './auth/auth.js';

export const services = (app: Application) => {
    app.configure(auth);
}