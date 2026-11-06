import { NotAuthenticated } from "@feathersjs/errors";
import type { HookContext, Params } from "@feathersjs/feathers";
import type { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

export const setAuthCookie = (req: Request, res: Response, next: NextFunction) => {
  const { accessToken, ...rest } = res.data;

  res.cookie('token', accessToken, {
    httpOnly: true,
    sameSite: 'strict'
  });

  res.data = rest;
  next();
}

export const parseAuthCookie = (req: Request, res: Response, next: NextFunction) => {
  req.feathers = { ...req.feathers, token: req.cookies?.token };
  next();
}


export const authenticate = async (context: HookContext) => {
  const params = context.params as Params & { token?: string };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT variables is not defined");
  }

  if (!params.token) {
    throw new NotAuthenticated("Not authenticated");
  }

  try {
    jwt.verify(params.token, secret);
  } catch {
    throw new NotAuthenticated("Invalid or expired token");
  }
};

const publicRoutes = [
  { path: 'api/auth/login', method: 'create' }
];

export const authenticateUnlessPublic = async (context: HookContext) => {
  const isPublic = publicRoutes.some(
    (r) => r.path === context.path && r.method === context.method
  );
  if (isPublic) return;

  await authenticate(context);
};
