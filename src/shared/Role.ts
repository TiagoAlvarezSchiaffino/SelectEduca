import { ArrayElement } from "./ArrayElement";
import z from "zod";

export const AllRoles = [
  'SystemAlertSubscriber',
  'RoleManager',
  'UserManager',
  'GroupManager',
  'SummaryEngineer',
  'MentorshipManager',
  'MentorshipAssessor',
  'InterviewManager',
  'Mentor',
  'Mentee',
  'Interviewer',
  'MentorCoach',

  // Deprecated
  'PrivilegedRoleManager',
  'PartnershipManager',
  'PartnershipAssessor',
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
  RoleManager: {
    displayName: 'Role Manager',
    actions: 'Manage user roles',
    privilegedUserDataAccess: false,
  },
  UserManager: {
    displayName: 'User Manager',
    actions: 'Manage basic user information',
    privilegedUserDataAccess: true,
  },
  GroupManager: {
    displayName: 'Group Manager',
    actions: 'Manage meeting groups',
    privilegedUserDataAccess: true,
  },
  SummaryEngineer: {
    displayName: 'Summary Engineer',
    actions: 'Develop automatic meeting summary function',
    privilegedUserDataAccess: true,
  },
  MentorshipManager: {
    displayName: 'One-on-One Mentor Manager',
    actions: 'Manage mentor matching',
    privilegedUserDataAccess: false,
  },
  MentorshipAssessor: {
    displayName: 'One-on-One Mentor Assessor',
    actions: 'Track and assess the effectiveness of one-on-one mentorship',
    privilegedUserDataAccess: true,
  },
  InterviewManager: {
    displayName: 'Interview Manager',
    actions: 'Manage mentor and student interviews',
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
    PrivilegedRoleManager: {
      displayName: 'Deprecated',
      actions: 'Manage user roles',
      privilegedUserDataAccess: false,
    },
    PartnershipManager: {
      displayName: 'Deprecated',
      actions: 'Manage mentor partnerships',
      privilegedUserDataAccess: false,
    },
    PartnershipAssessor: {
      displayName: 'Deprecated',
      actions: 'Track assessment of one-on-one mentoring effectiveness',
      privilegedUserDataAccess: false,
    },
};

type Role = ArrayElement<typeof AllRoles>;

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