import errors from "@feathersjs/errors";
import type { Paginated, ServiceMethods } from "@feathersjs/feathers";
import type { UserEntity } from "models/user.model";
import type { Application } from "types.d";
import { changePwd, resetPwd, sendResetPwd } from "./helpers";

type Action =
  | {
      type: "RESET_PASSWORD";
      payload: { token: string; password: string };
    }
  | {
      type: "CHANGE_PASSWORD";
      payload: {
        email: UserEntity["email"];
        oldPassword: string;
        newPassword: string;
      };
    }
  | {
      type: "SEND_RESET_PASSWORD";
      payload: {
        email: UserEntity["email"];
      };
    };

export class PasswordManagement implements ServiceMethods<unknown> {
  app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  async create(data: Action): Promise<Partial<UserEntity>> {
    switch (data.type) {
      case "SEND_RESET_PASSWORD":
        try {
          return await sendResetPwd(this.app)(data.payload.email);
        } catch (err) {
          return Promise.reject(err);
        }
      case "RESET_PASSWORD":
        try {
          return await resetPwd(this.app)(
            data.payload.password,
            data.payload.token
          );
        } catch (err) {
          return Promise.reject(err);
        }
      case "CHANGE_PASSWORD":
        try {
          return await changePwd(this.app)(
            data.payload.email,
            data.payload.oldPassword,
            data.payload.newPassword
          );
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
