import { BadRequest, NotAuthenticated } from "@feathersjs/errors";
import type { Hook, HookContext } from "@feathersjs/feathers";
import type { UserEntity } from "models/user.model";
import {
  loadConfig,
  lookupRefreshTokenId
} from "services/refresh-tokens/helpers";
import type { Application } from "types";
import { logger } from "utils";

interface Data {
  refreshToken: string;
}

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    // For internal calls, simply return the context
    if (!context.params.provider) return context;

    const app = <Application>context.app;
    const data = <Data>context.data;

    const config = loadConfig(app);

    const { userEntityId } = config;
    const user = <UserEntity | undefined>context.params.user;

    logger.debug(`Revoke refresh-token for user: ${user as unknown as string}`);

    if (!user) throw new NotAuthenticated("User is not authenticated");
    if (!(<string | undefined>user[<keyof UserEntity>userEntityId]))
      throw new Error(`Invalid configured userEntityId (${userEntityId})`);

    ["refreshToken"].forEach(param => {
      if (param in data) return;
      throw new BadRequest(`Param ${param} is missing from request`);
    });

    const tokenId = await lookupRefreshTokenId(app, config, {
      userId: <string>user[<keyof UserEntity>userEntityId],
      refreshToken: data.refreshToken
    });

    logger.debug(
      `Find existing refresh token result: ${tokenId as unknown as string}`
    );

    if (!tokenId) throw new NotAuthenticated("No refresh token");

    context.id = tokenId;
    context.data = { isValid: false };

    return context;
  };
};
