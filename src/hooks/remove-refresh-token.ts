import { BadRequest, NotAuthenticated } from "@feathersjs/errors";
import type { Hook, HookContext } from "@feathersjs/feathers";
import type { UserEntity } from "models/user.model";
import {
  loadConfig,
  lookupRefreshTokenId
} from "services/refresh-tokens/helpers";
import type { Application, ServiceTypes } from "types";
import { logger } from "utils";

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const app = <Application>context.app;
    const config = loadConfig(app);

    const { userEntityId, authService } = config;

    if (context.type === "after") {
      logger.debug("Logout user after delete refresh token", context.params);

      // Must reset the query or won't be able to find user id
      context.params.query = {};

      const authentication = <ServiceTypes["authentication"]>(
        app.service(authService)
      );

      const user = await authentication.remove(null, context.params);

      logger.debug(
        "Logout user after delete refresh token",
        user,
        context.result
      );

      return context;
    }

    const query = context.params.query;
    const user = <UserEntity | undefined>context.params;

    logger.debug("Logout before hook, query and params", query, user);

    if (!user) throw new NotAuthenticated("User is not authenticated");
    if (!query) throw new BadRequest("Invalid query string");
    if (!query.refreshToken)
      throw new BadRequest(`Refresh token is missing from query string`);
    if (!(<string | undefined>user[<keyof UserEntity>userEntityId]))
      throw new Error(`Invalid configured userEntityId (${userEntityId})`);

    const tokenId = await lookupRefreshTokenId(app, config, {
      userId: <string>user[<keyof UserEntity>userEntityId],
      refreshToken: <string>query.refreshToken
    });

    logger.debug("Find existing refresh token result", tokenId);

    if (!tokenId) throw new NotAuthenticated("No refresh token");

    context.id = tokenId;

    return context;
  };
};
