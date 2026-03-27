import { useState } from 'react';
import {
  BookOpen,
  Headphones,
  LayoutDashboard,
  Mic,
  PenLine,
} from 'lucide-react';
import './app.css';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { GrammarPracticeView } from '@/views/grammar-practice-view';
import {
  HoerenSection,
  LesenSection,
  SprechenSection,
} from '@/views/skill-placeholder-sections';

export type SkillSectionId =
  | 'lesen'
  | 'schreiben'
  | 'hoeren'
  | 'sprechen';

const SKILLS: {
  id: SkillSectionId;
  label: string;
  subtitle: string;
  icon: typeof BookOpen;
  accent: string;
}[] = [
  {
    id: 'lesen',
    label: 'Lesen',
    subtitle: 'Reading',
    icon: BookOpen,
    accent: 'text-[var(--chart-2)]',
  },
  {
    id: 'schreiben',
    label: 'Schreiben',
    subtitle: 'Writing',
    icon: PenLine,
    accent: 'text-primary',
  },
  {
    id: 'hoeren',
    label: 'Hören',
    subtitle: 'Listening',
    icon: Headphones,
    accent: 'text-[var(--chart-4)]',
  },
  {
    id: 'sprechen',
    label: 'Sprechen',
    subtitle: 'Speaking',
    icon: Mic,
    accent: 'text-[var(--chart-3)]',
  },
];

