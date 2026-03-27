import type { ReactNode } from 'react';
import { Languages } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme-toggle';
import '@/app.css';

export function AuthPortalLayout({
  title,
  subtitle,
  children,
  footerLink,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footerLink: { to: string; label: string; hint: string };
}) {
  return (
    <>
      <div className="app-canvas" aria-hidden />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <header className="absolute top-0 right-0 left-0 flex items-center justify-between gap-3 border-b-2 border-[var(--duo-border)] bg-card/90 px-4 py-3 backdrop-blur-sm md:px-8">
          <Link
            to="/login"
            className="flex min-w-0 items-center gap-2 rounded-xl font-heading text-base font-extrabold tracking-tight text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--chart-2)]/35"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border-2 border-[var(--primary-shadow)] bg-primary text-primary-foreground shadow-[0_3px_0_0_var(--primary-shadow)]">
              <Languages className="size-5" strokeWidth={2.25} aria-hidden />
            </span>
            <span className="truncate">Durchblick</span>
          </Link>
          <ThemeToggle placement="header" />
        </header>

        <div className="app-reveal w-full max-w-md pt-14">
          <div className="overflow-hidden rounded-2xl border-2 border-[var(--duo-border)] bg-card shadow-[0_6px_0_0_var(--duo-border)] dark:border-border dark:shadow-[0_6px_0_0_var(--border)]">
            <div
              className="h-1.5 w-full bg-primary shadow-[inset_0_-3px_0_0_var(--primary-shadow)]"
              aria-hidden
            />
            <div className="space-y-1 px-6 pt-7 pb-2">
              <p className="font-sans text-[11px] font-extrabold tracking-[0.14em] text-[var(--chart-2)] uppercase">
                {subtitle}
              </p>
              <h1 className="app-section-title font-heading text-2xl font-extrabold tracking-tight md:text-[1.75rem]">
                {title}
              </h1>
            </div>
            <div className="px-6 pt-4 pb-8">{children}</div>
          </div>

          <p className="mt-6 text-center font-sans text-sm font-bold text-muted-foreground">
            {footerLink.hint}{' '}
            <Link
              to={footerLink.to}
              className="text-[var(--chart-2)] underline-offset-4 hover:underline"
            >
              {footerLink.label}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
