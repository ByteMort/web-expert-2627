import type { Params } from '@feathersjs/feathers';
import type { LoginData } from './auth.schema.js';

export interface LoginResult{
    message: string;
}

export class AuthService{
    async create(data: LoginData, params?: Params): Promise<LoginResult>{
        return { message: `Login attempt for ${data.username}` };
    }
}