import express from 'express';
import auth_router from './auth.router.js';
import task_router from './task.router.js';
import user_router from './user.router.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const mainRouter = express.Router();

mainRouter.use(auth_router);

mainRouter.use(authenticateToken);

mainRouter.use(task_router);
mainRouter.use(user_router);

export default mainRouter;