import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Headphones,
  LayoutDashboard,
  LogOut,
  Mic,
  PenLine,
} from 'lucide-react';
import '@/app.css';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GrammarPracticeView } from '@/views/grammar-practice-view';
import { useAuth } from '@/contexts/auth-context';

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
  duoIconTint: string;
}[] = [
  {
    id: 'lesen',
    label: 'Lesen',
    subtitle: 'Reading',
    icon: BookOpen,
    duoIconTint: 'text-[var(--chart-2)]',
  },
  {
    id: 'schreiben',
    label: 'Schreiben',
    subtitle: 'Writing',
    icon: PenLine,
    duoIconTint: 'text-primary',
  },
  {
    id: 'hoeren',
    label: 'Hören',
    subtitle: 'Listening',
    icon: Headphones,
    duoIconTint: 'text-[var(--chart-4)]',
  },
  {
    id: 'sprechen',
    label: 'Sprechen',
    subtitle: 'Speaking',
    icon: Mic,
    duoIconTint: 'text-[var(--chart-3)]',
  },
];

export function DashboardApp() {
  const [active, setActive] = useState<SkillSectionId>('lesen');
  const current = SKILLS.find((s) => s.id === active)!;
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <>
      <div className="app-canvas" aria-hidden />

      <div className="relative z-10 flex min-h-screen flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:flex-row md:pb-0">
        <aside
          className="hidden shrink-0 flex-col overflow-visible border-e-2 border-[var(--duo-border)] bg-sidebar md:flex md:w-[17rem] lg:w-[18rem]"
          aria-label="Hauptnavigation"
        >
          <div className="border-b-2 border-[var(--duo-border)] px-4 py-5 md:px-5">
            <div className="app-brand-card relative overflow-hidden rounded-2xl border-2 border-[var(--duo-border)] bg-card shadow-[0_5px_0_0_var(--duo-border)] dark:border-border dark:shadow-[0_5px_0_0_var(--border)]">
              <div
                className="h-1.5 w-full bg-primary shadow-[inset_0_-3px_0_0_var(--primary-shadow)]"
                aria-hidden
              />
              <div className="flex items-start gap-3 p-4">
                <span className="flex size-[3.25rem] shrink-0 items-center justify-center rounded-2xl border-2 border-[var(--primary-shadow)] bg-primary text-primary-foreground shadow-[0_4px_0_0_var(--primary-shadow)]">
                  <LayoutDashboard
                    className="size-7"
                    strokeWidth={2.75}
                    aria-hidden
                  />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="font-sans text-[10px] font-extrabold tracking-[0.18em] text-muted-foreground uppercase">
                    Lernportal
                  </p>
                  <p className="app-wordmark mt-1 font-heading text-[1.65rem] leading-[1.05] font-extrabold tracking-[-0.03em]">
                    Durchblick
                  </p>
                </div>
              </div>
            </div>
          </div>

          <nav
            className="flex flex-1 flex-col gap-1.5 px-3 py-4"
            aria-label="Fertigkeiten"
          >
            {SKILLS.map((skill) => (
              <NavItem
                key={skill.id}
                skill={skill}
                isActive={active === skill.id}
                onSelect={() => setActive(skill.id)}
              />
            ))}
          </nav>

          <div className="border-t-2 border-[var(--duo-border)] space-y-3 p-4">
            {user && (
              <div className="rounded-2xl border-2 border-[var(--duo-border)] bg-card px-3 py-2.5 shadow-[0_3px_0_0_var(--duo-border)]">
                <p className="truncate font-sans text-[11px] font-extrabold tracking-wide text-muted-foreground uppercase">
                  Angemeldet
                </p>
                <p className="mt-0.5 truncate font-sans text-sm font-extrabold text-foreground">
                  {user.email}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2.5 w-full gap-2"
                  onClick={() => void handleLogout()}
                >
                  <LogOut className="size-3.5" aria-hidden />
                  Abmelden
                </Button>
              </div>
            )}
            <ThemeToggle placement="sidebar" />
          </div>
        </aside>

        <div className="sticky top-0 z-30 border-b-2 border-[var(--duo-border)] bg-card md:hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <div className="min-w-0">
              <p className="app-wordmark truncate font-heading text-base font-extrabold tracking-tight">
                Durchblick
              </p>
              <p className="truncate font-heading text-sm font-extrabold text-foreground">
                {current.label}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground"
                aria-label="Abmelden"
                onClick={() => void handleLogout()}
              >
                <LogOut className="size-[18px]" aria-hidden />
              </Button>
              <ThemeToggle placement="header" />
            </div>
          </div>
        </div>

        <main
          id="dashboard-main"
          className="min-h-0 flex-1 overflow-y-auto"
          aria-labelledby="dashboard-section-title"
        >
          <div className="mx-auto max-w-3xl px-4 py-6 md:max-w-4xl md:px-8 md:py-10 lg:max-w-5xl">
            <header className="app-reveal app-main-surface relative mb-8 overflow-hidden rounded-2xl border-2 border-[var(--duo-border)] bg-card p-6 shadow-[0_4px_0_0_var(--duo-border)] md:mb-10 md:p-9">
              <div className="relative flex flex-col gap-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
                  <div className="min-w-0 space-y-2">
                    <p className="font-sans text-[11px] font-extrabold tracking-[0.14em] text-[var(--chart-2)] uppercase">
                      {current.subtitle}
                    </p>
                    <div className="app-title-rule" aria-hidden />
                    <h1
                      id="dashboard-section-title"
                      className="app-section-title font-heading text-[1.85rem] leading-[1.1] md:text-[2.25rem]"
                    >
                      {current.label}
                    </h1>
                  </div>
                  <p className="shrink-0 font-sans text-xs font-bold text-muted-foreground sm:max-w-[11rem] sm:text-end">
                    {new Intl.DateTimeFormat('de-DE', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    }).format(new Date())}
                  </p>
                </div>

                {active === 'schreiben' && (
                  <p className="max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground md:text-base">
                    Erzeuge Sätze nach Thema und Niveau (A1–B2). Öffne die
                    Grammatik-Referenz nur wenn du sie brauchst.
                  </p>
                )}
              </div>
            </header>

            {active === 'schreiben' && (
              <div className="animate-in fade-in duration-200">
                <GrammarPracticeView />
              </div>
            )}
          </div>
        </main>

        <nav
          className="duo-mobile-tabbar fixed inset-x-0 bottom-0 z-40 flex border-t-2 border-[var(--duo-border)] bg-card md:hidden"
          aria-label="Fertigkeiten"
        >
          {SKILLS.map((skill) => {
            const Icon = skill.icon;
            const isOn = active === skill.id;
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => setActive(skill.id)}
                className={cn(
                  'flex min-h-[3.5rem] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 font-sans text-[10px] font-extrabold transition-colors',
                  isOn
                    ? 'text-primary'
                    : 'text-muted-foreground active:bg-muted/80'
                )}
              >
                <span
                  className={cn(
                    'flex size-11 items-center justify-center rounded-2xl border-2 transition-all',
                    isOn
                      ? 'border-[var(--duo-nav-active-border)] bg-[var(--duo-nav-active)] shadow-[0_3px_0_0_var(--duo-nav-active-border)]'
                      : 'border-transparent bg-transparent'
                  )}
                  aria-hidden
                >
                  <Icon
                    className={cn(
                      'size-6',
                      isOn ? 'text-[var(--chart-2)]' : skill.duoIconTint
                    )}
                    strokeWidth={2.25}
                  />
                </span>
                <span className="max-w-full truncate">{skill.label}</span>
              </button>
            );
          })}
        </nav>
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
        'group flex w-full items-center gap-3 rounded-2xl border-2 px-2 py-2 text-left font-sans text-[15px] font-extrabold transition-all duration-150',
        isActive
          ? 'border-[var(--duo-nav-active-border)] bg-[var(--duo-nav-active)] text-foreground shadow-[0_4px_0_0_var(--duo-nav-active-border)]'
          : 'border-transparent bg-transparent text-sidebar-foreground hover:bg-muted'
      )}
    >
      <span
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl border-2 transition-all',
          isActive
            ? 'border-[var(--chart-2)]/35 bg-card text-[var(--chart-2)] shadow-[0_3px_0_0_var(--duo-border)]'
            : 'border-[var(--duo-border)] bg-card text-muted-foreground shadow-[0_3px_0_0_var(--duo-border)] group-hover:text-foreground'
        )}
        aria-hidden
      >
        <Icon className="size-[22px]" strokeWidth={2.25} />
      </span>
      <span className="min-w-0 flex-1 truncate">{skill.label}</span>
      {isActive && (
        <span
          className="size-2 shrink-0 rounded-full bg-primary"
          aria-hidden
        />
      )}
    </button>
  );
}
