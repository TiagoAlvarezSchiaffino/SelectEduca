import z from "zod";

export const AllRoles = [
  'SystemAlertSubscriber',
  'UserManager',
  'GroupManager',
  'MentorshipAssessor',
  'MenteeManager',
  'Mentor',
  'Mentee',
  'Interviewer',
  'MentorCoach',

  // Deprecated
  'SummaryEngineer',
  'RoleManager',
] as const;

export const RoleProfiles: { [key: string]: {
  displayName: string,

  actions: string,

  automatic?: boolean,

  privilegedUserDataAccess: boolean,
}} = {
  SystemAlertSubscriber: {
    displayName: 'System Alert Subscriber',
    actions: 'Receive and handle alerts for system abnormal events',
    privilegedUserDataAccess: false,
  },
  UserManager: {
    displayName: 'User Manager',
    actions: 'Manage basic user information',
    privilegedUserDataAccess: true,
  },
  GroupManager: {
    displayName: 'Conference Manager',
    actions: 'Manage meeting breakouts and meeting minutes',
    privilegedUserDataAccess: true,
  },
  MentorshipAssessor: {
    displayName: 'One-on-One Mentor Assessor',
    actions: 'Track and assess the effectiveness of one-on-one mentorship',
    privilegedUserDataAccess: true,
  },
  MenteeManager: {
    displayName: 'Student Administrator',
    actions: 'Manage student information, student interview information, one-to-one tutor matching information, etc.',
    privilegedUserDataAccess: true,
  },
  Mentor: {
    displayName: 'Mentor',
    actions: 'Help young students grow',
    privilegedUserDataAccess: false,
    automatic: true,
  },
  Mentee: {
    displayName: 'Student',
    actions: 'Accept mentorship',
    privilegedUserDataAccess: false,
    automatic: true,
  },
  Interviewer: {
    displayName: 'Interviewer',
    actions: 'Interview mentor or student candidates',
    privilegedUserDataAccess: false,
    automatic: true,
  },
  MentorCoach: {
    displayName: 'Senior Mentor',
    actions: 'Assist and evaluate non-senior mentors',
    privilegedUserDataAccess: true,
    automatic: true,
  },

  // Deprecated
  SummaryEngineer: {
    displayName: 'Deprecated',
    actions: 'Develop automatic meeting summary function',
    privilegedUserDataAccess: false,
  },
  RoleManager: {
    displayName: 'Deprecated',
    actions: 'Manage user roles',
    privilegedUserDataAccess: false,
  },
};

type Role = typeof AllRoles[number];

export default Role;

export const zRoles = z.array(z.enum(AllRoles));

/**
 * @param permitted When absent, this function always returns true.
 */
export function isPermitted(userRoles : Role[], permitted?: Role | Role[]) {
  if (permitted === undefined) return true;
  if (typeof permitted === 'string') return userRoles.includes(permitted);
  return userRoles.some(r => permitted.includes(r));
}