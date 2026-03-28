import {
  BookOpen,
  Crown,
  Flame,
  Gem,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import type { CSSProperties } from 'react';
import { useId, useMemo, useState } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatSummaryCard } from '@/components/stat-summary-card';
import { useLearningProgress } from '@/contexts/learning-progress-context';
import { localYmd, type LearningStats } from '@/lib/progress-storage';
import { cn } from '@/lib/utils';

const DUO_ORANGE_BAR =
  'bg-gradient-to-r from-[#ff9600] via-[#ffb020] to-[#ffc800] dark:from-[#ffb020] dark:via-[#ffc84a] dark:to-[#ffd54a]';

const DUO_BAR_VERTICAL =
  'bg-gradient-to-t from-[#ff9600] via-[#ffb020] to-[#ffc800] dark:from-[#ffb020] dark:via-[#ffc84a] dark:to-[#ffd54a]';

function duoCardClassName(extra?: string) {
  return cn(
    'rounded-2xl border border-[var(--duo-border)] bg-card',
    'shadow-[0_3px_0_0_var(--duo-border-strong)] ring-1 ring-inset ring-white/45',
    'transition-[transform,box-shadow] duration-200 dark:shadow-[0_3px_0_0_rgb(0_0_0/0.5)] dark:ring-white/[0.05]',
    extra
  );
}

function computeGamifiedXp(stats: LearningStats): number {
  return (
    stats.correct * 12 +
    stats.totalAnswered * 2 +
    stats.practiceDaysCount * 8 +
    stats.setsGenerated * 15
  );
}

function computeCrowns(stats: LearningStats): number {
  return Math.min(99, stats.setsGenerated * 2 + Math.floor(stats.longestStreak / 2));
}

function computeGems(stats: LearningStats): number {
  return stats.correct * 3 + stats.practiceDaysCount * 2;
}

function niceCeil(n: number): number {
  if (n <= 1) return 5;
  if (n <= 5) return 5;
  if (n <= 10) return 10;
  const p = 10 ** Math.floor(Math.log10(n));
  return Math.ceil(n / p) * p;
}

function last7DaysSequence(): { ymd: string; short: string }[] {
  const out: { ymd: string; short: string }[] = [];
  const labels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const today = new Date();
  const dow = (today.getDay() + 6) % 7;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (dow - i));
    out.push({
      ymd: localYmd(d),
      short: labels[i] ?? '?',
    });
  }
  return out;
}

function rolling12Months(): { ym: string; label: string }[] {
  const out: { ym: string; label: string }[] = [];
  const now = new Date();
  for (let k = 11; k >= 0; k--) {
    const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('de-DE', { month: 'short' });
    out.push({ ym, label: label.replace('.', '') });
  }
  return out;
}

function countDaysInMonth(practiceDays: string[], ym: string): number {
  return practiceDays.filter((d) => d.startsWith(ym)).length;
}

