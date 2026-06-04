import { useState } from 'react';
import { useChatbot, type ViewMode } from '../chatbot/store';
import { PRIMITIVES, type PrimitiveDef, type Variant } from '../dashboard/primitiveDefs';
import { USE_CASES } from '../chatbot/useCases';
import { Icon } from './ui';

export function CompactSettings({ onCollapse }: { onCollapse?: () => void }) {
  const resetAllPrimitives = useChatbot((s) => s.resetAllPrimitives);
  const highlightMode = useChatbot((s) => s.highlightMode);
  const toggleHighlightMode = useChatbot((s) => s.toggleHighlightMode);
  const primitives = useChatbot((s) => s.primitives);
  // Accordion: only one primitive row open at a time.
  const [openCode, setOpenCode] = useState<string | null>(null);
  // Collapsible top-level sections. Use cases open; the Composer/Answer
  // primitive groups start folded so the panel opens tidy with all three
  // section titles in view — expand a group to edit it.
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(['composer', 'answer']));
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
      <div className="flex items-center gap-2 px-2.5 py-2.5 border-b border-zinc-200">
        {onCollapse && (
          <button
            onClick={onCollapse}
            title="Hide panel"
            className="size-7 grid place-items-center rounded-md shrink-0 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Icon name="columns" className="size-4" />
          </button>
        )}
        <div className="flex-1 t-large-semibold text-zinc-900 truncate">Assistant 2026</div>
      </div>

      {/* Preview — the primary view control: which canvas state to show. */}
      <div className="shrink-0 px-3 py-2.5 border-b border-zinc-200">
        <ViewTabs />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-2 py-2">
        {/* Use cases — load a preset (configures the whole chatbot at once) */}
        <SectionHeader title="Use cases" count={USE_CASES.length} collapsed={isCollapsed('usecases')} onToggle={() => toggleCollapsed('usecases')} />
        {!isCollapsed('usecases') && <ScenarioList />}

        {/* Composer primitives */}
        <PrimitiveSection
          title="Composer"
          items={[...groups.E, ...groups.C]}
          collapsed={isCollapsed('composer')}
          onToggleSection={() => toggleCollapsed('composer')}
          openCode={openCode}
          onToggleRow={(code) => setOpenCode(openCode === code ? null : code)}
        />

        {/* Answer primitives */}
        <PrimitiveSection
          title="Answer"
          items={groups.A}
          collapsed={isCollapsed('answer')}
          onToggleSection={() => toggleCollapsed('answer')}
          openCode={openCode}
          onToggleRow={(code) => setOpenCode(openCode === code ? null : code)}
        />
      </div>

      {/* Footer — minor tools, kept small and out of the way. */}
      <div className="shrink-0 border-t border-zinc-200 px-2 py-1">
        <HighlightRow on={highlightMode} onToggle={toggleHighlightMode} />
        {modifiedCount > 0 && <ResetRow count={modifiedCount} onReset={resetAllPrimitives} />}
      </div>
    </aside>
  );
}

/* A primitive group as a prominent top-level collapsible section. */
function PrimitiveSection({
  title, items, collapsed, onToggleSection, openCode, onToggleRow,
}: {
  title: string;
  items: PrimitiveDef[];
  collapsed: boolean;
  onToggleSection: () => void;
  openCode: string | null;
  onToggleRow: (code: string) => void;
}) {
  return (
    <div className="mt-2 pt-2 border-t border-zinc-200">
      <SectionHeader title={title} count={items.length} collapsed={collapsed} onToggle={onToggleSection} />
      {!collapsed && (
        <ul>
          {items.map((p) => (
            <Row key={p.code} def={p} open={openCode === p.code} onToggle={() => onToggleRow(p.code)} />
          ))}
        </ul>
      )}
    </div>
  );
}

/* -------------------- Scenarii (use-case presets) -------------------- */
function ScenarioList() {
  const applyUseCase = useChatbot((s) => s.applyUseCase);
  const active = useChatbot((s) => s.activeUseCase);
  return (
    <div className="pt-0.5">
      {USE_CASES.map((uc) => {
        const on = active === uc.id;
        return (
          <button
            key={uc.id}
            onClick={() => applyUseCase(uc.id)}
            className={
              'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left transition-colors ' +
              (on ? 'bg-zinc-100' : 'hover:bg-zinc-50/60')
            }
          >
            <span className={'t-small-semibold tabular-nums w-3.5 shrink-0 text-center ' + (on ? 'text-zinc-900' : 'text-zinc-400')}>{uc.n}</span>
            <span className={'t-base-regular truncate ' + (on ? 'text-zinc-900' : 'text-zinc-700')}>{uc.title}</span>
          </button>
        );
      })}
    </div>
  );
}

