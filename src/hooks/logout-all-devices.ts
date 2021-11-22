import type { Hook, HookContext } from "@feathersjs/feathers";
import type { UserEntity } from "models/user.model";
import {
  loadConfig,
  lookupRefreshTokenId
} from "services/refresh-tokens/helpers";
import type { Application, ServiceTypes } from "types";

type Result = Partial<UserEntity>;

interface Data {
  type: string;
}

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const data = <Data>context.data;

    if (data.type !== "RESET_PASSWORD" && data.type !== "CHANGE_PASSWORD")
      return context;

    const app = <Application>context.app;
    const result = <Result>context.result;

    const config = loadConfig(app);
    const { userEntityId, service } = config;
    const userId = <string>result[<keyof UserEntity>userEntityId];

    const refreshTokensService = <ServiceTypes["refresh-tokens"]>(
      app.service(service)
    );

    const tokenId = await lookupRefreshTokenId(app, config, { userId });

    if (!tokenId) return context;

    await refreshTokensService.remove(tokenId);

    return context;
  };
};
