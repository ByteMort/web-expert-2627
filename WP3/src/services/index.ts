import type { Application } from '@feathersjs/express';
import { auth } from './auth/auth.js';
import { user } from './user/user.js';
import { workout } from './workout/workout.js';

export const services = (app: Application) => {
  app.configure(auth);
  app.configure(user);
  app.configure(workout);
}
