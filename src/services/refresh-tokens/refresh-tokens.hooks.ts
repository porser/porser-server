import * as feathersAuthentication from "@feathersjs/authentication";
import refreshAccessToken from "hooks/refresh-access-token";
import removeRefreshToken from "hooks/remove-refresh-token";
import revokeRefreshToken from "hooks/revoke-refresh-token";

const { authenticate } = feathersAuthentication.hooks;

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [refreshAccessToken()],
    update: [],
    patch: [authenticate("jwt"), revokeRefreshToken()],
    remove: [authenticate("jwt"), removeRefreshToken()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [removeRefreshToken()]
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
