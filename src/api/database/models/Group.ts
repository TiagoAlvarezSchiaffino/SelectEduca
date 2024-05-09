import type {
  CreationOptional,
} from "sequelize";
import {
  AllowNull,
  BeforeDestroy,
  BelongsToMany,
  Column, 
  Model,
  ForeignKey, 
  HasMany,
  Index,
  Table,
  Default,
  IsUUID,
  Unique,
  PrimaryKey
} from "sequelize-typescript";
import Fix from "../modelHelpers/Fix";
import { ARRAY, BOOLEAN, STRING, UUID, UUIDV4 } from "sequelize";
import GroupUser from "./GroupUser";
import User from "./User";
import Transcript from "./Transcript";
import Partnership from "./Partnership";
import Interview from "./Interview";
import Calibration from "./Calibration";
import Role from "shared/Role";

@Table({ paranoid: true, tableName: "groups", modelName: "group" })
@Fix
class Group extends Model {
  @Unique
  @IsUUID(4)
  @PrimaryKey
  @Default(UUIDV4)
  @Column(UUID)
  id: CreationOptional<string>;

  @AllowNull(true)
  @Column(STRING)
  name: string | null;

  @ForeignKey(() => Partnership)
  @Column(UUID)
  partnershipId: string | null;

  // A user is a member of this group if they are associated with this group via GroupUser,
  // or isPermitted(user.roles, roles) is true.
  @AllowNull(true)
  @Column(ARRAY(STRING))
  roles: Role[];
  
  // A public group allows any registered user to visit the group page via the
  // group URL and join group meeting, and limits the access to group meeting
  // history to group users only.
  @AllowNull(false)
  @Default(false)
  @Column(BOOLEAN)
  public: boolean;

  // A group is said to be "owned" by an interview if this field is non-null.
  @ForeignKey(() => Interview)
  @Column(UUID)
  interviewId: string | null;

    // A group is said to be "owned" by a calibration if this field is non-null.
    //
    // The index is used by getCalibrationAndCheckPermissionSafe()
    @Index  
    @ForeignKey(() => Calibration)
    @Column(UUID)
    calibrationId: string | null;  

  /**
  * Associations
  */

  @BelongsToMany(() => User, { through: () => GroupUser })
  users: User[];
  
  @HasMany(() => GroupUser)
  groupUsers: GroupUser[];
  
  @HasMany(() => Transcript)
  transcripts: Transcript[];
  
  @BeforeDestroy
  static async cascadeDestroy(group: Group, options: any) {
    const promises1 = (await GroupUser.findAll({
      where: { groupId: group.id }
    })).map(async gu => { await gu.destroy(options); });

    const promises2 = (await Transcript.findAll({
      where: { groupId: group.id }
    })).map(async t => { await t.destroy(options); });

    await Promise.all([...promises1, ...promises2]);
  }
}

export default Group;