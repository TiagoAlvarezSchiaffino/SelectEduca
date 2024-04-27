import { ArrayElement } from "./ArrayElement";
import z from "zod";

export const AllRoles = [
  'UserManager',
  'GroupManager',
  'SummaryEngineer',
  'PartnershipManager',
  'PartnershipAssessor',
  'Mentor',
  'Mentee',
] as const;

export const RoleProfiles: { [key: string]: {
  // You may ask, why not simply use displayName as the role key?
  // Well, we're just too lazy to type Chinese characters everywhere.
  displayName: string,
  actions: string,
  privileged: boolean,
}} = {
  UserManager: {
    displayName: '',
    actions: '',
    privileged: true,
  },
  GroupManager: {
    displayName: '',
    actions: '',
    privileged: true,
  },
  SummaryEngineer: {
    displayName: '',
    actions: '',
    privileged: true,
  },
  PartnershipManager: {
    displayName: '',
    actions: '',
    privileged: true,
  },
  PartnershipAssessor: {
    displayName: '',
    actions: '',
    privileged: true,
  },
  Mentor: {
    displayName: '',
    actions: '',
    privileged: false,
  },
  Mentee: {
    displayName: '',
    actions: '',
    privileged: false,
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