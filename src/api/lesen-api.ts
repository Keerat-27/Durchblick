import { authFetch } from '@/api/auth-api';
import type { Level } from '@/data/topics';
import type { LesenGeneratedSet } from '@/types/lesen';

export async function generateLesenRequest(
  topicLabel: string,
  level: Level
): Promise<LesenGeneratedSet> {
  const res = await authFetch('/api/lesen/generate', {
    method: 'POST',
    body: JSON.stringify({ topic: topicLabel, level }),
  });
  const data = (await res.json()) as LesenGeneratedSet & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? 'Generation failed');
  }
  return data;
}
