import { z } from 'zod';

/** Keep in sync with client `LESEN_QUESTION_COUNT` in `src/data/lesen-content.ts`. */
export const LESEN_QUESTION_COUNT_MIN = 3;
export const LESEN_QUESTION_COUNT_MAX = 10;

const lesenMcQuestionSchema = z.object({
  type: z.literal('multiple_choice'),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  /** Gemini sometimes returns numeric strings in JSON mode. */
  correct_index: z.coerce.number().int().min(0).max(3),
  explanation: z.string().min(1),
});

const lesenFillQuestionSchema = z.object({
  type: z.literal('fill_blank'),
  question: z.string().min(1),
  answer: z.string().min(1),
  explanation: z.string().min(1),
});

const lesenQuestionSchema = z.discriminatedUnion('type', [
  lesenMcQuestionSchema,
  lesenFillQuestionSchema,
]);

export type LesenQuestionParsed = z.infer<typeof lesenQuestionSchema>;

export function createLesenGenerateResponseSchema(questionCount: number) {
  if (
    !Number.isInteger(questionCount) ||
    questionCount < LESEN_QUESTION_COUNT_MIN ||
    questionCount > LESEN_QUESTION_COUNT_MAX
  ) {
    throw new Error('INVALID_QUESTION_COUNT');
  }
  const mcCount = questionCount - 1;

  return z.object({
    passage: z.string().min(40),
    questions: z
      .array(lesenQuestionSchema)
      .length(questionCount)
      .superRefine((arr, ctx) => {
        for (let i = 0; i < mcCount; i++) {
          if (arr[i]?.type !== 'multiple_choice') {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Question ${i} must be multiple_choice`,
            });
          }
        }
        if (arr[mcCount]?.type !== 'fill_blank') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Question ${mcCount} must be fill_blank`,
          });
        }
      }),
  });
}

export type LesenGeneratePayload = {
  passage: string;
  questions: LesenQuestionParsed[];
};
