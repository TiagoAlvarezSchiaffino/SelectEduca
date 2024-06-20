import User from "./models/User";
import Group from "./models/Group";
import GroupUser from "./models/GroupUser";
import Transcript from "./models/Transcript";
import Summary from "./models/Summary";
import OngoingMeetings from "./models/OngoingMeetings";
import Mentorship from './models/Mentorship';
import Assessment from "./models/Assessment";
import Interview from "./models/Interview";
import InterviewFeedback from "./models/InterviewFeedback";
import Calibration from "./models/Calibration";
import InterviewFeedbackUpdateAttempt from "./models/InterviewFeedbackUpdateAttempt";
import ChatRoom from "./models/ChatRoom";
import ChatMessage from "./models/ChatMessage";

const db = {
  Mentorship,
  User,
  Group,
  GroupUser,
  Transcript,
  Summary,
  OngoingMeetings,
  Assessment,
  Interview,
  InterviewFeedback,
  InterviewFeedbackUpdateAttempt,
  Calibration,
  ChatRoom,
  ChatMessage,
};

export default db;