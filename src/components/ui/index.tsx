import { useLayoutEffect, useRef, useState, type ReactNode, type ButtonHTMLAttributes } from 'react';

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
type SegmentedOption<T extends string> = { value: T; label: string; hint?: string; count?: number };
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
            {/* A count belongs on the segment it describes — otherwise every
                caller re-invents "Label (n)" in its own label string. */}
            {opt.count !== undefined && (
              <span className={cn('ml-1 tabular-nums', active ? 'text-zinc-400' : 'text-zinc-400')}>{opt.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** The composer control-row button: icon-only at 44px on a phone, icon + label
 *  from 2xl. Shared so anything sitting in that row (Sources, Actions, the
 *  consignes chip) is visibly the same class of control. */
export const TOOL_BTN =
  'inline-flex items-center justify-center gap-1.5 size-11 rounded-lg t-base-medium text-zinc-700 hover:bg-zinc-100 ' +
  '@2xl/surface:size-auto @2xl/surface:h-8 @2xl/surface:px-2.5';

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
  options: { value: T; label: string; count?: number }[];
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap" role="tablist">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'h-8 px-3 rounded-lg t-base-medium transition-colors',
              active ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-800',
            )}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className={cn('ml-1.5 tabular-nums', active ? 'text-zinc-400' : 'text-zinc-400')}>{opt.count}</span>
            )}
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
/**
 * usePopover — place a popover on the side that actually has room, and cap it
 * to that room.
 *
 * Two things go wrong with a hardcoded `bottom-full`, and neither is a z-index
 * problem: a popover that opens upward from a composer sitting high on the page
 * runs off the top, and because the canvas scroll container has `overflow-y:
 * auto`, the overflow CLIPS it. No stacking order can rescue a clipped element —
 * `overflow` wins over `z-index` — which is why the fix is placement, not layering.
 *
 * So: measure the nearest scrolling ancestor (that is what clips, not the
 * viewport), pick the side with enough space, and hand back a max-height so a
 * menu taller than either side scrolls internally instead of being cut off.
 *
 * Returns `up` for the caller to pick `bottom-full mb-2` vs `top-full mt-2`, and
 * `maxH` to spread onto `style`. Mount the popover only while open — the
 * measurement runs once on layout.
 */
export function usePopover() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ up: boolean; maxH?: number }>({ up: true });

  useLayoutEffect(() => {
    const el = ref.current;
    const anchor = el?.parentElement;
    if (!el || !anchor) return;

    const a = anchor.getBoundingClientRect();

    // What clips is the nearest ancestor with a non-visible overflow — falling
    // back to the viewport when there isn't one.
    let clipTop = 0;
    let clipBottom = window.innerHeight;
    let node: HTMLElement | null = anchor.parentElement;
    while (node) {
      const cs = getComputedStyle(node);
      if (cs.overflowY !== 'visible' || cs.overflowX !== 'visible') {
        const r = node.getBoundingClientRect();
        clipTop = r.top;
        clipBottom = r.bottom;
        break;
      }
      node = node.parentElement;
    }

    const GAP = 12;
    const above = a.top - clipTop - GAP;
    const below = clipBottom - a.bottom - GAP;
    // scrollHeight, not offsetHeight: once we cap the height the element's own
    // box would otherwise report the capped value and the choice would oscillate.
    const need = el.scrollHeight;

    const up = above >= need ? true : below >= need ? false : above > below;
    // Never collapse to a sliver — below this a menu is unusable and it's better
    // to let it overhang than to render three scrolling pixels.
    setPos({ up, maxH: Math.max(180, Math.floor(up ? above : below)) });
  }, []);

  return { ref, up: pos.up, maxH: pos.maxH };
}

/**
 * Popover — an anchored menu that places itself on the side with room.
 *
 * Wrap it in a `relative` anchor and render it only while open. Everything about
 * placement is handled: it flips up or down based on the space its nearest
 * SCROLLING ancestor allows, and caps its own height so a tall menu scrolls
 * internally rather than being clipped.
 *
 * Worth stating because it's a recurring wrong diagnosis: when a popover gets
 * cut off, the cause is almost never z-index. An ancestor with `overflow: auto`
 * clips its descendants regardless of stacking order, so the fix is placement
 * and height, not a bigger number.
 */
export function Popover({
  children, align = 'left', width, className = '', z = 'z-30',
}: {
  children: ReactNode;
  align?: 'left' | 'right';
  /** Tailwind width classes, e.g. "w-[320px] max-w-[88cqw]". */
  width?: string;
  className?: string;
  z?: string;
}) {
  const { ref, up, maxH } = usePopover();
  return (
    <div
      ref={ref}
      style={{ maxHeight: maxH }}
      className={cn(
        'absolute rounded-xl border border-zinc-200 bg-white shadow-lg overflow-y-auto scrollbar-thin',
        align === 'right' ? 'right-0' : 'left-0',
        up ? 'bottom-full mb-2' : 'top-full mt-2',
        width, z, className,
      )}
    >
      {children}
    </div>
  );
}

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

