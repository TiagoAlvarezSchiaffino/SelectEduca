import { z } from 'zod';
import { zMinUser } from './User';

export const zMinInterviewFeedback = z.object({
  id: z.string(),
  interviewer: zMinUser,
  feedbackUpdatedAt: z.coerce.string().nullable(),
});

export const zFeedback = z.record(z.string(), z.any());
export type Feedback = object;

export const zInterviewFeedback = zMinInterviewFeedback.merge(z.object({
  feedback: zFeedback.nullable(),
}));
export type InterviewFeedback = z.ZodType<typeof zInterviewFeedback>;