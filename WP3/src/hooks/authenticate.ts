import { NotAuthenticated } from '@feathersjs/errors';
import type { HookContext, Params } from '@feathersjs/feathers';
import jwt from 'jsonwebtoken';

export const authenticate = async (context: HookContext) => {
  const params = context.params as Params & { token?: string; user?: { id: string; role: string } };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT variables is not defined");
  }

  if (!params.token) {
    throw new NotAuthenticated("Not authenticated");
  }

  let payload;
  try {
    payload = jwt.verify(params.token, secret);
  } catch {
    throw new NotAuthenticated("Invalid or expired token");
  }

  if (typeof payload === 'string' || !payload.sub) {
    throw new NotAuthenticated("Invalid token");
  }
  params.user = { id: payload.sub, role: payload.role };
};

const publicRoutes = [
  { path: 'api/auth/login', method: 'create' },
  { path: 'api/users', method: 'create' }
];

export const authenticateUnlessPublic = async (context: HookContext) => {
  const isPublic = publicRoutes.some(
    (r) => r.path === context.path && r.method === context.method
  );
  if (isPublic) return;

  await authenticate(context);
};