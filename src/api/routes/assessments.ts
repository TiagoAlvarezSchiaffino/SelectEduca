import { procedure, router } from "../trpc";
import { authUser } from "../auth";
import _ from "lodash";
import db from "../database/db";
import { z } from "zod";
import { zAssessment } from "../../shared/Assessment";
import Partnership from "../database/models/Mentorship";
import { TRPCError } from "@trpc/server";
import { noPermissionError, notFoundError } from "../errors";
import { partnershipInclude } from "api/database/models/attributesAndIncludes";
import { isPermitted } from "shared/Role";

/**
 * @returns the ID of the created assessment.
 */
const create = procedure
  .use(authUser('MentorshipAssessor'))
  .input(z.object({
    partnershipId: z.string().uuid(),
  }))
  .output(z.string())
  .mutation(async ({ input }) => 
{
  return (await db.Assessment.create({
    partnershipId: input.partnershipId,
  })).id;
});

const update = procedure
  .use(authUser('MentorshipAssessor'))
  .input(z.object({
    id: z.string().uuid(),
    summary: z.string(),
  }))
  .mutation(async ({ input }) => 
{
  const a = await db.Assessment.findByPk(input.id);
  if (!a) throw notFoundError("", input.id);
  await a.update({
    summary: input.summary,
  });
});

const get = procedure
  .use(authUser('MentorshipAssessor'))
  .input(z.string())
  .output(zAssessment)
  .query(async ({ input: id }) =>  
{
  const res = await db.Assessment.findByPk(id, {
    include: [{
      model: Partnership,
      include: partnershipInclude,
    }],
  });
  if (!res) throw new TRPCError({
    code: "NOT_FOUND",
    message: ` ${id} not found`,
  });
  return res;
});

/**
 * Only the mentor of the specified partnership and mentor coaches are allowed to use this API.
 */
const listAllForMentorship = procedure
  .use(authUser())
  .input(z.string())
  .query(async ({ ctx, input: id }) => 
{
  const p = await db.Mentorship.findByPk(mentorshipId, { attributes: ["mentorId"] });
  if (p?.mentorId !== ctx.user.id && !isPermitted(ctx.user.roles, "MentorCoach")) {
    throw noPermissionError("one-to-one matching", id);
  }

  return await db.Assessment.findAll({
    where: { partnershipId: id }
  });
});


const routes = router({
  create,
  get,
  update,
  listAllForMentorship,
});

export default routes;