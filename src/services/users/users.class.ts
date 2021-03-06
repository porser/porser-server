import type { Params } from "@feathersjs/feathers";
import crypto from "crypto";
import { NedbServiceOptions, Service } from "feathers-nedb";
import type { UserEntity } from "models/user.model";
import type { Application } from "types.d";

// The Gravatar image service
const gravatarUrl = "https://s.gravatar.com/avatar";

// The size query
const query = "s=60";

// Returns the Gravatar image for an email
const getGravatar = (email: string) => {
  // Gravatar uses MD5 hashes from an email address (all lowercase) to get the image
  const hash = crypto
    .createHash("md5")
    .update(email.toLowerCase())
    .digest("hex");

  // Return the full avatar URL
  return `${gravatarUrl}/${hash}?${query}`;
};

export class Users extends Service<UserEntity> {
  private app: Application;

  constructor(options: Partial<NedbServiceOptions>, app: Application) {
    super(options);

    this.app = app;
  }

  getApp() {
    return this.app;
  }

  async create(data: UserEntity, params?: Params) {
    // This is the information we want from the user signup data
    const { email, password } = data;

    // Use the existing avatar image or return the Gravatar for the email
    const avatar = data.avatar || getGravatar(email);

    const userData: UserEntity = {
      email,
      password,
      avatar,
      isVerified: false
    };

    // Call the original `create` method with existing `params` and new data
    return super.create(userData, params);
  }
}
