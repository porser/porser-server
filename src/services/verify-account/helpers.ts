import errors from "@feathersjs/errors";
import type { NullableId } from "@feathersjs/feathers";
import type { User } from "models/user.model";
import type { Application } from "types.d";
import { generateToken, getUserData, sendEmail } from "utils/service-utilities";

const DELAY = 1000 * 60 * 60 * 24 * 5; // 5 days

export const resendVerification =
  (app: Application) =>
  async (email: User["email"]): Promise<Partial<User>> => {
    if (!email) {
      throw new errors.BadRequest("email is missing.");
    }

    const usersService = app.service("users");
    const usersServiceIdName = usersService.id as string;

    const users = await usersService.find({ query: { email } });

    const user = getUserData(users, ["isNotVerified"]);

    const u = (await usersService.patch(
      <NullableId>user[<keyof User>usersServiceIdName],
      {
        isVerified: false,
        verifyExpires: new Date(Date.now() + DELAY),
        verifyToken: await generateToken()
      }
    )) as User;

    await sendEmail({
      from: "Porser <no-reply@porser.io>",
      to: u.email,
      subject: "Account Verification",
      text: u.verifyToken
    });

    return u;
  };

export const verify =
  (app: Application) =>
  async (token: NonNullable<User["verifyToken"]>): Promise<Partial<User>> => {
    if (!token) {
      throw new errors.BadRequest("token is missing.");
    }

    const usersService = app.service("users");
    const usersServiceIdName = usersService.id as string;

    const users = await usersService.find({ query: { verifyToken: token } });

    const user = getUserData(users, ["isNotVerified", "verifyNotExpired"]);

    const u = (await usersService.patch(
      <NullableId>user[<keyof User>usersServiceIdName],
      {
        isVerified: true,
        verifyToken: undefined,
        verifyExpires: undefined
      }
    )) as User;

    return u;
  };
