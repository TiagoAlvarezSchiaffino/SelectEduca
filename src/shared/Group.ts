import { z } from "zod";
import { zMinUserProfile } from "./UserProfile";
import { zRoles } from "./Role";

export const zGroup = z.object({
  id: z.string(),
  name: z.string().nullable(),
  roles: zRoles,
  users: z.array(zMinUserProfile),
  partnershipId: z.string().uuid().nullable(),
  interviewId: z.string().uuid().nullable(),
  calibrationId: z.string().uuid().nullable(),
});
export type Group = z.TypeOf<typeof zGroup>;

export const zGroupCountingTranscripts = zGroup.merge(z.object({
  transcripts: z.array(z.object({}))
}));
export type GroupCountingTranscripts = z.TypeOf<typeof zGroupCountingTranscripts>;

export function isOwned(g: Group) {
  return g.partnershipId || g.interviewId || g.calibrationId;
}

export const whereUnowned = { partnershipId: null, interviewId: null, calibrationId: null };