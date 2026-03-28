import type { Request, Response, Router } from 'express';
import { Router as createRouter } from 'express';
import {
  GoogleGenerativeAIFetchError,
  GoogleGenerativeAIResponseError,
} from '@google/generative-ai';
import { z } from 'zod';
import { verifyAccessToken } from './jwt-tokens.js';
import { findUserById } from './users-store.js';
import { generateLesenWithGemini } from './lesen-gemini.js';

const generateBodySchema = z.object({
  topic: z.string().trim().min(1),
  level: z.enum(['A1', 'A2', 'B1', 'B2']),
});

export function createLesenRouter(accessSecret: string): Router {
  const router = createRouter();

  router.post('/generate', async (req: Request, res: Response) => {
    const header = req.headers.authorization;
    const bearer = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!bearer) {
      res.status(401).json({ error: 'Missing access token' });
      return;
    }
    let sub: string;
    try {
      const decoded = verifyAccessToken(bearer, accessSecret);
      sub = decoded.sub;
    } catch {
      res.status(401).json({ error: 'Invalid or expired access token' });
      return;
    }
    const user = findUserById(sub);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const parsed = generateBodySchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors;
      const first =
        Object.values(msg).flat()[0] ?? 'Invalid request';
      res.status(400).json({ error: first });
      return;
    }

    const { topic, level } = parsed.data;
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      res.status(503).json({
        error:
          'Reading generation is not configured (missing GEMINI_API_KEY on the server).',
      });
      return;
    }

    try {
      const payload = await generateLesenWithGemini(apiKey, topic, level);
      res.json(payload);
    } catch (e) {
      const code = e instanceof Error ? e.message : String(e);
      if (
        code === 'EMPTY_MODEL_RESPONSE' ||
        code === 'INVALID_JSON' ||
        code === 'SCHEMA_MISMATCH'
      ) {
        res.status(502).json({
          error:
            'Could not build a valid reading set. Please try generating again.',
        });
        return;
      }

      if (e instanceof GoogleGenerativeAIResponseError) {
        console.error('Lesen Gemini response error:', e.message, e.response);
        res.status(502).json({
          error:
            'The model blocked or could not finish this reading task (safety or empty response). Try again or pick another topic.',
        });
        return;
      }

      if (e instanceof GoogleGenerativeAIFetchError) {
        const st = e.status;
        console.error(
          'Lesen Gemini HTTP error:',
          st,
          e.statusText,
          e.message,
          e.errorDetails
        );
        if (st === 401 || st === 403) {
          res.status(502).json({
            error:
              'Gemini API rejected the request. Check GEMINI_API_KEY in server/.env (AI Studio key with Generative Language API enabled).',
          });
          return;
        }
        if (st === 429) {
          res.status(502).json({
            error:
              'Gemini API rate limit reached. Wait a minute and try again.',
          });
          return;
        }
        res.status(502).json({
          error: `Gemini API error (${st ?? 'unknown'}). Check the server log or try again.`,
        });
        return;
      }

      console.error('Lesen generate error:', e);
      res.status(502).json({
        error: 'Generation failed. Please try again in a moment.',
      });
    }
  });

  return router;
}
