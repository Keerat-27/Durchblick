import {
  Award,
  CalendarDays,
  Flame,
  Layers,
  Target,
  TrendingUp,
  UserRound,
} from 'lucide-react';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLearningProgress } from '@/contexts/learning-progress-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import type { LearningStats } from '@/lib/progress-storage';
import { cn } from '@/lib/utils';

type StatPlayfulTheme = {
  wash: string;
  stripe: string;
  iconWell: string;
};

const STAT_THEMES = {
  streak: {
    wash: 'from-orange-500/[0.11] dark:from-orange-400/[0.14]',
    stripe: 'border-t-orange-500 dark:border-t-orange-400',
    iconWell:
      'border-orange-500/35 bg-orange-500/[0.18] dark:border-orange-400/30 dark:bg-orange-400/[0.14]',
  },
  trophy: {
    wash: 'from-[color-mix(in_srgb,var(--chart-3)_14%,transparent)] dark:from-[color-mix(in_srgb,var(--chart-3)_18%,transparent)]',
    stripe: 'border-t-[var(--chart-3)]',
    iconWell:
      'border-[color-mix(in_srgb,var(--chart-3)_35%,transparent)] bg-[color-mix(in_srgb,var(--chart-3)_16%,transparent)]',
  },
  calendar: {
    wash: 'from-[color-mix(in_srgb,var(--chart-2)_12%,transparent)] dark:from-[color-mix(in_srgb,var(--chart-2)_16%,transparent)]',
    stripe: 'border-t-[var(--chart-2)]',
    iconWell:
      'border-[color-mix(in_srgb,var(--chart-2)_35%,transparent)] bg-[color-mix(in_srgb,var(--chart-2)_14%,transparent)]',
  },
  target: {
    wash: 'from-[color-mix(in_srgb,var(--primary)_12%,transparent)] dark:from-[color-mix(in_srgb,var(--primary)_16%,transparent)]',
    stripe: 'border-t-[var(--primary)]',
    iconWell:
      'border-[color-mix(in_srgb,var(--primary)_35%,transparent)] bg-[color-mix(in_srgb,var(--primary)_14%,transparent)]',
  },
  trend: {
    wash: 'from-[color-mix(in_srgb,var(--chart-4)_12%,transparent)] dark:from-[color-mix(in_srgb,var(--chart-4)_16%,transparent)]',
    stripe: 'border-t-[var(--chart-4)]',
    iconWell:
      'border-[color-mix(in_srgb,var(--chart-4)_35%,transparent)] bg-[color-mix(in_srgb,var(--chart-4)_14%,transparent)]',
  },
  layers: {
    wash: 'from-[color-mix(in_srgb,var(--chart-5)_14%,transparent)] dark:from-[color-mix(in_srgb,var(--chart-5)_18%,transparent)]',
    stripe: 'border-t-[var(--chart-5)]',
    iconWell:
      'border-[color-mix(in_srgb,var(--chart-5)_40%,transparent)] bg-[color-mix(in_srgb,var(--chart-5)_16%,transparent)]',
  },
} satisfies Record<string, StatPlayfulTheme>;

type StatAnimParsed =
  | { kind: 'int'; target: number }
  | { kind: 'percent'; target: number }
  | { kind: 'static'; display: string };

function parseAnimatableStat(raw: string): StatAnimParsed {
  const v = raw.trim();
  if (v === '—') return { kind: 'static', display: '—' };
  const pct = v.match(/^(\d+)%$/);
  if (pct) return { kind: 'percent', target: Number(pct[1]) };
  const n = v.match(/^(\d+)$/);
  if (n) return { kind: 'int', target: Number(n[1]) };
  return { kind: 'static', display: raw };
}

function AnimatedStatValue({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const parsed = useMemo(() => parseAnimatableStat(value), [value]);
  const [display, setDisplay] = useState(value);

  useLayoutEffect(() => {
    if (reduced || parsed.kind === 'static') {
      setDisplay(parsed.kind === 'static' ? parsed.display : value);
      return;
    }
    setDisplay(parsed.kind === 'percent' ? '0%' : '0');
  }, [reduced, value, parsed]);

  useEffect(() => {
    if (reduced || parsed.kind === 'static') return;
    let start: number | null = null;
    const duration = 700;
    const target = parsed.target;
    let raf = 0;
    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - t) ** 3;
      const current = Math.round(eased * target);
      setDisplay(parsed.kind === 'percent' ? `${current}%` : String(current));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, parsed, value]);

  const softIn = parsed.kind === 'static' || reduced;

  return (
    <p className={cn(className, softIn ? 'stat-value-soft-in' : undefined)}>
      {display}
    </p>
  );
}

