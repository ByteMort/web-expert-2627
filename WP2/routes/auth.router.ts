import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";

const router = express.Router();

router.get('/register', (req, res) => {
    return res.render('auth/register', {
        title: "Register Page"
    });
});

router.post('/register', registerUser);

router.get('/login', (req, res) => {
    return res.render('auth/login', {
        title: "Login Page"
    });
});

router.post('/login', loginUser);

export default router ;