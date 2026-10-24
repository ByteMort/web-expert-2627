import type { NextFunction, Request, Response } from "express";
import { parseErrorMessages } from "../middlewares/error.middleware.js";
import { StatusCodes } from "http-status-codes";
import { findUsers } from "../services/user.service.js";

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user?.role.includes('admin')) {
            throw new Error("You can't see all users!");
        }

        let users = await findUsers();

        return res.status(StatusCodes.OK).json({
            users
        });

    } catch (err: any) {
        if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
            return next(err);
        }

        const errors = parseErrorMessages(err);

        return res.status(StatusCodes.BAD_REQUEST).json({
            errors
        });
    }
};