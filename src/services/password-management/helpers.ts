import errors from "@feathersjs/errors";
import type { NullableId, Paginated } from "@feathersjs/feathers";
import type { UserEntity } from "models/user.model";
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
  async (email: UserEntity["email"]): Promise<Partial<UserEntity>> => {
    if (!email)
      throw new errors.BadRequest("Email is missing.", { field: "email" });

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
        text: `http://localhost:3000/reset-password?token=${user.resetToken}`
      });

      return user;
    }

    const u1 = {
      ...user,
      resetExpires: new Date(Date.now() + RESET_DELAY),
      resetToken: `${<string>(
        user[<keyof UserEntity>usersServiceIdName]
      )}___${await generateToken()}`
    };

    await sendEmail({
      from: "Porser <no-reply@porser.io>",
      to: u1.email,
      subject: "Reset Password",
      text: `http://localhost:3000/reset-password?token=${u1.resetToken}`
    });

    const u2 = (await usersService.patch(
      <NullableId>u1[<keyof UserEntity>usersServiceIdName],
      {
        resetExpires: u1.resetExpires,
        resetToken: u1.resetToken
      }
    )) as UserEntity;

    return u2;
  };

export const verifyResetToken =
  (app: Application) =>
  async (
    token: NonNullable<UserEntity["resetToken"]>
  ): Promise<Partial<UserEntity>> => {
    if (!token)
      throw new errors.BadRequest("Token is missing", { field: "token" });

    const usersService = app.service("users");

    const user: UserEntity | Paginated<UserEntity> = await usersService.get(
      constructIdFromToken(token)
    );

    if (!user) {
      throw new errors.BadRequest("User not found", {
        reason: "userNotFound"
      });
    }

    checkAgainstUser(user, ["resetNotExpired", "isVerified"]);

    if (token !== user.resetToken) {
      throw new errors.BadRequest(
        "Reset Token is incorrect. Try to get a new one.",
        { reason: "incorrectToken" }
      );
    }

    return user;
  };

export const resetPwd =
  (app: Application) =>
  async (
    password: NonNullable<UserEntity["password"]>,
    token: NonNullable<UserEntity["resetToken"]>
  ): Promise<Partial<UserEntity>> => {
    if (!password)
      throw new errors.BadRequest("Password is missing", { field: "password" });

    const usersService = app.service("users");
    const usersServiceIdName = usersService.id as string;

    const user = await verifyResetToken(app)(token);

    const u = (await usersService.patch(
      <NullableId>user[<keyof UserEntity>usersServiceIdName],
      {
        password,
        resetExpires: undefined,
        resetToken: undefined
      }
    )) as UserEntity;

    return u;
  };

export const changePwd =
  (app: Application) =>
  async (
    email: UserEntity["email"],
    oldPassword: NonNullable<UserEntity["password"]>,
    newPassword: NonNullable<UserEntity["password"]>
  ): Promise<Partial<UserEntity>> => {
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
      <NullableId>user[<keyof UserEntity>usersServiceIdName],
      {
        password: newPassword
      }
    )) as UserEntity;

    return u;
  };