/* Edit-scoped tools — quiet, identical "tool row" anatomy: a muted leading
   icon + regular label + a trailing control. Amber appears only as the active
   accent on the highlight switch, so the tools never out-shout the content. */
const TOOL_ROW = 'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-zinc-50/60 text-left transition-colors';
// Footer rows — smaller/quieter than the primary Show-answer control above.
const FOOT_ROW = 'w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-zinc-50/60 text-left transition-colors';

/* Preview state (primary): which canvas state to show — Composer (empty) or
   Answer. A full-width segmented control at the top of the panel. */
function ViewTabs() {
  const mode = useChatbot((s) => s.viewMode);
  const setMode = useChatbot((s) => s.setViewMode);
  const tabs: { id: ViewMode; label: string }[] = [
    { id: 'empty', label: 'Composer' },
    { id: 'full', label: 'Answer' },
  ];
  return (
    <div className="flex gap-0.5 p-0.5 rounded-lg bg-zinc-100">
      {tabs.map((t) => {
        const active = mode === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setMode(t.id)}
            className={
              'flex-1 h-7 rounded-md t-base-medium transition-colors ' +
              (active ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900')
            }
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function HighlightRow({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} role="switch" aria-checked={on} title="Highlight each primitive on the canvas (hover to link)" className={FOOT_ROW}>
      <span className="inline-grid place-items-center size-3.5 shrink-0 text-zinc-400">
        <Icon name="visibility" className="size-3" />
      </span>
      <span className="flex-1 t-small-regular text-zinc-500 truncate">Highlight primitives</span>
      <span className={'relative inline-flex w-6 h-3.5 rounded-full transition-colors shrink-0 ' + (on ? 'bg-amber-500' : 'bg-zinc-200')}>
        <span className={'absolute top-0.5 size-2.5 rounded-full bg-white shadow transition-all ' + (on ? 'left-3' : 'left-0.5')} />
      </span>
    </button>
  );
}

function ResetRow({ count, onReset }: { count: number; onReset: () => void }) {
  return (
    <button onClick={onReset} title={`Reset ${count} modified primitive${count > 1 ? 's' : ''} to defaults`} className={FOOT_ROW}>
      <span className="inline-grid place-items-center size-3.5 shrink-0 text-zinc-400">
        <Icon name="refresh" className="size-3" />
      </span>
      <span className="flex-1 t-small-regular text-zinc-500 truncate">Reset changes</span>
    </button>
  );
}

/* A collapsible section title — a full disclosure row: clear chevron,
   readable label, and a muted item count. */
function SectionHeader({
  title, count, collapsed, onToggle,
}: {
  title: string;
  count?: number;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full group flex items-center gap-2 h-8 px-2 rounded-md hover:bg-zinc-100/70 transition-colors text-left"
    >
      <Icon
        name="chevron-right"
        className={'size-3.5 text-zinc-400 group-hover:text-zinc-600 shrink-0 transition-transform duration-150 ' + (collapsed ? '' : 'rotate-90')}
      />
      <span className="t-base-semibold text-zinc-900">{title}</span>
      {count != null && <span className="t-small-regular text-zinc-400 tabular-nums">{count}</span>}
    </button>
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
        'rounded-md transition-colors ' +
        (isHighlighted ? 'bg-amber-100' : open ? 'bg-zinc-50' : 'hover:bg-zinc-50/60')
      }
    >
      {/* Header: visibility checkbox + name (+ expand chevron when configurable) */}
      <div className="flex items-center gap-2.5 px-2 py-1.5">
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
            <span className={'flex-1 min-w-0 t-base-regular truncate ' + (value.visible ? 'text-zinc-900' : 'text-zinc-400')}>
              {def.name}
            </span>
            <Icon
              name="chevron-right"
              className={'size-3 text-zinc-400 shrink-0 transition-transform ' + (open ? 'rotate-90' : '')}
            />
          </button>
        ) : (
          <span className={'flex-1 min-w-0 t-base-regular truncate ' + (value.visible ? 'text-zinc-900' : 'text-zinc-400')}>
            {def.name}
          </span>
        )}
      </div>

      {open && expandable && (
        // Config is meaningless while the primitive is hidden — dim + disable the whole
        // panel; the header checkbox stays live as the way back.
        <div
          aria-disabled={hidden}
          className={'pl-7 pr-2 pb-2 pt-1 transition-opacity ' + (hidden ? 'opacity-40 pointer-events-none select-none' : '')}
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
