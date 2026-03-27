import { EXERCISE_BANK } from '../data/exercises';
import type { TopicId } from '../data/topics';
import type { Level } from '../data/topics';
import type { Exercise, ExerciseMultipleChoice } from '../types/exercise';

function exerciseKey(ex: Exercise): string {
  if (ex.type === 'error_correction') {
    return `${ex.type}|${ex.wrong_sentence}`;
  }
  return `${ex.type}|${ex.sentence}`;
}

function cloneExercise<T extends Exercise>(ex: T): T {
  return JSON.parse(JSON.stringify(ex)) as T;
}

function shuffleMultipleChoice(ex: ExerciseMultipleChoice): ExerciseMultipleChoice {
  const copy = cloneExercise(ex);
  const orig = copy.options.slice();
  const correct = orig[copy.correct_index];
  const order = orig.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  copy.options = order.map((i) => orig[i]);
  copy.correct_index = copy.options.indexOf(correct);
  return copy;
}

function prepareExercise(ex: Exercise): Exercise {
  let copy = cloneExercise(ex);
  if (copy.type === 'multiple_choice') {
    copy = shuffleMultipleChoice(copy);
  }
  return copy;
}

function shufflePool<T>(items: T[]): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Up to `count` distinct exercises for the topic and level (no duplicates in one set).
 * If fewer exercises exist than `count`, returns all available for that filter.
 */
export function pickExercises(
  topic: TopicId,
  level: Level,
  count: number
): Exercise[] {
  const pool = EXERCISE_BANK[topic];
  if (!pool?.length) return [];

  const filtered = pool.filter((e) => e.levels.includes(level));
  const use = filtered.length ? filtered : pool;
  const shuffled = shufflePool(use);
  const picked: Exercise[] = [];
  const usedKeys = new Set<string>();

  for (const ex of shuffled) {
    if (picked.length >= count) break;
    const k = exerciseKey(ex);
    if (usedKeys.has(k)) continue;
    usedKeys.add(k);
    picked.push(prepareExercise(ex));
  }

  return picked;
}

export function pickExercise(
  topic: TopicId,
  level: Level,
  lastKey: string | null
): Exercise | null {
  const pool = EXERCISE_BANK[topic];
  if (!pool?.length) return null;

  const filtered = pool.filter((e) => e.levels.includes(level));
  const use = filtered.length ? filtered : pool;

  let choice = use[0];
  let attempts = 0;
  do {
    choice = use[Math.floor(Math.random() * use.length)];
    attempts++;
  } while (
    attempts < 20 &&
    lastKey &&
    exerciseKey(choice) === lastKey &&
    use.length > 1
  );

  return prepareExercise(choice);
}

export function getExerciseStableKey(ex: Exercise): string {
  return exerciseKey(ex);
}
