import User from "./models/User";
import Group from "./models/Group";
import GroupUser from "./models/GroupUser";
import Transcript from "./models/Transcript";
import Summary from "./models/Summary";
import OngoingMeetings from "./models/OngoingMeetings";
import Partnership from './models/Partnership';
import Assessment from "./models/Assessment";

const db = {
  Partnership,
  User,
  Group, 
  GroupUser, 
  Transcript, 
  Summary, 
  OngoingMeetings,
  Assessment,
};

export default db;