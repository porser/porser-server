import type { Application } from "../types.d";
import users from "./users/users.service";

const transport = (app: Application) => {
  app.configure(users);
};

export default transport;
