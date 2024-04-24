import { procedure, router } from "../trpc";
import { authIntegration } from "../auth";
import { z } from "zod";
import { decodeTranscriptId } from "./transcripts";
import Transcript from "../database/models/Transcript";
import Summary from "../database/models/Summary";

const summaries = router({

  /**
   * Upload a summary for a transcript. Each summary is identified by a (`transcriptId`, `summaryKey`) tuple.
   * Uploading a summary that already exists overwrites it.
   * 
   * @param transcriptId Returned from /api/v1/transcripts.list
   * @param summaryKey An arbitrary string determined by the caller
   */
  write: procedure
  .use(authIntegration())
  .input(
    z.object({ 
      transcriptId: z.string(),
      summaryKey: z.string(),
      summary: z.string(),
    })
  ).mutation(async ({ input }) => {
    const { groupId, transcriptId, startedAt, endedAt } = decodeTranscriptId(input.transcriptId);
    await upsertSummary(groupId, transcriptId, startedAt, endedAt, input.summaryKey, input.summary);
  }),
});

export default summaries;

export async function upsertSummary(groupId: string, transcriptId: string, startedAt: number, endedAt: number,
  summaryKey: string, summary: string) {
  await Transcript.upsert({
    transcriptId,
    groupId,
    startedAt,
    endedAt
  });
  await Summary.upsert({
    transcriptId,
    summaryKey,
    summary
  });
}