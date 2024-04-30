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
] as const;

export const RoleProfiles: { [key: string]: {
  // You may ask, why not simply use displayName as the role key?
  // Well, we're just too lazy to type Chinese characters everywhere.
  displayName: string,

  actions: string,

  privileged: boolean,

  privilegedUserDataAccess: boolean,
}} = {
  SystemAlertSubscriber: {
    displayName: '',
    actions: '',
    privileged: true,
    privilegedUserDataAccess: false,
  },
  PrivilegedRoleManager: {
    displayName: '',
    actions: '',
    privileged: true,
    privilegedUserDataAccess: false,
  },
  UserManager: {
    displayName: '',
    actions: '',
    privileged: true,
    privilegedUserDataAccess: true,
  },
  GroupManager: {
    displayName: '',
    actions: '',
    privileged: true,
    privilegedUserDataAccess: true,
  },
  SummaryEngineer: {
    displayName: '',
    actions: '',
    privileged: true,
    privilegedUserDataAccess: true,
  },
  PartnershipManager: {
    displayName: '',
    actions: '',
    privileged: true,
    privilegedUserDataAccess: false,
  },
  PartnershipAssessor: {
    displayName: '',
    actions: '',
    privileged: true,
    privilegedUserDataAccess: true,
  },
  InterviewManager: {
    displayName: '',
    actions: '',
    privileged: true,
    privilegedUserDataAccess: false,
  },
  Mentor: {
    displayName: '',
    actions: '',
    privileged: false,
    privilegedUserDataAccess: false,
  },
  Mentee: {
    displayName: '',
    actions: '',
    privileged: false,
    privilegedUserDataAccess: false,
  },
}

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