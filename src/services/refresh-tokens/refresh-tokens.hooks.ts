import * as feathersAuthentication from "@feathersjs/authentication";
import {
  refreshAccessToken,
  removeRefreshToken,
  revokeRefreshToken
} from "hooks";

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
