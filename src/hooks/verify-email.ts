import { Hook, HookContext } from "@feathersjs/feathers";
import { User } from "models/user.model";
import { Application } from "types.d";

type ContextResult = Partial<User> & { email: User["email"] };

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    await (<Application>context.app).service("verify-account").create({
      type: "RESEND_VERIFICATION",
      payload: { email: (<ContextResult>context.result).email }
    });

    return context;
  };
};
