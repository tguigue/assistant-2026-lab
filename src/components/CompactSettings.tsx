import { useState } from 'react';
import { useChatbot } from '../chatbot/store';
import { PRIMITIVES, type PrimitiveDef, type Variant } from '../dashboard/primitiveDefs';
import { USE_CASES_BY_FAMILY, FAMILY_META } from '../chatbot/useCases';
import { Icon } from './ui';

const GROUP_LABELS: Record<'E' | 'C' | 'A', string> = {
  E: 'Empty state',
  C: 'Composer',
  A: 'Answer',
};

export function CompactSettings({ onCollapse }: { onCollapse?: () => void }) {
  const resetAllPrimitives = useChatbot((s) => s.resetAllPrimitives);
  const highlightMode = useChatbot((s) => s.highlightMode);
  const toggleHighlightMode = useChatbot((s) => s.toggleHighlightMode);
  const primitives = useChatbot((s) => s.primitives);
  // Accordion: only one primitive row open at a time.
  const [openCode, setOpenCode] = useState<string | null>(null);
  // Collapsible top-level sections. Primitive groups start folded so the panel
  // opens tidy, with the scenarii in focus.
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(['E', 'C', 'A']));
  const isCollapsed = (k: string) => collapsed.has(k);
  const toggleCollapsed = (k: string) =>
    setCollapsed((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });

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
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200">
        <div className="t-base-semibold text-zinc-900">Assistant 2026</div>
        {onCollapse && (
          <button
            onClick={onCollapse}
            title="Masquer le panneau"
            className="size-7 grid place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Icon name="columns" className="size-4" />
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin pb-4">
        {/* Scenarii — load a use case (configures the whole chatbot at once) */}
        <div className="px-2 pt-2">
          <SectionHeader title="Cas d’usage" collapsed={isCollapsed('usecases')} onToggle={() => toggleCollapsed('usecases')} className="px-2 pt-1 pb-1" />
          {!isCollapsed('usecases') && <ScenarioList />}
        </div>

        {/* Design tooling — the primitives */}
        <div className="mt-3 pt-3 border-t border-zinc-200 px-4">
          <div className="flex items-center justify-between mb-2">
            <div className="t-micro text-zinc-500 uppercase tracking-wide">Primitives</div>
            <ResetButton modifiedCount={modifiedCount} onReset={resetAllPrimitives} />
          </div>
          <HighlightToggle on={highlightMode} onToggle={toggleHighlightMode} />
        </div>

        {(['E', 'C', 'A'] as const).filter((g) => groups[g].length > 0).map((g) => (
          <div key={g} className="mt-3 pt-3 border-t border-zinc-200">
            <Section
              title={GROUP_LABELS[g]}
              items={groups[g]}
              openCode={openCode}
              onToggle={(code) => setOpenCode(openCode === code ? null : code)}
              collapsed={isCollapsed(g)}
              onToggleCollapsed={() => toggleCollapsed(g)}
            />
          </div>
        ))}
      </div>
    </aside>
  );
}

