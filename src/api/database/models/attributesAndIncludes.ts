/**
 * Collect things in this file as opposed to model files to avoid cyclic dependencies.
 */
import Calibration from "./Calibration";
import Group from "./Group";
import InterviewFeedback from "./InterviewFeedback";
import Transcript from "./Transcript";
import User from "./User";

/**
 * User
 */

export const minUserAttributes = ['id', 'name'];

export const userAttributes = [...minUserAttributes, "email", "roles", "consentFormAcceptedAt",
  "menteeInterviewerTestLastPassedAt"];
/**
 * Group
 */

export const groupAttributes = ["id", "name", "partnershipId", "interviewId", "calibrationId"];

export const groupInclude = [{
  model: User,
  attributes: minUserAttributes,
}];

export const groupCountingTranscriptsInclude = [...groupInclude,
  {
    model: Transcript,
    attributes: ["transcriptId"],
  }
];

/**
 * Partnership
 */

// Don't include private notes.
export const defaultPartnershipAttributes = ['id', 'menteeId', 'mentorId'];

export const partnershipInclude = [{
  association: 'mentor',
  attributes: minUserAttributes,
}, {
  association: 'mentee',
  attributes: minUserAttributes,
}];

/**
 * InterviewFeedback
 */

export const minInterviewFeedbackAttributes = ["id", "feedbackUpdatedAt"];

export const interviewFeedbackAttributes = [...minInterviewFeedbackAttributes, "feedback"];

export const interviewFeedbackInclude = [{
  model: User,
  attributes: minUserAttributes
}];

/**
 * Callibration
 */

export const calibrationAttributes = ["id", "type", "name", "active", "createdAt"];

export const calibrationInclude = [{
  model: Group,
  attributes: groupAttributes,
  include: groupCountingTranscriptsInclude,
}];

/**
 * Interview
 */

export const interviewAttributes = ["id", "type", "decision"];

export const interviewInclude = [{
  model: User,
  attributes: minUserAttributes,
}, {
  model: InterviewFeedback,
  attributes: minInterviewFeedbackAttributes,
  include: interviewFeedbackInclude,
}, {
  model: Calibration,
  include: calibrationInclude,
}];