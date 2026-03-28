import { authFetch } from '@/api/auth-api';
import type { LesenCategory } from '@/data/lesen-content';
import type { Level } from '@/data/topics';
import type { LesenGeneratedSet } from '@/types/lesen';

export async function generateLesenRequest(params: {
  category: LesenCategory;
  passageFocus: string | null;
  level: Level;
  questionCount: number;
}): Promise<LesenGeneratedSet> {
  const body: Record<string, unknown> = {
    category: params.category,
    level: params.level,
    questionCount: params.questionCount,
  };
  const focus = params.passageFocus?.trim();
  if (focus) body.passageFocus = focus;

  const res = await authFetch('/api/lesen/generate', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as LesenGeneratedSet & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? 'Generation failed');
  }
  return data;
}
