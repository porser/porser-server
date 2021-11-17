import { NedbServiceOptions, Service } from "feathers-nedb";
import type { RefreshTokenEntity } from "models/refresh-tokens.model";
import type { Application } from "types";

export class RefreshTokens extends Service<RefreshTokenEntity> {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<NedbServiceOptions>, _app: Application) {
    super(options);
  }
}
