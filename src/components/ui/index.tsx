import { type ReactNode, type ButtonHTMLAttributes } from 'react';

/* ---------- cn ---------- */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

/* ---------- Modals ----------
   Shared max-height for every centered modal, so the height:width proportion
   stays consistent app-wide. The pixel cap holds the proportion on tall screens
   (a modal never gets much taller than it is wide); the % fallback keeps it
   on-screen on short ones. Change it here and every modal follows.

   `%` rather than `vh` so the cap follows the containing block. */
export const MODAL_MAX_H = 'max-h-[min(600px,85%)]';

/* Centered modal shell. `narrow` = phone-sized host: the modal gives up its
   fixed width and takes the room it has, minus a gutter. */
export function modalShell(maxWidth: string, narrow: boolean, extra = '') {
  return cn(
    'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col overflow-hidden',
    'bg-white rounded-2xl shadow-xl border border-zinc-200',
    MODAL_MAX_H,
    narrow ? 'w-[calc(100%-1.5rem)]' : `w-full ${maxWidth}`,
    extra,
  );
}

/* Side drawer. Narrow it keeps being a side drawer and just takes the whole
   width — the ordinary web answer. (It was briefly a rounded bottom sheet with
   a grab handle; that's a native idiom, and importing one native control into a
   web app buys nothing but inconsistency.) */
export function drawerShell(width: string, narrow: boolean) {
  return cn(
    'fixed inset-y-0 right-0 z-50 bg-white shadow-xl flex flex-col',
    narrow ? 'w-full' : `${width} border-l border-zinc-200`,
  );
}

/* The dimmed backdrop behind any overlay. `inset-0` on a fixed element covers
   the containing block — the window, or the phone frame when portaled. */

/* ---------- Button ---------- */
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md';
};
export function Button({
  variant = 'outline',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  const v = {
    solid: 'bg-zinc-900 text-white hover:bg-zinc-800',
    outline: 'border border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400',
    ghost: 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
  }[variant];
  const s = {
    sm: 'h-7 px-2.5 t-base-medium',
    md: 'h-8 px-3 t-base-medium',
  }[size];
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md transition-colors disabled:opacity-50 disabled:pointer-events-none',
        v,
        s,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------- Segmented (three-way for Role) ---------- */
type SegmentedOption<T extends string> = { value: T; label: string; hint?: string };
type SegmentedProps<T extends string> = {
  value: T;
  onChange: (v: T) => void;
  options: SegmentedOption<T>[];
  className?: string;
};
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      className={cn(
        'inline-flex rounded-md border border-zinc-200 bg-zinc-50 p-0.5',
        className,
      )}
      role="radiogroup"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            title={opt.hint}
            className={cn(
              'h-6 px-2 rounded-[5px] t-base-medium transition-colors',
              active
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200'
                : 'text-zinc-500 hover:text-zinc-900',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Toggle (binary) ---------- */
export function Toggle({
  checked,
  onChange,
  children,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children?: ReactNode;
  hint?: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      title={hint}
      className={cn(
        'inline-flex items-center gap-2 rounded-md px-2 py-1 t-base-medium border transition-colors',
        checked
          ? 'bg-zinc-900 border-zinc-900 text-white'
          : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400',
      )}
    >
      <span
        className={cn(
          'size-2 rounded-full transition-colors',
          checked ? 'bg-white' : 'bg-zinc-300',
        )}
      />
      {children}
    </button>
  );
}

/* ---------- Select (native, styled) ---------- */
export function Select<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="appearance-none w-full h-8 px-3 pr-8 rounded-md border border-zinc-200 bg-white t-base-medium text-zinc-900 outline-none focus:border-zinc-900 hover:border-zinc-400 transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon
        name="chevron-down"
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500"
      />
    </div>
  );
}

/* ---------- Tabs ---------- */
export function Tabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div role="tablist" className="flex items-center gap-0 border-b border-zinc-200">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'px-3 py-2 t-base-medium border-b-2 -mb-px transition-colors',
              active
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-900',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Separator ---------- */
/**
 * StatusBullet — a timeline bullet that pulses while something is live.
 *
 * The ping halo is the app's ONE "this is happening now" cue (A1's reasoning
 * trace, A12's long job). The `ring-4 ring-white` is load-bearing: it punches a
 * hole through the hairline rail a timeline draws behind its bullets, so the
 * caller owns the rail and this owns the dot.
 */
export function StatusBullet({ running = false, tone = 'dark' }: {
  running?: boolean;
  /** `dark` = in progress / done. `warn` = stopped partway, needs attention. */
  tone?: 'dark' | 'warn';
}) {
  const core = running ? (tone === 'warn' ? 'bg-amber-500' : 'bg-zinc-900')
                       : (tone === 'warn' ? 'bg-amber-400' : 'bg-zinc-400');
  return (
    <span className="relative z-10 mt-1.5 flex size-1.5 shrink-0 rounded-full ring-4 ring-white">
      {running && (
        <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
          tone === 'warn' ? 'bg-amber-500' : 'bg-zinc-900')} />
      )}
      <span className={cn('relative inline-flex size-1.5 rounded-full', core)} />
    </span>
  );
}

