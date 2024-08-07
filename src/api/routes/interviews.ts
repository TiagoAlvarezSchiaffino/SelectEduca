import { procedure, router } from "../trpc";
import { authUser } from "../auth";
import { z } from "zod";
import db from "../database/db";
import { zInterview, zInterviewWithGroup } from "../../shared/Interview";
import { groupAttributes, groupInclude, interviewInclude, interviewAttributes } from "../database/models/attributesAndIncludes";
import sequelizeInstance from "../database/sequelizeInstance";
import { conflictError, generalBadRequestError, noPermissionError, notFoundError } from "../errors";
import invariant from "tiny-invariant";
import { createGroup, updateGroup } from "./groups";
import { formatUserName } from "../../shared/strings";
import Group from "../database/models/Group";
import { getCalibrationAndCheckPermissionSafe, syncCalibrationGroup } from "./calibrations";
import { InterviewType, zInterviewType } from "../../shared/InterviewType";
import { isPermitted } from "shared/Role";
import { date2etag } from "./interviewFeedbacks";
import { zFeedbackDeprecated } from "../../shared/InterviewFeedback";

/**
 * Only MenteeManagers, interviewers of the interview, and users allowed by `checkCalibrationPermission` are allowed
 * to call this route.
 */
const get = procedure
  .use(authUser())
  .input(z.string())
  .output(z.object({
    interviewWithGroup: zInterviewWithGroup,
    etag: z.number(),
  }))
  .query(async ({ ctx, input: id }) =>
{
  const i = await db.Interview.findByPk(id, {
    attributes: [...interviewAttributes, "calibrationId", "decisionUpdatedAt"],
    include: [...interviewInclude, {
      model: Group,
      attributes: groupAttributes,
      include: groupInclude,
    }],
  });
  if (!i) throw notFoundError("", id);

  const ret = {
    interviewWithGroup: i,
    etag: date2etag(i.decisionUpdatedAt),
  };

  if (isPermitted(ctx.user.roles, "MenteeManager")) return ret;

  if (i.feedbacks.some(f => f.interviewer.id === ctx.user.id)) return ret;

  if (i.calibrationId && await getCalibrationAndCheckPermissionSafe(ctx.user, i.calibrationId)) return ret;

  throw noPermissionError("", id);
});

const list = procedure
  .use(authUser("MenteeManager"))
  .input(zInterviewType)
  .output(z.array(zInterview))
  .query(async ({ input: type }) =>
{
  return await db.Interview.findAll({
    where: { type },
    attributes: interviewAttributes,
    include: interviewInclude,
  });
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
      include: interviewInclude
    }]
  })).map(feedback => feedback.interview);
});

/**
 * @returns the interview id.
 */
const create = procedure
  .use(authUser("MenteeManager"))
  .input(z.object({
    type: zInterviewType,
    calibrationId: z.string().nullable(),
    intervieweeId: z.string(),
    interviewerIds: z.array(z.string()),
  }))
  .mutation(async ({ input }) =>
{
  return await createInterview(input.type, input.calibrationId, input.intervieweeId, input.interviewerIds);
});

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

    await createGroup(null, [intervieweeId, ...interviewerIds], null, i.id, null, null, transaction);

    if (calibrationId) await syncCalibrationGroup(calibrationId, transaction);
    return i.id;
  });
}

const update = procedure
  .use(authUser("MenteeManager"))
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
});

/**
 * @return etag
 */
const updateDecision = procedure
  .use(authUser("MenteeManager"))
  .input(z.object({
    interviewId: z.string(),
    decision: zFeedbackDeprecated,
    etag: z.number(),
  }))
  .output(z.number())
  .mutation(async ({ input }) =>
{
  return await sequelizeInstance.transaction(async transaction => {
    const i = await db.Interview.findByPk(input.interviewId, {
      attributes: ["id", "decisionUpdatedAt"],
      transaction,
      lock: true,
    });
    if (!i) throw notFoundError("", input.interviewId);
    if (date2etag(i.decisionUpdatedAt) !== input.etag) throw conflictError();

    i.decision = input.decision;
    const now = new Date();
    await i.update({
      decision: input.decision,
      decisionUpdatedAt: now,
    }, { transaction });
    return date2etag(now);
  });
});

export async function updateInterview(id: string, type: InterviewType, calibrationId: string | null,
  intervieweeId: string, interviewerIds: string[]) 
{
  validate(intervieweeId, interviewerIds);

  await sequelizeInstance.transaction(async (transaction) => {
    const i = await db.Interview.findByPk(id, {
      include: [...interviewInclude, Group],
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
        throw generalBadRequestError(`Interviewer ${formatUserName(f.interviewer.name)} has already submitted feedback and cannot be removed`);
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
    await updateGroup(i.group.id, null, i.group.public, 
      [intervieweeId, ...interviewerIds], transaction);
    // Update calibration. When the interviwer list is updated, the calibration group needs an update, too.
    if (calibrationId) await syncCalibrationGroup(calibrationId, transaction);
    if (oldCalibrationId && oldCalibrationId !== calibrationId) {
      await syncCalibrationGroup(oldCalibrationId, transaction);
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
  updateDecision,
});