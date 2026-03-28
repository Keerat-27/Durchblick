import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type SkillSectionEmptyTone = 'lesen' | 'schreiben' | 'hoeren' | 'sprechen';

const TONE_STYLES: Record<
  SkillSectionEmptyTone,
  {
    card: string;
    glow: string;
    iconBox: string;
  }
> = {
  lesen: {
    card:
      'border-dashed border-[var(--chart-2)]/30 bg-gradient-to-br from-[var(--chart-2)]/[0.07] via-card to-primary/[0.05] dark:border-[var(--chart-2)]/25',
    glow: 'bg-[var(--chart-2)]/10',
    iconBox: 'border-[var(--chart-2)]/25 shadow-[0_6px_0_0_var(--duo-border)] dark:shadow-[0_6px_0_0_var(--border)]',
  },
  schreiben: {
    card:
      'border-dashed border-primary/35 bg-gradient-to-br from-primary/[0.07] via-card to-[var(--chart-2)]/[0.05] dark:border-primary/30',
    glow: 'bg-primary/10',
    iconBox:
      'border-primary/30 shadow-[0_6px_0_0_var(--duo-border)] dark:shadow-[0_6px_0_0_var(--border)]',
  },
  hoeren: {
    card:
      'border-dashed border-[var(--chart-4)]/35 bg-gradient-to-br from-[var(--chart-4)]/[0.08] via-card to-card dark:border-[var(--chart-4)]/28',
    glow: 'bg-[var(--chart-4)]/10',
    iconBox:
      'border-[var(--chart-4)]/30 shadow-[0_6px_0_0_var(--duo-border)] dark:shadow-[0_6px_0_0_var(--border)]',
  },
  sprechen: {
    card:
      'border-dashed border-[var(--chart-3)]/35 bg-gradient-to-br from-[var(--chart-3)]/[0.08] via-card to-card dark:border-[var(--chart-3)]/28',
    glow: 'bg-[var(--chart-3)]/10',
    iconBox:
      'border-[var(--chart-3)]/30 shadow-[0_6px_0_0_var(--duo-border)] dark:shadow-[0_6px_0_0_var(--border)]',
  },
};

export type SkillSectionEmptyStateProps = {
  /** Section icon (e.g. lucide icon with size and stroke). */
  icon: ReactNode;
  title: string;
  /** Body copy; use `<span className="font-bold text-foreground">…</span>` for emphasis. */
  description: ReactNode;
  tone?: SkillSectionEmptyTone;
  className?: string;
};

/**
 * Shared dashed-card empty state for skill sections (Lesen, Schreiben, Hören, Sprechen).
 */
export function SkillSectionEmptyState({
  icon,
  title,
  description,
  tone = 'lesen',
  className,
}: SkillSectionEmptyStateProps) {
  const t = TONE_STYLES[tone];
  return (
    <Card
      className={cn(
        'app-reveal app-reveal-delay-3 overflow-hidden rounded-3xl border-2',
        t.card,
        className
      )}
    >
      <CardContent className="flex flex-col items-center gap-6 px-6 py-16 text-center">
        <div className="relative" aria-hidden>
          <div
            className={cn(
              'absolute inset-0 scale-110 rounded-3xl blur-xl',
              t.glow
            )}
          />
          <div
            className={cn(
              'relative flex size-20 items-center justify-center rounded-3xl border-2 bg-card',
              t.iconBox
            )}
          >
            {icon}
          </div>
        </div>
        <div className="max-w-md space-y-2">
          <p className="font-heading text-xl font-extrabold tracking-tight text-foreground md:text-2xl">
            {title}
          </p>
          <p className="font-sans text-sm font-medium leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
