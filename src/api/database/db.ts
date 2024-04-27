import User from "./models/User";
import Group from "./models/Group";
import GroupUser from "./models/GroupUser";
import Transcript from "./models/Transcript";
import Summary from "./models/Summary";
import OngoingMeetingCount from "./models/OngoingMeetingCount";
import Partnership from './models/Partnership';
import Assessment from "./models/Assessment";

const db = {
  Partnership,
  User,
  Group, 
  GroupUser, 
  Transcript, 
  Summary, 
  OngoingMeetingCount,
  Assessment,
};

export default db;