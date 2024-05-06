import { ArrayElement } from "./ArrayElement";
import z from "zod";

export const AllRoles = [
  'SystemAlertSubscriber',
  'PrivilegedRoleManager',
  'UserManager',
  'GroupManager',
  'SummaryEngineer',
  'PartnershipManager',
  'PartnershipAssessor',
  'InterviewManager',
  'Mentor',
  'Mentee',
  'Interviewer',
] as const;

export const RoleProfiles: { [key: string]: {
  // You may ask, why not simply use displayName as the role key?
  // Well, we're just too lazy to type Chinese characters everywhere.
  displayName: string,

  actions: string,

  // If the role can be automatically added to or removed from users.
  automatic?: boolean,

  privilegedUserDataAccess: boolean,
}} = {
  SystemAlertSubscriber: {
    displayName: '',
    actions: '',
    privilegedUserDataAccess: false,
  },
  PrivilegedRoleManager: {
    displayName: '',
    actions: '',
    privilegedUserDataAccess: false,
  },
  UserManager: {
    displayName: '',
    actions: '',
    privilegedUserDataAccess: true,
  },
  GroupManager: {
    displayName: '',
    actions: '',
    privilegedUserDataAccess: true,
  },
  SummaryEngineer: {
    displayName: '',
    actions: '',
    privilegedUserDataAccess: true,
  },
  PartnershipManager: {
    displayName: '',
    actions: '',
    privilegedUserDataAccess: false,
  },
  PartnershipAssessor: {
    displayName: '',
    actions: '',
    privilegedUserDataAccess: true,
  },
  InterviewManager: {
    displayName: '',
    actions: '',
    privilegedUserDataAccess: true,
  },
  Mentor: {
    displayName: '',
    actions: '',
    privilegedUserDataAccess: false,
    automatic: true,
  },
  Mentee: {
    displayName: '',
    actions: '',
    privilegedUserDataAccess: false,
    automatic: true,
  },
  Interviewer: {
    displayName: '',
    actions: '',
    privilegedUserDataAccess: false,
    automatic: true,
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