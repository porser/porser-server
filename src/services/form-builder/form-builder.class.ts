import errors from "@feathersjs/errors";
import { Params } from "@feathersjs/feathers";
import { NedbServiceOptions, Service } from "feathers-nedb";
import type { FormBuilderEntity } from "models/form-builder.model";
import { UserEntity } from "models/user.model";
import type { Application } from "types";
import { checkAgainstUser } from "utils/service-utilities";

export class FormBuilder extends Service {
  private app: Application;

  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<NedbServiceOptions>, app: Application) {
    super(options);

    this.app = app;
  }

  async create(
    data: Pick<FormBuilderEntity, "serializedString">,
    params?: Params
  ) {
    const user = <UserEntity | undefined>params?.user;

    if (!user) {
      throw new errors.BadRequest("User not found", {
        reason: "userNotFound"
      });
    }

    checkAgainstUser(user, ["isVerified"]);

    const usersService = this.app.service("users");
    const usersServiceIdName = usersService.id as string;

    const userId = <string>user[<keyof UserEntity>usersServiceIdName];

    // Call the original `create` method with existing `params` and new data
    return super.create({ userId, serializedString: data }, params);
  }
}
