import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
  defaultLearningProgress,
  deriveStats,
  loadLearningProgress,
  recordAnswer as applyAnswer,
  recordSetGenerated as applySetGenerated,
  saveLearningProgress,
  type LearningProgress,
  type LearningStats,
} from '@/lib/progress-storage';

type LearningProgressContextValue = {
  progress: LearningProgress;
  stats: LearningStats;
  recordAttempt: (correct: boolean) => void;
  recordNewSet: () => void;
};

const LearningProgressContext = createContext<LearningProgressContextValue | null>(
  null
);

function LearningProgressStore({
  userId,
  children,
}: {
  userId: string | null;
  children: ReactNode;
}) {
  const [progress, setProgress] = useState<LearningProgress>(() =>
    userId ? loadLearningProgress(userId) : defaultLearningProgress()
  );

  const recordAttempt = useCallback(
    (correct: boolean) => {
      if (!userId) return;
      setProgress((prev) => {
        const next = applyAnswer(prev, correct);
        saveLearningProgress(userId, next);
        return next;
      });
    },
    [userId]
  );

  const recordNewSet = useCallback(() => {
    if (!userId) return;
    setProgress((prev) => {
      const next = applySetGenerated(prev);
      saveLearningProgress(userId, next);
      return next;
    });
  }, [userId]);

  const stats = useMemo(() => deriveStats(progress), [progress]);

  const value = useMemo(
    () => ({
      progress,
      stats,
      recordAttempt,
      recordNewSet,
    }),
    [progress, stats, recordAttempt, recordNewSet]
  );

  return (
    <LearningProgressContext.Provider value={value}>
      {children}
    </LearningProgressContext.Provider>
  );
}

export function LearningProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storeKey = user?.id ?? '__guest__';

  return (
    <LearningProgressStore key={storeKey} userId={user?.id ?? null}>
      {children}
    </LearningProgressStore>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useLearningProgress(): LearningProgressContextValue {
  const ctx = useContext(LearningProgressContext);
  if (!ctx) {
    throw new Error('useLearningProgress must be used within LearningProgressProvider');
  }
  return ctx;
}
