import { useCallback, useState } from 'react';
import { BookOpen, PenLine } from 'lucide-react';
import { ExerciseCard } from '@/components/exercise-card';
import { SkillSectionEmptyState } from '@/components/skill-section-empty-state';
import { GrammarRulesPanel } from '@/components/grammar-rules-panel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  TOPICS,
  SET_SIZE_OPTIONS,
  type Level,
  type SetSize,
  type TopicId,
} from '@/data/topics';
import type { Exercise } from '@/types/exercise';
import { pickExercises } from '@/utils/pick-exercise';
import { cn } from '@/lib/utils';
import { useLearningProgress } from '@/contexts/learning-progress-context';

/** Grammar and writing practice (Schreiben) — topic sets, levels, exercise cards. */
export function GrammarPracticeView() {
  const [topic, setTopic] = useState<TopicId>('Konjunktiv II');
  const [level, setLevel] = useState<Level>('B1');
  const [setSize, setSetSize] = useState<SetSize>(5);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState({ total: 0, correct: 0, wrong: 0 });
  const [setId, setSetId] = useState(0);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [partialNotice, setPartialNotice] = useState<string | null>(null);

  const { recordAttempt, recordNewSet } = useLearningProgress();

  const topicLabel = TOPICS.find((t) => t.id === topic)?.label ?? topic;

  const onResult = useCallback(
    (correct: boolean) => {
      recordAttempt(correct);
      setScore((s) => ({
        total: s.total + 1,
        correct: s.correct + (correct ? 1 : 0),
        wrong: s.wrong + (correct ? 0 : 1),
      }));
    },
    [recordAttempt]
  );

  function onTopicChange(next: TopicId) {
    setTopic(next);
    setExercises([]);
    setError(null);
    setPartialNotice(null);
  }

  function generateSet() {
    setLoading(true);
    setError(null);
    setPartialNotice(null);
    try {
      const list = pickExercises(topic, level, setSize);
      if (!list.length) {
        setExercises([]);
        setError(
          'No exercises for this topic and level. Try another combination.'
        );
        return;
      }
      if (list.length < setSize) {
        setPartialNotice(
          `Showing all ${list.length} exercise${list.length === 1 ? '' : 's'} available for this topic and level (you asked for ${setSize}).`
        );
      }
      recordNewSet();
      setSetId((n) => n + 1);
      setExercises(list);
    } catch {
      setExercises([]);
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section
        className="app-reveal app-reveal-delay-1 mb-8"
        aria-labelledby="topic-heading"
      >
        <h2
          id="topic-heading"
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
            aria-controls="grammar-reference-sheet"
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
              setExercises([]);
              setError(null);
              setPartialNotice(null);
            }}
          >
            <SelectTrigger
              id="level"
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

          <Select
            value={String(setSize)}
            onValueChange={(value) => {
              setSetSize(Number(value) as SetSize);
              setExercises([]);
              setError(null);
              setPartialNotice(null);
            }}
          >
            <SelectTrigger
              id="set-size"
              className="w-full min-w-[8rem] sm:w-44"
              aria-label="Number of questions in the set"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SET_SIZE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} questions
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            size="lg"
            className="w-full font-sans sm:ml-auto sm:w-auto sm:min-w-[10rem]"
            disabled={loading}
            onClick={generateSet}
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

        {partialNotice && !error && (
          <Alert className="rounded-2xl border-2 border-[var(--chart-2)]/35 bg-[var(--duo-nav-active)]">
            <AlertTitle className="font-sans font-extrabold text-foreground">
              Note
            </AlertTitle>
            <AlertDescription className="font-sans font-semibold">
              {partialNotice}
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

        {!loading && exercises.length > 0 && (
          <div className="flex flex-col gap-6 pt-2">
            {exercises.map((ex, i) => (
              <div
                key={`${setId}-${i}`}
                className="app-reveal"
                style={{ animationDelay: `${Math.min(i * 0.05, 0.35)}s` }}
              >
                <ExerciseCard
                  exercise={ex}
                  topicLabel={topicLabel}
                  questionNumber={i + 1}
                  onResult={onResult}
                />
              </div>
            ))}
          </div>
        )}

        {!loading && exercises.length === 0 && !error && (
          <SkillSectionEmptyState
            tone="schreiben"
            icon={
              <PenLine
                className="size-9 text-primary"
                strokeWidth={2.25}
                aria-hidden
              />
            }
            title="Bereit zum Schreiben?"
            description={
              <>
                Wähle{' '}
                <span className="font-bold text-foreground">Thema</span>,{' '}
                <span className="font-bold text-foreground">Niveau</span> und{' '}
                <span className="font-bold text-foreground">Set-Größe</span>,
                dann{' '}
                <span className="font-bold text-foreground">Generate set</span>
                . Mehrere Aufgaben erscheinen nacheinander. Über{' '}
                <span className="font-bold text-foreground">
                  Grammar reference
                </span>{' '}
                kannst du bei Bedarf Wikipedia-Auszüge zum Grammatik-Thema
                öffnen.
              </>
            }
          />
        )}
      </div>

      <Sheet open={referenceOpen} onOpenChange={setReferenceOpen}>
        <SheetContent
          id="grammar-reference-sheet"
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
