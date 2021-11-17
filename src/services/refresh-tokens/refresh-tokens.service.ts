import type { ServiceOptions } from "@feathersjs/adapter-commons";
import { ServiceAddons } from "@feathersjs/feathers";
import type { Application } from "types";
import createTokenModel from "../../models/refresh-tokens.model";
import { RefreshTokens } from "./refresh-tokens.class";
import hooks from "./refresh-tokens.hooks";

// Add this service to the service type index
declare module "types" {
  interface ServiceTypes {
    "refresh-tokens": RefreshTokens & ServiceAddons<unknown>;
  }
}

export default function (app: Application): void {
  const Model = createTokenModel(app);
  const paginate = app.get("paginate") as
    | ServiceOptions["paginate"]
    | undefined;

  // Initialize our service with any options it requires
  app.use("/refresh-tokens", new RefreshTokens({ Model, paginate }, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("refresh-tokens");

  service.hooks(hooks);
}
