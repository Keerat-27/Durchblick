import { z } from 'zod';

const lesenMcQuestionSchema = z.object({
  type: z.literal('multiple_choice'),
  question: z.string().min(1),
  options: z
    .array(z.string().min(1))
    .length(4),
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

export const lesenGenerateResponseSchema = z.object({
  passage: z.string().min(40),
  questions: z
    .array(lesenQuestionSchema)
    .length(4)
    .superRefine((arr, ctx) => {
      for (let i = 0; i < 3; i++) {
        if (arr[i]?.type !== 'multiple_choice') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Question ${i} must be multiple_choice`,
          });
        }
      }
      if (arr[3]?.type !== 'fill_blank') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Question 3 must be fill_blank',
        });
      }
    }),
});

export type LesenGeneratePayload = z.infer<typeof lesenGenerateResponseSchema>;
