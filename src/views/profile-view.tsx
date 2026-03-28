import { CalendarDays, UserRound } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useLearningProgress } from '@/contexts/learning-progress-context';
import { Card, CardContent } from '@/components/ui/card';

/** Profile hub: account summary. Learning stats live on Start (Dashboard). */
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
                  Übe unter Lesen oder Schreiben — deinen Fortschritt findest du
                  unter <span className="text-foreground">Start</span> im
                  Dashboard.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
