import errors from "@feathersjs/errors";
import type { Paginated, ServiceMethods } from "@feathersjs/feathers";
import type { User } from "models/user.model";
import type { Application } from "types.d";
import { resendVerification, verify } from "./helpers";

type Action =
  | {
      type: "VERIFY_REGISTRATION";
      payload: { token: string };
    }
  | {
      type: "RESEND_VERIFICATION";
      payload: { email: User["email"] };
    };

export class VerifyAccount implements ServiceMethods<unknown> {
  app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  async create(data: Action): Promise<Partial<User>> {
    switch (data.type) {
      case "RESEND_VERIFICATION":
        try {
          return await resendVerification(this.app)(data.payload.email);
        } catch (err) {
          return Promise.reject(err);
        }
      case "VERIFY_REGISTRATION":
        try {
          return await verify(this.app)(data.payload.token);
        } catch (err) {
          return Promise.reject(err);
        }
      default:
        throw new errors.BadRequest(
          `Action '${(<{ type: string }>data).type}' is invalid.`
        );
    }
  }

  find(): Promise<Action[] | Paginated<Action>> {
    throw new errors.MethodNotAllowed(
      "Method `find` is not supported by this endpoint."
    );
  }

  get(): Promise<Action> {
    throw new errors.MethodNotAllowed(
      "Method `get` is not supported by this endpoint."
    );
  }

  update(): Promise<Action> {
    throw new errors.MethodNotAllowed(
      "Method `update` is not supported by this endpoint."
    );
  }

  patch(): Promise<Action> {
    throw new errors.MethodNotAllowed(
      "Method `patch` is not supported by this endpoint."
    );
  }

  remove(): Promise<Action> {
    throw new errors.MethodNotAllowed(
      "Method `remove` is not supported by this endpoint."
    );
  }
}
