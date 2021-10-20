import { AuthenticationService, JWTStrategy } from "@feathersjs/authentication";
import { LocalStrategy } from "@feathersjs/authentication-local";
import { expressOauth } from "@feathersjs/authentication-oauth";
import { ServiceAddons } from "@feathersjs/feathers";
import type { Application } from "types.d";

declare module "types.d" {
  interface ServiceTypes {
    authentication: AuthenticationService & ServiceAddons<unknown>;
  }
}

const service = (app: Application) => {
  const authService = new AuthenticationService(app);

  authService.register("jwt", new JWTStrategy());
  authService.register("local", new LocalStrategy());

  app.use("/authentication", authService);
  app.configure(expressOauth());
};

export default service;
