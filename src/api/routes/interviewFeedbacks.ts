import { procedure, router } from "../trpc";
import { authUser } from "../auth";
import { z } from "zod";
import db from "../database/db";
import { interviewFeedbackInclude, interviewFeedbackAttributes } from "../database/models/attributesAndIncludes";
import { conflictError, generalBadRequestError, noPermissionError, notFoundError } from "../errors";
import { zFeedback, zInterviewFeedback } from "../../shared/InterviewFeedback";
import User from "../../shared/User";
import { isPermitted } from "../../shared/Role";
import moment from "moment";
import InterviewFeedback from "api/database/models/InterviewFeedback";
import { getCalibrationAndCheckPermissionSafe } from "./calibrations";

/**
 * Only InterviewManagers, the interviewer of the feedback, and participant's of the interview's calibration (only if
 * the calibration is active) are allowed to call this route.
 */
const get = procedure
  .use(authUser())
  .input(z.string())
  .output(z.object({
    interviewFeedback: zInterviewFeedback,
    etag: z.number(),
  }))
  .query(async ({ ctx, input: id }) =>
{
  const f = await getInterviewFeedback(id, ctx.user, /*allowOnlyInterviewer=*/ false);
  return {
    interviewFeedback: f,
    etag: updatedAt2etag(f.feedbackUpdatedAt),
  }
});

async function getInterviewFeedback(id: string, me: User, allowOnlyInterviewer: boolean) {
  const f = await db.InterviewFeedback.findByPk(id, {
    attributes: [...interviewFeedbackAttributes, "interviewId"],
    include: interviewFeedbackInclude,
  });
  if (!f) throw notFoundError("", id);

  if (f.interviewer.id == me.id) return f;

  if (!allowOnlyInterviewer) {
    if (isPermitted(me.roles, "InterviewManager")) return f;

    // Check if the user is a participant of the interview's calibration and the calibration is active.
    const i = await db.Interview.findByPk(f.interviewId, {
      attributes: ["calibrationId"],
    });
    if (i?.calibrationId && await getCalibrationAndCheckPermissionSafe(me, i.calibrationId)) return f;
  }

  throw noPermissionError("", id);
}

export function updatedAt2etag(feedbackUpdatedAt: string | Date | null) {
  return feedbackUpdatedAt ? moment(feedbackUpdatedAt).unix() : 0;
}

/**
 * Only the interviewer of the feedback are allowed to call this route.
 * 
 * @return etag
 */
const update = procedure
  .use(authUser())
  .input(z.object({
    id: z.string(),
    feedback: zFeedback,
    etag: z.number(),
  }))
  .output(z.number())
  .mutation(async ({ ctx, input }) =>
{
  // TODO: Use transaction
  const f = await getInterviewFeedback(input.id, ctx.user, /*allowOnlyInterviewer=*/ true);
  if (updatedAt2etag(f.feedbackUpdatedAt) !== input.etag) {
    throw conflictError();
  }

  const now = new Date();
  await f.update({
    feedback: input.feedback,
    feedbackUpdatedAt: now,
  });

  return updatedAt2etag(now);
});

const logUpdateAttempt = procedure
  .use(authUser())
  .input(z.object({
    id: z.string(),
    feedback: zFeedback,
    etag: z.number(),
  }))
  .mutation(async ({ ctx, input }) =>
{
  await db.InterviewFeedbackUpdateAttempt.create({
    userId: ctx.user.id,
    interviewFeedbackId: input.id,
    feedback: input.feedback,
    etag: input.etag,
  });
});

export default router({
  get,
  update,
  logUpdateAttempt,
});