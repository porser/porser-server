import type { Paginated } from "@feathersjs/feathers";
import type { Algorithm, Secret } from "jsonwebtoken";
import type { RefreshTokenEntity } from "models/refresh-tokens.model";
import type { Application, ServiceTypes } from "types";
import { logger } from "utils";

interface AuthConfig {
  entity: string;
  service: string;
  secret: Secret;
  jwtOptions: {
    header: { typ: "access" | "refresh" };
    audience?: string;
    issuer?: string;
    algorithm?: Algorithm;
    expiresIn?: string;
  };
}

interface AuthOptions {
  authService: string;
  userEntity: string;
  userEntityId: string;
}

export type RefreshTokenOptions = AuthConfig & AuthOptions;

let refreshTokenOptions: RefreshTokenOptions | null = null;

export const loadConfig = (app: Application) => {
  // RefreshToken options already loaded, simply return
  if (refreshTokenOptions) return refreshTokenOptions;

  const authConf = <AuthConfig>app.get("authentication");

  const userEntity = authConf.entity;
  const userService = authConf.service;

  if (!userEntity || !authConf || !app.service(userService)) {
    throw new Error(`Invalid authentication service configuration`);
  }

  logger.debug(`Authentication config`, authConf);

  const REFRESH_SECRET = process.env.REFRESH_SECRET;

  if (!REFRESH_SECRET) {
    throw new Error(`No REFRESH_SECRET environment variable provided`);
  }

  const config: RefreshTokenOptions = {
    service: "refresh-tokens",
    entity: "refreshToken",
    secret: REFRESH_SECRET,
    jwtOptions: {
      ...authConf.jwtOptions,
      header: { typ: "refresh" },
      expiresIn: "14d"
    },
    userEntity,
    authService: "authentication",
    userEntityId: <string>(<ServiceTypes["users"]>app.service(userService)).id
  };

  logger.debug(`Final options for refresh token`, config);

  if (!app.service(config.service)) {
    throw new Error(
      `Missing refresh-token entity service. Make sure refresh-tokens service is configured properly.`
    );
  }

  refreshTokenOptions = config;

  return config;
};

export const lookupRefreshToken = async (
  app: Application,
  config: RefreshTokenOptions,
  params: Partial<RefreshTokenEntity>
): Promise<{ token: RefreshTokenEntity | null; verifyResult: unknown }> => {
  const { userId, deviceId, isValid = true, refreshToken } = params;

  if (!userId) {
    throw new Error(`userId is required for querying refresh-token`);
  }

  const { service, authService, jwtOptions, secret } = config;

  let query: Partial<RefreshTokenEntity> = { userId, isValid };

  if (refreshToken) query = { ...query, refreshToken };
  if (deviceId) query = { ...query, deviceId };

  const token = await (<ServiceTypes["refresh-tokens"]>(
    app.service(service)
  )).find({ query });

  logger.debug(`Refresh token lookup result: `, token);

  let data: RefreshTokenEntity | null = null;

  if (Array.isArray(token) && token.length > 0) {
    data = token[0];
  } else if (
    token &&
    (<Paginated<RefreshTokenEntity>>token).total > 0 &&
    (<Paginated<RefreshTokenEntity>>token).data
  ) {
    data = (<Paginated<RefreshTokenEntity>>token).data[0];
  } else data = <RefreshTokenEntity>(<unknown>token);

  if (!data || !data.refreshToken) return { token: null, verifyResult: null };

  const authentication = <ServiceTypes["authentication"]>(
    app.service(authService)
  );

  const verifyResult: unknown = await authentication.verifyAccessToken(
    data.refreshToken,
    jwtOptions,
    secret
  );

  if (!verifyResult) throw new Error("Invalid refresh-token!");

  return { token: data, verifyResult };
};

export const lookupRefreshTokenId = async (
  app: Application,
  config: RefreshTokenOptions,
  params: Partial<RefreshTokenEntity>
): Promise<string | null> => {
  const { token } = await lookupRefreshToken(app, config, params);

  if (!token) return null;

  logger.debug("Find existing refresh token result", token);

  const service = <ServiceTypes["refresh-tokens"]>app.service(config.service);
  const tokenEntityId = <string>service.id;

  logger.debug(`tokenEntityId: ${tokenEntityId}`);

  const tokenId = <string | undefined>(
    token[<keyof RefreshTokenEntity>tokenEntityId]
  );

  if (tokenId == null) throw new Error("Invalid refresh token!");

  logger.debug("refresh-token Id", tokenId);

  return tokenId;
};
