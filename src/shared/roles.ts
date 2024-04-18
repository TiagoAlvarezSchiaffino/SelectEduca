import { ArrayElement } from "./utils/ArrayElement";
import z from "zod";

export const ALL_ROLES = [
  // Implict to all users. Not to be persisted in the User table.
  'Anyone',
  
  'ADMIN',

  'AI Researcher',

  // DEPRECATED. Do not use. TODO: remove it from all dbs (including all local dev dbs).
  'VISITOR',
] as const;

export type Role = ArrayElement<typeof ALL_ROLES>;

export const zRoles = z.array(z.enum(ALL_ROLES));

const ACL = {
  'me:read': ['ADMIN', 'VISITOR'] as Role[],
  'me:write': ['ADMIN', 'VISITOR'] as Role[],
  'my-groups:read': ['ADMIN', 'VISITOR'] as Role[],
  'my-groups:write': ['ADMIN', 'VISITOR'] as Role[],

  'users:read': ['ADMIN'] as Role[],
  'users:write': ['ADMIN'] as Role[],
  'groups:read': ['ADMIN'] as Role[],
  'groups:write': ['ADMIN'] as Role[],

  'open-to-all': ['ADMIN', 'VISITOR'] as Role[],
} as const;

type StringKeys<objType extends {}> = Array<Extract<keyof objType, string>>

export type Resource = ArrayElement<StringKeys<typeof ACL>>;

export function isPermitted(userRoles : Role[], permitted: Role) {
  return permitted === 'Anyone' || userRoles.includes(permitted); 
}

export const isPermittedDeprecated = (roles: Role[], resource: Resource) => {
  if (ACL[resource].includes('VISITOR')) return true;
  for (const r of roles) {
    if (ACL[resource].includes(r)) {
      return true;
    }
  }

  return false;
}