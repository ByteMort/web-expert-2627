import type { Params } from '@feathersjs/feathers';
import type { LoginData } from './auth.schema.js';
import User, { type IUser } from '../../models/user.model.js';
import { NotAuthenticated } from '@feathersjs/errors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface LoginResult{
  message: string;
  accessToken: string;
}

export class AuthService{
  async create(data: LoginData, params?: Params): Promise<LoginResult>{
    const foundUser: IUser | null = await User.findOne({ username: data.username });
    if (!foundUser) {
      throw new NotAuthenticated("Invalid username or password");
    }

    const passStatus = await bcrypt.compare(data.password, foundUser.hashedPass);
    if (!passStatus) {
      throw new NotAuthenticated("Invalid username or password");
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

    if (!JWT_SECRET || !JWT_EXPIRES_IN) {
      throw new Error("JWT variables not defined");
    }

    const token = jwt.sign(
      { sub: foundUser._id, role: foundUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as NonNullable<jwt.SignOptions['expiresIn']> }
    );

    return {
      message: `Login attempt for ${data.username}`,
      accessToken: token
    };
  }
}
