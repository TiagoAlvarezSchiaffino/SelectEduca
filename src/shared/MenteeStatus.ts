import z from "zod";

/**
 * null status means pending screening
 */
export const AllMenteeStatuses = [
  "Initial occupation",
  "Face evidence",

  "Current students",
  "Scholarship only",

  "Active alumni",
  "Exit alumni",
  "Persuade to quit",
  "Jacky",
] as const;

export type MenteeStatus = typeof AllMenteeStatuses[number];

export const zMenteeStatus = z.enum(AllMenteeStatuses);