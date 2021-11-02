import errors from "@feathersjs/errors";
import type { NullableId, Paginated } from "@feathersjs/feathers";
import type { User } from "models/user.model";
import type { Application } from "types.d";
import {
  checkAgainstUser,
  comparePasswords,
  constructIdFromToken,
  generateToken,
  getUserData,
  sendEmail
} from "utils/service-utilities";

const RESET_DELAY = 1000 * 60 * 60 * 2; // 2 hours

export const sendResetPwd =
  (app: Application) =>
  async (email: User["email"]): Promise<Partial<User>> => {
    if (!email) {
      throw new errors.BadRequest("email is missing.");
    }

    const usersService = app.service("users");
    const usersServiceIdName = usersService.id as string;

    const users = await usersService.find({ query: { email } });

    const user = getUserData(users, ["isVerified"]);

    if (
      user.resetToken &&
      user.resetToken.includes("___") &&
      user.resetExpires &&
      // remaining time exceeds half of resetDelay
      user.resetExpires.getTime() > Date.now() + RESET_DELAY / 2
    ) {
      await sendEmail({
        from: "Porser <no-reply@porser.io>",
        to: user.email,
        subject: "Reset Password",
        text: user.resetToken
      });

      return user;
    }

    const u1 = {
      ...user,
      resetExpires: new Date(Date.now() + RESET_DELAY),
      resetToken: `${<string>(
        user[<keyof User>usersServiceIdName]
      )}___${await generateToken()}`
    };

    await sendEmail({
      from: "Porser <no-reply@porser.io>",
      to: u1.email,
      subject: "Reset Password",
      text: u1.resetToken
    });

    const u2 = (await usersService.patch(
      <NullableId>u1[<keyof User>usersServiceIdName],
      {
        resetExpires: u1.resetExpires,
        resetToken: u1.resetToken
      }
    )) as User;

    return u2;
  };

export const resetPwd =
  (app: Application) =>
  async (
    password: NonNullable<User["password"]>,
    token: NonNullable<User["resetToken"]>
  ): Promise<Partial<User>> => {
    if (!password) {
      throw new errors.BadRequest("password is missing.");
    }

    if (!token) {
      throw new errors.BadRequest("token is missing.");
    }

    const usersService = app.service("users");
    const usersServiceIdName = usersService.id as string;

    let user: User | Paginated<User>;

    if (token) {
      user = await usersService.get(constructIdFromToken(token));
    } else {
      throw new errors.BadRequest("resetToken is missing.");
    }

    if (!user) {
      throw new errors.BadRequest("User not found.");
    }

    checkAgainstUser(user, ["resetNotExpired", "isVerified"]);

    if (token !== user.resetToken) {
      await usersService.patch(
        <NullableId>user[<keyof User>usersServiceIdName],
        { resetToken: undefined, resetExpires: undefined }
      );

      throw new errors.BadRequest(
        "Reset Token is incorrect. Try to get a new one."
      );
    }

    const u = (await usersService.patch(
      <NullableId>user[<keyof User>usersServiceIdName],
      {
        password,
        resetExpires: undefined,
        resetToken: undefined
      }
    )) as User;

    return u;
  };

export const changePwd =
  (app: Application) =>
  async (
    email: User["email"],
    oldPassword: NonNullable<User["password"]>,
    newPassword: NonNullable<User["password"]>
  ): Promise<Partial<User>> => {
    if (!email) {
      throw new errors.BadRequest("email is missing.");
    }

    if (!oldPassword) {
      throw new errors.BadRequest("oldPassword is missing.");
    }

    if (!newPassword) {
      throw new errors.BadRequest("newPassword is missing.");
    }

    const usersService = app.service("users");
    const usersServiceIdName = usersService.id as string;

    const users = await usersService.find({ query: { email } });

    const user = getUserData(users, ["isVerified"]);

    try {
      await comparePasswords(oldPassword, user.password);
    } catch (err) {
      throw new errors.BadRequest("Current password is incorrect.", {
        errors: { oldPassword: "Current password is incorrect." }
      });
    }

    const u = (await usersService.patch(
      <NullableId>user[<keyof User>usersServiceIdName],
      {
        password: newPassword
      }
    )) as User;

    return u;
  };
