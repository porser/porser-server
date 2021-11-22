import * as feathersAuthentication from "@feathersjs/authentication";
import type { Hook, HookContext } from "@feathersjs/feathers";
import type { UserEntity } from "models/user.model";

const { authenticate } = feathersAuthentication.hooks;

type Data =
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

export default (): Hook =>
  async (context: HookContext): Promise<HookContext> => {
    const data = <Data>context.data;

    if (
      context.path === "password-management" &&
      context.method === "create" &&
      data.type === "CHANGE_PASSWORD"
    ) {
      return authenticate("jwt")(context);
    }

    return context;
  };
