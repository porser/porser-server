import * as feathersAuthentication from "@feathersjs/authentication";
import { disallow, cache, CacheMap } from "feathers-hooks-common";
import {
  refreshAccessToken,
  removeRefreshToken,
  revokeRefreshToken
} from "hooks";
import { MakeCacheMap } from "utils";

const { authenticate } = feathersAuthentication.hooks;

const cacheMap = MakeCacheMap({ max: 100 }) as unknown as CacheMap<unknown>;

export default {
  before: {
    all: [],
    find: [],
    get: [disallow("external")],
    create: [refreshAccessToken(), cache(cacheMap)],
    update: [disallow("external")],
    patch: [authenticate("jwt"), revokeRefreshToken()],
    remove: [authenticate("jwt"), removeRefreshToken()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [cache(cacheMap)],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
