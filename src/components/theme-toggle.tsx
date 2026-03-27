import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';

const OPTIONS = [
  { id: 'light' as const, label: 'Light', Icon: Sun },
  { id: 'dark' as const, label: 'Dark', Icon: Moon },
  { id: 'system' as const, label: 'System', Icon: Monitor },
] as const;

const THEME_LABEL_DE: Record<(typeof OPTIONS)[number]['id'], string> = {
  light: 'Hell',
  dark: 'Dunkel',
  system: 'System',
};

type Placement = 'sidebar' | 'header';

type Variant = 'icon' | 'bar';

type Props = { placement?: Placement; variant?: Variant };

export function ThemeToggle({ placement = 'sidebar', variant = 'icon' }: Props) {
  const mounted = useMounted();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      const el = rootRef.current;
      if (el && !el.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const openUpward = variant === 'bar' || placement === 'sidebar';

  if (!mounted) {
    if (variant === 'bar') {
      return (
        <div
          className="h-[3.25rem] w-full rounded-2xl border-2 border-[var(--duo-border-strong)] bg-card opacity-50 dark:border-input dark:bg-input/30"
          aria-hidden
        />
      );
    }
    return (
      <div
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border-2 border-[var(--duo-border-strong)] bg-card opacity-50"
        aria-hidden
      >
        <Sun className="size-4 opacity-40" />
      </div>
    );
  }

  const themeKey =
    theme === 'light' || theme === 'dark' || theme === 'system'
      ? theme
      : 'system';
  const ActiveIcon = OPTIONS.find((o) => o.id === themeKey)?.Icon ?? Monitor;

  return (
    <div ref={rootRef} className={cn('relative isolate', variant === 'bar' && 'w-full')}>
      {variant === 'bar' ? (
        <button
          type="button"
          className="inline-flex h-[3.25rem] w-full items-center gap-2 rounded-2xl border-2 border-[var(--duo-border-strong)] bg-card px-4 font-sans text-[17px] font-extrabold tracking-wide text-foreground shadow-[0_4px_0_0_var(--duo-border-strong)] transition-all outline-none hover:bg-muted hover:brightness-[1.02] focus-visible:border-[var(--chart-2)] focus-visible:ring-[3px] focus-visible:ring-[var(--chart-2)]/35 active:translate-y-1 active:shadow-none dark:border-input dark:bg-input/30 dark:shadow-[0_4px_0_0_var(--border)] dark:hover:bg-input/50"
          aria-label="Erscheinungsbild wählen"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? listId : undefined}
          onClick={() => setOpen((o) => !o)}
        >
          <ActiveIcon className="size-5 shrink-0 opacity-90" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-left">
            {THEME_LABEL_DE[themeKey]}
          </span>
          <ChevronDown
            className={cn(
              'size-5 shrink-0 opacity-70 transition-transform',
              open && '-rotate-180'
            )}
            aria-hidden
          />
        </button>
      ) : (
        <button
          type="button"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border-2 border-[var(--duo-border-strong)] bg-card font-sans text-foreground shadow-[0_4px_0_0_var(--duo-border-strong)] transition-all outline-none hover:bg-muted hover:brightness-[1.02] focus-visible:border-[var(--chart-2)] focus-visible:ring-[3px] focus-visible:ring-[var(--chart-2)]/35 active:translate-y-1 active:shadow-none dark:border-input dark:bg-input/30 dark:shadow-[0_4px_0_0_var(--border)] dark:hover:bg-input/50"
          aria-label="Choose color theme"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? listId : undefined}
          onClick={() => setOpen((o) => !o)}
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="size-4" />
          ) : (
            <Sun className="size-4" />
          )}
        </button>
      )}

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label="Theme"
          className={cn(
            'absolute z-[200] flex flex-col gap-0.5 rounded-2xl border-2 border-[var(--duo-border)] bg-popover p-2 text-popover-foreground shadow-[0_6px_0_0_var(--duo-border)] ring-0 dark:border-border dark:shadow-[0_4px_0_0_var(--border)]',
            variant === 'bar' &&
              'bottom-full left-0 right-0 mb-2 w-full min-w-0 origin-bottom',
            variant === 'icon' &&
              openUpward &&
              'bottom-full left-0 mb-2 min-w-[10.5rem] origin-bottom',
            variant === 'icon' &&
              !openUpward &&
              'top-full right-0 mt-2 min-w-[10.5rem] origin-top'
          )}
        >
          <span className="px-2 py-1 font-sans text-[10px] font-extrabold tracking-[0.12em] text-muted-foreground uppercase">
            Erscheinungsbild
          </span>
          {OPTIONS.map(({ id, Icon: OptIcon }) => (
            <button
              key={id}
              type="button"
              role="option"
              aria-selected={themeKey === id}
              className="flex w-full cursor-default items-center gap-2 rounded-xl px-2 py-2.5 text-left font-sans text-sm font-extrabold outline-none hover:bg-muted focus-visible:bg-muted"
              onClick={() => {
                setTheme(id);
                setOpen(false);
              }}
            >
              <OptIcon className="size-4 shrink-0 opacity-80" aria-hidden />
              {THEME_LABEL_DE[id]}
              <Check
                className={cn(
                  'ml-auto size-4 shrink-0',
                  themeKey === id ? 'opacity-70' : 'opacity-0'
                )}
                aria-hidden
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
