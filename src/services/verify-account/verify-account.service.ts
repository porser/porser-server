import type { ServiceAddons } from "@feathersjs/feathers";
import type { Application } from "types.d";
import { VerifyAccount } from "./verify-account.class";
import hooks from "./verify-account.hooks";

// Add this service to the service type index
declare module "types.d" {
  interface ServiceTypes {
    "verify-account": VerifyAccount & ServiceAddons<unknown>;
  }
}

export default function (app: Application): void {
  // Initialize our service with any options it requires
  app.use("/verify-account", new VerifyAccount(app));

  // Get our initialized service so that we can register hooks
  const service = app.service("verify-account");

  service.hooks(hooks);
}
