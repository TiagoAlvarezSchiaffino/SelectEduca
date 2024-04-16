import crypto from 'crypto';
import qs from 'qs';
import apiEnv from "./apiEnv";
import https from "https";
import http from "http";
import z from "zod";
import { TRPCError } from '@trpc/server';

const LOG_HEADER = "[TecentMeeting]"

const splitFirst = (s: string, separator: string) => {
  const idx = s.indexOf(separator);
  if (idx < 0) return [s];
  return [s.slice(0, idx), s.slice(idx + separator.length)];
};

const requestWithBody = async (body: string, options: {
  host: string,
  port: string,
  protocol: string,
  path: string,
  method: 'GET' | 'POST',
  headers: Record<string, string>
}) => {
  return new Promise<string>((resolve, reject) => {
    const callback = function (response: any) {
      let str = '';
      response.on('data', function (chunk: any) {
        str += chunk;
      });
      response.on('end', function () {
        resolve(str);
      });
    };

    const req = (options.protocol === 'https:' ? https : http).request(options, callback);
    req.on('error', (e: Error) => {
      reject(e);
    });
    req.write(body);
    req.end();
  });
};

const sign = (
  secretId: string, secretKey: string,
  httpMethod: string, headerNonce: number,
  headerTimestamp: number, requestUri: string, requestBody: string
) => {
  const tobeSig = `${httpMethod}\nX-TC-Key=${secretId}&X-TC-Nonce=${headerNonce}&X-TC-Timestamp=${headerTimestamp}\n${requestUri}\n${requestBody}`
  const signature = crypto.createHmac('sha256', secretKey)
    .update(tobeSig)
    .digest('hex')
  return Buffer.from(signature, "utf8").toString('base64');
}

const tmRequest = async (
  method: 'POST' | 'GET',
  requestUri: string,
  query: Record<string, string | number>,
  body: Record<string, string> = {},
) => {
  const enterpriseId = apiEnv.TM_ENTERPRISE_ID;
  const appId = apiEnv.TM_APP_ID;
  const secretId = apiEnv.TM_SECRET_ID;
  const secretKey = apiEnv.TM_SECRET_KEY;

  const now = Math.floor(Date.now() / 1000);

  const hasQuery = Object.keys(query).length > 0;

  const pathWithQuery = requestUri + (hasQuery ? `?${qs.stringify(query)}` : "");

  // authentication docs location
  // https://cloud.tencent.com/document/product/1095/42413
  const url = "https://api.meeting.qq.com" + pathWithQuery;

  const nonce = Math.floor(Math.random() * 100000);

  // const body = {
  //   "userid": "...",
  //   "subject": "testing meeting",
  //   "type": 0,
  //   "instanceid": 1,
  //   "start_time": "" + now,
  //   "end_time": "" + (now + 3600)
  // }

  const bodyText = method === "GET" ? "" : JSON.stringify(body);

  const signature = sign(
    secretId,
    secretKey,
    method,
    nonce,
    now,
    pathWithQuery,
    bodyText
  )

  const headers = {
    // "Accept": "*/*",
    // "Accept-Encoding": "gzip, deflate",
    "Content-Type": "application/json",
    "X-TC-Key": secretId,
    "AppId": enterpriseId,
    "SdkId": appId,
    "X-TC-Timestamp": "" + now,
    "X-TC-Nonce": "" + nonce,
    "X-TC-Signature": signature,
    "X-TC-Registered": "1"
  };

  const [protocol, rest] = splitFirst(url, '//');
  const [base, path] = splitFirst(rest, '/');
  const [host, _port] = splitFirst(base, ':');

  const port = _port ?? (protocol === 'http:' ? "80" : "443");

  return JSON.parse(await requestWithBody(bodyText, {
    host,
    port,
    path: "/" + path,
    protocol,
    method,
    headers,
  }));
};

export const createMeeting = async (
  meetingSubject: string,
  startTimeSecond: number,
  endTimeSecond: number,
  type: 'scheduled' | 'fast',
) => {
  console.log(LOG_HEADER, `createMeeting('${meetingSubject}', ${startTimeSecond}, ${endTimeSecond})`)
  return await tmRequest('POST', '/v1/meetings', {}, {
    "userid": apiEnv.TM_ADMIN_USER_ID,
    "instanceid": "1",
    "subject": meetingSubject,
    "start_time": "" + startTimeSecond,
    "end_time": "" + endTimeSecond,
    "type": type === 'scheduled' ? "0" : "1",
  });
};

