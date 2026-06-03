import { type ReactNode, type ButtonHTMLAttributes } from 'react';

/* ---------- cn ---------- */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

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
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
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
export function Separator({ className }: { className?: string }) {
  return <div className={cn('h-px bg-zinc-200', className)} />;
}

/* ---------- Icon ---------- */
export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg className={cn('inline-block', className)}>
      <use href={`/icons.svg#i-${name}`} />
    </svg>
  );
}

/* ---------- FileCard ----------
   Shared visual for any file attached to the conversation — used by both
   C5 Imported Files (composer) and U2 Attached File Chip (user message).
   Same chrome, same copy pattern (name + format · size), same hover tilt
   so files read as one consistent identity across the app.

   `tilt` is a degree value used as the base rotation — Imported Files passes
   alternating ±1° so a stack of two cards reads like a real stack of papers.
   On hover the card straightens up (rotate 0) + lifts a touch (shadow). */
export function FileCard({
  name,
  meta,
  format,
  onRemove,
  tilt = 0,
  className,
}: {
  name: string;
  meta?: string;
  format?: string;
  onRemove?: () => void;
  tilt?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'group relative inline-flex items-center gap-2.5 pl-2.5 pr-2 py-1.5 rounded-md border border-zinc-200 bg-white shadow-sm transition-transform duration-150 hover:rotate-0 hover:shadow-md max-w-full',
        className,
      )}
      style={{ transform: tilt ? `rotate(${tilt}deg)` : undefined }}
    >
      <Icon name="file-text" className="size-4 text-zinc-500 shrink-0" />
      <span className="flex flex-col min-w-0 leading-tight">
        <span className="t-base-medium text-zinc-900 truncate">{name}</span>
        {(format || meta) && (
          <span className="t-small-regular text-zinc-400 truncate">
            {format && (
              <span className="t-mono text-[10px] font-semibold tracking-wide text-zinc-500">
                {format}
              </span>
            )}
            {format && meta ? <span className="mx-1 text-zinc-300">·</span> : null}
            {meta}
          </span>
        )}
      </span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 size-5 grid place-items-center rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 shrink-0"
          title="Retirer"
        >
          <Icon name="x" className="size-3" />
        </button>
      )}
    </div>
  );
}
