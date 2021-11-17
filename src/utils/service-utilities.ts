import errors from "@feathersjs/errors";
import type { Paginated } from "@feathersjs/feathers";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { UserEntity } from "models/user.model";
import nodemailer, { Transporter } from "nodemailer";
import type { Options as MailOptions } from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

type UserChecks =
  | "isNotVerified"
  | "isVerified"
  | "verifyNotExpired"
  | "verifyNotExpired"
  | "resetNotExpired";

export const comparePasswords = (
  oldPassword: string,
  newPassword: string | undefined
): Promise<void> => {
  if (!newPassword) return Promise.reject();

  return new Promise((resolve, reject) => {
    bcrypt.compare(oldPassword, newPassword, (err, data) =>
      err || !data ? reject(err) : resolve()
    );
  });
};

export const checkAgainstUser = (user: UserEntity, checks: UserChecks[]) => {
  if (checks.includes("isNotVerified") && user.isVerified) {
    throw new errors.BadRequest("User is already verified.");
  }

  if (checks.includes("isVerified") && !user.isVerified) {
    throw new errors.BadRequest("User is not verified.");
  }

  if (
    checks.includes("verifyNotExpired") &&
    user.verifyExpires &&
    user.verifyExpires.getTime() < Date.now()
  ) {
    throw new errors.BadRequest("Verification token has expired.");
  }

  if (
    checks.includes("resetNotExpired") &&
    user.resetExpires &&
    user.resetExpires.getTime() < Date.now()
  ) {
    throw new errors.BadRequest("Password reset token has expired.");
  }
};

export const getUserData = (
  users: UserEntity[] | Paginated<UserEntity>,
  checks: UserChecks[] = []
) => {
  if (Array.isArray(users) ? users.length === 0 : users.total === 0) {
    throw new errors.BadRequest("User not found.");
  }

  const _users = Array.isArray(users) ? users : users.data || [users];

  if (_users.length !== 1) {
    throw new errors.BadRequest("More than 1 user selected.");
  }

  const user = _users[0];

  checkAgainstUser(user, checks);

  return user;
};

export const generateToken = (length = 15): Promise<string> => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(length, (err, buf) =>
      err ? reject(err) : resolve(buf.toString("hex"))
    );
  });
};

export const constructIdFromToken = (token: string) => {
  if (!token.includes("___")) {
    throw new errors.BadRequest("Token is not in the correct format.");
  }

  return token.slice(0, token.indexOf("___"));
};

export const emailTransporter =
  (): Transporter<SMTPTransport.SentMessageInfo> => {
    const transportOptions: SMTPTransport.Options = {
      host: process.env.MAIL_HOST,
      port: <number | undefined>process.env.MAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PASS
      }
    };

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport(transportOptions);

    return transporter;
  };

export const sendEmail = async (mailOptions: MailOptions) => {
  const transporter = emailTransporter();

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    throw new errors.GeneralError("Sending email failed.");
  }
};
