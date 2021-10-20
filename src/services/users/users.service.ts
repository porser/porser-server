import type { ServiceOptions } from "@feathersjs/adapter-commons";
import type { ServiceAddons } from "@feathersjs/feathers";
import createUserModel from "models/user.model";
import type { Application } from "types.d";
import { Users } from "./users.class";
import hooks from "./users.hooks";

// Add this service to the service type index
declare module "types.d" {
  interface ServiceTypes {
    users: Users & ServiceAddons<unknown>;
  }
}

const registerService = (app: Application) => {
  const Model = createUserModel(app);
  const paginate = app.get("paginate") as
    | ServiceOptions["paginate"]
    | undefined;

  // Initialize our service with any options it requires
  app.use("/users", new Users({ Model, paginate }, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("users");

  service.hooks(hooks);
};

export default registerService;
