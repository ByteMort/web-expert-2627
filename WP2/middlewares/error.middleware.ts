import type { NextFunction, Request, Response } from "express";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const errorMessage = err.message || "A server error has occurred.";

    return res.status(statusCode).json({
        errors: [errorMessage]
    });
};

export const parseErrorMessages = (err: any): string[] => {
    if (err.name === "ValidationError") {
        return Object.values(err.errors).map((e: any) => e.message);
    }
    if (err.code === 11000) {
        return ["Username is already taken."];
    }
    if (err instanceof Error) {
        return [err.message];
    }
    return ["An unexpected error occurred."];
};