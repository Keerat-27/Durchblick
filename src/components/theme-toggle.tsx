import { useEffect, useId, useRef, useState } from 'react';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';

const OPTIONS = [
  { id: 'light' as const, label: 'Light', Icon: Sun },
  { id: 'dark' as const, label: 'Dark', Icon: Moon },
  { id: 'system' as const, label: 'System', Icon: Monitor },
];

type Placement = 'sidebar' | 'header';

type Props = { placement?: Placement };

export function ThemeToggle({ placement = 'sidebar' }: Props) {
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

  if (!mounted) {
    return (
      <div
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border-2 border-border bg-card opacity-50"
        aria-hidden
      >
        <Sun className="size-4 opacity-40" />
      </div>
    );
  }

  const Icon = resolvedTheme === 'dark' ? Moon : Sun;
  const active = theme ?? 'system';

  return (
    <div ref={rootRef} className="relative isolate">
      <button
        type="button"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border-2 border-border bg-card text-foreground shadow-[0_3px_0_0_var(--border)] transition-all outline-none hover:bg-muted hover:brightness-[1.02] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-0.5 active:shadow-none dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
        aria-label="Choose color theme"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon className="size-4" />
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label="Theme"
          className={cn(
            'absolute z-[200] flex min-w-[10.5rem] flex-col gap-0.5 rounded-xl border border-border/80 bg-popover p-1.5 text-popover-foreground shadow-lg ring-1 ring-foreground/5',
            placement === 'sidebar'
              ? 'bottom-full left-0 mb-2 origin-bottom'
              : 'top-full right-0 mt-2 origin-top'
          )}
        >
          <span className="px-2 py-1 font-sans text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Theme
          </span>
          {OPTIONS.map(({ id, label, Icon: OptIcon }) => (
            <button
              key={id}
              type="button"
              role="option"
              aria-selected={active === id}
              className="flex w-full cursor-default items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-semibold outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
              onClick={() => {
                setTheme(id);
                setOpen(false);
              }}
            >
              <OptIcon className="size-4 shrink-0 opacity-80" aria-hidden />
              {label}
              <Check
                className={cn(
                  'ml-auto size-4 shrink-0',
                  active === id ? 'opacity-70' : 'opacity-0'
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
