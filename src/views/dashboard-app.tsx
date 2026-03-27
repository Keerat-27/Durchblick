import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Headphones,
  Languages,
  LogOut,
  Mic,
  PenLine,
  UserRound,
} from 'lucide-react';
import '@/app.css';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { duoPressParent, duoPressShadowChild } from '@/lib/duo-press';
import { cn } from '@/lib/utils';
import { GrammarPracticeView } from '@/views/grammar-practice-view';
import { ProfileView } from '@/views/profile-view';
import { useAuth } from '@/contexts/auth-context';

export type SkillSectionId =
  | 'lesen'
  | 'schreiben'
  | 'hoeren'
  | 'sprechen';

export type DashboardSectionId = SkillSectionId | 'profil';

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

const PROFILE_SECTION = {
  id: 'profil' as const,
  label: 'Profil',
  subtitle: 'Statistiken & Konto',
  icon: UserRound,
  duoIconTint: 'text-[var(--chart-5)]',
};

/** Same height row as top header on md+ so the border under the logo lines up. */
const DASHBOARD_MD_HEADER_ROW =
  'md:flex md:min-h-[5.25rem] md:items-center md:py-0';

function sectionMeta(active: DashboardSectionId) {
  if (active === 'profil') return PROFILE_SECTION;
  return SKILLS.find((s) => s.id === active)!;
}

export function DashboardApp() {
  const [active, setActive] = useState<DashboardSectionId>('lesen');
  const current = sectionMeta(active);
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
          className="hidden shrink-0 flex-col overflow-visible border-e-2 border-[var(--duo-border)] bg-sidebar md:flex md:min-h-screen md:w-[17rem] lg:w-[18rem]"
          aria-label="Hauptnavigation"
        >
          <div
            className={cn(
              'border-b-2 border-[var(--duo-border)] px-4 py-3 md:px-5',
              DASHBOARD_MD_HEADER_ROW
            )}
          >
            <div className="flex min-w-0 items-center gap-3 md:gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border-2 border-[var(--primary-shadow)] bg-primary text-primary-foreground shadow-[0_4px_0_0_var(--primary-shadow)] md:size-[3.25rem]">
                <Languages
                  className="size-[1.35rem] md:size-7"
                  strokeWidth={2.5}
                  aria-hidden
                />
              </span>
              <p className="app-wordmark min-w-0 truncate font-heading text-2xl font-extrabold leading-tight tracking-tight md:text-[1.65rem] md:leading-[1.1]">
                Durchblick
              </p>
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

          <div className="mt-auto">
            <div className="space-y-3 border-t-2 border-[var(--duo-border)] p-4 pt-3">
              {user && (
                <>
                  <div className="rounded-2xl border-2 border-[var(--duo-border)] bg-card px-3 py-2.5 shadow-[0_3px_0_0_var(--duo-border)]">
                    <p className="truncate font-sans text-[11px] font-extrabold tracking-wide text-muted-foreground uppercase">
                      Angemeldet
                    </p>
                    <p className="mt-0.5 truncate font-sans text-sm font-extrabold text-foreground">
                      {user.email}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full gap-2"
                    onClick={() => void handleLogout()}
                  >
                    <LogOut className="size-4" aria-hidden />
                    Abmelden
                  </Button>
                </>
              )}
            </div>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header
            className={cn(
              'sticky top-0 z-30 flex shrink-0 items-center justify-between gap-3 border-b-2 border-[var(--duo-border)] bg-card/95 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 md:px-6',
              DASHBOARD_MD_HEADER_ROW
            )}
            aria-label="Kopfzeile"
          >
            <div className="min-w-0">
              <p className="truncate font-heading text-sm font-extrabold text-foreground md:hidden">
                {current.label}
              </p>
              <p className="hidden truncate font-sans text-xs font-extrabold text-muted-foreground md:block md:text-sm">
                <span className="text-[var(--chart-2)]">{current.subtitle}</span>
                <span className="text-muted-foreground"> · </span>
                {current.label}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
              <ThemeToggle placement="header" />
              <button
                type="button"
                className={cn(
                  'inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border-2 bg-card font-sans hover:brightness-[1.02] focus-visible:border-[var(--chart-2)] focus-visible:ring-[3px] focus-visible:ring-[var(--chart-2)]/35',
                  duoPressParent,
                  active === 'profil'
                    ? 'border-[var(--duo-nav-active-border)] bg-[var(--duo-nav-active)] text-foreground shadow-[0_4px_0_0_var(--duo-nav-active-border)] hover:bg-[var(--duo-nav-active)]'
                    : 'border-[var(--duo-border-strong)] text-muted-foreground shadow-[0_4px_0_0_var(--duo-border-strong)] hover:bg-muted dark:border-input dark:bg-input/30 dark:text-foreground dark:shadow-[0_4px_0_0_var(--border)] dark:hover:bg-input/50'
                )}
                aria-label="Profil öffnen"
                aria-pressed={active === 'profil'}
                onClick={() => setActive('profil')}
              >
                <UserRound className="size-4" strokeWidth={2.25} aria-hidden />
              </button>
            </div>
          </header>

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
                {active === 'profil' && (
                  <p className="max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground md:text-base">
                    Sieh Serien, Genauigkeit und Übungsvolumen — alles aus deinen
                    Aktivitäten unter Schreiben.
                  </p>
                )}
              </div>
            </header>

            {active === 'schreiben' && (
              <div className="animate-in fade-in duration-200">
                <GrammarPracticeView />
              </div>
            )}
            {active === 'profil' && (
              <div className="animate-in fade-in duration-200">
                <ProfileView />
              </div>
            )}
          </div>
        </main>
        </div>

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
                  'flex min-h-[3.5rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 font-sans text-[10px] font-extrabold transition-colors',
                  duoPressParent,
                  isOn
                    ? 'text-primary'
                    : 'text-muted-foreground active:bg-muted/80'
                )}
              >
                <span
                  className={cn(
                    'flex size-11 items-center justify-center rounded-2xl border-2 transition-all',
                    duoPressShadowChild,
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
        'flex w-full items-center gap-3 rounded-2xl border-2 px-2 py-2 text-left font-sans text-[15px] font-extrabold',
        duoPressParent,
        isActive
          ? 'border-[var(--duo-nav-active-border)] bg-[var(--duo-nav-active)] text-foreground shadow-[0_4px_0_0_var(--duo-nav-active-border)]'
          : 'border-transparent bg-transparent text-sidebar-foreground hover:bg-muted'
      )}
    >
      <span
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl border-2 transition-all',
          duoPressShadowChild,
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
