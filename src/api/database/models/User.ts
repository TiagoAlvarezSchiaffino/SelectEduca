import type {
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from "sequelize";
import {
  AllowNull,
  Column,
  HasMany,
  Index,
  Table,
  Unique,
} from "sequelize-typescript";
import Fix from "../modelHelpers/Fix";
import ParanoidModel from "../modelHelpers/ParanoidModel";
import { DATE, JSONB, STRING } from "sequelize";
import ZodColumn from "../modelHelpers/ZodColumn";
import Role, { zRoles } from "../../../shared/Role";
import z from "zod";
import { toPinyin } from "../../../shared/strings";
import Interview from "./Interview";

@Table({ tableName: "users", modelName: "user" })
@Fix
class User extends ParanoidModel<
  InferAttributes<User>,
  InferCreationAttributes<User>
  > {
  // Always use `formatUserName` to display user names.
  @Column(STRING)
  name: string;

  @Column(STRING)
  pinyin: string;

  @Unique
  @AllowNull(false)
  @Column(STRING)
  email: string;

  @Index({
    using: 'gin'
  })
  @AllowNull(false)
  @ZodColumn(JSONB, zRoles)
  roles: Role[];

  @Column(DATE)
  consentFormAcceptedAt: Date | null;

  @Column(DATE)
  menteeInterviewerTestLastPassedAt: string | null;

  @Column(STRING)
  sex: string | null;

  @Column(STRING)
  wechat: string | null;

  @ZodColumn(JSONB, z.record(z.string(), z.any()).nullable())
  menteeApplication: Record<string, any> | null;
  
  /**
   * Associations
   */

  @HasMany(() => Interview)
  interviews: NonAttribute<Interview[]>;
}

export default User;

export async function createUser(fields: any) {
  const f = structuredClone(fields);
  if (!("name" in f)) f.name = "";
  f.pinyin = toPinyin(f.name);
  return await User.create(f);
}