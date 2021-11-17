import NeDB from "nedb";
import path from "path";
import type { Application } from "types";

export interface RefreshTokenEntity {
  _id?: string;
  userId: string;
  refreshToken: string;
  isValid: boolean;
  deviceId?: string;
  location?: string;
}

const createTokenModel = (app: Application) => {
  const dbPath = <string>app.get("nedb");

  const Model = new NeDB<RefreshTokenEntity>({
    filename: path.join(dbPath, "refresh-tokens.db"),
    autoload: true
  });

  Model.ensureIndex({ fieldName: "userId", unique: true });

  return Model;
};

export default createTokenModel;
