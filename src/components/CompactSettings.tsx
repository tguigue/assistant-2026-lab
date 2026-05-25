import { useState } from 'react';
import { useChatbot } from '../chatbot/store';
import { PRIMITIVES, type PrimitiveDef, type Variant } from '../dashboard/primitiveDefs';

const GROUP_LABELS: Record<'E' | 'C' | 'A', string> = {
  E: 'Empty state',
  C: 'Composer',
  A: 'Response',
};

export function CompactSettings() {
  const resetAllPrimitives = useChatbot((s) => s.resetAllPrimitives);
  const highlightMode = useChatbot((s) => s.highlightMode);
  const toggleHighlightMode = useChatbot((s) => s.toggleHighlightMode);
  const primitives = useChatbot((s) => s.primitives);
  // Accordion: only one row open at a time.
  const [openCode, setOpenCode] = useState<string | null>(null);

  const groups: Record<'E' | 'C' | 'A', PrimitiveDef[]> = { E: [], C: [], A: [] };
  for (const p of PRIMITIVES) groups[p.group].push(p);

  const modifiedCount = PRIMITIVES.reduce((n, p) => {
    const v = primitives[p.code];
    const dirty =
      v.visible !== p.defaultVisible ||
      v.variant !== p.defaultVariantId ||
      (p.content && v.content !== p.content.defaultId);
    return dirty ? n + 1 : n;
  }, 0);

  return (
    <aside className="w-[300px] shrink-0 bg-white border-r border-zinc-200 flex flex-col min-h-0">
      <div className="px-4 py-3 border-b border-zinc-200">
        <div className="flex items-center justify-between mb-2">
          <div className="t-micro text-zinc-500 uppercase tracking-wide">Primitives</div>
          <ResetButton modifiedCount={modifiedCount} onReset={resetAllPrimitives} />
        </div>
        <HighlightToggle on={highlightMode} onToggle={toggleHighlightMode} />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin pb-4">
        {(['E', 'C', 'A'] as const).map((g, i) => (
          <div key={g} className={i > 0 ? 'mt-4 pt-3 border-t border-zinc-200' : ''}>
            <Section
              title={GROUP_LABELS[g]}
              items={groups[g]}
              openCode={openCode}
              onToggle={(code) => setOpenCode(openCode === code ? null : code)}
            />
          </div>
        ))}
      </div>
    </aside>
  );
}

/* -------------------- Highlight toggle (mode) -------------------- */
function HighlightToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      title="Survolez les sections pour les lier au panneau gauche."
      className={
        'w-full h-9 px-2.5 rounded-lg border flex items-center gap-2.5 transition-colors ' +
        (on
          ? 'bg-amber-50 border-amber-300 text-amber-900'
          : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400')
      }
    >
      <span className={'inline-grid place-items-center size-5 rounded ' + (on ? 'bg-amber-500 text-white' : 'bg-zinc-100 text-zinc-500')}>
        <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </span>
      <span className="flex-1 text-left t-small-medium">Highlight primitives</span>
      <span className={'relative inline-flex w-8 h-4 rounded-full transition-colors ' + (on ? 'bg-amber-500' : 'bg-zinc-200')}>
        <span className={'absolute top-0.5 size-3 rounded-full bg-white shadow transition-all ' + (on ? 'left-4' : 'left-0.5')} />
      </span>
    </button>
  );
}

