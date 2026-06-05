import { Icon as DSIcon, type IconName } from '@doctrinelegal/design-system/icon';
import { Card } from '@doctrinelegal/design-system/surface';

/* ---------- cn ---------- */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

/* ---------- Icon ----------
   Renders the Doctrine design-system <Icon> (Material Symbols). The {name,className}
   signature is unchanged so all ~72 call-sites keep working, including the ones that
   pass runtime strings from data tables.

   Two translations happen here:
   1. Sprite name → DS MaterialIconName (hyphen → underscore + semantic remaps).
   2. Tailwind `size-*` (width/height) → `fontSize`. DS Material icons are a font
      glyph sized by font-size, NOT width/height, so size-* alone wouldn't size them.

   The 6 names with no Material equivalent fall back to the original SVG sprite. */
const ICON_MAP: Record<string, string> = {
  'account-balance': 'account_balance', add: 'add', apps: 'apps',
  'arrow-left': 'arrow_back', 'arrow-right': 'arrow_forward', 'arrow-up': 'arrow_upward',
  book: 'book_4', check: 'check', 'chevron-down': 'keyboard_arrow_down',
  'chevron-right': 'chevron_right', 'chevron-up': 'keyboard_arrow_up',
  cloud: 'cloud_download', copy: 'content_copy', description: 'description',
  euro: 'euro_symbol', 'file-text': 'description', folder: 'folder',
  languages: 'language', language: 'language', list: 'format_list_bulleted',
  message: 'chat', mic: 'mic', 'more-horiz': 'more_horiz', paperclip: 'attach_file',
  pen: 'edit', plus: 'add', refresh: 'refresh', scan: 'scan', search: 'search',
  sparkles: 'auto_awesome', table: 'table', 'thumb-down': 'thumb_down',
  'thumb-up': 'thumb_up', upload: 'upload', visibility: 'visibility', x: 'close',
};
// No clean Material equivalent — keep the SVG sprite glyph (semantics matter).
const SPRITE_ONLY = new Set(['bolt', 'columns', 'scales', 'at', 'slash', 'alert']);

// Tailwind size-N → px (N * 4px); size-full → 1em.
function sizeToFontSize(className?: string): string | undefined {
  if (!className) return undefined;
  const m = className.match(/\bsize-(\d+(?:\.\d+)?|full)\b/);
  if (!m) return undefined;
  return m[1] === 'full' ? '1em' : `${parseFloat(m[1]) * 4}px`;
}

export function Icon({ name, className }: { name: string; className?: string }) {
  if (SPRITE_ONLY.has(name)) {
    return (
      <svg className={cn('inline-block', className)}>
        <use href={`/icons.svg?v=4#i-${name}`} />
      </svg>
    );
  }
  const fontSize = sizeToFontSize(className);
  return (
    <DSIcon
      name={(ICON_MAP[name] ?? name) as IconName}
      className={cn('inline-flex items-center justify-center', className)}
      style={fontSize ? { fontSize, lineHeight: 1 } : undefined}
    />
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
    <Card
      className={cn(
        'group relative flex flex-col gap-2 w-[210px] px-3 py-2.5',
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
    </Card>
  );
}
