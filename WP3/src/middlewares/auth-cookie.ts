import type { Request, Response, NextFunction } from 'express';

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

export const clearAuthCookie = (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'strict'
  });

  res.json({ message: 'Logout successful' });
};
