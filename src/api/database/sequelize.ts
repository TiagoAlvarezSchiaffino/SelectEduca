import { Sequelize } from "sequelize-typescript";
import apiEnv from "../apiEnv";
import { hookIsPartialAfterSequelizeInit } from "./modelHelpers/ZodColumn";
import db from "./db";

const sequelize = new Sequelize(apiEnv.DATABASE_URI, {
  models: Object.values(db),
  logging: false,
  dialectModule: require('pg'),
  retry: {
    match: [
      /ConnectionError/
    ],
    max: 3
}
});

hookIsPartialAfterSequelizeInit();

export default sequelize;