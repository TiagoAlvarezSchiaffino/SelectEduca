import { procedure, router } from "../trpc";
import { authUser } from "../auth";
import { z } from "zod";
import db from "../database/db";
import { zInterview, zInterviewWithGroup } from "../../shared/Interview";
import { groupAttributes, includeForGroup, includeForInterview, interviewAttributes } from "../database/models/attributesAndIncludes";
import sequelizeInstance from "../database/sequelizeInstance";
import { generalBadRequestError, noPermissionError, notFoundError } from "../errors";
import invariant from "tiny-invariant";
import { createGroup, updateGroup } from "./groups";
import { formatUserName } from "../../shared/strings";
import Group from "../database/models/Group";
import { getCalibrationAndCheckPermissionSafe, syncCalibrationGroup } from "./calibrations";
import { InterviewType, zInterviewType } from "../../shared/InterviewType";
import { isPermitted } from "shared/Role";

/**
 * Only InterviewManagers, interviewers of the interview, and users allowed by `checkCalibrationPermission` are allowed
 * to call this route.
 */
const get = procedure
  .use(authUser())
  .input(z.string())
  .output(zInterviewWithGroup)
  .query(async ({ ctx, input: id }) =>
{
  const i = await db.Interview.findByPk(id, {
    attributes: [...interviewAttributes, "calibrationId"],
    include: [...includeForInterview, {
      model: Group,
      attributes: groupAttributes,
      include: includeForGroup,
    }],
  });
  if (!i) throw notFoundError("", id);

  if (isPermitted(ctx.user.roles, "InterviewManager")) return i;

  if (i.feedbacks.some(f => f.interviewer.id === ctx.user.id)) return i;

  if (i.calibrationId && await getCalibrationAndCheckPermissionSafe(ctx.user, i.calibrationId)) return i;

  throw noPermissionError("", id);
});

const list = procedure
  .use(authUser("InterviewManager"))
  .input(zInterviewType)
  .output(z.array(zInterview))
  .query(async ({ input: type }) =>
{
  return await db.Interview.findAll({
    where: { type },
    attributes: interviewAttributes,
    include: includeForInterview,
  })
});

const listMine = procedure
  .use(authUser())
  .output(z.array(zInterview))
  .query(async ({ ctx }) =>
{
  return (await db.InterviewFeedback.findAll({
    where: { interviewerId: ctx.user.id },
    attributes: [],
    include: [{
      model: db.Interview,
      attributes: interviewAttributes,
      include: includeForInterview
    }]
  })).map(feedback => feedback.interview);
});

/**
 * @returns the interview id.
 */
const create = procedure
  .use(authUser("InterviewManager"))
  .input(z.object({
    type: zInterviewType,
    calibrationId: z.string().nullable(),
    intervieweeId: z.string(),
    interviewerIds: z.array(z.string()),
  }))
  .mutation(async ({ input }) =>
{
  return await createInterview(input.type, input.calibrationId, input.intervieweeId, input.interviewerIds);
})

/**
 * @returns the interview id.
 */
export async function createInterview(type: InterviewType, calibrationId: string | null, 
  intervieweeId: string, interviewerIds: string[]
): Promise<string> {
  validate(intervieweeId, interviewerIds);

  return await sequelizeInstance.transaction(async (transaction) => {
    const i = await db.Interview.create({
      type, intervieweeId, calibrationId,
    }, { transaction });
    await db.InterviewFeedback.bulkCreate(interviewerIds.map(id => ({
      interviewId: i.id,
      interviewerId: id,
    })), { transaction });

    // Update roles
    for (const interviwerId of interviewerIds) {
      const u = await db.User.findByPk(interviwerId);
      invariant(u);
      if (u.roles.some(r => r == "Interviewer")) continue;
      u.roles = [...u.roles, "Interviewer"];
      await u.save({ transaction });
    }

    await createGroup(null, [intervieweeId, ...interviewerIds], null, i.id, null, transaction);

    if (calibrationId) await syncCalibrationGroup(calibrationId, transaction);
    return i.id;
  });
}

const update = procedure
  .use(authUser("InterviewManager"))
  .input(z.object({
    id: z.string(),
    type: zInterviewType,
    calibrationId: z.string().nullable(),
    intervieweeId: z.string(),
    interviewerIds: z.array(z.string()),
  }))
  .mutation(async ({ input }) =>
{
  await updateInterview(input.id, input.type, input.calibrationId, input.intervieweeId, input.interviewerIds);
})

export async function updateInterview(id: string, type: InterviewType, calibrationId: string | null,
  intervieweeId: string, interviewerIds: string[]) 
{
  validate(intervieweeId, interviewerIds);

  await sequelizeInstance.transaction(async (transaction) => {
    const i = await db.Interview.findByPk(id, {
      include: [...includeForInterview, Group],
      transaction
    });

    if (!i) {
      throw notFoundError("", id);
    }
    if (type !== i.type) {
      throw generalBadRequestError("");
    }
    if (intervieweeId !== i.intervieweeId && i.feedbacks.some(f => f.feedbackUpdatedAt != null)) {
      throw generalBadRequestError("");
    }
    for (const f of i.feedbacks) {
      if (f.feedbackUpdatedAt && !interviewerIds.includes(f.interviewer.id)) {
        throw generalBadRequestError(`${formatUserName(f.interviewer.name, "formal")}`);
      }
  }

    // Update interviwee
    const oldCalibrationId = i.calibrationId;
    await i.update({ intervieweeId, calibrationId }, { transaction });
    // Remove interviwers
    for (const f of i.feedbacks) {
      if (!interviewerIds.includes(f.interviewer.id)) {
        await f.destroy({ transaction });
      }
    }
    // Add interviewers
    for (const ir of interviewerIds) {
      if (!i.feedbacks.some(f => ir === f.interviewer.id)) {
        await db.InterviewFeedback.create({
          interviewId: i.id,
          interviewerId: ir,
        }, { transaction });
      }
    }
    // Update roles
    for (const interviwerId of interviewerIds) {
      const u = await db.User.findByPk(interviwerId, { transaction });
      invariant(u);
      if (u.roles.some(r => r == "Interviewer")) continue;
      u.roles = [...u.roles, "Interviewer"];
      u.save({ transaction });
    }
    // Update group
    await updateGroup(i.group.id, null, [intervieweeId, ...interviewerIds], transaction);
    // Update calibration
    if (oldCalibrationId !== calibrationId) {
      if (oldCalibrationId) await syncCalibrationGroup(oldCalibrationId, transaction);
      if (calibrationId) await syncCalibrationGroup(calibrationId, transaction);
    }
  });
}

function validate(intervieweeId: string, interviewerIds: string[]) {
  if (interviewerIds.some(id => id === intervieweeId)) {
    throw generalBadRequestError("");
  }
}

export default router({
  get,
  list,
  listMine,
  create,
  update,
});