/* ---------- SearchField ---------- */
/** Accent-insensitive needle prep for search filters — one definition, so the
 *  pickers can't drift on diacritics handling («Négocier» matches "negoc"). */
export function normalizeQuery(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** The one search input. Was hand-rolled identically in three modals. */
export function SearchField({
  value, onChange, placeholder = 'Rechercher…',
}: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50 focus-within:border-zinc-400 transition-colors">
      <Icon name="search" className="size-4 text-zinc-400 shrink-0" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none t-base-regular text-zinc-800 placeholder:text-zinc-400"
      />
    </div>
  );
}

/* ---------- Modal ---------- */
/**
 * THE dialog shell. Every app-level modal composes this instead of re-deriving
 * the same anatomy — five of them had their own copy of the header, the close
 * button, the search field and the footer, which is why their titles, tab rows
 * and paddings had all quietly drifted apart.
 *
 * Three things it fixes by construction:
 *   • one title style (`t-title-4`). Four modals used `t-h2-semibold`, which is
 *     not defined in index.css, so their headings rendered at inherited size.
 *   • one tab treatment — the kit's Segmented. There were three.
 *   • a body min-height, so switching tabs doesn't resize the dialog under the
 *     pointer. Pass `minBody={0}` for a modal whose content is a fixed shape.
 *
 * Canvas-scoped overlays (the budget and watcher dialogs, which deliberately
 * cover only the canvas so the design panel stays usable) are a different
 * container and do NOT use this.
 */
export function Modal<T extends string>({
  title, onClose, width = 'max-w-[560px]', narrow, z, as = 'modal',
  leading, search, tabs, footerLeft, footerRight, minBody = 280, children,
}: {
  title: string;
  /** Optional glyph beside the title, for dialogs that represent one source. */
  leading?: ReactNode;
  onClose: () => void;
  width?: string;
  narrow: boolean;
  /** `drawer` slides in from the right instead of centring. Same anatomy — the
   *  sources picker uses both shapes for one piece of content. */
  as?: 'modal' | 'drawer';
  /** Extra classes for stacking, e.g. '!z-[61]' when opening over another modal. */
  z?: string;
  search?: { value: string; onChange: (v: string) => void; placeholder?: string };
  tabs?: { value: T; onChange: (v: T) => void; options: { value: T; label: string; count?: number }[] };
  footerLeft?: ReactNode;
  footerRight?: ReactNode;
  minBody?: number;
  children: ReactNode;
}) {
  const hasHead = !!search || !!tabs;
  // Tabs imply a min-height (anti-jump). An untabbed dialog gets one only if it
  // asks — otherwise a short body would just be padded with dead space.
  const minBodyExplicit = minBody !== 280;
  // A tabbed MODAL takes a stable height instead of a minimum: a min-height only
  // binds when content is shorter than it, and the connector tabs range from two
  // cards to twenty, so the dialog resized under the pointer on every switch.
  // A DRAWER is already inset-y-0 — full viewport height — so it never jumps,
  // and pinning it to 600px just clipped its list with no footer in sight.
  const stable = as === 'modal' && !!tabs ? '!h-[min(600px,85%)]' : '';
  const shell = as === 'drawer'
    ? drawerShell(width, narrow)
    : cn(modalShell(width, narrow, z), stable);
  return (
    <>
      <div className={cn('fixed inset-0', as === 'drawer' ? 'bg-black/20' : 'bg-black/30', z ? 'z-[60]' : 'z-40')} onClick={onClose} />
      <div className={cn(shell, as === 'drawer' ? z : undefined)}>
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 shrink-0">
          {leading}
          <h2 className="flex-1 t-title-4 text-zinc-900">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fermer">
            <Icon name="x" className="size-4" />
          </Button>
        </div>

        {hasHead && (
          <div className="px-5 pb-3 shrink-0 space-y-3">
            {search && <SearchField {...search} />}
            {tabs && <Tabs value={tabs.value} onChange={tabs.onChange} options={tabs.options} />}
          </div>
        )}

        <Separator />

        {/* The min-height is purely an anti-jump for TABS — a two-item tab and a
            twelve-item tab leave the dialog the same size. An untabbed dialog has
            nothing to stabilise, so forcing it would just pad short content with
            dead space, which is what it did to the upload dialog. */}
        <div
          className="flex-1 min-h-0 overflow-y-auto scrollbar-thin"
          style={minBody && (tabs || minBodyExplicit) ? { minHeight: minBody } : undefined}
        >
          {children}
        </div>

        {(footerLeft || footerRight) && (
          <>
            <Separator />
            <div className="flex items-center justify-between gap-3 px-5 py-4 shrink-0">
              {footerLeft ?? <span />}
              {footerRight}
            </div>
          </>
        )}
      </div>
    </>
  );
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