function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  accentClass,
  theme,
  revealIndex,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Flame;
  accentClass: string;
  theme: StatPlayfulTheme;
  revealIndex: number;
}) {
  return (
    <Card
      size="sm"
      style={
        {
          '--stat-enter-delay': `${40 + revealIndex * 55}ms`,
        } as CSSProperties
      }
      className={cn(
        'stat-tile-enter group/stat relative h-full min-h-[9.5rem] overflow-hidden rounded-3xl border-2 border-[var(--duo-border)] bg-card bg-gradient-to-br shadow-[0_3px_0_0_var(--duo-border)] transition-[transform,box-shadow] duration-200 ease-out will-change-transform',
        'via-card to-[var(--duo-nav-active)]/25 dark:via-card dark:to-card',
        'hover:-translate-y-0.5 hover:shadow-[0_5px_0_0_var(--duo-border)]',
        'active:translate-y-1 active:shadow-none',
        'dark:border-border dark:shadow-[0_3px_0_0_var(--border)] dark:hover:shadow-[0_5px_0_0_var(--border)] dark:active:shadow-none',
        'border-t-2',
        theme.wash,
        theme.stripe
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-gradient-to-br from-white/40 to-transparent opacity-50 blur-2xl dark:from-white/[0.07]"
        aria-hidden
      />
      <CardHeader className="relative flex flex-row items-start justify-between gap-3 space-y-0 pb-1.5 pt-1">
        <CardTitle className="max-w-[62%] pt-0.5 font-sans text-[10px] font-extrabold tracking-[0.12em] text-muted-foreground uppercase">
          {label}
        </CardTitle>
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-full border-2 shadow-[0_2px_0_0_var(--duo-border)] transition-[transform,box-shadow] duration-200 ease-out group-hover/stat:scale-105 group-active/stat:shadow-none dark:shadow-[0_2px_0_0_var(--border)]',
            theme.iconWell,
            accentClass
          )}
          aria-hidden
        >
          <Icon className="size-5" strokeWidth={2.35} />
        </span>
      </CardHeader>
      <CardContent className="relative flex flex-1 flex-col pt-0 pb-1">
        <AnimatedStatValue
          value={value}
          className="font-heading text-[1.85rem] font-extrabold tabular-nums leading-none tracking-tight text-foreground md:text-[2rem]"
        />
        {hint ? (
          <p className="mt-auto pt-3 font-sans text-[11px] font-semibold leading-snug text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

type ProfileStatDef = {
  label: string;
  icon: typeof Flame;
  accentClass: string;
  theme: StatPlayfulTheme;
  value: (s: LearningStats) => string;
  hint: (s: LearningStats) => string | undefined;
};

function profileStatRows(stats: LearningStats): ProfileStatDef[] {
  const accuracyDisplay =
    stats.accuracyPercent != null ? `${stats.accuracyPercent}%` : '—';

  return [
    {
      label: 'Aktuelle Serie',
      icon: Flame,
      accentClass: 'text-orange-600 dark:text-orange-400',
      theme: STAT_THEMES.streak,
      value: (s) => String(s.currentStreak),
      hint: (s) =>
        s.currentStreak === 0
          ? 'Noch keine aktive Serie — übe heute oder gestern weiter'
          : s.currentStreak === 1
            ? '1 Tag in Folge mit Übung'
            : `${s.currentStreak} Tage in Folge mit Übung`,
    },
    {
      label: 'Längste Serie',
      icon: Award,
      accentClass: 'text-[var(--chart-3)]',
      theme: STAT_THEMES.trophy,
      value: (s) => String(s.longestStreak),
      hint: () => 'Dein Rekord an aufeinanderfolgenden Tagen',
    },
    {
      label: 'Aktive Tage',
      icon: CalendarDays,
      accentClass: 'text-[var(--chart-2)]',
      theme: STAT_THEMES.calendar,
      value: (s) => String(s.practiceDaysCount),
      hint: () => 'Kalendertage mit mindestens einer Übung',
    },
    {
      label: 'Genauigkeit',
      icon: Target,
      accentClass: 'text-primary',
      theme: STAT_THEMES.target,
      value: () => accuracyDisplay,
      hint: (s) =>
        s.totalAnswered > 0
          ? `${s.correct} richtig · ${s.wrong} falsch`
          : 'Noch keine bewerteten Antworten',
    },
    {
      label: 'Beantwortet',
      icon: TrendingUp,
      accentClass: 'text-[var(--chart-4)]',
      theme: STAT_THEMES.trend,
      value: (s) => String(s.totalAnswered),
      hint: () => 'Lese- und Grammatikfragen insgesamt',
    },
    {
      label: 'Sätze generiert',
      icon: Layers,
      accentClass: 'text-[var(--chart-5)]',
      theme: STAT_THEMES.layers,
      value: (s) => String(s.setsGenerated),
      hint: () => 'Lesen- oder Schreib-Sets gestartet',
    },
  ];
}

/** Profile hub: account summary and learning stats (streaks, accuracy, volume). */
export function ProfileView() {
  const { user } = useAuth();
  const { stats } = useLearningProgress();

  const memberSince =
    stats.startedAt != null
      ? new Intl.DateTimeFormat('de-DE', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date(stats.startedAt))
      : null;

  const emailLocal = user?.email?.split('@')[0] ?? 'Lernende';
  const statRows = useMemo(() => profileStatRows(stats), [stats]);

  return (
    <div className="space-y-8">
      <section
        className="app-reveal app-reveal-delay-1"
        aria-labelledby="profile-heading"
      >
        <h2
          id="profile-heading"
          className="font-sans text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase"
        >
          Dein Profil
        </h2>
        <Card className="mt-4 overflow-hidden border-[var(--duo-border)] bg-gradient-to-br from-[var(--duo-nav-active)]/80 via-card to-card dark:from-card dark:via-card dark:to-card">
          <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:gap-8 md:p-8">
            <span className="flex size-[4.5rem] shrink-0 items-center justify-center rounded-2xl border-2 border-[var(--primary-shadow)] bg-primary text-primary-foreground shadow-[0_5px_0_0_var(--primary-shadow)]">
              <UserRound className="size-10" strokeWidth={2.25} aria-hidden />
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="font-heading text-2xl font-extrabold tracking-tight text-foreground md:text-[1.75rem]">
                {emailLocal}
              </p>
              <p className="truncate font-sans text-sm font-semibold text-muted-foreground">
                {user?.email}
              </p>
              {memberSince ? (
                <p className="flex items-center gap-2 font-sans text-xs font-bold text-muted-foreground">
                  <CalendarDays className="size-3.5 shrink-0 text-[var(--chart-2)]" />
                  Dabei seit {memberSince}
                </p>
              ) : (
                <p className="font-sans text-xs font-bold text-muted-foreground">
                  Übe unter Lesen oder Schreiben — dann erscheinen deine
                  Statistiken hier.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section
        className="app-reveal app-reveal-delay-2 space-y-5"
        aria-labelledby="stats-heading"
      >
        <div className="space-y-1">
          <h2
            id="stats-heading"
            className="font-sans text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase"
          >
            Statistiken
          </h2>
          <p className="max-w-md font-sans text-sm font-semibold leading-snug text-muted-foreground">
            Live aus Lesen, Schreiben und Grammatik — Zahlen zählen hoch, sobald
            du diesen Bereich öffnest.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:auto-rows-fr sm:grid-cols-2 sm:gap-4 lg:grid-cols-2 lg:gap-4 xl:grid-cols-3 xl:gap-x-5 xl:gap-y-4">
          {statRows.map((row, index) => {
            const Icon = row.icon;
            return (
              <StatTile
                key={row.label}
                label={row.label}
                value={row.value(stats)}
                hint={row.hint(stats)}
                icon={Icon}
                accentClass={row.accentClass}
                theme={row.theme}
                revealIndex={index}
              />
            );
          })}
        </div>
      </section>

      <section className="app-reveal app-reveal-delay-3">
        <Card className="overflow-hidden rounded-3xl border-2 border-[var(--chart-2)]/25 bg-gradient-to-br from-[var(--duo-nav-active)]/70 via-card to-[color-mix(in_srgb,var(--chart-5)_12%,transparent)] shadow-[0_4px_0_0_var(--duo-border)] dark:border-[var(--chart-2)]/20 dark:from-secondary/40 dark:via-card dark:to-card dark:shadow-[0_4px_0_0_var(--border)]">
          <CardContent className="relative py-6">
            <span
              className="absolute left-4 top-4 size-2 rounded-full bg-[var(--chart-2)]/50"
              aria-hidden
            />
            <span
              className="absolute left-7 top-5 size-1.5 rounded-full bg-[var(--primary)]/45"
              aria-hidden
            />
            <span
              className="absolute left-5 top-8 size-1 rounded-full bg-[var(--chart-5)]/50"
              aria-hidden
            />
            <p className="relative max-w-2xl pl-1 font-sans text-sm font-semibold leading-relaxed text-muted-foreground">
              Serien zählen Kalendertage in deiner lokalen Zeitzone, an denen du
              mindestens eine Übung machst (Satz generieren oder Frage beantworten).
              Daten werden in diesem Browser gespeichert und sind an dein Konto
              gekoppelt.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
