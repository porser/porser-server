import * as local from "@feathersjs/authentication-local";
import { cache, CacheMap } from "feathers-hooks-common";
import { MakeCacheMap } from "utils";
import { secureResetPassword, logoutAllDevices } from "hooks";

const { protect } = local.hooks;

const cacheMap = MakeCacheMap({ max: 100 }) as unknown as CacheMap<unknown>;

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      // Make sure the user is authenticated
      // (before changing the password)
      secureResetPassword(),
      cache(cacheMap)
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      // Make sure the token fields are never sent to the client
      protect("resetToken"),
      protect("verifyToken"),
      protect("resetExpires"),
      protect("verifyExpires"),

      logoutAllDevices(),
      cache(cacheMap),

      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect("password")
    ],
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
