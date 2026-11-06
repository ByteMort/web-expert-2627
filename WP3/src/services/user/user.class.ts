import type { Params } from '@feathersjs/feathers';
import User from '../../models/user.model.js';
import { NotFound } from '@feathersjs/errors';

type UserParams = Params & { user?: { id: string; role: string } };

export class UserService{
  async find(params?: UserParams) {
    const foundUser = await User.findById(params?.user?.id).lean();

    if (!foundUser) {
      throw new NotFound("User not found");
    }

    return foundUser;
  }
}