/* -------------------- Reset button -------------------- */
function ResetButton({ modifiedCount, onReset }: { modifiedCount: number; onReset: () => void }) {
  const disabled = modifiedCount === 0;
  return (
    <button
      onClick={onReset}
      disabled={disabled}
      title={disabled ? 'Tous les primitives sont au défaut' : `Revenir au défaut (${modifiedCount} modifié${modifiedCount > 1 ? 's' : ''})`}
      className={
        'inline-flex items-center gap-1.5 h-6 px-2 rounded t-small-regular transition-colors ' +
        (disabled
          ? 'text-zinc-300 cursor-not-allowed'
          : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100')
      }
    >
      <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
      </svg>
      {disabled ? 'reset' : `reset · ${modifiedCount}`}
    </button>
  );
}

function Section({
  title, items, openCode, onToggle,
}: {
  title: string;
  items: PrimitiveDef[];
  openCode: string | null;
  onToggle: (code: string) => void;
}) {
  return (
    <div>
      <div className="px-4 pt-3 pb-1 t-micro text-zinc-500">{title}</div>
      <ul>
        {items.map((p) => (
          <Row key={p.code} def={p} open={openCode === p.code} onToggle={() => onToggle(p.code)} />
        ))}
      </ul>
    </div>
  );
}

function Row({
  def, open, onToggle,
}: {
  def: PrimitiveDef;
  open: boolean;
  onToggle: () => void;
}) {
  const value = useChatbot((s) => s.primitives[def.code]);
  const setVariant = useChatbot((s) => s.setPrimitiveVariant);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  const setContent = useChatbot((s) => s.setPrimitiveContent);
  const highlightMode = useChatbot((s) => s.highlightMode);
  const hovered = useChatbot((s) => s.hoveredPrimitive);
  const setHovered = useChatbot((s) => s.setHoveredPrimitive);

  const isHighlighted = highlightMode && hovered === def.code;

  const currentVariantName = !value.visible
    ? 'Masqué'
    : def.variants.find((v) => v.id === value.variant)?.name ?? '';
  const currentContentName = def.content
    ? def.content.variants.find((v) => v.id === (value.content ?? def.content!.defaultId))?.name
    : undefined;

  const summary = def.content && value.visible
    ? `${currentVariantName} · ${currentContentName}`
    : currentVariantName;

  return (
    <li
      onMouseEnter={() => highlightMode && setHovered(def.code)}
      onMouseLeave={() => highlightMode && setHovered(null)}
      className={
        'border-b border-zinc-100 last:border-b-0 transition-colors ' +
        (isHighlighted ? 'bg-amber-100' : open ? 'bg-zinc-50' : 'hover:bg-zinc-50/60')
      }
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-4 py-1.5 text-left"
      >
        <svg
          className={'size-3 text-zinc-400 shrink-0 transition-transform ' + (open ? 'rotate-90' : '')}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
        <span className={'t-small-medium shrink-0 ' + (value.visible ? 'text-zinc-900' : 'text-zinc-400')}>
          {def.name}
        </span>
        <span className="flex-1 min-w-0 text-right t-small-regular text-zinc-400 truncate">
          {summary}
        </span>
      </button>

      {open && (
        <div className="pl-9 pr-4 pb-2 pt-1">
          <OptionList
            label={def.content ? 'design' : undefined}
            options={def.variants}
            value={value.visible ? value.variant : null}
            onChange={(id) => {
              setVariant(def.code, id);
              if (!value.visible) setVisible(def.code, true);
            }}
            hiddenActive={!value.visible}
            onHide={def.canHide === false ? undefined : () => setVisible(def.code, false)}
          />
          {def.content && (
            <div className="mt-1.5">
              <OptionList
                label="content"
                options={def.content.variants}
                value={value.content ?? def.content.defaultId}
                onChange={(id) => setContent(def.code, id)}
              />
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function OptionList({
  label, options, value, onChange, hiddenActive, onHide,
}: {
  label?: string;
  options: Variant[];
  value: string | null;
  onChange: (id: string) => void;
  hiddenActive?: boolean;
  onHide?: () => void;
}) {
  return (
    <div>
      {label && (
        <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-0.5">
          {label}
        </div>
      )}
      <div>
        {options.map((o) => (
          <OptionItem
            key={o.id}
            active={!hiddenActive && o.id === value}
            onClick={() => onChange(o.id)}
            label={o.name}
          />
        ))}
        {onHide && (
          <OptionItem
            active={!!hiddenActive}
            onClick={onHide}
            label="Masquer"
            muted
          />
        )}
      </div>
    </div>
  );
}

function OptionItem({
  active, onClick, label, muted,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  muted?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 py-0.5 rounded text-left hover:bg-zinc-100"
    >
      <span
        className={
          'size-2.5 rounded-full border shrink-0 ' +
          (active ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300 bg-white')
        }
      />
      <span
        className={
          't-small-regular truncate ' +
          (active ? 'text-zinc-900' : muted ? 'text-zinc-400' : 'text-zinc-600')
        }
      >
        {label}
      </span>
    </button>
  );
}
