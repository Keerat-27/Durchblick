/** Local learning stats per user (localStorage). Keyed by account id. */

export const PROGRESS_STORAGE_PREFIX = 'dl_learning_progress_v1_';

export type LearningProgress = {
  v: 1;
  totalAnswered: number;
  correct: number;
  wrong: number;
  setsGenerated: number;
  /** Unique calendar days (local) with at least one recorded activity, sorted ascending YYYY-MM-DD */
  practiceDays: string[];
  /** ISO timestamp of first recorded activity */
  startedAt: string | null;
};

export function defaultLearningProgress(): LearningProgress {
  return {
    v: 1,
    totalAnswered: 0,
    correct: 0,
    wrong: 0,
    setsGenerated: 0,
    practiceDays: [],
    startedAt: null,
  };
}

export function storageKeyForUser(userId: string): string {
  return `${PROGRESS_STORAGE_PREFIX}${userId}`;
}

export function localYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, delta: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + delta);
  return next;
}

function parseYmd(ymd: string): Date {
  const [y, m, day] = ymd.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, day ?? 1);
}

function daysApart(a: string, b: string): number {
  const ms = parseYmd(b).getTime() - parseYmd(a).getTime();
  return Math.round(ms / (86_400_000));
}

function mergePracticeDay(days: string[], ymd: string): string[] {
  const set = new Set(days);
  set.add(ymd);
  return [...set].sort();
}

export function loadLearningProgress(userId: string): LearningProgress {
  if (typeof localStorage === 'undefined') return defaultLearningProgress();
  try {
    const raw = localStorage.getItem(storageKeyForUser(userId));
    if (!raw) return defaultLearningProgress();
    const parsed = JSON.parse(raw) as Partial<LearningProgress>;
    if (parsed.v !== 1) return defaultLearningProgress();
    const base = defaultLearningProgress();
    return {
      ...base,
      ...parsed,
      practiceDays: Array.isArray(parsed.practiceDays)
        ? [...new Set(parsed.practiceDays as string[])].sort()
        : [],
    };
  } catch {
    return defaultLearningProgress();
  }
}

export function saveLearningProgress(
  userId: string,
  progress: LearningProgress
): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(storageKeyForUser(userId), JSON.stringify(progress));
}

export function recordAnswer(
  progress: LearningProgress,
  correct: boolean
): LearningProgress {
  const now = new Date();
  const ymd = localYmd(now);
  const startedAt = progress.startedAt ?? now.toISOString();
  return {
    ...progress,
    startedAt,
    totalAnswered: progress.totalAnswered + 1,
    correct: progress.correct + (correct ? 1 : 0),
    wrong: progress.wrong + (correct ? 0 : 1),
    practiceDays: mergePracticeDay(progress.practiceDays, ymd),
  };
}

export function recordSetGenerated(progress: LearningProgress): LearningProgress {
  const now = new Date();
  const ymd = localYmd(now);
  const startedAt = progress.startedAt ?? now.toISOString();
  return {
    ...progress,
    startedAt,
    setsGenerated: progress.setsGenerated + 1,
    practiceDays: mergePracticeDay(progress.practiceDays, ymd),
  };
}

/** Streak ends if neither today nor yesterday has activity. */
export function computeCurrentStreak(practiceDays: string[]): number {
  if (practiceDays.length === 0) return 0;
  const set = new Set(practiceDays);
  const today = localYmd(new Date());
  const yesterday = localYmd(addDays(new Date(), -1));
  if (!set.has(today) && !set.has(yesterday)) return 0;

  let cursor = set.has(today) ? new Date() : addDays(new Date(), -1);
  let streak = 0;
  for (let i = 0; i < 366; i++) {
    const ymd = localYmd(cursor);
    if (set.has(ymd)) {
      streak++;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }
  return streak;
}

export function computeLongestStreak(practiceDays: string[]): number {
  if (practiceDays.length === 0) return 0;
  const sorted = [...new Set(practiceDays)].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const gap = daysApart(sorted[i - 1]!, sorted[i]!);
    if (gap === 1) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

export type LearningStats = {
  currentStreak: number;
  longestStreak: number;
  totalAnswered: number;
  correct: number;
  wrong: number;
  setsGenerated: number;
  accuracyPercent: number | null;
  practiceDaysCount: number;
  startedAt: string | null;
};

export function deriveStats(progress: LearningProgress): LearningStats {
  const { totalAnswered, correct, wrong, setsGenerated, practiceDays, startedAt } =
    progress;
  const accuracyPercent =
    totalAnswered > 0
      ? Math.round((correct / totalAnswered) * 1000) / 10
      : null;
  return {
    currentStreak: computeCurrentStreak(practiceDays),
    longestStreak: computeLongestStreak(practiceDays),
    totalAnswered,
    correct,
    wrong,
    setsGenerated,
    accuracyPercent,
    practiceDaysCount: practiceDays.length,
    startedAt,
  };
}
