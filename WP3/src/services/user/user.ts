import type { Application } from "@feathersjs/express";
import { UserService } from "./user.class.js";

export const userPath = "/api/users";

export const user = (app: Application) => {
  app.use(userPath, new UserService);

  app.service(userPath).hooks({

  });
};
