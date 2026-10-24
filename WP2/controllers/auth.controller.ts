import { type NextFunction, type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { addUser, logUser } from '../services/auth.service.js';
import { parseErrorMessages } from '../middlewares/error.middleware.js';

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body;

        if (!body.username) { throw new Error("Username is required.") }
        if (!body.password) { throw new Error("Password is required.") }
        const added_user = await addUser(body);

        return res.status(StatusCodes.CREATED).json(added_user);
    } catch (err: any) {
        if (err.name === "MongoNetworkError" || err.name === "MongoServerSelectionError") {
            return next(err);
        }

        const errors = parseErrorMessages(err);
        return res.status(StatusCodes.BAD_REQUEST).json({ errors });
    }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body;

        if (!body.username) { throw new Error("Username is required.") }
        if (!body.password) { throw new Error("Password is required.") }

        const { user, token } = await logUser(body);

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 3600000
        });

        return res.status(StatusCodes.OK).json({
            message: "Login Successfull!",
            user: { id: user._id, username: user.username, role: user.role }
        });

    } catch (err: any) {
        if (err.name == "MongoNetworkError" || err.name === "MongoServerSelectionError") {
            return next(err);
        }

        const errors = parseErrorMessages(err);
        return res.status(StatusCodes.BAD_REQUEST).json({ errors });
    }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie('token');
    return res.status(StatusCodes.OK).json({
        message: "Logout Successull"
    });
}