import type { Hook, HookContext } from "@feathersjs/feathers";
import type { Application, ServiceTypes } from "types";
import {
  lookupRefreshToken,
  loadConfig
} from "services/refresh-tokens/helpers";
import { logger } from "utils";
import { BadRequest, NotAuthenticated } from "@feathersjs/errors";

interface Data {
  refreshToken: string;
  userId: string;
  refreshAccessToken?: boolean;
  [k: string]: unknown;
}

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    // For internal calls, simply return the context
    if (context.params.provider) return context;
    const data = <Data>context.data;

    ["refreshToken", "userId"].forEach(param => {
      if (param in data) return;
      throw new BadRequest(`Param ${param} is missing from request`);
    });

    const refreshAccess = data.refreshAccessToken || false;

    if (!refreshAccess) return context;

    const app = <Application>context.app;
    const config = loadConfig(app);

    const lookup = await lookupRefreshToken(app, config, {
      userId: data.userId,
      refreshToken: data.refreshToken
    });

    logger.debug("Find existing refresh token result", lookup.token);

    if (!lookup.token) throw new NotAuthenticated("No refresh token");

    if ((<{ sub: string }>lookup.verifyResult).sub !== data.userId)
      throw new NotAuthenticated(`Invalid refresh token`);

    logger.debug("Creating new access token");

    const authentication = <ServiceTypes["authentication"]>(
      app.service(config.authService)
    );

    const accessToken = await authentication.createAccessToken({
      sub: data.userId
    });

    logger.debug(`Issued new access token ${accessToken}`);

    context.result = { accessToken };

    return context;
  };
};
