import { ArrayElement } from "./utils/ArrayElement";
import z from "zod";

export const AllRoles = [
  'UserManager',
  'SummaryEngineer',
] as const;

type Role = ArrayElement<typeof AllRoles>;

export default Role;

export const zRoles = z.array(z.enum(AllRoles));

export function isPermitted(userRoles : Role[], permitted?: Role) {
  return permitted === undefined || userRoles.includes(permitted);
}