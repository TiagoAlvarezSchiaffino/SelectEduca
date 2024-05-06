import { middleware } from "./trpc";
import { TRPCError } from "@trpc/server";
import Role, { isPermitted } from "../shared/Role";
import db from "./database/db";
import invariant from "tiny-invariant";
import apiEnv from "./apiEnv";
import { userAttributes } from "./database/models/attributesAndIncludes";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";

const USER_CACHE_TTL_IN_MS = 60 * 60 * 1000;

/**
 * Authenticate for APIs used by applications as opposed to end users. These applications should use
 * "Bearer ${INTEGRATION_AUTH_TOKEN}" as their authentican token.
 */
export const authIntegration = () => middleware(async ({ ctx, next }) => {
  const token: string | undefined = ctx.req.headers['authorization']?.split(' ')[1];

  if (!token) throw unauthorizedError();
  if (token !== apiEnv.INTEGRATION_AUTH_TOKEN) throw invalidTokenError();
  return await next({ ctx: { baseUrl: ctx.baseUrl } });
});

/**
 * Authenticate for APIs used by end users as opposed to integration applications. All end user auth tokens are
 * acquired from authing.cn.
 */

export const authUser = (permitted?: Role) => middleware(async ({ ctx, next }) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) throw unauthorizedError();

  if (!isPermitted(session.user.roles, permitted)) throw forbiddenError();

  return await next({ ctx: { user: session.user, baseUrl: ctx.baseUrl } });
});

const unauthorizedError = () => new TRPCError({
  code: 'UNAUTHORIZED',
  message: 'Please login first',
});

const invalidTokenError = () => new TRPCError({
  code: 'BAD_REQUEST',
  message: 'Invalid authorization token',
});

const forbiddenError = () => new TRPCError({
  code: 'FORBIDDEN',
  message: 'Access denied',
});