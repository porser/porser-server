import NeDB from "nedb";
import path from "path";
import type { Application } from "types.d";

export interface User {
  _id?: string;
  email: string;
  password: string;
  name?: string;
  avatar?: string;
  githubId?: string;
}

const createUserModel = (app: Application) => {
  const dbPath = app.get("nedb") as string;

  const Model = new NeDB<User>({
    filename: path.join(dbPath, "users.db"),
    autoload: true
  });

  Model.ensureIndex({ fieldName: "email", unique: true });

  return Model;
};

export default createUserModel;
