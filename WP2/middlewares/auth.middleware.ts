import type { NextFunction, Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

export interface JWTClaims{
    sub: string;
    username: string;
    role: string[];
}

export const authenticateToken: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.token;

    if(!token){
        if(req.accepts('html')){
            res.redirect('/login');
            return;
        }
        res.status(StatusCodes.UNAUTHORIZED).json({
            errors: ["Access denied. No token provided."]
        });
        return;
    }

    try{
        const secretKey = process.env.JWT_SECRET;
        if(!secretKey){
            throw new Error("There is no key for jwt tokens in server.")
        }
        
        const decoded = jwt.verify(token, secretKey) as JWTClaims;
        req.user = decoded;

        return next();
    }catch(err: any){
        res.clearCookie('token');

        if(req.accepts('html')){
            res.redirect('/login');
            return;
        }
        res.status(StatusCodes.UNAUTHORIZED).json({
            errors: ["Invalid or expired token. Please log in again."]
        });
        return;
    }
};