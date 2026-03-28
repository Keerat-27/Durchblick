import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  GraduationCap,
  Library,
  ListChecks,
  ListFilter,
  Minus,
  PenLine,
  Plus,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { generateLesenRequest } from '@/api/lesen-api';
import { GrammarRulesPanel } from '@/components/grammar-rules-panel';
import { SkillSectionEmptyState } from '@/components/skill-section-empty-state';
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
import {
  getDailyLesenTheme,
  LESEN_CATEGORIES,
  LESEN_QUESTION_COUNT,
  type LesenCategory,
} from '@/data/lesen-content';
import { LEVELS, TOPICS, type Level, type TopicId } from '@/data/topics';
import type {
  LesenFillBlankQuestion,
  LesenGeneratedSet,
  LesenMultipleChoiceQuestion,
  LesenQuestion,
} from '@/types/lesen';
import { normalize } from '@/utils/normalize';
import { cn } from '@/lib/utils';
import { useLearningProgress } from '@/contexts/learning-progress-context';

const MC_LABELS = ['A', 'B', 'C', 'D'] as const;

/** Per-category tint for unselected chips (selected stays primary). */
const LESEN_CATEGORY_ACCENTS: Record<LesenCategory, string> = {
  Kultur:
    'border-[var(--chart-4)]/40 text-foreground hover:border-[var(--chart-4)]/55 hover:bg-[var(--chart-4)]/10',
  Technologie:
    'border-[var(--chart-2)]/40 text-foreground hover:border-[var(--chart-2)]/55 hover:bg-[var(--chart-2)]/10',
  Sport:
    'border-[var(--chart-3)]/45 text-foreground hover:border-[var(--chart-3)]/65 hover:bg-[var(--chart-3)]/10',
  Reisen:
    'border-[var(--chart-2)]/35 text-foreground hover:border-[var(--chart-2)]/50 hover:bg-[var(--chart-2)]/8',
  Alltag:
    'border-muted-foreground/30 text-foreground hover:border-muted-foreground/45 hover:bg-muted/80',
  Politik:
    'border-destructive/30 text-foreground hover:border-destructive/45 hover:bg-destructive/[0.08]',
  Natur:
    'border-[var(--chart-1)]/40 text-foreground hover:border-[var(--chart-1)]/55 hover:bg-[var(--chart-1)]/10',
  Geschichte:
    'border-[var(--chart-5)]/45 text-foreground hover:border-[var(--chart-5)]/60 hover:bg-[var(--chart-5)]/10',
};

const LESEN_FILTER_MENU_WIDTH_PX = 320;

function isValidLesenQuestionSequence(questions: LesenQuestion[]): boolean {
  const n = questions.length;
  if (
    n < LESEN_QUESTION_COUNT.min ||
    n > LESEN_QUESTION_COUNT.max
  ) {
    return false;
  }
  const last = n - 1;
  for (let i = 0; i < last; i++) {
    if (questions[i]?.type !== 'multiple_choice') return false;
  }
  return questions[last]?.type === 'fill_blank';
}

/**
 * Portal-based filter panel (avoids Base UI Menu modal / viewport issues that
 * could blank the screen inside overflow-hidden cards).
 */