export default function App() {
  const [active, setActive] = useState<SkillSectionId>('lesen');
  const current = SKILLS.find((s) => s.id === active)!;

  return (
    <>
      <div className="app-canvas" aria-hidden />

      <div className="relative z-10 flex min-h-screen flex-col md:flex-row">
        <aside
          className="hidden shrink-0 flex-col overflow-visible border-e border-sidebar-border/80 bg-sidebar/85 backdrop-blur-xl md:flex md:w-[15.5rem] lg:w-64"
          aria-label="Hauptnavigation"
        >
          <div className="flex flex-col gap-3 border-b border-sidebar-border/60 px-5 py-8">
            <p className="font-sans text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Lernportal
            </p>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <LayoutDashboard
                  className="size-[1.35rem] shrink-0 text-primary"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <span className="font-heading text-lg font-medium tracking-tight text-foreground/90">
                  Dashboard
                </span>
              </div>
              <p className="font-heading text-[1.35rem] leading-tight font-semibold tracking-tight">
                <span className="app-wordmark">Deutsch</span>
                <span className="text-foreground/75"> Trainer</span>
              </p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-3 py-4" aria-label="Fertigkeiten">
            {SKILLS.map((skill) => (
              <NavItem
                key={skill.id}
                skill={skill}
                isActive={active === skill.id}
                onSelect={() => setActive(skill.id)}
              />
            ))}
          </nav>

          <div className="border-t border-sidebar-border/60 p-4">
            <ThemeToggle placement="sidebar" />
          </div>
        </aside>

        <div className="sticky top-0 z-30 border-b border-border/50 bg-card/75 backdrop-blur-xl md:hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3.5">
            <div className="min-w-0">
              <p className="truncate font-sans text-[9px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Deutsch Trainer
              </p>
              <p className="truncate font-heading text-base font-semibold tracking-tight">
                <span className="app-wordmark">Dashboard</span>
              </p>
            </div>
            <ThemeToggle placement="header" />
          </div>
          <nav
            className="flex gap-2 overflow-x-auto px-3 pb-3.5 pt-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Fertigkeiten"
          >
            {SKILLS.map((skill) => {
              const Icon = skill.icon;
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => setActive(skill.id)}
                  className={cn(
                    'relative flex shrink-0 flex-col items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[11px] font-semibold transition-all duration-200',
                    active === skill.id
                      ? 'bg-card text-foreground shadow-md ring-1 ring-primary/25'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {active === skill.id && (
                    <span
                      className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-gradient-to-r from-primary via-[var(--chart-2)] to-[var(--chart-4)]"
                      aria-hidden
                    />
                  )}
                  <Icon className="size-5" strokeWidth={1.65} aria-hidden />
                  <span className="max-w-[4.5rem] truncate">{skill.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <main
          id="dashboard-main"
          className="min-h-0 flex-1 overflow-y-auto"
          aria-labelledby="dashboard-section-title"
        >
          <div className="mx-auto max-w-3xl px-4 py-8 pb-20 md:max-w-4xl md:px-10 md:py-12 lg:max-w-5xl">
            <header
              className={cn(
                'app-reveal app-main-surface relative mb-10 overflow-hidden rounded-[1.85rem] border border-border/45 bg-card/70 p-7 shadow-[0_1px_2px_oklch(0_0_0/0.04),0_24px_60px_-28px_oklch(0_0_0/0.14)] backdrop-blur-md md:mb-12 md:p-10',
                'dark:border-border/35 dark:bg-card/50 dark:shadow-[0_1px_2px_oklch(0_0_0/0.15),0_28px_64px_-24px_oklch(0_0_0/0.5)]'
              )}
            >
              <div
                className="app-hero-glow -right-8 -top-20 size-[14rem] bg-gradient-to-br from-primary/30 via-[var(--chart-2)]/15 to-transparent md:right-4 md:top-1/2 md:size-[18rem] md:-translate-y-1/2"
                aria-hidden
              />
              <div
                className="app-hero-glow -bottom-24 -left-12 size-[11rem] bg-gradient-to-tr from-[var(--chart-4)]/25 to-transparent md:size-[14rem]"
                aria-hidden
              />

              <div className="relative flex flex-col gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
                  <div className="min-w-0 space-y-3">
                    <p className="font-sans text-[11px] font-semibold tracking-[0.22em] text-primary uppercase">
                      {current.subtitle}
                    </p>
                    <div className="app-title-rule" aria-hidden />
                    <h1
                      id="dashboard-section-title"
                      className="app-section-title font-heading text-[2.15rem] leading-[1.08] font-semibold tracking-tight md:text-4xl md:leading-[1.06]"
                    >
                      {current.label}
                    </h1>
                  </div>
                  <p className="shrink-0 font-sans text-[11px] font-medium leading-relaxed tracking-wide text-muted-foreground sm:max-w-[12rem] sm:text-end">
                    {new Intl.DateTimeFormat('de-DE', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    }).format(new Date())}
                  </p>
                </div>

                {active === 'schreiben' && (
                  <p className="max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground md:text-lg">
                    Generate sets by topic and CEFR level (A1–B2). Open the
                    reference drawer when you want Wikipedia extracts — keep it
                    closed while you drill.
                  </p>
                )}
              </div>
            </header>

            <div className="animate-in fade-in duration-300">
              {active === 'lesen' && <LesenSection />}
              {active === 'schreiben' && <GrammarPracticeView />}
              {active === 'hoeren' && <HoerenSection />}
              {active === 'sprechen' && <SprechenSection />}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function NavItem({
  skill,
  isActive,
  onSelect,
}: {
  skill: (typeof SKILLS)[number];
  isActive: boolean;
  onSelect: () => void;
}) {
  const Icon = skill.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-sm font-semibold transition-all duration-200',
        isActive
          ? 'bg-card/95 text-foreground shadow-md ring-1 ring-border/50 dark:bg-card/60 dark:ring-border/40'
          : 'text-sidebar-foreground/88 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
      )}
    >
      {isActive ? (
        <span
          className="h-9 w-1 shrink-0 self-center rounded-full bg-gradient-to-b from-primary to-[var(--chart-2)] shadow-sm shadow-primary/15"
          aria-hidden
        />
      ) : (
        <span className="w-1 shrink-0 self-center" aria-hidden />
      )}
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors',
          isActive
            ? 'border-primary/25 bg-primary/10 text-primary'
            : 'border-border/50 bg-card/60 text-muted-foreground',
          !isActive && skill.accent
        )}
        aria-hidden
      >
        <Icon className="size-[18px]" strokeWidth={1.65} />
      </span>
      <span className="min-w-0 flex-1 truncate">{skill.label}</span>
    </button>
  );
}
