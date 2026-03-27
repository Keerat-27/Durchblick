import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Exercise } from '@/types/exercise';
import { normalize } from '@/utils/normalize';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const TYPE_LABELS: Record<Exercise['type'], string> = {
  fill_blank: 'Fill in the blank',
  multiple_choice: 'Multiple choice',
  error_correction: 'Error correction',
};

type Props = {
  exercise: Exercise;
  topicLabel: string;
  questionNumber?: number;
  onResult: (correct: boolean) => void;
};

export function ExerciseCard({
  exercise,
  topicLabel,
  questionNumber,
  onResult,
}: Props) {
  const [answered, setAnswered] = useState(false);
  const [fillInput, setFillInput] = useState('');
  const [mcChoice, setMcChoice] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (exercise.type === 'fill_blank' || exercise.type === 'error_correction') {
      const t = window.setTimeout(() => inputRef.current?.focus(), 80);
      return () => window.clearTimeout(t);
    }
  }, [exercise]);

  const [feedback, setFeedback] = useState<{
    correct: boolean;
    main: ReactNode;
    explanation: string;
  } | null>(null);

  function finish(correct: boolean, main: ReactNode, explanation: string) {
    setFeedback({ correct, main, explanation });
    setAnswered(true);
    onResult(correct);
  }

  function checkFillBlank() {
    if (answered || exercise.type !== 'fill_blank') return;
    const user = fillInput.trim();
    if (!user) return;
    const ok = normalize(user) === normalize(exercise.answer);
    if (ok) {
      finish(
        true,
        <span className="text-[var(--ok)]">„{exercise.answer}"</span>,
        exercise.explanation
      );
    } else {
      finish(
        false,
        <>
          Your answer: <span className="text-destructive">„{user}"</span> —
          Correct:{' '}
          <span className="text-[var(--ok)]">„{exercise.answer}"</span>
        </>,
        exercise.explanation
      );
    }
  }

  function checkErrorCorrection() {
    if (answered || exercise.type !== 'error_correction') return;
    const user = fillInput.trim();
    if (!user) return;
    const ok = normalize(user) === normalize(exercise.answer);
    if (ok) {
      finish(
        true,
        <span className="text-[var(--ok)]">„{exercise.answer}"</span>,
        exercise.explanation
      );
    } else {
      finish(
        false,
        <>
          Wrong part:{' '}
          <span className="text-destructive">„{exercise.error_word}"</span> →
          should be{' '}
          <span className="text-[var(--ok)]">„{exercise.correct_word}"</span>
        </>,
        exercise.explanation
      );
    }
  }

  function checkMC(index: number) {
    if (answered || exercise.type !== 'multiple_choice') return;
    const correctIdx = exercise.correct_index;
    const ok = index === correctIdx;
    setMcChoice(index);
    if (ok) {
      finish(
        true,
        <span className="text-[var(--ok)]">
          „{exercise.options[correctIdx]}"
        </span>,
        exercise.explanation
      );
    } else {
      finish(
        false,
        <>
          Your answer:{' '}
          <span className="text-destructive">„{exercise.options[index]}"</span>{' '}
          — Correct:{' '}
          <span className="text-[var(--ok)]">
            „{exercise.options[correctIdx]}"
          </span>
        </>,
        exercise.explanation
      );
    }
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key !== 'Enter' || answered) return;
    if (exercise.type === 'fill_blank') checkFillBlank();
    if (exercise.type === 'error_correction') checkErrorCorrection();
  }

  const promptBlank = (s: string) => {
    const parts = s.split('___');
    if (parts.length === 1) return s;
    return (
      <>
        {parts[0]}
        <strong className="font-extrabold text-[var(--chart-2)]">___</strong>
        {parts.slice(1).join('___')}
      </>
    );
  };

  const inputStateClass =
    answered && feedback
      ? feedback.correct
        ? 'border-[var(--duo-correct-border)] bg-[var(--duo-correct-bg)]'
        : 'border-[var(--duo-wrong-border)] bg-[var(--duo-wrong-bg)]'
      : '';

  return (
    <Card className="transition-transform duration-150 hover:translate-y-[-1px]">
      <CardHeader className="flex flex-row flex-wrap items-center gap-2 space-y-0 border-b-2 border-[var(--duo-border)] bg-muted/30 px-4 py-3.5 dark:border-border">
        {questionNumber != null && (
          <Badge
            variant="outline"
            className="border-[var(--chart-2)]/40 font-sans text-[10px] font-extrabold tracking-wider text-[var(--chart-2)] uppercase"
            aria-label={`Question ${questionNumber}`}
          >
            Q{questionNumber}
          </Badge>
        )}
        <Badge
          variant="secondary"
          className="border-2 border-[var(--duo-border)] font-sans text-[9px] font-extrabold tracking-[0.12em] uppercase dark:border-border"
        >
          {TYPE_LABELS[exercise.type]}
        </Badge>
        <span className="ml-auto font-sans text-xs font-extrabold text-muted-foreground">
          {topicLabel}
        </span>
      </CardHeader>

      <CardContent className="space-y-4 pt-5">
        <p className="font-sans text-sm font-bold text-muted-foreground">
          {exercise.instruction}
        </p>

        {exercise.type === 'fill_blank' && (
          <>
            <p className="font-sans text-lg font-bold leading-relaxed text-foreground md:text-xl">
              {promptBlank(exercise.sentence)}
            </p>
            {exercise.hint && (
              <p className="font-sans text-xs font-extrabold text-muted-foreground">
                Hint: {exercise.hint}
              </p>
            )}
            <Input
              ref={inputRef}
              type="text"
              className={cn('font-sans', inputStateClass)}
              placeholder="Type your answer…"
              value={fillInput}
              disabled={answered}
              onChange={(event) => setFillInput(event.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <Button
              type="button"
              variant="outline"
              disabled={answered}
              onClick={checkFillBlank}
            >
              Check answer
            </Button>
          </>
        )}

        {exercise.type === 'multiple_choice' && (
          <>
            <p className="font-sans text-lg font-bold leading-relaxed text-foreground md:text-xl">
              {promptBlank(exercise.sentence)}
            </p>
            <div className="flex flex-col gap-3">
              {exercise.options.map((opt, i) => {
                const correctIdx = exercise.correct_index;
                let state: 'neutral' | 'correct' | 'wrong' = 'neutral';
                if (answered && feedback) {
                  if (i === correctIdx) state = 'correct';
                  else if (i === mcChoice && !feedback.correct) state = 'wrong';
                }
                return (
                  <Button
                    key={i}
                    type="button"
                    variant="outline"
                    disabled={answered}
                    className={cn(
                      'h-auto min-h-[3.25rem] justify-start gap-3 rounded-2xl py-3 pr-4 pl-3 text-left font-sans text-[15px] font-bold whitespace-normal',
                      state === 'neutral' &&
                        'active:translate-y-1 hover:border-[var(--chart-2)]/50 hover:bg-[var(--duo-nav-active)]',
                      state === 'correct' &&
                        'border-[var(--duo-correct-border)] bg-[var(--duo-correct-bg)] text-[var(--ok)] shadow-none hover:bg-[var(--duo-correct-bg)]',
                      state === 'wrong' &&
                        'border-[var(--duo-wrong-border)] bg-[var(--duo-wrong-bg)] text-destructive shadow-none hover:bg-[var(--duo-wrong-bg)]'
                    )}
                    onClick={() => checkMC(i)}
                  >
                    <span
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-xl border-2 border-[var(--duo-border)] font-sans text-xs font-extrabold text-muted-foreground dark:border-border',
                        state === 'correct' &&
                          'border-[var(--duo-correct-border)] bg-card text-[var(--ok)]',
                        state === 'wrong' &&
                          'border-[var(--duo-wrong-border)] bg-card text-destructive'
                      )}
                    >
                      {['A', 'B', 'C', 'D'][i]}
                    </span>
                    {opt}
                  </Button>
                );
              })}
            </div>
          </>
        )}

        {exercise.type === 'error_correction' && (
          <>
            <p className="border-s-4 border-[var(--duo-wrong-border)] ps-3 font-sans text-lg font-bold leading-relaxed text-foreground md:text-xl">
              {exercise.wrong_sentence}
            </p>
            <Input
              ref={inputRef}
              type="text"
              className={cn('font-sans', inputStateClass)}
              placeholder="Type the corrected sentence…"
              value={fillInput}
              disabled={answered}
              onChange={(event) => setFillInput(event.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <Button
              type="button"
              variant="outline"
              disabled={answered}
              onClick={checkErrorCorrection}
            >
              Check answer
            </Button>
          </>
        )}
      </CardContent>

      {feedback && (
        <CardFooter
          className={cn(
            'mx-4 mb-4 flex flex-col items-stretch gap-2 rounded-2xl border-2 px-4 py-4 shadow-[0_4px_0_0_var(--duo-border)] dark:shadow-[0_4px_0_0_var(--border)]',
            feedback.correct
              ? 'duo-pop-in border-[var(--duo-correct-border)] bg-[var(--duo-correct-bg)]'
              : 'duo-shake border-[var(--duo-wrong-border)] bg-[var(--duo-wrong-bg)]'
          )}
        >
          <p
            className={cn(
              'font-sans text-xs font-extrabold tracking-[0.12em] uppercase',
              feedback.correct ? 'text-[var(--ok)]' : 'text-destructive'
            )}
          >
            {feedback.correct ? 'Richtig!' : 'Falsch'}
          </p>
          <div className="font-sans text-sm font-bold text-foreground">
            {feedback.main}
          </div>
          <p className="font-sans text-sm font-semibold text-muted-foreground">
            {feedback.explanation}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
