import { z } from "zod";
import { zRoles } from "./Role";

export const zMinUser = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
});
export type MinUser = z.TypeOf<typeof zMinUser>;

export const zUser = zMinUser.merge(z.object({
  roles: zRoles,
  email: z.string().email(),
  // For some reason coerce is needed to avoid zod input validation error. TODO use string()
  consentFormAcceptedAt: z.coerce.date().nullable(),
  menteeInterviewerTestLastPassedAt: z.coerce.string().nullable(),
}));
type User = z.TypeOf<typeof zUser>;

// TODO: export as non-default
export default User;

export const zUserFilter = z.object({
  hasMenteeApplication: z.boolean().optional(),
  isMenteeInterviewee: z.boolean().optional(),
  matchNameOrEmail: z.string().optional(),
});
export type UserFilter = z.TypeOf<typeof zUserFilter>;