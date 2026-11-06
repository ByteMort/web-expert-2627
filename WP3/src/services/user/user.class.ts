import type { Params } from "@feathersjs/feathers";

export class UserService{
  async find(params?: Params) {
    return { message: "Users find works" };
  }
}
