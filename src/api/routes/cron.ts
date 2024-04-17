import { procedure, router } from "../trpc";
import axios from "axios";
import apiEnv from "api/apiEnv";

/**
 * These API are to be periodically triggered for background operations and housekeeping.
 */
const cron = router({

  /**
   * Download transcripts and then upload them as summaries as is.
   */
  uploadRawTranscripts: procedure.query(async () => {
    const baseUrl = ``;
    const headers = { 'Authorization': `Bearer ${apiEnv.INTEGRATION_AUTH_TOKEN}` };

    console.log('Retriving transcript URLs...');
    const res = await axios.get(baseUrl + 'transcripts.list', { headers });

    const promises = res.data.result.data.map(async (transcript: any) => {
      const id = transcript.transcriptId;
      console.log(`Downloading ${id}...`);
      try {
        const res = await axios.get(transcript.url);
        console.log(`Uploading ${id}...`);
        try {
          await axios.post(baseUrl + 'summaries.write', { 
            transcriptId: id,
            summaryKey: '（）',
            summary: res.data,
          }, { headers });
        } catch (e) {
          console.error(`Error uploading ${id}. Ignored:`, (e as Error).message);
        }
      } catch (e) {
        console.error(`Error downloading ${id}. Ignored:`, (e as Error).message);
      }
    });
    await Promise.all(promises);
  }),
})

export default cron