import {
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
} from '@google/generative-ai';
import {
  lesenGenerateResponseSchema,
  type LesenGeneratePayload,
} from './lesen-schema.js';

function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  const body = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(body) as unknown;
}

function buildPrompt(topicLabel: string, level: string): string {
  return `You are an expert German teacher creating reading comprehension for learners.

Return ONE JSON object only (no markdown), with this exact shape:
{
  "passage": string,
  "questions": [
    { "type": "multiple_choice", "question": string, "options": [string, string, string, string], "correct_index": 0|1|2|3, "explanation": string },
    { "type": "multiple_choice", ... },
    { "type": "multiple_choice", ... },
    { "type": "fill_blank", "question": string, "answer": string, "explanation": string }
  ]
}

Rules:
- "passage": original German text, 150–200 words, difficulty suited to CEFR level ${level}. The topic should naturally touch on or relate to the grammar area "${topicLabel}" without being a grammar drill (authentic reading).
- Exactly 4 questions in order: first 3 are multiple_choice (comprehension of the passage), fourth is fill_blank.
- Multiple choice: 4 plausible German options; "correct_index" is 0-based index of the correct option (integer 0–3).
- Fill blank: "question" is a German sentence with ___ marking the blank; "answer" is the single correct word or short phrase (no punctuation extras); base it on the passage.
- All student-facing text (passage, questions, options, explanations) must be in German.
- Explanations: brief (1–2 sentences), why the answer is right/wrong.

CEFR level: ${level}
Grammar theme (loose): ${topicLabel}`;
}

function modelCandidates(): string[] {
  const fromEnv = process.env.GEMINI_MODEL?.trim();
  const defaults = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-flash-latest',
    'gemini-1.5-flash',
  ];
  const list = fromEnv ? [fromEnv, ...defaults] : defaults;
  return [...new Set(list)];
}

/** Try the next model id when this one is missing, gone, or overloaded. */
function shouldTryFallbackModel(e: unknown): boolean {
  if (e instanceof GoogleGenerativeAIFetchError) {
    const s = e.status;
    if (s === 401 || s === 403 || s === 429) return false;
    if (s === 404 || s === 410 || s === 503) return true;
    const msg = `${e.message} ${e.statusText ?? ''}`.toLowerCase();
    return msg.includes('not found') || msg.includes('does not exist');
  }
  return false;
}

async function generateWithModel(
  apiKey: string,
  modelName: string,
  topicLabel: string,
  level: string
): Promise<LesenGeneratePayload> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.65,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  });

  const result = await model.generateContent(buildPrompt(topicLabel, level));
  const text = result.response.text();
  if (!text?.trim()) {
    throw new Error('EMPTY_MODEL_RESPONSE');
  }

  let parsed: unknown;
  try {
    parsed = extractJsonObject(text);
  } catch {
    throw new Error('INVALID_JSON');
  }

  const checked = lesenGenerateResponseSchema.safeParse(parsed);
  if (!checked.success) {
    console.warn(
      'Lesen schema mismatch:',
      checked.error.flatten(),
      'raw keys:',
      parsed && typeof parsed === 'object'
        ? Object.keys(parsed as object)
        : typeof parsed
    );
    throw new Error('SCHEMA_MISMATCH');
  }

  return checked.data;
}

export async function generateLesenWithGemini(
  apiKey: string,
  topicLabel: string,
  level: string
): Promise<LesenGeneratePayload> {
  const candidates = modelCandidates();
  let lastError: unknown;

  for (let i = 0; i < candidates.length; i++) {
    const modelName = candidates[i]!;
    try {
      return await generateWithModel(apiKey, modelName, topicLabel, level);
    } catch (e) {
      lastError = e;
      if (shouldTryFallbackModel(e) && i < candidates.length - 1) {
        console.warn(
          `[Lesen] Model "${modelName}" unavailable (${e instanceof GoogleGenerativeAIFetchError ? e.status : '?'}), trying next…`
        );
        continue;
      }
      throw e;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('MODEL_CHAIN_EXHAUSTED');
}