function DuoProgressTrack({
  value,
  max,
  className,
  'aria-label': ariaLabel,
}: {
  value: number;
  max: number;
  className?: string;
  'aria-label'?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 1000) / 10) : 0;
  return (
    <div
      className={cn('h-2.5 w-full overflow-hidden rounded-full bg-muted', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500 ease-out', DUO_ORANGE_BAR)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

type Period = 'week' | 'month' | 'year';

export type LearningStatsDashboardProps = {
  /** Wenn gesetzt, erscheint die Überschrift über den Karten. */
  title?: string;
  description?: string;
  titleId?: string;
  className?: string;
};

/**
 * Duolingo-style dashboard: summary strip, course-style progress rows,
 * daily goal + week spark bars, activity chart, achievement card.
 */
export function LearningStatsDashboard({
  title,
  description,
  titleId = 'learning-stats-heading',
  className,
}: LearningStatsDashboardProps) {
  const { stats, progress } = useLearningProgress();
  const hasTitle = Boolean(title?.trim());
  const hasDescription = Boolean(description?.trim());
  const showHeadingBlock = hasTitle || hasDescription;

  const xp = useMemo(() => computeGamifiedXp(stats), [stats]);
  const crowns = useMemo(() => computeCrowns(stats), [stats]);
  const gems = useMemo(() => computeGems(stats), [stats]);

  const practiceSet = useMemo(() => new Set(progress.practiceDays), [progress.practiceDays]);
  const todayYmd = useMemo(() => localYmd(new Date()), []);
  const practicedToday = practiceSet.has(todayYmd);

  /** Einheitliches Tagesziel: heute geübt ja/nein (keine Zwischenwerte ohne Tages-Tracking). */
  const dailyGoal = 1;
  const dailyNumerator = practicedToday ? 1 : 0;

  const weekBars = useMemo(() => {
    return last7DaysSequence().map(({ ymd, short }) => ({
      ymd,
      short,
      active: practiceSet.has(ymd),
    }));
  }, [practiceSet]);

  const [period, setPeriod] = useState<Period>('year');

  const chartData = useMemo(() => {
    if (period === 'year') {
      const months = rolling12Months();
      const values = months.map(({ ym }) => countDaysInMonth(progress.practiceDays, ym));
      return {
        labels: months.map((m) => m.label),
        values,
      };
    }
    if (period === 'month') {
      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth();
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const step = Math.max(1, Math.ceil(daysInMonth / 8));
      const labels: string[] = [];
      const values: number[] = [];
      for (let d = 1; d <= daysInMonth; d += step) {
        labels.push(String(d));
        const ymd = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        values.push(practiceSet.has(ymd) ? 1 : 0);
      }
      return { labels, values };
    }
    const seq = last7DaysSequence();
    return {
      labels: seq.map((s) => s.short),
      values: seq.map((s) => (practiceSet.has(s.ymd) ? 1 : 0)),
    };
  }, [period, practiceSet, progress.practiceDays]);

  const chartMax = useMemo(() => {
    const raw = Math.max(...chartData.values, 1);
    return niceCeil(raw);
  }, [chartData.values]);

  const accuracy = stats.accuracyPercent ?? 0;
  const accDenom = 100;
  const activeCap = 30;
  const setsCap = 25;

  const achievementTarget = 100;
  const achievementCurrent = Math.min(achievementTarget, stats.correct);

  const chartGradientId = useId().replace(/:/g, '');
  const hasChartActivity = chartData.values.some((v) => v > 0);
  const chartLinePoints = useMemo(() => {
    const vals = chartData.values;
    const n = vals.length;
    if (n === 0) return '';
    if (n === 1) {
      const v = vals[0] ?? 0;
      const y = chartMax > 0 ? 100 - (v / chartMax) * 86 - 7 : 93;
      return `47,${y} 53,${y}`;
    }
    return vals
      .map((v, i) => {
        const x = ((i + 0.5) / n) * 100;
        const y = chartMax > 0 ? 100 - (v / chartMax) * 86 - 7 : 93;
        return `${x},${y}`;
      })
      .join(' ');
  }, [chartData.values, chartMax]);

  const chartAreaPolygon = useMemo(() => {
    if (!chartLinePoints) return '';
    return `0,100 ${chartLinePoints} 100,100`;
  }, [chartLinePoints]);

  return (
    <section
      className={cn(
        'relative isolate space-y-6',
        'before:pointer-events-none before:absolute before:inset-x-0 before:-top-4 before:z-0 before:h-40 before:rounded-[1.75rem] before:bg-gradient-to-b before:from-[var(--app-aurora-1)]/35 before:via-[var(--app-aurora-2)]/12 before:to-transparent dark:before:from-[var(--app-aurora-1)]/18 dark:before:via-transparent',
        className
      )}
      aria-labelledby={showHeadingBlock ? titleId : undefined}
      aria-label={showHeadingBlock ? undefined : 'Lernstatistiken'}
    >
      {showHeadingBlock ? (
        <div className="space-y-1">
          {hasTitle ? (
            <h2
              id={titleId}
              className="font-stats-display text-lg font-bold tracking-tight text-foreground"
            >
              {title}
            </h2>
          ) : null}
          {hasDescription ? (
            <p
              id={hasTitle ? undefined : titleId}
              className="max-w-lg font-sans text-sm font-semibold leading-snug text-muted-foreground"
            >
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatSummaryCard
          tone="xp"
          enterIndex={0}
          icon={<span className="font-black text-[var(--duo-green)]">XP</span>}
          value={xp.toLocaleString('de-DE')}
          aria-label={`XP ${xp.toLocaleString('de-DE')}`}
        />
        <StatSummaryCard
          tone="crown"
          enterIndex={1}
          icon={<Crown className="text-[#ffc800]" strokeWidth={2.25} aria-hidden />}
          value={crowns}
          aria-label={`Kronen ${crowns}`}
        />
        <StatSummaryCard
          tone="streak"
          enterIndex={2}
          icon={<Flame className="text-[#ff9600]" strokeWidth={2.25} aria-hidden />}
          value={stats.currentStreak}
          aria-label={`Serie ${stats.currentStreak} Tage`}
        />
        <StatSummaryCard
          tone="gem"
          enterIndex={3}
          icon={<Gem className="text-[#ea2b2b]" strokeWidth={2.25} aria-hidden />}
          value={gems}
          aria-label={`Edelsteine ${gems}`}
        />
      </div>

      {/*
        Bento-Grid: Zeile 1 = Kursfortschritt | Abzeichen (keine leere Fläche unter dem Abzeichen).
        Zeile 2 = Tagesziel über volle Breite — der Wochenchart nutzt die zusätzliche Breite.
      */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start lg:gap-5">
        <div className="min-w-0 lg:col-span-7 xl:col-span-8">
          <div
            className={duoCardClassName('stat-tile-enter overflow-hidden')}
            style={{ '--stat-enter-delay': '220ms' } as CSSProperties}
          >
            <CardHeader className="border-b border-[var(--duo-border)] bg-gradient-to-r from-[var(--app-aurora-1)]/35 via-transparent to-[var(--app-aurora-3)]/25 px-4 py-3.5 dark:from-[var(--app-aurora-1)]/20">
              <CardTitle className="font-stats-display text-lg font-bold tracking-tight text-foreground">
                Kursfortschritt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 py-4">
              <div className="flex items-center gap-3 rounded-xl px-1 py-1.5 transition-colors hover:bg-muted/45">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-amber-300 shadow-sm">
                  <Target className="size-5 text-white drop-shadow-sm" aria-hidden />
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="font-sans text-sm font-bold text-foreground">Genauigkeit</p>
                  <DuoProgressTrack
                    value={accuracy}
                    max={accDenom}
                    aria-label={`Genauigkeit ${accuracy} von ${accDenom} Prozent`}
                  />
                </div>
                <span className="shrink-0 font-sans text-xs font-extrabold tabular-nums text-muted-foreground">
                  {stats.accuracyPercent != null ? `${Math.round(accuracy)}%` : '—'}
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-xl px-1 py-1.5 transition-colors hover:bg-muted/45">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#ffc800] to-[#ff9600] shadow-sm">
                  <Sparkles className="size-5 text-white drop-shadow-sm" aria-hidden />
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="font-sans text-sm font-bold text-foreground">Aktive Tage</p>
                  <DuoProgressTrack
                    value={Math.min(stats.practiceDaysCount, activeCap)}
                    max={activeCap}
                    aria-label={`Aktive Tage ${stats.practiceDaysCount} von ${activeCap}`}
                  />
                </div>
                <span className="shrink-0 font-sans text-xs font-extrabold tabular-nums text-muted-foreground">
                  {stats.practiceDaysCount}/{activeCap}
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-xl px-1 py-1.5 transition-colors hover:bg-muted/45">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-400 shadow-sm">
                  <BookOpen className="size-5 text-white drop-shadow-sm" aria-hidden />
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="font-sans text-sm font-bold text-foreground">Übungen gestartet</p>
                  <DuoProgressTrack
                    value={Math.min(stats.setsGenerated, setsCap)}
                    max={setsCap}
                    aria-label={`Übungen ${stats.setsGenerated} von ${setsCap}`}
                  />
                </div>
                <span className="shrink-0 font-sans text-xs font-extrabold tabular-nums text-muted-foreground">
                  {stats.setsGenerated}/{setsCap}
                </span>
              </div>
            </CardContent>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-5 xl:col-span-4">
          <div
            className={duoCardClassName('stat-tile-enter overflow-hidden')}
            style={{ '--stat-enter-delay': '275ms' } as CSSProperties}
          >
            <CardHeader className="border-b border-[var(--duo-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--primary)_12%,transparent)] via-card to-[var(--app-aurora-2)]/20 px-4 py-3.5 dark:from-[color-mix(in_srgb,var(--primary)_8%,transparent)]">
              <CardTitle className="font-stats-display text-lg font-bold tracking-tight text-foreground">
                Nächstes Abzeichen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <span className="mx-auto flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--duo-green)] text-primary-foreground shadow-[0_4px_0_0_var(--primary-shadow)] sm:mx-0 sm:size-[3.75rem]">
                  <Target className="size-7 sm:size-8" strokeWidth={2.5} aria-hidden />
                </span>
                <div className="min-w-0 flex-1 space-y-3 text-center sm:text-start">
                  <p className="font-sans text-sm font-semibold leading-snug text-muted-foreground">
                    Treffsicher — erreiche 100 richtige Antworten.
                  </p>
                  <DuoProgressTrack
                    value={achievementCurrent}
                    max={achievementTarget}
                    aria-label={`Fortschritt Treffsicher ${achievementCurrent} von ${achievementTarget}`}
                  />
                  <p className="font-sans text-xs font-extrabold tabular-nums text-muted-foreground sm:text-end">
                    {achievementCurrent}/{achievementTarget}
                  </p>
                </div>
              </div>
            </CardContent>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-12">
          <div
            className={duoCardClassName('stat-tile-enter overflow-hidden')}
            style={{ '--stat-enter-delay': '330ms' } as CSSProperties}
          >
            <CardHeader className="border-b border-[var(--duo-border)] bg-gradient-to-r from-[var(--app-aurora-2)]/30 via-transparent to-[var(--app-aurora-1)]/20 px-4 py-3.5 dark:from-[var(--app-aurora-2)]/15">
              <CardTitle className="font-stats-display text-lg font-bold tracking-tight text-foreground">
                Tagesziel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-4 py-4 lg:flex lg:items-stretch lg:gap-8 lg:space-y-0">
              <div className="flex min-w-0 flex-1 items-start gap-3 lg:max-w-md">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border-2 border-[var(--duo-border)] bg-muted/50">
                  <Trophy className="size-5 text-[#ff9600]" aria-hidden />
                </span>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="font-sans text-sm font-bold text-foreground">Heute geübt</p>
                  <DuoProgressTrack
                    value={dailyNumerator}
                    max={dailyGoal}
                    aria-label={practicedToday ? 'Heute schon geübt' : 'Heute noch nicht geübt'}
                  />
                  <p className="text-end font-sans text-xs font-extrabold tabular-nums text-muted-foreground">
                    {practicedToday ? 'Erreicht' : 'Offen'}
                  </p>
                </div>
              </div>

              <div className="relative min-w-0 flex-[1.35] pl-7 lg:border-s lg:border-[var(--duo-border)]/70 lg:ps-8">
                <div
                  className="absolute bottom-6 left-0 flex h-[5.5rem] flex-col justify-between font-sans text-[10px] font-bold tabular-nums text-muted-foreground lg:left-8"
                  aria-hidden
                >
                  <span>40</span>
                  <span>30</span>
                  <span>20</span>
                  <span>10</span>
                  <span>0</span>
                </div>
                <div
                  className="flex h-28 items-end justify-between gap-1 border-b border-[var(--duo-border)]/80 pl-1 pr-0.5 lg:h-32"
                  role="img"
                  aria-label="Überblick Übungen in den letzten sieben Tagen"
                >
                  {weekBars.map(({ ymd, short, active }) => {
                    const hPct = active ? 72 : 8;
                    return (
                      <div
                        key={ymd}
                        className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
                      >
                        <div className="flex h-24 w-full max-w-[2.25rem] flex-col justify-end lg:h-28 lg:max-w-none">
                          <div
                            className={cn(
                              'w-full rounded-t-[4px] transition-all duration-300',
                              active ? DUO_BAR_VERTICAL : 'bg-muted'
                            )}
                            style={{ height: `${hPct}%` }}
                          />
                        </div>
                        <span className="font-sans text-[10px] font-extrabold text-muted-foreground">
                          {short}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </div>

      {/* Activity chart — full width below the two-column block */}
      <div
        className={duoCardClassName('stat-tile-enter overflow-hidden')}
        style={{ '--stat-enter-delay': '385ms' } as CSSProperties}
      >
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-[var(--duo-border)] bg-gradient-to-r from-[var(--app-aurora-3)]/25 via-transparent to-[var(--app-aurora-1)]/15 px-4 py-3.5 dark:from-[var(--app-aurora-3)]/12">
          <CardTitle className="font-stats-display text-lg font-bold tracking-tight text-foreground">
            Aktivität
          </CardTitle>
          <div
            className="flex rounded-xl border border-[var(--duo-border)] bg-muted/50 p-1 font-sans text-[10px] font-extrabold tracking-wide uppercase shadow-[inset_0_1px_0_rgb(255_255_255/0.35)] dark:bg-muted/30 dark:shadow-none"
            role="tablist"
          >
            {(
              [
                ['week', 'Woche'],
                ['month', 'Monat'],
                ['year', 'Jahr'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={period === key}
                onClick={() => setPeriod(key)}
                className={cn(
                  'rounded-lg px-3 py-1.5 transition-[color,transform,box-shadow] duration-200',
                  period === key
                    ? 'bg-card text-foreground shadow-[0_2px_0_0_var(--duo-border-strong)] ring-1 ring-[var(--chart-2)]/20 dark:shadow-[0_2px_0_0_rgb(0_0_0/0.4)]'
                    : 'text-muted-foreground hover:text-foreground active:scale-[0.98]'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="px-4 py-5">
          <div className="relative pl-9">
            <div
              className="absolute top-0 bottom-10 left-0 flex w-7 flex-col justify-between font-sans text-[10px] font-bold tabular-nums text-muted-foreground"
              aria-hidden
            >
              {[chartMax, Math.round(chartMax * 0.8), Math.round(chartMax * 0.6), Math.round(chartMax * 0.4), Math.round(chartMax * 0.2), 0].map(
                (t, yi) => (
                  <span key={`y-tick-${yi}-${t}`}>{t}</span>
                )
              )}
            </div>
            <div className="relative ml-1 h-40 border-b border-[var(--duo-border)]/70">
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="border-t border-dashed border-[var(--duo-border)]/50"
                  />
                ))}
              </div>
              {hasChartActivity && chartLinePoints ? (
                <svg
                  className="absolute inset-0 h-full w-full overflow-visible text-[var(--chart-2)]"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id={`${chartGradientId}-stroke`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.9} />
                    </linearGradient>
                    <linearGradient id={`${chartGradientId}-fill`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <polygon
                    points={chartAreaPolygon}
                    fill={`url(#${chartGradientId}-fill)`}
                    className="transition-opacity duration-500"
                  />
                  <polyline
                    fill="none"
                    stroke={`url(#${chartGradientId}-stroke)`}
                    strokeWidth="1.25"
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chartLinePoints}
                  />
                </svg>
              ) : null}
              <div className="relative z-[1] flex h-full items-end justify-between gap-1 px-0.5">
                {chartData.values.map((v, i) => {
                  const h = chartMax > 0 ? Math.max(4, (v / chartMax) * 100) : 4;
                  return (
                    <div
                      key={`${chartData.labels[i]}-${i}`}
                      className="flex min-w-0 flex-1 flex-col items-center justify-end"
                    >
                      <div className="flex h-full w-full max-w-[1.85rem] flex-col justify-end">
                        <div
                          className={cn(
                            'w-full rounded-t-md transition-[height] duration-500 ease-out',
                            v > 0 ? DUO_BAR_VERTICAL : 'bg-muted/90 dark:bg-muted/50'
                          )}
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-2 flex justify-between gap-0.5 px-0.5">
              {chartData.labels.map((lab) => (
                <span
                  key={lab}
                  className="min-w-0 flex-1 text-center font-sans text-[10px] font-extrabold text-muted-foreground"
                >
                  {lab}
                </span>
              ))}
            </div>
            {!hasChartActivity ? (
              <p className="mt-4 text-center font-sans text-xs font-semibold text-muted-foreground">
                In diesem Zeitraum noch keine Übungstage — leg gleich los.
              </p>
            ) : null}
          </div>
        </CardContent>
      </div>
    </section>
  );
}
