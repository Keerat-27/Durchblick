import {
  Award,
  CalendarDays,
  Flame,
  Layers,
  Target,
  TrendingUp,
  UserRound,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useLearningProgress } from '@/contexts/learning-progress-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  accentClass,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Flame;
  accentClass: string;
}) {
  return (
    <Card
      size="sm"
      className="app-reveal border-[var(--duo-border)] bg-card shadow-[0_4px_0_0_var(--duo-border)]"
    >
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="font-sans text-[10px] font-extrabold tracking-[0.12em] text-muted-foreground uppercase">
          {label}
        </CardTitle>
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-xl border-2 border-[var(--duo-border)] bg-[var(--duo-nav-active)] shadow-[0_2px_0_0_var(--duo-border)]',
            accentClass
          )}
          aria-hidden
        >
          <Icon className="size-[18px]" strokeWidth={2.25} />
        </span>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="font-heading text-3xl font-extrabold tabular-nums tracking-tight text-foreground md:text-[2rem]">
          {value}
        </p>
        {hint ? (
          <p className="mt-1 font-sans text-xs font-semibold text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
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

  const accuracyDisplay =
    stats.accuracyPercent != null
      ? `${stats.accuracyPercent}%`
      : '—';

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
                  Übe unter Schreiben — dann erscheinen deine Statistiken hier.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section
        className="app-reveal app-reveal-delay-2 space-y-4"
        aria-labelledby="stats-heading"
      >
        <h2
          id="stats-heading"
          className="font-sans text-[11px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase"
        >
          Statistiken
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatTile
            label="Aktuelle Serie"
            value={String(stats.currentStreak)}
            hint={
              stats.currentStreak === 0
                ? 'Noch keine aktive Serie — übe heute oder gestern weiter'
                : stats.currentStreak === 1
                  ? '1 Tag in Folge mit Übung'
                  : `${stats.currentStreak} Tage in Folge mit Übung`
            }
            icon={Flame}
            accentClass="text-orange-600 dark:text-orange-400"
          />
          <StatTile
            label="Längste Serie"
            value={String(stats.longestStreak)}
            hint="Dein Rekord an aufeinanderfolgenden Tagen"
            icon={Award}
            accentClass="text-[var(--chart-3)]"
          />
          <StatTile
            label="Aktive Tage"
            value={String(stats.practiceDaysCount)}
            hint="Kalendertage mit mindestens einer Übung"
            icon={CalendarDays}
            accentClass="text-[var(--chart-2)]"
          />
          <StatTile
            label="Genauigkeit"
            value={accuracyDisplay}
            hint={
              stats.totalAnswered > 0
                ? `${stats.correct} richtig · ${stats.wrong} falsch`
                : 'Noch keine bewerteten Antworten'
            }
            icon={Target}
            accentClass="text-primary"
          />
          <StatTile
            label="Beantwortet"
            value={String(stats.totalAnswered)}
            hint="Grammatikfragen insgesamt"
            icon={TrendingUp}
            accentClass="text-[var(--chart-4)]"
          />
          <StatTile
            label="Sätze generiert"
            value={String(stats.setsGenerated)}
            hint="Übungssätze unter Schreiben gestartet"
            icon={Layers}
            accentClass="text-[var(--chart-5)]"
          />
        </div>
      </section>

      <section className="app-reveal app-reveal-delay-3">
        <Card className="border-dashed border-[var(--duo-border-strong)] bg-muted/20 dark:border-border">
          <CardContent className="py-6">
            <p className="max-w-2xl font-sans text-sm font-semibold leading-relaxed text-muted-foreground">
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
