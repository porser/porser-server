import * as local from "@feathersjs/authentication-local";

const { protect } = local.hooks;

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [
      // Make sure the token fields are never sent to the client
      protect("resetToken"),
      protect("verifyToken"),
      protect("resetExpires"),
      protect("verifyExpires"),
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect("password")
    ],
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