/** Determinate progress. Amber once `warn` — the app's one "approaching a limit"
 *  colour, shared with the usage meter and the connector/conflict bands. */
export function ProgressBar({ pct, warn = false, size = 'md' }: {
  pct: number;
  warn?: boolean;
  size?: 'sm' | 'md';
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <span className={cn('block relative w-full rounded-full bg-zinc-200 overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2')}>
      <span
        className={cn('absolute inset-y-0 left-0 rounded-full', warn ? 'bg-amber-500' : 'bg-zinc-700')}
        style={{ width: clamped + '%' }}
      />
    </span>
  );
}

/** Sliding switch. The kit's `Toggle` is a pill-with-a-dot — a different
 *  control; this is the one the watcher and autonomy surfaces use. */
export function Sw({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn('relative h-5 w-9 rounded-full transition-colors shrink-0', checked ? 'bg-zinc-900' : 'bg-zinc-300')}
    >
      <span className={cn('absolute top-0.5 size-4 rounded-full bg-white shadow transition-all', checked ? 'left-[18px]' : 'left-0.5')} />
    </button>
  );
}

export function Separator({ className }: { className?: string }) {
  return <div className={cn('h-px bg-zinc-200', className)} />;
}

/* ---------- Icon ---------- */
export function Icon({ name, className, label }: { name: string; className?: string; label?: string }) {
  // Icons are decorative by default (aria-hidden). Pass `label` to expose one as
  // an image with an accessible name (e.g. an icon-only control).
  return (
    <svg className={cn('inline-block', className)} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <use href={`/icons.svg?v=7#i-${name}`} />
    </svg>
  );
}

/* ---------- FileCard ----------
   Shared visual for any file attached to the conversation — used by both
   C5 Imported Files (composer) and U2 Attached File Chip (user message).
   A fixed-width card: filename clamped to two lines, then a format pill
   (DOCX / PDF / PNG…) + optional size meta. The fixed width is what keeps
   a long filename from blowing the card out to full width.
   Lifts a touch on hover (shadow). */
export function FileCard({
  name,
  meta,
  format,
  onRemove,
  className,
}: {
  name: string;
  meta?: string;
  format?: string;
  onRemove?: () => void;
  className?: string;
}) {
  // Fall back to the filename extension when no explicit format is given (e.g. U2).
  const fmt = format ?? (name.includes('.') ? name.split('.').pop()!.toUpperCase() : undefined);
  return (
    <div
      className={cn(
        'group relative flex flex-col gap-2 w-[210px] px-3 py-2.5 rounded-lg border border-zinc-200 bg-white shadow-sm transition-shadow duration-150 hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <span className="flex-1 min-w-0 t-base-medium leading-snug line-clamp-2 break-words text-zinc-900">
          {name}
        </span>
        {onRemove && (
          <button
            onClick={onRemove}
            className="shrink-0 -mr-1 -mt-1 size-6 grid place-items-center rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700"
            title="Retirer"
          >
            <Icon name="x" className="size-3.5" />
          </button>
        )}
      </div>

      {(fmt || meta) && (
        <div className="flex items-center gap-1.5">
          {fmt && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-zinc-100 t-mono text-[10px] font-semibold tracking-wide text-zinc-500">
              {fmt}
            </span>
          )}
          {meta && <span className="t-small-regular text-zinc-400 truncate">{meta}</span>}
        </div>
      )}
    </div>
  );
}
