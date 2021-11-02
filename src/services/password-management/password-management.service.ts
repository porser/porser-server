import type { ServiceAddons } from "@feathersjs/feathers";
import type { Application } from "types.d";
import { PasswordManagement } from "./password-management.class";
import hooks from "./password-management.hooks";

// Add this service to the service type index
declare module "types.d" {
  interface ServiceTypes {
    "password-management": PasswordManagement & ServiceAddons<unknown>;
  }
}

export default function (app: Application): void {
  // Initialize our service with any options it requires
  app.use("/password-management", new PasswordManagement(app));

  // Get our initialized service so that we can register hooks
  const service = app.service("password-management");

  service.hooks(hooks);
}
