import type { Hook, HookContext } from "@feathersjs/feathers";
import type { SignOptions } from "jsonwebtoken";
import type { RefreshTokenEntity } from "models/refresh-tokens.model";
import type { UserEntity } from "models/user.model";
import {
  loadConfig,
  lookupRefreshToken
} from "services/refresh-tokens/helpers";
import type { Application, ServiceTypes } from "types";
import { logger } from "utils";

interface Result {
  user: UserEntity;
  accessToken: string;
  [k: string]: unknown;
}

interface Data {
  deviceId: RefreshTokenEntity["deviceId"];
}

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const data = <Data>context.data;
    const result = <Result>context.result;
    const app = <Application>context.app;

    const config = loadConfig(app);

    const {
      entity,
      service,
      userEntity,
      userEntityId,
      authService,
      jwtOptions,
      secret
    } = config;

    let userId: string;
    const user = result[<"user">userEntity];

    if (user) {
      userId = <string>user[<keyof UserEntity>userEntityId];
    } else if (userEntityId in result) {
      userId = <string>result[<keyof Result>userEntityId];
    } else {
      logger.debug(`${userEntityId} doesn't exist in auth result`, result);
      throw new Error(`Could not find userId`);
    }

    const { deviceId } = data;

    const query: Partial<RefreshTokenEntity> = deviceId
      ? { userId, deviceId }
      : { userId };

    const { token } = await lookupRefreshToken(app, config, query);

    logger.debug(`existing token: ${token as unknown as string}`);

    if (token) {
      result[entity] = token.refreshToken;
      return context;
    }

    const authentication = <ServiceTypes["authentication"]>(
      app.service(authService)
    );

    const refreshToken = await authentication.createAccessToken(
      { sub: userId },
      jwtOptions as unknown as SignOptions,
      secret
    );

    let refreshTokenEntity: RefreshTokenEntity = {
      refreshToken,
      userId,
      isValid: true
    };

    if (data.deviceId) {
      refreshTokenEntity = { ...refreshTokenEntity, deviceId: data.deviceId };
    }

    const refreshTokenService = <ServiceTypes["refresh-tokens"]>(
      app.service(service)
    );

    const tokenEntity = <RefreshTokenEntity>(
      await refreshTokenService.create(refreshTokenEntity)
    );

    logger.debug(
      `AccessToken and RefreshToken: ${result.accessToken}, ${tokenEntity.refreshToken}`
    );

    result[entity] = refreshToken;

    return context;
  };
};
