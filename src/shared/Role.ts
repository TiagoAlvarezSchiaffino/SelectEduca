import { ArrayElement } from "./ArrayElement";
import z from "zod";

export const AllRoles = [
  'UserManager',
  'GroupManager',
  'SummaryEngineer',
] as const;

export const RoleProfiles: { [key: string]: {
  displayName: string,
  actions: string,
  dataAccess: string,
}} = {
  UserManager: {
    displayName: '',
    actions: '',
    dataAccess: '',
  },
  GroupManager: {
    displayName: '',
    actions: '',
    dataAccess: '',
  },
  SummaryEngineer: {
    displayName: '',
    actions: '',
    dataAccess: '',
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