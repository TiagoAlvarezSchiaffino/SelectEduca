import { procedure } from "../trpc";
import z from "zod";
import { generalBadRequestError, notFoundError } from "../errors";
import db from "../database/db";

export default procedure
  .input(z.record(z.string(), z.any()))
  .mutation(async ({ input }) => await submit(input));

export async function submit({ form, entry }: Record<string, any>) {
  if (form !== "w02l95") {
    throw generalBadRequestError(`form id ${form} is not supported.`);
  }

  const name = entry.field_1;
  if (entry.exam_score < 120) {
    console.log(`MenteeInterviewerTest not passed for ${name}. Ignored.`);
    return;
  }

  // There may be multiple users under the same name because users may have used the wrong email to sign up.
  // Update all of them.
  const users = await db.User.findAll({
    where: { name }
  });
  
  for (const user of users) {
    user.menteeInterviewerTestLastPassedAt = new Date().toISOString();
    await user.save();
  }
}
