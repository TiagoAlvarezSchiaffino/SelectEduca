import { procedure, router } from "../trpc";
import { authIntegration, authUser } from "../auth";
import { z } from "zod";
import db from "../database/db";
import { getRecordURLs, listRecords } from "../TencentMeeting";
import { TRPCError } from "@trpc/server";
import { safeDecodeMeetingSubject } from "./meetings";
import apiEnv from "api/apiEnv";
import { groupAttributes, groupInclude, summaryAttributes } from "api/database/models/attributesAndIncludes";
import { zSummary } from "shared/Summary";
import { notFoundError } from "api/errors";
import { checkPermissionForGroupHistory } from "./groups";

const crudeSummaryKey = "";

export interface CrudeSummaryDescriptor {
  groupId: string,
  transcriptId: string,
  startedAt: number,
  endedAt: number,
  url: string,
};

const listForIntegration = procedure
  .use(authIntegration())
  .input(z.object({
    key: z.string(),
    excludeTranscriptsWithKey: z.string().optional(),
  }))
  .output(z.array(zSummary))
  .query(async ({ input }) => 
{
  // TODO: Optimize and use a single query to return final results.
  const summaries = await db.Summary.findAll({ 
    where: { 
      summaryKey: input.key,
    },
    attributes: summaryAttributes,
  });

  const skippedTranscriptIds = !input.excludeTranscriptsWithKey ? [] : (await db.Summary.findAll({
    where: { summaryKey: input.excludeTranscriptsWithKey },
    attributes: ['transcriptId'],
  })).map(s => s.transcriptId);

  return summaries.filter(s => !skippedTranscriptIds.includes(s.transcriptId));
});

const list = procedure
  .use(authUser())
  .input(z.string())
  .output(z.array(zSummary))
  .query(async ({ ctx, input: transcriptId }) => 
{
  const t = await db.Transcript.findByPk(transcriptId, {
    attributes: ["transcriptId"],
    include: [{
      model: db.Group,
      attributes: groupAttributes,
      include: groupInclude,
    }, {
      model: db.Summary,
      attributes: summaryAttributes,
    }]
  });

  if (!t) throw notFoundError("", transcriptId);

  checkPermissionForGroup(ctx.user, t.group);

  const { nameMap, summaries } = await getSummariesAndNameMap(transcriptId);

  for (const summary of summaries) {
    try {
      // Compile and update summary
      summary.summary = Handlebars.compile(summary.summary)(nameMap);
    } catch (error) {
      // If there's an error compiling, keep and return the original summaries
      console.error("Error compiling Handlebars template for summary:", summary.transcriptId, summary.summaryKey);
    }
  }
  
  return t.summaries;
});

const write = procedure
  .use(authIntegration())
  .input(zSummary)
  .mutation(async ({ input }) => 
{
  if (input.summaryKey === crudeSummaryKey) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `Summaries with key "${crudeSummaryKey}" are read-only`,
    });
  }
  // By design, this statement fails if the transcript doesn't exist.
  await db.Summary.upsert({
    transcriptId: input.transcriptId,
    summaryKey: input.summaryKey,
    summary: input.summary,
  });
});

const summaries = router({
  list: listForIntegration,
  listToBeRenamed: list,  // TODO: rename to `list`
  write,
});
export default summaries;

export async function saveCrudeSummary(meta: CrudeSummaryDescriptor, summary: string) {
  // `upsert` not `insert` because the system may fail after inserting the transcript row and before inserting the 
  // summary.
  await db.Transcript.upsert({
    transcriptId: meta.transcriptId,
    groupId: meta.groupId,
    startedAt: meta.startedAt,
    endedAt: meta.endedAt,
  });
  await db.Summary.create({
    transcriptId: meta.transcriptId,
    summaryKey: crudeSummaryKey,
    summary
  });
}

export async function findMissingCrudeSummaries(): Promise<CrudeSummaryDescriptor[]> {
  const ret: CrudeSummaryDescriptor[] = [];
  for (const tmUserId of apiEnv.TM_USER_IDS) {
    const promises = (await listRecords(tmUserId))
      // Only interested in meetings that are ready to download.
      .filter(meeting => meeting.state === 3)
      .map(async meeting => {
        // Only interested in meetings that refers to valid groups.
        const groupId = safeDecodeMeetingSubject(meeting.subject);
        if (!groupId || !(await db.Group.count({ where: { id: groupId } }))) {
          console.log(`Ignoring invalid meeting subject or non-existing group "${meeting.subject}"`); 
          return;
        }

        if (!meeting.record_files) return;

        // Have start and end times cover all record files.
        let startTime = Number.MAX_VALUE;
        let endTime = Number.MIN_VALUE;
        for (const file of meeting.record_files) {
          startTime = Math.min(startTime, file.record_start_time);
          endTime = Math.max(endTime, file.record_end_time);
        }

        const record = await getRecordURLs(meeting.meeting_record_id, tmUserId);
        const promises = record.record_files.map(async file => {
          // Only interested in records that we don't already have.
          const transcriptId = file.record_file_id;
          if (await db.Summary.count({
            where: {
              transcriptId,
              summaryKey: crudeSummaryKey,
            }
          }) > 0) {
            console.log(`Ignoring existing crude summaries for transcript "${transcriptId}"`);
            return;
          }

          file.meeting_summary?.filter(summary => summary.file_type === 'txt')
            .map(summary => {
              ret.push({
                groupId,
                startedAt: startTime,
                endedAt: endTime,
                transcriptId,
                url: summary.download_address,
              });
            });
        });
        await Promise.all(promises);
      });
    await Promise.all(promises);
  }
  return ret;
}