import { useEffect, useRef } from 'react';
import { useChatbot, type Surface } from '../chatbot/store';
import { PRIMITIVES, type PrimitiveDef, type Variant } from '../dashboard/primitiveDefs';
import { USE_CASES } from '../chatbot/useCases';
import { Icon } from './ui';

export function CompactSettings({ onCollapse }: { onCollapse?: () => void }) {
  const resetAllPrimitives = useChatbot((s) => s.resetAllPrimitives);
  const designMode = useChatbot((s) => s.highlightMode);
  const toggleDesignMode = useChatbot((s) => s.toggleHighlightMode);
  const viewMode = useChatbot((s) => s.viewMode);
  const setViewMode = useChatbot((s) => s.setViewMode);
  // The inspected primitive lives in the store: clicking a primitive ON THE
  // CANVAS (design mode) opens the same accordion row as clicking its name.
  const inspected = useChatbot((s) => s.inspectedPrimitive);
  const setInspected = useChatbot((s) => s.setInspectedPrimitive);

  const surface = useChatbot((s) => s.surface);
  const groups: Record<'E' | 'C' | 'A' | 'D', PrimitiveDef[]> = { E: [], C: [], A: [], D: [] };
  for (const p of PRIMITIVES) groups[p.group].push(p);
  // Design mode lists the components of the CURRENT view — what you list is
  // what you see on the canvas. The D (Éditeur) group is appended only in the
  // doc surface, where its chrome actually renders.
  const designItems = [
    ...(viewMode === 'full' ? groups.A : [...groups.E, ...groups.C]),
    ...(surface === 'doc' ? groups.D : []),
  ].filter((p) => !p.chrome); // chrome (e.g. the "+" Context) isn't a configurable primitive

  return (
    <aside className="w-[340px] shrink-0 bg-white border-r border-zinc-200 flex flex-col min-h-0">
      <div className="flex items-center gap-1.5 px-2.5 py-2.5 border-b border-zinc-200">
        {onCollapse && (
          <button
            onClick={onCollapse}
            title="Hide panel"
            className="size-7 grid place-items-center rounded-md shrink-0 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Icon name="columns" className="size-4" />
          </button>
        )}
        {/* Clicking the wordmark resets everything to defaults — it's the "home" of the lab. */}
        <button
          onClick={resetAllPrimitives}
          title="Reset everything to defaults"
          className="flex-1 min-w-0 text-left t-large-semibold text-zinc-900 truncate hover:text-zinc-500 transition-colors"
        >
          Doctrine
        </button>
        {/* All the small lab settings live here, quiet: surface + design mode. */}
        <SurfaceIconGroup />
        <span className="h-4 w-px bg-zinc-200" />
        {/* Design mode — a real labeled SWITCH (Figma Dev-Mode style): on, the
            canvas becomes the navigation for components. */}
        <button
          onClick={toggleDesignMode}
          role="switch"
          aria-checked={designMode}
          title="Design mode — hover any component on the canvas to identify it"
          className={
            'h-7 pl-2 pr-1.5 inline-flex items-center gap-1.5 rounded-lg transition-colors shrink-0 t-small-medium ' +
            (designMode ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900')
          }
        >
          <Icon name="pen" className="size-3.5" />
          Design
          <span className={'relative inline-flex w-6 h-3.5 rounded-full transition-colors ' + (designMode ? 'bg-amber-500' : 'bg-zinc-300')}>
            <span className={'absolute top-0.5 size-2.5 rounded-full bg-white shadow transition-all ' + (designMode ? 'left-3' : 'left-0.5')} />
          </span>
        </button>
      </div>


      {/* ONE prominent control: which moment of the chatbot is on the canvas. */}
      <div className="shrink-0 px-3 py-3 border-b border-zinc-200">
        <div className="flex gap-1 p-1 rounded-xl bg-zinc-100">
          {([['empty', 'Composer'], ['full', 'Answer']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              className={
                'flex-1 h-8 rounded-lg t-base-medium transition-colors ' +
                (viewMode === id ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900')
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* The mode decides the panel: OFF = scenarios (product manager),
          ON = the current view's components + click-to-inspect on the canvas. */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-2 py-2">
        {designMode ? (
          <PrimitiveGroup
            items={designItems}
            openCode={inspected}
            onToggleRow={(code) => setInspected(inspected === code ? null : (code as typeof inspected))}
          />
        ) : (
          <ScenarioList />
        )}
      </div>
    </aside>
  );
}

/* COMPLETE, STATIC page order — every primitive (visible or not) has a fixed
   slot, top→bottom as it sits on the canvas. Because it's complete and static,
   toggling a primitive's visibility NEVER moves anything in the panel.
   Anything missing here falls to the end of its region. */
const ORDER: string[] = [
  // Composer
  'C8',                                  // Header
  'C9', 'C7', 'C5', 'C6', 'C2', 'C12',   // Composer bar
  'E3', 'E4', 'E6',                      // Below the composer
  'C14', 'C13',                          // Opened from the bar
  // Answer
  'A1',                                  // Before the answer
  'A2', 'A5', 'A9',                      // Answer body
  'A4', 'A7', 'A8',                      // After the answer
  'A0',                                  // Docked question
  // Éditeur
  'D2', 'D3', 'D4',
];
const rank = (code: string) => {
  const i = ORDER.indexOf(code);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
};

/* Each primitive belongs to a region of the page — a semantic label used only
   to draw the section headers. */
const REGION_OF: Record<string, string> = {
  C8: 'Header',
  C2: 'Composer bar', C6: 'Composer bar', C9: 'Composer bar', C5: 'Composer bar', C7: 'Composer bar', C12: 'Composer bar',
  E3: 'Below the composer', E4: 'Below the composer', E6: 'Below the composer',
  C14: 'Opened from the bar', C13: 'Opened from the bar',
  A1: 'Before the answer',
  A2: 'Answer body', A9: 'Answer body', A5: 'Answer body',
  A4: 'After the answer', A7: 'After the answer', A8: 'After the answer',
  A0: 'Docked question',
  D2: 'Éditeur', D3: 'Éditeur', D4: 'Éditeur',
};
const REGION_FALLBACK = [
  'Header', 'Composer bar', 'Below the composer', 'Opened from the bar',
  'Before the answer', 'Answer body', 'After the answer', 'Docked question', 'Éditeur', 'Other',
];

/* The panel is a MAP OF THE PAGE: rows grouped into the regions you see on the
   canvas, ordered by the fixed ORDER above. Stable across visibility toggles.
   Legacy sinks to "Archived". */
function PrimitiveGroup({
  items, openCode, onToggleRow,
}: {
  items: PrimitiveDef[];
  openCode: string | null;
  onToggleRow: (code: string) => void;
}) {
  const buckets = new Map<string, PrimitiveDef[]>();
  items.filter((p) => !p.legacy).forEach((p) => {
    const region = REGION_OF[p.code] ?? 'Other';
    (buckets.get(region) ?? buckets.set(region, []).get(region)!).push(p);
  });

  const regions = [...buckets.entries()]
    .map(([region, defs]) => {
      defs.sort((a, b) => rank(a.code) - rank(b.code));
      return { region, defs, min: Math.min(...defs.map((d) => rank(d.code))) };
    })
    .sort((a, b) => a.min - b.min || REGION_FALLBACK.indexOf(a.region) - REGION_FALLBACK.indexOf(b.region));

  const legacy = items.filter((p) => p.legacy);
  if (legacy.length) regions.push({ region: 'Archived', defs: legacy, min: Infinity });

  return (
    <div>
      {regions.map(({ region, defs }) => (
        <section key={region} className="mb-1.5">
          <div className="px-2 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{region}</div>
          <ul>
            {defs.map((p) => (
              <Row key={p.code} def={p} open={openCode === p.code} onToggle={() => onToggleRow(p.code)} />
            ))}
          </ul>
        </section>
      ))}
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
            {uc.surface === 'doc' && (
              <span className="ml-auto shrink-0 text-[10px] leading-none text-zinc-400 border border-zinc-200 rounded px-1 py-0.5">
                Éditeur
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* Surface — WHERE the chatbot lives. A classic view-switcher segmented:
   small wireframe glyph beside the label, standard control height. */
function SurfaceGlyph({ kind }: { kind: Surface }) {
  return (
    <svg viewBox="0 0 20 20" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      {kind === 'fullscreen' && (
        <>
          <rect x="2.5" y="3.5" width="15" height="13" rx="2" />
          <path d="M2.5 6.8h15" />
        </>
      )}
      {kind === 'doc' && (
        <>
          <rect x="2.5" y="3.5" width="15" height="13" rx="2" />
          <path d="M12.5 3.5v13" />
          <path d="M4.8 7h5M4.8 9.5h5M4.8 12h3.5" />
        </>
      )}
      {kind === 'mobile' && (
        <rect x="7" y="2.5" width="6" height="15" rx="2" />
      )}
    </svg>
  );
}

function SurfaceIconGroup() {
  const surface = useChatbot((s) => s.surface);
  const setSurface = useChatbot((s) => s.setSurface);
  const tabs: { id: Surface; label: string }[] = [
    { id: 'fullscreen', label: 'Full screen' },
    { id: 'doc', label: 'Éditeur' },
    { id: 'mobile', label: 'Mobile' },
  ];
  return (
    // Tiny toolbar in the header — a setting, not a headline. Glyph-only with
    // tooltips; the active one is just a shade darker.
    <div className="flex items-center gap-0.5 shrink-0">
      {tabs.map((t) => {
        const active = surface === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setSurface(t.id)}
            aria-pressed={active}
            title={t.label}
            className={
              'size-7 grid place-items-center rounded-md transition-colors ' +
              (active ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700')
            }
          >
            <SurfaceGlyph kind={t.id} />
          </button>
        );
      })}
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
  const setAxisVariant = useChatbot((s) => s.setPrimitiveAxisVariant);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  const setContent = useChatbot((s) => s.setPrimitiveContent);
  const toggleContent = useChatbot((s) => s.togglePrimitiveContent);
  const highlightMode = useChatbot((s) => s.highlightMode);
  const hovered = useChatbot((s) => s.hoveredPrimitive);
  const setHovered = useChatbot((s) => s.setHoveredPrimitive);

  const isHighlighted = highlightMode && hovered === def.code;
  const hidden = !value.visible;
  const hasVariants = def.variants.length >= 2;
  const axes = def.axes ?? [];
  // A row is worth expanding only if there's something to configure beyond on/off.
  const expandable = hasVariants || !!def.content || axes.length > 0;

  // Canvas click-to-inspect opens this row — make sure it's actually in view.
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (open) ref.current?.scrollIntoView({ block: 'nearest' });
  }, [open]);

  return (
    <li
      ref={ref}
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
          className={'pl-7 pr-2 pb-2 pt-1 space-y-2 transition-opacity ' + (hidden ? 'opacity-40 pointer-events-none select-none' : '')}
        >
          {/* Fixed reading order, plain words:
              Design (the look) → Options (what's enabled) → axes (e.g. Example)
              → Lab only (preview toggles that don't exist in the product). */}

          {/* Design — the designer's look-picker, in a dashed "design zone". */}
          {hasVariants && (
            <div className="">
              <div className="mb-1 text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                Design
              </div>
              <OptionList
                options={def.variants}
                value={value.variant}
                onChange={(id) => setVariant(def.code, id)}
              />
            </div>
          )}

          {/* Options — the product configuration. */}
          {def.content && (
            def.content.multiSelect ? (() => {
              const preview = def.content.previewIds ?? [];
              const values = Array.isArray(value.content) ? value.content : def.content.defaultIds;
              const stateOpts = def.content.variants.filter((v) => !preview.includes(v.id));
              return stateOpts.length > 0
                ? <CheckboxList label="options" options={stateOpts} values={values} onToggle={(id) => toggleContent(def.code, id)} />
                : null;
            })() : def.content.toggleable ? (
              <ToggleableList
                label="options"
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
                label="options"
                options={def.content.variants}
                value={typeof value.content === 'string' ? value.content : def.content.defaultId}
                onChange={(id) => setContent(def.code, id)}
              />
            )
          )}

          {axes.map((axis) => (
            <div key={axis.key} className="">
              <div className="mb-1 text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                {axis.label}
              </div>
              <OptionList
                options={axis.variants}
                value={value.axisVariants?.[axis.key] ?? axis.defaultVariantId}
                onChange={(id) => setAxisVariant(def.code, axis.key, id)}
              />
            </div>
          ))}

          {/* Lab only — preview toggles (e.g. keep a menu open to design it). */}
          {def.content?.multiSelect && (() => {
            const preview = def.content.previewIds ?? [];
            const values = Array.isArray(value.content) ? value.content : def.content.defaultIds;
            const previewOpts = def.content.variants.filter((v) => preview.includes(v.id));
            return previewOpts.length > 0
              ? <CheckboxList label="lab only" options={previewOpts} values={values} onToggle={(id) => toggleContent(def.code, id)} />
              : null;
          })()}
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
