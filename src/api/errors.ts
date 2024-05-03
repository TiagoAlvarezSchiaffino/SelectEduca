import { TRPCError } from "@trpc/server";

type Kind = "" | "" | "";

export const notFoundError = (kind: Kind, id: string) =>
  new TRPCError({ code: 'NOT_FOUND', message: `${kind} ${id} ` });

export const noPermissionError = (kind: Kind, id?: string) =>
  new TRPCError({ code: 'FORBIDDEN', message: `${kind}${id ? ` ${id}` : ""}。` });

export const alreadyExistsErrorMessage = (kind: Kind) => `${kind}`;

export const alreadyExistsError = (kind: Kind) =>
  new TRPCError({ code: 'BAD_REQUEST', message: alreadyExistsErrorMessage(kind) });

export const generalBadRequestError = (message: string) =>
  new TRPCError({ code: 'BAD_REQUEST', message });

export const notImplemnetedError = () =>
  new TRPCError({ code: "METHOD_NOT_SUPPORTED", message: "" });