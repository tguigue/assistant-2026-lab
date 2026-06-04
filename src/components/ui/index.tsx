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
export function Separator({ className }: { className?: string }) {
  return <div className={cn('h-px bg-zinc-200', className)} />;
}

/* ---------- Icon ---------- */
export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg className={cn('inline-block', className)}>
      <use href={`/icons.svg?v=4#i-${name}`} />
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
        <span className="flex-1 min-w-0 t-base-medium text-zinc-900 leading-snug line-clamp-2 break-words">
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
