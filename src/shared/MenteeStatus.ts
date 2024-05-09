import z from "zod";

export const AllMenteeStatuses = [
  "Waiting for interview",
  "Current students",
  "Active alumni",
  "Exit alumni",
  "Jacky",
] as const;

export type MenteeStatus = typeof AllMenteeStatuses[number];

export const zMenteeStatus = z.enum(AllMenteeStatuses);