function LesenFiltersPopover({
  category,
  passageFocus,
  level,
  questionCount,
  onCategoryCommitted,
  onLevelCommitted,
  onQuestionCountCommitted,
}: {
  category: LesenCategory;
  passageFocus: string | null;
  level: Level;
  questionCount: number;
  onCategoryCommitted: (c: LesenCategory) => void;
  onLevelCommitted: (lv: Level) => void;
  onQuestionCountCommitted: (n: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const w = LESEN_FILTER_MENU_WIDTH_PX;
    const left = Math.min(
      window.innerWidth - w - 8,
      Math.max(8, r.right - w)
    );
    setPos({ top: r.bottom + 6, left });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updatePosition();
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('scroll', onScrollOrResize, true);
    return () => {
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || triggerRef.current?.contains(t)) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        size="lg"
        className="h-12 w-full justify-between gap-2 rounded-2xl border-2 font-sans font-extrabold sm:w-auto sm:min-w-[12rem]"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? 'lesen-filter-popover' : undefined}
        aria-label="Lesen-Filter: Kategorie, Niveau und Fragenzahl"
        onClick={() => {
          if (open) setOpen(false);
          else {
            updatePosition();
            setOpen(true);
          }
        }}
      >
        <span className="flex items-center gap-2">
          <ListFilter className="size-4 shrink-0 text-[var(--chart-2)]" aria-hidden />
          Filter
          <Badge
            variant="secondary"
            className="ml-1 max-w-[9rem] truncate border border-[var(--duo-border)] font-sans text-[11px] font-extrabold dark:border-border"
            title={category}
          >
            {category}
          </Badge>
          <Badge
            variant="secondary"
            className="ml-0.5 border border-[var(--duo-border)] font-sans text-[11px] font-extrabold tabular-nums dark:border-border"
          >
            {level}
          </Badge>
        </span>
        <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden />
      </Button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            id="lesen-filter-popover"
            role="dialog"
            aria-labelledby="lesen-filter-cefr-label"
            className="fixed z-[200] w-80 max-w-[calc(100vw-1rem)] rounded-xl border-2 border-[var(--duo-border)] bg-popover p-2 font-sans text-popover-foreground shadow-lg ring-1 ring-foreground/10 dark:border-border"
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="border-b border-border pb-3">
              <div className="flex flex-col gap-0.5 px-2 pt-1 sm:flex-row sm:items-end sm:justify-between">
                <p
                  id="lesen-filter-category-label"
                  className="font-sans text-[10px] font-extrabold tracking-[0.12em] text-muted-foreground uppercase"
                >
                  Inhaltskategorie
                </p>
                {passageFocus?.trim() && (
                  <p className="font-sans text-[11px] font-bold text-[var(--chart-2)] sm:max-w-[11rem] sm:truncate sm:text-end">
                    Fokus: {passageFocus.trim()}
                  </p>
                )}
              </div>
              <div
                className="mt-3 flex flex-wrap gap-2 px-0.5"
                role="tablist"
                aria-labelledby="lesen-filter-category-label"
              >
                {LESEN_CATEGORIES.map((c) => (
                  <Button
                    key={c}
                    type="button"
                    role="tab"
                    aria-selected={category === c}
                    size="sm"
                    variant={category === c ? 'default' : 'outline'}
                    className={cn(
                      'rounded-full border-2 px-3 py-1.5 font-sans text-[11px] font-extrabold transition-all duration-150',
                      category === c
                        ? 'shadow-[0_3px_0_0_var(--primary-shadow)] hover:-translate-y-px'
                        : cn(
                            'shadow-[0_2px_0_0_var(--duo-border-strong)] dark:shadow-[0_2px_0_0_var(--border)]',
                            LESEN_CATEGORY_ACCENTS[c]
                          )
                    )}
                    onClick={() => {
                      onCategoryCommitted(c);
                    }}
                  >
                    {c}
                  </Button>
                ))}
              </div>
            </div>
            <p
              id="lesen-filter-cefr-label"
              className="mt-3 px-2 py-1.5 font-sans text-[10px] font-extrabold tracking-[0.12em] text-muted-foreground uppercase"
            >
              CEFR-Niveau
            </p>
            <div className="flex flex-col gap-0.5" role="listbox" aria-label="CEFR-Niveau">
              {LEVELS.map((lv) => (
                <button
                  key={lv}
                  type="button"
                  role="option"
                  aria-selected={level === lv}
                  className={cn(
                    'flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-extrabold outline-none transition-colors',
                    level === lv
                      ? 'bg-[var(--duo-nav-active)] text-foreground ring-2 ring-[var(--chart-2)]/25'
                      : 'hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring'
                  )}
                  onClick={() => {
                    onLevelCommitted(lv);
                    setOpen(false);
                  }}
                >
                  {lv}
                </button>
              ))}
            </div>
            <div className="mt-3 border-t border-border pt-3">
              <p
                id="lesen-filter-fragen-label"
                className="px-2 pb-2 font-sans text-[10px] font-extrabold tracking-[0.12em] text-muted-foreground uppercase"
              >
                Fragen pro Set
              </p>
              <div
                className="flex items-center justify-between gap-2 rounded-lg border border-[var(--duo-border)]/80 bg-muted/40 px-2 py-1.5 dark:border-border/60"
                role="group"
                aria-labelledby="lesen-filter-fragen-label"
              >
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-9 shrink-0 rounded-lg border-2 shadow-none"
                  aria-label="Weniger Fragen"
                  disabled={questionCount <= LESEN_QUESTION_COUNT.min}
                  onClick={() =>
                    onQuestionCountCommitted(questionCount - 1)
                  }
                >
                  <Minus className="size-4" aria-hidden />
                </Button>
                <span className="min-w-[2.5rem] text-center font-heading text-xl font-extrabold tabular-nums text-foreground">
                  {questionCount}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-9 shrink-0 rounded-lg border-2 shadow-none"
                  aria-label="Mehr Fragen"
                  disabled={questionCount >= LESEN_QUESTION_COUNT.max}
                  onClick={() =>
                    onQuestionCountCommitted(questionCount + 1)
                  }
                >
                  <Plus className="size-4" aria-hidden />
                </Button>
              </div>
              <p className="mt-2 flex items-start gap-2 px-2 font-sans text-[11px] font-semibold leading-snug text-muted-foreground">
                <CircleHelp
                  className="mt-0.5 size-3.5 shrink-0 text-[var(--chart-2)]"
                  aria-hidden
                />
                Inkl. einer Lückentext-Frage; der Rest ist Multiple Choice.
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

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
    <Card className="overflow-hidden rounded-3xl border-2 border-[var(--duo-border)] shadow-[0_5px_0_0_var(--duo-border-strong)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_var(--duo-border-strong)] dark:border-border dark:shadow-[0_5px_0_0_var(--border)] dark:hover:shadow-[0_6px_0_0_var(--border)]">
      <CardHeader className="flex flex-row flex-wrap items-center gap-2 space-y-0 border-b-2 border-[var(--duo-border)] bg-gradient-to-r from-muted/50 to-muted/20 px-4 py-4 dark:border-border">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--chart-2)]/15 text-[var(--chart-2)]">
          <ListChecks className="size-4" aria-hidden />
        </div>
        <Badge
          variant="outline"
          className="border-[var(--chart-2)]/45 font-sans text-[10px] font-extrabold tracking-wider text-[var(--chart-2)] uppercase"
        >
          Q{questionNumber}
        </Badge>
        <Badge
          variant="secondary"
          className="border-2 border-[var(--duo-border)] font-sans text-[9px] font-extrabold tracking-[0.12em] uppercase dark:border-border"
        >
          Multiple choice
        </Badge>
        <span className="ml-auto max-w-[min(12rem,46%)] truncate text-end font-sans text-[11px] font-extrabold leading-tight text-muted-foreground">
          {topicLabel}
        </span>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5 pt-5">
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
    <Card className="overflow-hidden rounded-3xl border-2 border-[var(--duo-border)] shadow-[0_5px_0_0_var(--duo-border-strong)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_var(--duo-border-strong)] dark:border-border dark:shadow-[0_5px_0_0_var(--border)] dark:hover:shadow-[0_6px_0_0_var(--border)]">
      <CardHeader className="flex flex-row flex-wrap items-center gap-2 space-y-0 border-b-2 border-[var(--duo-border)] bg-gradient-to-r from-primary/[0.08] to-muted/30 px-4 py-4 dark:border-border">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <PenLine className="size-4" aria-hidden />
        </div>
        <Badge
          variant="outline"
          className="border-primary/35 font-sans text-[10px] font-extrabold tracking-wider text-primary uppercase"
        >
          Q{questionNumber}
        </Badge>
        <Badge
          variant="secondary"
          className="border-2 border-[var(--duo-border)] font-sans text-[9px] font-extrabold tracking-[0.12em] uppercase dark:border-border"
        >
          Fill in the blank
        </Badge>
        <span className="ml-auto max-w-[min(12rem,46%)] truncate text-end font-sans text-[11px] font-extrabold leading-tight text-muted-foreground">
          {topicLabel}
        </span>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5 pt-5">
        <p className="font-sans text-sm font-bold text-muted-foreground">
          Complete the sentence from the passage.
        </p>
        <p className="font-sans text-lg font-bold leading-relaxed text-foreground md:text-xl">
          {promptBlank(question.question)}
        </p>
        <Input
          type="text"
          className={cn(
            'h-12 rounded-xl border-2 font-sans text-base font-semibold',
            inputStateClass
          )}
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

