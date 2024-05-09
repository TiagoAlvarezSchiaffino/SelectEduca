import { TRPCError } from "@trpc/server";

type Kind = "User" | "Group" | "Evaluation" | "One-on-One Match" | "Senior Mentor Match" | "Interview" | "Interview Feedback" | "Application Data" | "Interview Discussion" | "Meeting Transcript"
  | "Discussion Space" | "Discussion Message" | "Student";

export const notFoundError = (kind: Kind, id: string) =>
  new TRPCError({ code: 'NOT_FOUND', message: `${kind} ${id} does not exist.` });

export const noPermissionError = (kind: Kind, id?: string) =>
  new TRPCError({ code: 'FORBIDDEN', message: `No permission to access ${kind}${id ? ` ${id}` : ""}.` });

export const alreadyExistsErrorMessage = (kind: Kind) => `${kind} already exists.`;

export const alreadyExistsError = (kind: Kind) =>
  new TRPCError({ code: 'BAD_REQUEST', message: alreadyExistsErrorMessage(kind) });

export const generalBadRequestError = (message: string) =>
  new TRPCError({ code: 'BAD_REQUEST', message });

export const conflictError = () =>
  new TRPCError({ code: "CONFLICT", message: "Version conflict" });

export const notImplemnetedError = () =>
  new TRPCError({ code: "METHOD_NOT_SUPPORTED", message: "Feature not yet implemented" });
