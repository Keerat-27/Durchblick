import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type StatSummaryTone = 'xp' | 'crown' | 'streak' | 'gem';

const toneClass: Record<StatSummaryTone, string> = {
  xp: 'border-[color-mix(in_srgb,var(--primary)_22%,var(--duo-border))] bg-gradient-to-br from-[color-mix(in_srgb,var(--primary)_14%,transparent)] to-card shadow-[0_2px_0_0_color-mix(in_srgb,var(--primary)_35%,transparent)] dark:shadow-[0_2px_0_0_rgb(0_0_0/0.35)]',
  crown:
    'border-[color-mix(in_srgb,var(--chart-5)_28%,var(--duo-border))] bg-gradient-to-br from-[color-mix(in_srgb,var(--chart-5)_18%,transparent)] to-card shadow-[0_2px_0_0_color-mix(in_srgb,var(--chart-5)_40%,transparent)] dark:shadow-[0_2px_0_0_rgb(0_0_0/0.35)]',
  streak:
    'border-[color-mix(in_srgb,var(--chart-3)_26%,var(--duo-border))] bg-gradient-to-br from-[color-mix(in_srgb,var(--chart-3)_14%,transparent)] to-card shadow-[0_2px_0_0_color-mix(in_srgb,var(--chart-3)_38%,transparent)] dark:shadow-[0_2px_0_0_rgb(0_0_0/0.35)]',
  gem: 'border-[color-mix(in_srgb,var(--destructive)_22%,var(--duo-border))] bg-gradient-to-br from-[color-mix(in_srgb,var(--destructive)_10%,transparent)] to-card shadow-[0_2px_0_0_color-mix(in_srgb,var(--destructive)_28%,transparent)] dark:shadow-[0_2px_0_0_rgb(0_0_0/0.35)]',
};

export type StatSummaryCardProps = {
  /** Icon, text label (z. B. „XP“), oder beliebiger Inhalt links. */
  icon: ReactNode;
  /** Angezeigter Wert (Zahl oder formatierter Text). */
  value: ReactNode;
  className?: string;
  'aria-label'?: string;
  /** Farbakzent für die Kachel (Hintergrundverlauf + Schatten). */
  tone?: StatSummaryTone;
  /** Index für gestaffelte Einblendanimation (`stat-tile-enter`). */
  enterIndex?: number;
};

/**
 * Kompakte Stat-Kachel: links `icon`, rechts `value` — für XP, Kronen, Serie, Edelsteine usw.
 */
export function StatSummaryCard({
  icon,
  value,
  className,
  'aria-label': ariaLabel,
  tone = 'xp',
  enterIndex = 0,
}: StatSummaryCardProps) {
  return (
    <div
      className={cn(
        'stat-tile-enter flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl border px-4 py-3.5',
        'font-sans text-sm font-extrabold tabular-nums text-foreground',
        'ring-1 ring-inset ring-white/50 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md',
        'dark:ring-white/[0.06]',
        toneClass[tone],
        className
      )}
      style={{ '--stat-enter-delay': `${enterIndex * 55}ms` } as CSSProperties}
      aria-label={ariaLabel}
    >
      <span className="flex shrink-0 items-center [&_svg]:size-[1.2rem] [&_svg]:shrink-0">
        {icon}
      </span>
      <span className="stat-value-soft-in min-w-0 text-foreground">{value}</span>
    </div>
  );
}
