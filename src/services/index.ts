import type { Application } from "../types.d";
import passwordManagement from "./password-management/password-management.service";
import refreshTokens from "./refresh-tokens/refresh-tokens.service";
import users from "./users/users.service";
import verifyAccount from "./verify-account/verify-account.service";

const transport = (app: Application) => {
  app.configure(users);
  app.configure(verifyAccount);
  app.configure(passwordManagement);
  app.configure(refreshTokens);
};

export default transport;
