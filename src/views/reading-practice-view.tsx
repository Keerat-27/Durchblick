import { useCallback, useState, type ReactNode } from 'react';
import { BookOpen } from 'lucide-react';
import { generateLesenRequest } from '@/api/lesen-api';
import { GrammarRulesPanel } from '@/components/grammar-rules-panel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { TOPICS, type Level, type TopicId } from '@/data/topics';
import type {
  LesenFillBlankQuestion,
  LesenGeneratedSet,
  LesenMultipleChoiceQuestion,
} from '@/types/lesen';
import { normalize } from '@/utils/normalize';
import { cn } from '@/lib/utils';
import { useLearningProgress } from '@/contexts/learning-progress-context';

const MC_LABELS = ['A', 'B', 'C', 'D'] as const;

function promptBlank(s: string): ReactNode {
  const parts = s.split('___');
  if (parts.length === 1) return s;
  return (
    <>
      {parts[0]}
      <strong className="font-extrabold text-[var(--chart-2)]">___</strong>
      {parts.slice(1).join('___')}
    </>
  );
}

function LesenMcBlock({
  question,
  questionNumber,
  topicLabel,
  selected,
  onSelect,
  submitted,
  wasCorrect,
}: {
  question: LesenMultipleChoiceQuestion;
  questionNumber: number;
  topicLabel: string;
  selected: number | null;
  onSelect: (index: number) => void;
  submitted: boolean;
  wasCorrect: boolean;
}) {
  const correctIdx = question.correct_index;

  return (
    <Card className="transition-transform duration-150 hover:translate-y-[-1px]">
      <CardHeader className="flex flex-row flex-wrap items-center gap-2 space-y-0 border-b-2 border-[var(--duo-border)] bg-muted/30 px-4 py-3.5 dark:border-border">
        <Badge
          variant="outline"
          className="border-[var(--chart-2)]/40 font-sans text-[10px] font-extrabold tracking-wider text-[var(--chart-2)] uppercase"
        >
          Q{questionNumber}
        </Badge>
        <Badge
          variant="secondary"
          className="border-2 border-[var(--duo-border)] font-sans text-[9px] font-extrabold tracking-[0.12em] uppercase dark:border-border"
        >
          Multiple choice
        </Badge>
        <span className="ml-auto font-sans text-xs font-extrabold text-muted-foreground">
          {topicLabel}
        </span>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <p className="font-sans text-sm font-bold text-muted-foreground">
          Read the passage, then answer.
        </p>
        <p className="font-sans text-lg font-bold leading-relaxed text-foreground md:text-xl">
          {question.question}
        </p>
        <div className="flex flex-col gap-3">
          {question.options.map((opt, i) => {
            let state: 'neutral' | 'selected' | 'correct' | 'wrong' = 'neutral';
            if (submitted) {
              if (i === correctIdx) state = 'correct';
              else if (i === selected && !wasCorrect) state = 'wrong';
            } else if (selected === i) {
              state = 'selected';
            }
            return (
              <Button
                key={i}
                type="button"
                variant="outline"
                disabled={submitted}
                aria-pressed={!submitted && selected === i}
                className={cn(
                  'h-auto min-h-[3.25rem] justify-start gap-3 rounded-2xl py-3 pr-4 pl-3 text-left font-sans text-[15px] font-bold whitespace-normal',
                  state === 'neutral' &&
                    !submitted &&
                    'active:translate-y-1 hover:border-[var(--chart-2)]/50 hover:bg-[var(--duo-nav-active)]',
                  state === 'selected' &&
                    'border-[var(--duo-nav-active-border)] bg-[var(--duo-nav-active)] text-foreground shadow-none ring-2 ring-[var(--chart-2)]/25 hover:border-[var(--duo-nav-active-border)] hover:bg-[var(--duo-nav-active)]',
                  state === 'correct' &&
                    'border-[var(--duo-correct-border)] bg-[var(--duo-correct-bg)] text-[var(--ok)] shadow-none hover:bg-[var(--duo-correct-bg)]',
                  state === 'wrong' &&
                    'border-[var(--duo-wrong-border)] bg-[var(--duo-wrong-bg)] text-destructive shadow-none hover:bg-[var(--duo-wrong-bg)]'
                )}
                onClick={() => onSelect(i)}
              >
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-xl border-2 border-[var(--duo-border)] font-sans text-xs font-extrabold text-muted-foreground dark:border-border',
                    state === 'selected' &&
                      'border-[var(--chart-2)] bg-card text-[var(--chart-2)]',
                    state === 'correct' &&
                      'border-[var(--duo-correct-border)] bg-card text-[var(--ok)]',
                    state === 'wrong' &&
                      'border-[var(--duo-wrong-border)] bg-card text-destructive'
                  )}
                >
                  {MC_LABELS[i]}
                </span>
                {opt}
              </Button>
            );
          })}
        </div>
      </CardContent>
      {submitted && (
        <CardFooter
          className={cn(
            'mx-4 mb-4 flex flex-col items-stretch gap-2 rounded-2xl border-2 px-4 py-4 shadow-[0_4px_0_0_var(--duo-border)] dark:shadow-[0_4px_0_0_var(--border)]',
            wasCorrect
              ? 'duo-pop-in border-[var(--duo-correct-border)] bg-[var(--duo-correct-bg)]'
              : 'duo-shake border-[var(--duo-wrong-border)] bg-[var(--duo-wrong-bg)]'
          )}
        >
          <p
            className={cn(
              'font-sans text-xs font-extrabold tracking-[0.12em] uppercase',
              wasCorrect ? 'text-[var(--ok)]' : 'text-destructive'
            )}
          >
            {wasCorrect ? 'Richtig!' : 'Falsch'}
          </p>
          {!wasCorrect && selected !== null && (
            <div className="font-sans text-sm font-bold text-foreground">
              Your answer:{' '}
              <span className="text-destructive">
                „{question.options[selected]}"
              </span>{' '}
              — Correct:{' '}
              <span className="text-[var(--ok)]">
                „{question.options[correctIdx]}"
              </span>
            </div>
          )}
          <p className="font-sans text-sm font-semibold text-muted-foreground">
            {question.explanation}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}

function LesenFillBlock({
  question,
  questionNumber,
  topicLabel,
  value,
  onChange,
  submitted,
  wasCorrect,
}: {
  question: LesenFillBlankQuestion;
  questionNumber: number;
  topicLabel: string;
  value: string;
  onChange: (next: string) => void;
  submitted: boolean;
  wasCorrect: boolean;
}) {
  const inputStateClass =
    submitted && value.trim()
      ? wasCorrect
        ? 'border-[var(--duo-correct-border)] bg-[var(--duo-correct-bg)]'
        : 'border-[var(--duo-wrong-border)] bg-[var(--duo-wrong-bg)]'
      : '';

  return (
    <Card className="transition-transform duration-150 hover:translate-y-[-1px]">
      <CardHeader className="flex flex-row flex-wrap items-center gap-2 space-y-0 border-b-2 border-[var(--duo-border)] bg-muted/30 px-4 py-3.5 dark:border-border">
        <Badge
          variant="outline"
          className="border-[var(--chart-2)]/40 font-sans text-[10px] font-extrabold tracking-wider text-[var(--chart-2)] uppercase"
        >
          Q{questionNumber}
        </Badge>
        <Badge
          variant="secondary"
          className="border-2 border-[var(--duo-border)] font-sans text-[9px] font-extrabold tracking-[0.12em] uppercase dark:border-border"
        >
          Fill in the blank
        </Badge>
        <span className="ml-auto font-sans text-xs font-extrabold text-muted-foreground">
          {topicLabel}
        </span>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <p className="font-sans text-sm font-bold text-muted-foreground">
          Complete the sentence from the passage.
        </p>
        <p className="font-sans text-lg font-bold leading-relaxed text-foreground md:text-xl">
          {promptBlank(question.question)}
        </p>
        <Input
          type="text"
          className={cn('font-sans', inputStateClass)}
          placeholder="Type your answer…"
          value={value}
          disabled={submitted}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </CardContent>
      {submitted && (
        <CardFooter
          className={cn(
            'mx-4 mb-4 flex flex-col items-stretch gap-2 rounded-2xl border-2 px-4 py-4 shadow-[0_4px_0_0_var(--duo-border)] dark:shadow-[0_4px_0_0_var(--border)]',
            wasCorrect
              ? 'duo-pop-in border-[var(--duo-correct-border)] bg-[var(--duo-correct-bg)]'
              : 'duo-shake border-[var(--duo-wrong-border)] bg-[var(--duo-wrong-bg)]'
          )}
        >
          <p
            className={cn(
              'font-sans text-xs font-extrabold tracking-[0.12em] uppercase',
              wasCorrect ? 'text-[var(--ok)]' : 'text-destructive'
            )}
          >
            {wasCorrect ? 'Richtig!' : 'Falsch'}
          </p>
          {!wasCorrect && (
            <div className="font-sans text-sm font-bold text-foreground">
              Your answer:{' '}
              <span className="text-destructive">„{value.trim()}"</span> —
              Correct:{' '}
              <span className="text-[var(--ok)]">„{question.answer}"</span>
            </div>
          )}
          <p className="font-sans text-sm font-semibold text-muted-foreground">
            {question.explanation}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}

/** Reading comprehension (Lesen) — topic, level, AI passage + four questions, batch submit. */
export function ReadingPracticeView() {
  const [topic, setTopic] = useState<TopicId>('Konjunktiv II');
  const [level, setLevel] = useState<Level>('B1');
  const [data, setData] = useState<LesenGeneratedSet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState({ total: 0, correct: 0, wrong: 0 });
  const [setId, setSetId] = useState(0);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [mcAnswers, setMcAnswers] = useState<
    [number | null, number | null, number | null]
  >([null, null, null]);
  const [fillAnswer, setFillAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { recordAttempt, recordNewSet } = useLearningProgress();

  const topicLabel = TOPICS.find((t) => t.id === topic)?.label ?? topic;

  const clearRound = useCallback(() => {
    setData(null);
    setError(null);
    setMcAnswers([null, null, null]);
    setFillAnswer('');
    setSubmitted(false);
  }, []);

  function onTopicChange(next: TopicId) {
    setTopic(next);
    clearRound();
  }

  async function generateSet() {
    setLoading(true);
    setError(null);
    setSubmitted(false);
    setData(null);
    setMcAnswers([null, null, null]);
    setFillAnswer('');
    try {
      const payload = await generateLesenRequest(topicLabel, level);
      if (!payload.questions || payload.questions.length !== 4) {
        setError('Invalid response from server. Try again.');
        return;
      }
      recordNewSet();
      setSetId((n) => n + 1);
      setData(payload);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Something went wrong. Try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  function submitSet() {
    if (!data || submitted) return;
    if (mcAnswers.some((x) => x === null)) return;
    if (!fillAnswer.trim()) return;

    const q0 = data.questions[0];
    const q1 = data.questions[1];
    const q2 = data.questions[2];
    const q3 = data.questions[3];
    if (
      q0.type !== 'multiple_choice' ||
      q1.type !== 'multiple_choice' ||
      q2.type !== 'multiple_choice' ||
      q3.type !== 'fill_blank'
    ) {
      setError('Unexpected question format. Generate a new set.');
      return;
    }

    let nCorrect = 0;
    const mcList = [q0, q1, q2] as const;
    for (let i = 0; i < 3; i++) {
      const ok = mcAnswers[i] === mcList[i].correct_index;
      if (ok) nCorrect++;
      recordAttempt(ok);
    }
    const fillOk = normalize(fillAnswer) === normalize(q3.answer);
    if (fillOk) nCorrect++;
    recordAttempt(fillOk);

    setScore((s) => ({
      total: s.total + 4,
      correct: s.correct + nCorrect,
      wrong: s.wrong + (4 - nCorrect),
    }));
    setSubmitted(true);
  }

  const allAnswered =
    mcAnswers.every((x) => x !== null) && fillAnswer.trim().length > 0;

  const summaryCorrect =
    data &&
    submitted &&
    data.questions[0]?.type === 'multiple_choice' &&
    data.questions[1]?.type === 'multiple_choice' &&
    data.questions[2]?.type === 'multiple_choice' &&
    data.questions[3]?.type === 'fill_blank'
      ? (() => {
          let n = 0;
          if (mcAnswers[0] === data.questions[0].correct_index) n++;
          if (mcAnswers[1] === data.questions[1].correct_index) n++;
          if (mcAnswers[2] === data.questions[2].correct_index) n++;
          if (
            normalize(fillAnswer) ===
            normalize(data.questions[3].answer)
          ) {
            n++;
          }
          return n;
        })()
      : 0;

  return (
    <>
      <section
        className="app-reveal app-reveal-delay-1 mb-8"
        aria-labelledby="lesen-topic-heading"
      >
        <h2
          id="lesen-topic-heading"
          className="font-sans text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase"
        >
          Topic
        </h2>
        <div
          className="mt-3 flex flex-wrap gap-2.5"
          role="tablist"
          aria-label="Grammar topics"
        >
          {TOPICS.map((t) => (
            <Button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={topic === t.id}
              size="sm"
              variant={topic === t.id ? 'default' : 'outline'}
              className={cn(
                'rounded-full border-2 px-4 font-sans text-[13px] font-extrabold transition-transform duration-100',
                topic === t.id
                  ? 'shadow-[0_4px_0_0_var(--primary-shadow)] hover:-translate-y-px'
                  : 'border-[var(--duo-border-strong)] shadow-[0_4px_0_0_var(--duo-border-strong)] hover:-translate-y-px hover:bg-muted dark:border-input dark:shadow-[0_4px_0_0_var(--border)]'
              )}
              onClick={() => onTopicChange(t.id)}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </section>

      <div className="app-reveal app-reveal-delay-2 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-sans text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
            Practice
          </h2>
          <Button
            type="button"
            variant={referenceOpen ? 'default' : 'outline'}
            size="sm"
            className="w-fit gap-2 rounded-full font-sans text-[11px] font-extrabold tracking-[0.12em] uppercase"
            aria-expanded={referenceOpen}
            aria-controls="lesen-reference-sheet"
            onClick={() => setReferenceOpen((open) => !open)}
          >
            <BookOpen className="size-3.5" aria-hidden />
            {referenceOpen ? 'Close reference' : 'Grammar reference'}
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Select
            value={level}
            onValueChange={(value) => {
              setLevel(value as Level);
              clearRound();
            }}
          >
            <SelectTrigger
              id="lesen-level"
              className="w-full min-w-[5.5rem] sm:w-36"
              aria-label="CEFR level"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A1">A1</SelectItem>
              <SelectItem value="A2">A2</SelectItem>
              <SelectItem value="B1">B1</SelectItem>
              <SelectItem value="B2">B2</SelectItem>
            </SelectContent>
          </Select>

          <div
            className="flex h-10 w-full min-w-[8rem] items-center rounded-md border-2 border-[var(--duo-border-strong)] bg-muted/40 px-3 font-sans text-sm font-extrabold text-muted-foreground sm:w-44 dark:border-border"
            aria-hidden
          >
            4 questions
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full font-sans sm:ml-auto sm:w-auto sm:min-w-[10rem]"
            disabled={loading}
            onClick={() => void generateSet()}
          >
            Generate set
          </Button>
        </div>

        <Card className="bg-[var(--duo-nav-active)]/40 dark:bg-card">
          <CardContent className="flex flex-wrap gap-x-8 gap-y-3 py-4">
            <div className="flex items-center gap-2 font-sans text-sm font-bold text-muted-foreground">
              <span
                className="size-2.5 shrink-0 rounded-full bg-muted-foreground/45"
                aria-hidden
              />
              <span className="text-lg font-extrabold text-foreground tabular-nums">
                {score.total}
              </span>
              <span>attempted</span>
            </div>
            <Separator
              orientation="vertical"
              className="hidden h-7 sm:block"
            />
            <div className="flex items-center gap-2 font-sans text-sm font-bold text-muted-foreground">
              <span
                className="size-2.5 shrink-0 rounded-full bg-primary"
                aria-hidden
              />
              <span className="text-lg font-extrabold text-primary tabular-nums">
                {score.correct}
              </span>
              <span>correct</span>
            </div>
            <div className="flex items-center gap-2 font-sans text-sm font-bold text-muted-foreground">
              <span
                className="size-2.5 shrink-0 rounded-full bg-destructive"
                aria-hidden
              />
              <span className="text-lg font-extrabold text-destructive tabular-nums">
                {score.wrong}
              </span>
              <span>wrong</span>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert
            variant="destructive"
            className="rounded-2xl border-2 border-[var(--duo-wrong-border)] bg-[var(--duo-wrong-bg)]"
          >
            <AlertTitle className="font-sans font-extrabold">Error</AlertTitle>
            <AlertDescription className="font-sans font-semibold">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {loading && (
          <div
            className="flex flex-col items-center gap-4 py-12 text-muted-foreground"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <span
              className="size-14 shrink-0 rounded-full border-4 border-[var(--duo-border)] border-t-primary animate-spin dark:border-border"
              aria-hidden
            />
            <p className="font-sans text-sm font-extrabold tracking-wide">
              Loading…
            </p>
          </div>
        )}

        {!loading && data && (
          <div className="flex flex-col gap-6 pt-2">
            <Card
              key={`passage-${setId}`}
              className="app-reveal border-2 border-[var(--duo-border)] bg-card shadow-[0_4px_0_0_var(--duo-border)] dark:border-border"
            >
              <CardHeader className="border-b-2 border-[var(--duo-border)] bg-muted/25 pb-4 dark:border-border">
                <p className="font-sans text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
                  Reading passage
                </p>
                <p className="mt-1 font-heading text-xl font-extrabold text-foreground md:text-2xl">
                  {topicLabel} · {level}
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="font-sans text-[1.05rem] leading-[1.75] text-foreground md:text-lg md:leading-relaxed">
                  {data.passage.split(/\n+/).map((para, i) => (
                    <p key={i} className={i > 0 ? 'mt-4' : ''}>
                      {para}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {data.questions[0]?.type === 'multiple_choice' && (
              <div
                className="app-reveal"
                style={{ animationDelay: '0.05s' }}
              >
                <LesenMcBlock
                  question={data.questions[0]}
                  questionNumber={1}
                  topicLabel={topicLabel}
                  selected={mcAnswers[0]}
                  onSelect={(i) =>
                    setMcAnswers((prev) => [i, prev[1], prev[2]])
                  }
                  submitted={submitted}
                  wasCorrect={mcAnswers[0] === data.questions[0].correct_index}
                />
              </div>
            )}
            {data.questions[1]?.type === 'multiple_choice' && (
              <div
                className="app-reveal"
                style={{ animationDelay: '0.1s' }}
              >
                <LesenMcBlock
                  question={data.questions[1]}
                  questionNumber={2}
                  topicLabel={topicLabel}
                  selected={mcAnswers[1]}
                  onSelect={(i) =>
                    setMcAnswers((prev) => [prev[0], i, prev[2]])
                  }
                  submitted={submitted}
                  wasCorrect={mcAnswers[1] === data.questions[1].correct_index}
                />
              </div>
            )}
            {data.questions[2]?.type === 'multiple_choice' && (
              <div
                className="app-reveal"
                style={{ animationDelay: '0.15s' }}
              >
                <LesenMcBlock
                  question={data.questions[2]}
                  questionNumber={3}
                  topicLabel={topicLabel}
                  selected={mcAnswers[2]}
                  onSelect={(i) =>
                    setMcAnswers((prev) => [prev[0], prev[1], i])
                  }
                  submitted={submitted}
                  wasCorrect={mcAnswers[2] === data.questions[2].correct_index}
                />
              </div>
            )}
            {data.questions[3]?.type === 'fill_blank' && (
              <div
                className="app-reveal"
                style={{ animationDelay: '0.2s' }}
              >
                <LesenFillBlock
                  question={data.questions[3]}
                  questionNumber={4}
                  topicLabel={topicLabel}
                  value={fillAnswer}
                  onChange={setFillAnswer}
                  submitted={submitted}
                  wasCorrect={
                    normalize(fillAnswer) ===
                    normalize(data.questions[3].answer)
                  }
                />
              </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                size="lg"
                className="w-full font-sans sm:w-auto sm:min-w-[12rem]"
                disabled={!allAnswered || submitted}
                onClick={submitSet}
              >
                Submit answers
              </Button>
              {!allAnswered && !submitted && (
                <p className="font-sans text-xs font-bold text-muted-foreground sm:text-end">
                  Answer all four questions to submit the set.
                </p>
              )}
            </div>

            {submitted && (
              <Card
                className={cn(
                  'app-reveal border-2 shadow-[0_4px_0_0_var(--duo-border)] dark:shadow-[0_4px_0_0_var(--border)]',
                  summaryCorrect === 4
                    ? 'border-[var(--duo-correct-border)] bg-[var(--duo-correct-bg)]'
                    : summaryCorrect === 0
                      ? 'border-[var(--duo-wrong-border)] bg-[var(--duo-wrong-bg)]'
                      : 'border-[var(--chart-2)]/40 bg-[var(--duo-nav-active)]'
                )}
              >
                <CardHeader>
                  <p className="font-sans text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
                    Set summary
                  </p>
                  <p className="font-heading text-2xl font-extrabold text-foreground">
                    {summaryCorrect} / 4 correct
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="font-sans text-sm font-semibold text-muted-foreground">
                    {summaryCorrect === 4
                      ? 'Excellent — full comprehension on this passage.'
                      : summaryCorrect === 0
                        ? 'Review the explanations above, then try another set.'
                        : 'Solid work — generate another passage to keep going.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!loading && !data && !error && (
          <Card className="app-reveal app-reveal-delay-3 border-dashed border-[var(--duo-border-strong)] bg-muted/25 dark:border-border">
            <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
              <span className="flex size-16 items-center justify-center rounded-full border-4 border-dashed border-primary/35 bg-[var(--duo-correct-bg)] font-heading text-2xl font-extrabold text-primary">
                DE
              </span>
              <p className="max-w-sm font-heading text-lg font-extrabold text-foreground md:text-xl">
                Choose topic and level — then generate a reading set
              </p>
              <p className="max-w-md font-sans text-sm font-semibold text-muted-foreground">
                You will get one passage (about 150–200 words) and four
                comprehension questions. Use “Grammar reference” for Wikipedia
                extracts when you want them.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Sheet open={referenceOpen} onOpenChange={setReferenceOpen}>
        <SheetContent
          id="lesen-reference-sheet"
          side="left"
          showCloseButton
          className="w-full gap-0 border-[var(--duo-border)] bg-card p-0 sm:max-w-md dark:border-border"
        >
          <SheetHeader className="border-b-2 border-[var(--duo-border)] px-5 py-4 text-left dark:border-border">
            <SheetTitle className="font-sans text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
              Grammar reference
            </SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-10 pt-4">
            {referenceOpen && (
              <GrammarRulesPanel
                key={topic}
                topicId={topic}
                topicLabel={topicLabel}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
