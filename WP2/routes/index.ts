import express from 'express';
import auth_router from './auth.router.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const mainRouter = express.Router();

mainRouter.use(auth_router);

mainRouter.use(authenticateToken);

mainRouter.get('/', (req, res) => {
    res.render('index', {
        title: "Home Page"
    });
})

export default mainRouter;