const paginationNotSupported = () => new TRPCError({
  code: 'METHOD_NOT_SUPPORTED',
  message: "Pagination isn't supported",
});

export const listMeetings = async () => {
  console.log(LOG_HEADER, 'listMeetings()');
  const zRes = z.intersection(z.object({
    meeting_number: z.number(),
    remaining: z.number(),
    next_post: z.number(),
    next_cursory: z.number(),
  }), z.array(z.object({
    "subject": z.string(),
    "meeting_id": z.string(),
    "meeting_code": z.string(),
    "status": z.string(),
    // "type": 0,
    "join_url": z.string(),
    "start_time": z.string(),
    "end_time": z.string(),
    // "meeting_type": 6,
    // "recurring_rule": {"recurring_type": 3, "until_type": 1, "until_count": 20},
    // "current_sub_meeting_id": "1679763600",
    // "has_vote": false,
    // "current_hosts": [{"userid": "1764d9d81a924fdf9269b7a54e519f30"}],
    // "join_meeting_role": "creator",
    // "location": "",
    // "enable_enroll": false,
    // "enable_host_key": false,
    // "time_zone": "",
    // "disable_invitation": 0
  })));

  const res = await tmRequest('GET', '/v1/meetings', {
    'userid': apiEnv.TM_ADMIN_USER_ID,
    'instanceid': "1",
  });

  return zRes.parse(res);
}

/**
 * List meeting recordings since 31 days ago (max allowed date range).
 */
export async function listRecords() {
  console.log(LOG_HEADER, 'listRecords()');
  const zRes = z.object({
    total_count: z.number(),
    // current_size: z.number(),
    // current_page: z.number(),
    total_page: z.number(),
    record_meetings: z.array(
      z.object({
        meeting_record_id: z.string(), // needed for script download
        meeting_id: z.string(),
        // meeting_code: z.string(),
        // host_user_id: z.string(),
        // media_start_time: z.number(),
        // subject: z.string(),
        state: z.number(), // 3 - ready for download
        record_files: z.array(
          z.object({
            record_file_id: z.string(), // needed for script download
            // record_start_time: z.number(),
            // record_end_time: z.number(),
            // record_size: z.number(),
            // sharing_state: z.number(),
            // required_same_corp: z.boolean(),
            // required_participant: z.boolean(),
            // password: z.string(),
            // sharing_expire: z.number(),
            // allow_download: z.boolean()
          })
        )
      })
    )
  });

  const res = zRes.parse(await tmRequest('GET', '/v1/records', {
    'userid': apiEnv.TM_ADMIN_USER_ID,
    // 31d is earliest allowed date
    'start_time': JSON.stringify(Math.trunc(Date.now() / 1000 - 31 * 24 * 3600)),
    'end_time': JSON.stringify(Math.trunc(Date.now() / 1000)),
  }));
  
  if (res.total_page != 1) throw paginationNotSupported();
  return res;
}

/**
 * Get record file download URLs given a meeting record id retrieved from listRecords().
 */
export async function getRecordURLs(meetingRecordId : string) {
  console.log(LOG_HEADER, `getRecordURLs("${meetingRecordId}")`);
  const zRes = z.object({
    // meeting_record_id: z.string(),
    meeting_id: z.string(),
    // meeting_code: z.string(),
    // subject: z.string(),
    // total_count: z.number(),
    // current_size: z.number(),
    total_page: z.number(),
    record_files: z.array(
      z.object({
        record_file_id: z.string(),
        // view_address: z.string().url(),
        // download_address: z.string().url(),
        // download_address_file_type: z.string(),
        // audio_address: z.string().url(),
        // audio_address_file_type: z.string(),
        meeting_summary: z.array(
          z.object({
            download_address: z.string().url(),
            //file_type: z.literal('txt')
            //file_type: z.literal('txt')
          })
        ).optional()
      })
    )
  });

  const res = zRes.parse(await tmRequest('GET', '/v1/addresses', {
    meeting_record_id: meetingRecordId,
    userid: apiEnv.TM_ADMIN_USER_ID,
  }));
  
  if (res.total_page != 1) throw paginationNotSupported();
  return res;
}

// Uncomment and modify this line to debug TM APIs.
// listRecords().then(res => console.log(JSON.stringify(res, null, 2)));