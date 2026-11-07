import type { Params } from '@feathersjs/feathers';
import User, { type IUser } from '../../models/user.model.js';
import { Forbidden, NotFound } from '@feathersjs/errors';
import type { RegisterData } from './user.schema.js';

type UserParams = Params & { user?: { id: string; role: string } };

export class UserService{
  async find(params?: UserParams) {
    const users = await User.find().lean();

    return users;
  }

  async get(id: string, params: UserParams){
    if(id === 'me'){
      const foundUser = await User.findById(params?.user?.id).lean();
      if (!foundUser) {
        throw new NotFound("User not found");
      }
      return foundUser;
    }

    throw new Forbidden("This is forbidden path");
  }

  async create(data: RegisterData, params?: UserParams){
    const savedUser = await User.create({ username: data.username, password: data.password });
    return savedUser.toObject();
  }
}
