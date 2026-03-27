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
        <strong className="font-semibold text-primary">___</strong>
        {parts.slice(1).join('___')}
      </>
    );
  };

  const inputStateClass =
    answered && feedback
      ? feedback.correct
        ? 'border-[var(--ok)]/50 bg-[var(--ok-dim)]'
        : 'border-destructive/50 bg-destructive/10'
      : '';

  return (
    <Card className="border-border/70 transition-shadow duration-300 hover:brightness-[1.01]">
      <CardHeader className="flex flex-row flex-wrap items-center gap-2 space-y-0 border-b border-border/60 bg-muted/15 px-4 py-3">
        {questionNumber != null && (
          <Badge
            variant="outline"
            className="font-sans text-[10px] font-bold tracking-wider text-primary uppercase"
            aria-label={`Question ${questionNumber}`}
          >
            Q{questionNumber}
          </Badge>
        )}
        <Badge
          variant="secondary"
          className="font-sans text-[9px] font-bold tracking-[0.14em] uppercase"
        >
          {TYPE_LABELS[exercise.type]}
        </Badge>
        <span className="ml-auto font-sans text-xs font-semibold text-muted-foreground">
          {topicLabel}
        </span>
      </CardHeader>

      <CardContent className="space-y-4 pt-5">
        <p className="text-sm text-muted-foreground">{exercise.instruction}</p>

        {exercise.type === 'fill_blank' && (
          <>
            <p className="font-sans text-lg leading-relaxed text-foreground">
              {promptBlank(exercise.sentence)}
            </p>
            {exercise.hint && (
              <p className="font-sans text-xs font-semibold text-muted-foreground">
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
            <p className="font-sans text-lg leading-relaxed text-foreground">
              {promptBlank(exercise.sentence)}
            </p>
            <div className="flex flex-col gap-2">
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
                      'h-auto min-h-10 justify-start gap-3 py-2.5 pr-4 pl-3 text-left font-sans whitespace-normal',
                      state === 'correct' &&
                        'border-[var(--ok)]/45 bg-[var(--ok-dim)] text-[var(--ok)] hover:bg-[var(--ok-dim)]',
                      state === 'wrong' &&
                        'border-destructive/45 bg-destructive/10 text-destructive hover:bg-destructive/10'
                    )}
                    onClick={() => checkMC(i)}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted font-sans text-xs font-bold text-muted-foreground">
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
            <p className="text-lg leading-relaxed text-muted-foreground">
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
            'mx-4 mb-4 flex flex-col items-stretch gap-2 rounded-2xl border-2 px-4 py-3',
            feedback.correct
              ? 'border-[var(--ok)]/30 bg-[var(--ok-dim)]'
              : 'border-destructive/30 bg-destructive/10'
          )}
        >
          <p
            className={cn(
              'font-sans text-[11px] font-bold tracking-[0.14em] uppercase',
              feedback.correct ? 'text-[var(--ok)]' : 'text-destructive'
            )}
          >
            {feedback.correct ? 'Richtig!' : 'Falsch'}
          </p>
          <div className="text-sm text-foreground">{feedback.main}</div>
          <p className="text-sm text-muted-foreground">{feedback.explanation}</p>
        </CardFooter>
      )}
    </Card>
  );
}
