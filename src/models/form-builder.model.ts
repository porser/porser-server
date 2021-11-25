import NeDB from "nedb";
import path from "path";
import type { Application } from "types";

export interface FormBuilderEntity {
  _id?: string;
  userId: string;
  serializedString: string;
}

const createModel = (app: Application) => {
  const dbPath = <string>app.get("nedb");

  const Model = new NeDB<FormBuilderEntity>({
    filename: path.join(dbPath, "form-builder.db"),
    autoload: true
  });

  Model.ensureIndex({ fieldName: "userId", unique: true });

  return Model;
};

export default createModel;
