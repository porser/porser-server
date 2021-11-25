import type { ServiceOptions } from "@feathersjs/adapter-commons";
import type { ServiceAddons } from "@feathersjs/feathers";
import type { Application } from "types";
import createFormBuilderModel from "../../models/form-builder.model";
import { FormBuilder } from "./form-builder.class";
import hooks from "./form-builder.hooks";

// Add this service to the service type index
declare module "types" {
  interface ServiceTypes {
    "form-builder": FormBuilder & ServiceAddons<unknown>;
  }
}

export default function (app: Application): void {
  const Model = createFormBuilderModel(app);
  const paginate = app.get("paginate") as
    | ServiceOptions["paginate"]
    | undefined;

  // Initialize our service with any options it requires
  app.use("/form-builder", new FormBuilder({ Model, paginate }, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("form-builder");

  service.hooks(hooks);
}