/* -------------------- Scenarii (use-case presets) -------------------- */
function ScenarioList() {
  const applyUseCase = useChatbot((s) => s.applyUseCase);
  const active = useChatbot((s) => s.activeUseCase);
  return (
    <div className="space-y-2">
      {USE_CASES_BY_FAMILY.map(({ family, cases }) => (
        <div key={family}>
          <div className="t-small-medium text-zinc-400 px-2 mb-0.5">{FAMILY_META[family].label}</div>
          {cases.map((uc) => {
            const on = active === uc.id;
            return (
              <button
                key={uc.id}
                onClick={() => applyUseCase(uc.id)}
                className={
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors ' +
                  (on ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-50 text-zinc-700')
                }
              >
                <span className={'t-small-semibold tabular-nums w-3.5 shrink-0 ' + (on ? 'text-white/50' : 'text-zinc-400')}>{uc.n}</span>
                <span className="t-base-regular truncate">{uc.title}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* -------------------- Highlight toggle (mode) -------------------- */
function HighlightToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      title="Hover sections to link them to the left panel."
      className={
        'w-full h-9 px-2.5 rounded-lg border flex items-center gap-2.5 transition-colors ' +
        (on
          ? 'bg-amber-50 border-amber-300 text-amber-900'
          : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400')
      }
    >
      <span className={'inline-grid place-items-center size-5 rounded ' + (on ? 'bg-amber-500 text-white' : 'bg-zinc-100 text-zinc-500')}>
        <Icon name="visibility" className="size-3" />
      </span>
      <span className="flex-1 text-left t-base-medium">Highlight primitives</span>
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
      title={disabled ? 'All primitives are at their defaults' : `Reset to defaults (${modifiedCount} modified)`}
      className={
        'inline-flex items-center gap-1.5 h-6 px-2 rounded t-small-regular transition-colors ' +
        (disabled
          ? 'text-zinc-300 cursor-not-allowed'
          : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100')
      }
    >
      <Icon name="refresh" className="size-3" />
      {disabled ? 'reset' : `reset · ${modifiedCount}`}
    </button>
  );
}

/* A collapsible section header: chevron + micro label. */
function SectionHeader({
  title, collapsed, onToggle, className,
}: {
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button onClick={onToggle} className={'w-full flex items-center gap-1.5 text-left hover:text-zinc-700 ' + (className ?? '')}>
      <Icon name="chevron-right" className={'size-3 text-zinc-400 shrink-0 transition-transform ' + (collapsed ? '' : 'rotate-90')} />
      <span className="t-micro text-zinc-500">{title}</span>
    </button>
  );
}

function Section({
  title, items, openCode, onToggle, collapsed, onToggleCollapsed,
}: {
  title: string;
  items: PrimitiveDef[];
  openCode: string | null;
  onToggle: (code: string) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  return (
    <div>
      <SectionHeader title={title} collapsed={collapsed} onToggle={onToggleCollapsed} className="px-4 pt-1 pb-1" />
      {!collapsed && (
        <ul>
          {items.map((p) => (
            <Row key={p.code} def={p} open={openCode === p.code} onToggle={() => onToggle(p.code)} />
          ))}
        </ul>
      )}
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
  const toggleContent = useChatbot((s) => s.togglePrimitiveContent);
  const highlightMode = useChatbot((s) => s.highlightMode);
  const hovered = useChatbot((s) => s.hoveredPrimitive);
  const setHovered = useChatbot((s) => s.setHoveredPrimitive);

  const isHighlighted = highlightMode && hovered === def.code;
  const hidden = !value.visible;
  const hasVariants = def.variants.length >= 2;
  // A row is worth expanding only if there's something to configure beyond on/off.
  const expandable = hasVariants || !!def.content;

  return (
    <li
      onMouseEnter={() => highlightMode && setHovered(def.code)}
      onMouseLeave={() => highlightMode && setHovered(null)}
      className={
        'border-b border-zinc-100 last:border-b-0 transition-colors ' +
        (isHighlighted ? 'bg-amber-100' : open ? 'bg-zinc-50' : 'hover:bg-zinc-50/60')
      }
    >
      {/* Header: visibility checkbox + name (+ expand chevron when configurable) */}
      <div className="flex items-center gap-2 px-4 py-1.5">
        <button
          type="button"
          role="checkbox"
          aria-checked={value.visible}
          title={value.visible ? 'Hide this primitive' : 'Show this primitive'}
          onClick={() => setVisible(def.code, !value.visible)}
          className="shrink-0 inline-flex items-center"
        >
          <input
            type="checkbox"
            checked={value.visible}
            readOnly
            tabIndex={-1}
            className="size-3.5 accent-zinc-900 cursor-pointer"
          />
        </button>

        {expandable ? (
          <button
            onClick={onToggle}
            className="flex-1 min-w-0 flex items-center gap-2 text-left"
          >
            <span className={'flex-1 min-w-0 t-base-medium truncate ' + (value.visible ? 'text-zinc-900' : 'text-zinc-400')}>
              {def.name}
            </span>
            <Icon
              name="chevron-right"
              className={'size-3 text-zinc-400 shrink-0 transition-transform ' + (open ? 'rotate-90' : '')}
            />
          </button>
        ) : (
          <span className={'flex-1 min-w-0 t-base-medium truncate ' + (value.visible ? 'text-zinc-900' : 'text-zinc-400')}>
            {def.name}
          </span>
        )}
      </div>

      {open && expandable && (
        // Config is meaningless while the primitive is hidden — dim + disable the whole
        // panel; the header checkbox stays live as the way back.
        <div
          aria-disabled={hidden}
          className={'pl-9 pr-4 pb-2 pt-1 transition-opacity ' + (hidden ? 'opacity-40 pointer-events-none select-none' : '')}
        >
          {/* State (content) — the product configuration; primary, clean. */}
          {def.content && (
            def.content.multiSelect ? (
              <CheckboxList
                label="state"
                options={def.content.variants}
                values={Array.isArray(value.content) ? value.content : def.content.defaultIds}
                onToggle={(id) => toggleContent(def.code, id)}
              />
            ) : def.content.toggleable ? (
              <ToggleableList
                label="state"
                options={def.content.variants}
                activeId={typeof value.content === 'string' ? value.content : def.content.defaultId}
                isVisible={value.visible}
                onToggle={(id) => {
                  const isActive = value.visible && value.content === id;
                  if (isActive) {
                    setVisible(def.code, false);
                  } else {
                    setContent(def.code, id);
                    setVisible(def.code, true);
                  }
                }}
              />
            ) : (
              <OptionList
                label="state"
                options={def.content.variants}
                value={typeof value.content === 'string' ? value.content : def.content.defaultId}
                onChange={(id) => setContent(def.code, id)}
              />
            )
          )}

          {/* Design variant — the designer's look-picker. Set apart in a dashed
              "design zone" so it doesn't read as product state. */}
          {hasVariants && (
            <div className={(def.content ? 'mt-2 ' : '') + 'rounded-md border border-dashed border-zinc-300 bg-zinc-50/60 px-2 py-1.5'}>
              <div className="mb-1 text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                Design variant
              </div>
              <OptionList
                options={def.variants}
                value={value.variant}
                onChange={(id) => setVariant(def.code, id)}
              />
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function OptionList({
  label, options, value, onChange,
}: {
  label?: string;
  options: Variant[];
  value: string | null;
  onChange: (id: string) => void;
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
            active={o.id === value}
            onClick={() => onChange(o.id)}
            label={o.name}
          />
        ))}
      </div>
    </div>
  );
}

function OptionItem({
  active, onClick, label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      role="radio"
      aria-checked={active}
      className="w-full flex items-center gap-2 py-1 px-1 -mx-1 rounded text-left hover:bg-zinc-100"
    >
      <input
        type="radio"
        checked={active}
        readOnly
        tabIndex={-1}
        className="size-3 accent-zinc-900 shrink-0 cursor-pointer"
      />
      <span className={'t-small-regular truncate ' + (active ? 'text-zinc-900' : 'text-zinc-600')}>
        {label}
      </span>
    </button>
  );
}

function ToggleableList({
  label, options, activeId, isVisible, onToggle,
}: {
  label?: string;
  options: Variant[];
  activeId: string;
  isVisible: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      {label && (
        <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-0.5">
          {label}
        </div>
      )}
      <div>
        {options.map((o) => {
          const active = isVisible && o.id === activeId;
          return (
            <button
              key={o.id}
              onClick={() => onToggle(o.id)}
              className="w-full flex items-center gap-2 py-1 px-1 -mx-1 rounded text-left hover:bg-zinc-100"
            >
              <span className={
                'size-3 rounded-sm border shrink-0 inline-flex items-center justify-center ' +
                (active ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300 bg-white')
              }>
                {active && (
                  <Icon name="check" className="size-2 text-white" />
                )}
              </span>
              <span className={'t-small-regular truncate ' + (active ? 'text-zinc-900' : 'text-zinc-600')}>
                {o.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CheckboxList({
  label, options, values, onToggle,
}: {
  label?: string;
  options: Variant[];
  values: string[];
  onToggle: (id: string) => void;
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
          <CheckboxItem
            key={o.id}
            checked={values.includes(o.id)}
            onClick={() => onToggle(o.id)}
            label={o.name}
          />
        ))}
      </div>
    </div>
  );
}

function CheckboxItem({ checked, onClick, label }: { checked: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      role="checkbox"
      aria-checked={checked}
      className="w-full flex items-center gap-2 py-1 px-1 -mx-1 rounded text-left hover:bg-zinc-100"
    >
      <input
        type="checkbox"
        checked={checked}
        readOnly
        tabIndex={-1}
        className="size-3 accent-zinc-900 shrink-0 cursor-pointer"
      />
      <span className={'t-small-regular truncate ' + (checked ? 'text-zinc-900' : 'text-zinc-600')}>
        {label}
      </span>
    </button>
  );
}