/** Reading comprehension (Lesen) — category, level, configurable question count, AI passage. */
export function ReadingPracticeView() {
  const [category, setCategory] = useState<LesenCategory>(
    () => getDailyLesenTheme().category
  );
  const [passageFocus, setPassageFocus] = useState<string | null>(() =>
    getDailyLesenTheme().theme
  );
  const [referenceGrammarTopic, setReferenceGrammarTopic] =
    useState<TopicId>('Konjunktiv II');
  const [level, setLevel] = useState<Level>('B1');
  const [questionCount, setQuestionCount] = useState<number>(
    LESEN_QUESTION_COUNT.default
  );
  const [data, setData] = useState<LesenGeneratedSet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [setId, setSetId] = useState(0);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [mcAnswers, setMcAnswers] = useState<(number | null)[]>([]);
  const [fillAnswer, setFillAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { recordAttempt, recordNewSet } = useLearningProgress();

  const contentLabel = passageFocus?.trim()
    ? `${category} · ${passageFocus.trim()}`
    : category;

  const dailyTheme = getDailyLesenTheme();
  const todayFormatted = new Date().toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const clearRound = useCallback(() => {
    setData(null);
    setError(null);
    setMcAnswers([]);
    setFillAnswer('');
    setSubmitted(false);
  }, []);

  function onCategoryChange(next: LesenCategory) {
    setCategory(next);
    setPassageFocus(null);
    clearRound();
  }

  function applyDailyTheme() {
    const t = getDailyLesenTheme();
    setCategory(t.category);
    setPassageFocus(t.theme);
    clearRound();
  }

  async function generateSet() {
    setLoading(true);
    setError(null);
    setSubmitted(false);
    setData(null);
    setMcAnswers([]);
    setFillAnswer('');
    try {
      const payload = await generateLesenRequest({
        category,
        passageFocus,
        level,
        questionCount,
      });
      if (
        !payload.questions ||
        payload.questions.length !== questionCount ||
        !isValidLesenQuestionSequence(payload.questions)
      ) {
        setError('Invalid response from server. Try again.');
        return;
      }
      const mcSlots = questionCount - 1;
      recordNewSet();
      setSetId((n) => n + 1);
      setMcAnswers(Array.from({ length: mcSlots }, () => null));
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
    const qs = data.questions;
    const last = qs.length - 1;
    if (last < 1) return;
    if (mcAnswers.length !== last || mcAnswers.some((x) => x === null)) return;
    if (!fillAnswer.trim()) return;

    if (!isValidLesenQuestionSequence(qs)) {
      setError('Unexpected question format. Generate a new set.');
      return;
    }

    for (let i = 0; i < last; i++) {
      const q = qs[i];
      if (q.type !== 'multiple_choice') {
        setError('Unexpected question format. Generate a new set.');
        return;
      }
      const ok = mcAnswers[i] === q.correct_index;
      recordAttempt(ok);
    }
    const fillQ = qs[last];
    if (fillQ.type !== 'fill_blank') {
      setError('Unexpected question format. Generate a new set.');
      return;
    }
    const fillOk = normalize(fillAnswer) === normalize(fillQ.answer);
    recordAttempt(fillOk);

    setSubmitted(true);
  }

  const totalQuestions = data?.questions.length ?? 0;
  const mcSlots = totalQuestions > 0 ? totalQuestions - 1 : 0;

  const allAnswered =
    data !== null &&
    mcSlots > 0 &&
    mcAnswers.length === mcSlots &&
    mcAnswers.every((x) => x !== null) &&
    fillAnswer.trim().length > 0;

  const summaryCorrect =
    data &&
    submitted &&
    isValidLesenQuestionSequence(data.questions) &&
    mcAnswers.length === data.questions.length - 1
      ? (() => {
          let n = 0;
          const last = data.questions.length - 1;
          for (let i = 0; i < last; i++) {
            const q = data.questions[i];
            if (q?.type === 'multiple_choice' && mcAnswers[i] === q.correct_index) {
              n++;
            }
          }
          const fillQ = data.questions[last];
          if (
            fillQ?.type === 'fill_blank' &&
            normalize(fillAnswer) === normalize(fillQ.answer)
          ) {
            n++;
          }
          return n;
        })()
      : 0;

  return (
    <>
      <section
        className="app-reveal app-reveal-delay-1 mb-10 space-y-8"
        aria-labelledby="lesen-thema-heading"
      >
        <div
          className="relative overflow-hidden rounded-3xl border-2 border-[var(--chart-2)]/30 bg-card shadow-[0_6px_0_0_var(--duo-border-strong)] dark:border-[var(--chart-2)]/22 dark:shadow-[0_6px_0_0_var(--border)]"
          role="region"
          aria-label="Tagesempfehlung Lesen"
        >
          <div
            className="pointer-events-none absolute -right-24 -top-28 size-[min(100vw,22rem)] rounded-full bg-[var(--chart-2)]/[0.09] blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 left-0 size-[min(90vw,16rem)] rounded-full bg-primary/[0.07] blur-3xl"
            aria-hidden
          />
          <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:gap-10 md:p-8">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2 gap-y-1">
                <p
                  id="lesen-thema-heading"
                  className="font-sans text-[11px] font-extrabold tracking-[0.14em] text-[var(--chart-2)] uppercase"
                >
                  Thema des Tages
                </p>
                <span
                  className="hidden h-1 w-1 rounded-full bg-muted-foreground/35 sm:inline"
                  aria-hidden
                />
                <p className="font-sans text-xs font-bold capitalize text-muted-foreground">
                  {todayFormatted}
                </p>
              </div>
              <p className="font-heading text-2xl font-extrabold leading-[1.2] tracking-tight text-foreground md:text-3xl">
                {dailyTheme.theme}
              </p>
              <Badge
                variant="secondary"
                className="w-fit border-2 border-[var(--duo-border)] bg-[var(--chart-2)]/10 font-sans text-[10px] font-extrabold tracking-wider text-[var(--chart-2)] uppercase dark:border-border"
              >
                {dailyTheme.category}
              </Badge>
              <p className="max-w-xl pt-1 font-sans text-sm font-medium leading-relaxed text-muted-foreground">
                Ein Klick setzt Kategorie und Schwerpunkt für deinen nächsten
                Lesetext. Kategorie änderst du jederzeit unter{' '}
                <span className="font-bold text-foreground">Filter</span>.
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row md:flex-col md:items-end">
              <div className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[var(--duo-border)] bg-muted/30 px-4 py-3 dark:border-border md:min-w-[7.5rem]">
                <CalendarDays
                  className="size-5 shrink-0 text-[var(--chart-2)]"
                  aria-hidden
                />
                <span className="font-sans text-xs font-extrabold text-muted-foreground">
                  Heute
                </span>
              </div>
              <Button
                type="button"
                variant="default"
                size="lg"
                className="rounded-2xl font-sans text-[12px] font-extrabold tracking-[0.06em] uppercase shadow-[0_4px_0_0_var(--primary-shadow)]"
                onClick={applyDailyTheme}
              >
                Thema übernehmen
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="app-reveal app-reveal-delay-2 space-y-6">
        <Card className="overflow-hidden rounded-3xl border-2 border-[var(--duo-border)] shadow-[0_5px_0_0_var(--duo-border-strong)] dark:border-border dark:shadow-[0_5px_0_0_var(--border)]">
          <CardHeader className="flex flex-col gap-4 space-y-0 border-b-2 border-[var(--duo-border)] bg-gradient-to-br from-[var(--duo-nav-active)]/50 to-card px-5 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-border">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--chart-2)]/18 text-[var(--chart-2)] ring-2 ring-[var(--chart-2)]/15">
                <GraduationCap className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="font-heading text-lg font-extrabold tracking-tight text-foreground">
                  Übung starten
                </h2>
                <p className="font-sans text-xs font-semibold text-muted-foreground">
                  Unter Filter: Kategorie, Niveau, Fragenzahl — dann Text erzeugen
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant={referenceOpen ? 'default' : 'outline'}
              size="sm"
              className="w-full shrink-0 gap-2 rounded-xl font-sans text-[11px] font-extrabold tracking-[0.1em] uppercase sm:w-auto"
              aria-expanded={referenceOpen}
              aria-controls="lesen-reference-sheet"
              onClick={() => setReferenceOpen((open) => !open)}
            >
              <Library className="size-3.5" aria-hidden />
              {referenceOpen ? 'Hilfe schließen' : 'Grammatik-Hilfe'}
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-4">
            <LesenFiltersPopover
              category={category}
              passageFocus={passageFocus}
              level={level}
              questionCount={questionCount}
              onCategoryCommitted={onCategoryChange}
              onLevelCommitted={(lv) => {
                setLevel(lv);
                clearRound();
              }}
              onQuestionCountCommitted={(n) => {
                setQuestionCount(n);
                clearRound();
              }}
            />

            <Button
              type="button"
              size="lg"
              className="h-12 w-full gap-2 rounded-2xl font-sans text-[15px] font-extrabold shadow-[0_4px_0_0_var(--primary-shadow)] sm:w-auto sm:min-w-[11rem]"
              disabled={loading}
              onClick={() => void generateSet()}
            >
              <Sparkles className="size-4" aria-hidden />
              Text erzeugen
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Alert
            variant="destructive"
            className="rounded-3xl border-2 border-[var(--duo-wrong-border)] bg-[var(--duo-wrong-bg)] shadow-[0_4px_0_0_var(--duo-wrong-border)]"
          >
            <AlertTitle className="font-sans font-extrabold">Fehler</AlertTitle>
            <AlertDescription className="font-sans font-semibold">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {loading && (
          <Card
            className="overflow-hidden rounded-3xl border-2 border-dashed border-[var(--chart-2)]/35 bg-gradient-to-b from-[var(--chart-2)]/[0.06] to-card"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <CardContent className="flex flex-col items-center gap-6 py-14">
              <div className="relative flex size-20 items-center justify-center" aria-hidden>
                <span className="absolute inset-0 rounded-full border-4 border-[var(--duo-border)] border-t-primary animate-spin dark:border-border" />
                <Sparkles className="relative size-7 text-primary" />
              </div>
              <div className="space-y-2 text-center">
                <p className="font-heading text-lg font-extrabold text-foreground">
                  Text wird geschrieben…
                </p>
                <p className="max-w-xs font-sans text-sm font-medium text-muted-foreground">
                  Kurz warten — der Lesetext und die Fragen werden erstellt.
                </p>
              </div>
              <div className="flex w-full max-w-sm flex-col gap-2">
                <div className="h-2.5 w-full animate-pulse rounded-full bg-muted" />
                <div className="h-2.5 w-4/5 animate-pulse rounded-full bg-muted/70" />
                <div className="h-2.5 w-3/5 animate-pulse rounded-full bg-muted/50" />
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && data && (
          <div className="flex flex-col gap-6 pt-2">
            <Card
              key={`passage-${setId}`}
              className="app-reveal overflow-hidden rounded-3xl border-2 border-[var(--duo-border)] bg-card shadow-[0_6px_0_0_var(--duo-border-strong)] dark:border-border dark:shadow-[0_6px_0_0_var(--border)]"
            >
              <CardHeader className="relative border-b-2 border-[var(--duo-border)] bg-gradient-to-r from-[var(--chart-2)]/[0.08] via-muted/30 to-transparent pb-5 dark:border-border">
                <div
                  className="absolute left-0 top-0 h-full w-1.5 bg-[var(--chart-2)]"
                  aria-hidden
                />
                <div className="pl-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-sans text-[11px] font-extrabold tracking-[0.14em] text-[var(--chart-2)] uppercase">
                      Lesetext
                    </p>
                    <Badge
                      variant="outline"
                      className="border-[var(--chart-2)]/40 font-sans text-[10px] font-extrabold text-[var(--chart-2)] uppercase"
                    >
                      {level}
                    </Badge>
                  </div>
                  <p className="mt-2 font-heading text-xl font-extrabold leading-snug text-foreground md:text-2xl">
                    {contentLabel}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-8 pt-8">
                <div className="rounded-2xl border border-[var(--duo-border)]/80 bg-muted/15 px-5 py-6 dark:border-border/60 dark:bg-muted/10">
                  <div className="font-sans text-[1.0625rem] leading-[1.8] text-foreground md:text-lg md:leading-[1.85]">
                    {data.passage.split(/\n+/).map((para, i) => (
                      <p
                        key={i}
                        className={cn(
                          i > 0 && 'mt-5 border-t border-[var(--duo-border)]/50 pt-5 dark:border-border/40'
                        )}
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {data.questions.slice(0, -1).map((q, idx) => {
              if (q.type !== 'multiple_choice') return null;
              return (
                <div
                  key={`mc-${idx}`}
                  className="app-reveal"
                  style={{
                    animationDelay: `${Math.min(idx * 0.05, 0.35)}s`,
                  }}
                >
                  <LesenMcBlock
                    question={q}
                    questionNumber={idx + 1}
                    topicLabel={contentLabel}
                    selected={mcAnswers[idx] ?? null}
                    onSelect={(i) =>
                      setMcAnswers((prev) => {
                        const next = [...prev];
                        next[idx] = i;
                        return next;
                      })
                    }
                    submitted={submitted}
                    wasCorrect={mcAnswers[idx] === q.correct_index}
                  />
                </div>
              );
            })}
            {data.questions.length > 0 &&
              (() => {
                const fillQ = data.questions[data.questions.length - 1];
                if (fillQ?.type !== 'fill_blank') return null;
                return (
                  <div
                    className="app-reveal"
                    style={{ animationDelay: '0.2s' }}
                  >
                    <LesenFillBlock
                      question={fillQ}
                      questionNumber={data.questions.length}
                      topicLabel={contentLabel}
                      value={fillAnswer}
                      onChange={setFillAnswer}
                      submitted={submitted}
                      wasCorrect={
                        normalize(fillAnswer) === normalize(fillQ.answer)
                      }
                    />
                  </div>
                );
              })()}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                size="lg"
                className="h-12 w-full gap-2 rounded-2xl font-sans text-[15px] font-extrabold shadow-[0_4px_0_0_var(--primary-shadow)] sm:w-auto sm:min-w-[13rem]"
                disabled={!allAnswered || submitted}
                onClick={submitSet}
              >
                <CheckCircle2 className="size-4" aria-hidden />
                Antworten prüfen
              </Button>
              {!allAnswered && !submitted && totalQuestions > 0 && (
                <p className="font-sans text-xs font-bold text-muted-foreground sm:max-w-[14rem] sm:text-end">
                  Beantworte alle {totalQuestions} Fragen, um dein Set
                  abzugeben.
                </p>
              )}
            </div>

            {submitted && data && (
              <Card
                className={cn(
                  'app-reveal overflow-hidden rounded-3xl border-2 shadow-[0_6px_0_0_var(--duo-border)] dark:shadow-[0_6px_0_0_var(--border)]',
                  summaryCorrect === data.questions.length
                    ? 'border-[var(--duo-correct-border)] bg-[var(--duo-correct-bg)]'
                    : summaryCorrect === 0
                      ? 'border-[var(--duo-wrong-border)] bg-[var(--duo-wrong-bg)]'
                      : 'border-[var(--chart-2)]/45 bg-[var(--duo-nav-active)]'
                )}
              >
                <CardHeader className="flex flex-row flex-wrap items-start gap-4 space-y-0">
                  <div
                    className={cn(
                      'flex size-12 shrink-0 items-center justify-center rounded-2xl border-2',
                      summaryCorrect === data.questions.length &&
                        'border-[var(--duo-correct-border)] bg-card text-[var(--ok)]',
                      summaryCorrect === 0 &&
                        'border-[var(--duo-wrong-border)] bg-card text-destructive',
                      summaryCorrect > 0 &&
                        summaryCorrect < data.questions.length &&
                        'border-[var(--chart-2)]/40 bg-card text-[var(--chart-2)]'
                    )}
                  >
                    {summaryCorrect === data.questions.length ? (
                      <CheckCircle2 className="size-7" aria-hidden />
                    ) : summaryCorrect === 0 ? (
                      <XCircle className="size-7" aria-hidden />
                    ) : (
                      <Sparkles className="size-7" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
                      Ergebnis
                    </p>
                    <p className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
                      {summaryCorrect} / {data.questions.length} richtig
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="font-sans text-sm font-semibold leading-relaxed text-muted-foreground">
                    {summaryCorrect === data.questions.length
                      ? 'Sehr gut — du hast den Text vollständig verstanden.'
                      : summaryCorrect === 0
                        ? 'Schau dir die Erklärungen oben an, dann starte ein neues Set.'
                        : 'Gute Basis — erzeuge einen weiteren Text zum Üben.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!loading && !data && !error && (
          <SkillSectionEmptyState
            tone="lesen"
            icon={
              <BookOpen
                className="size-9 text-[var(--chart-2)]"
                strokeWidth={2.25}
                aria-hidden
              />
            }
            title="Bereit zum Lesen?"
            description={
              <>
                Öffne{' '}
                <span className="font-bold text-foreground">Filter</span> für
                Kategorie, Niveau und Fragenzahl, dann{' '}
                <span className="font-bold text-foreground">Text erzeugen</span>
                . Du bekommst etwa 150–200 Wörter und so viele Fragen, wie du
                eingestellt hast (3–10, inkl. einer Lückentext-Aufgabe). Unter{' '}
                <span className="font-bold text-foreground">
                  Grammatik-Hilfe
                </span>{' '}
                findest du Wikipedia-Infos — Grammatik-Thema dort separat
                wählen.
              </>
            }
          />
        )}
      </div>

      <Sheet open={referenceOpen} onOpenChange={setReferenceOpen}>
        <SheetContent
          id="lesen-reference-sheet"
          side="left"
          showCloseButton
          className="w-full gap-0 border-[var(--duo-border)] bg-card p-0 sm:max-w-md dark:border-border"
        >
          <SheetHeader className="space-y-4 border-b-2 border-[var(--duo-border)] bg-muted/20 px-5 py-5 text-left dark:border-border">
            <div className="flex items-center gap-2">
              <Library className="size-4 text-[var(--chart-2)]" aria-hidden />
              <SheetTitle className="font-sans text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
                Grammatik-Referenz
              </SheetTitle>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="lesen-ref-grammar-topic"
                className="font-sans text-[10px] font-extrabold tracking-[0.12em] text-muted-foreground uppercase"
              >
                Grammatik-Thema
              </label>
              <Select
                value={referenceGrammarTopic}
                onValueChange={(v) => setReferenceGrammarTopic(v as TopicId)}
              >
                <SelectTrigger
                  id="lesen-ref-grammar-topic"
                  className="w-full font-sans font-bold"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TOPICS.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </SheetHeader>
          <div className="px-4 pb-10 pt-4">
            {referenceOpen && (
              <GrammarRulesPanel
                key={referenceGrammarTopic}
                topicId={referenceGrammarTopic}
                topicLabel={
                  TOPICS.find((t) => t.id === referenceGrammarTopic)?.label ??
                  referenceGrammarTopic
                }
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
