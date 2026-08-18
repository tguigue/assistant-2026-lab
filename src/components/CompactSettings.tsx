import { useEffect, useRef, type ReactNode } from 'react';
import { useChatbot, VIEW_MODES, SURFACES, type Surface, type ViewMode } from '../chatbot/store';
import { PRIMITIVES, type PrimitiveCode, type PrimitiveDef, type Variant } from '../dashboard/primitiveDefs';
import { Icon } from './ui';

/* The design panel reads like a React component API — settings-only, so the
   primitives feel like a real dev-ready library while the chatbot canvas stays
   clean. Two levels of monospace token:
     SECTION_TOKEN — the concept heading: `props` (caller config) vs `state`
                     (runtime state the component owns).
     API_TOKEN     — a field name inside a section: `variant`, `source`, `role`,
                     `status`, `@lab`. */
const SECTION_TOKEN = 'font-mono lowercase text-[11px] font-semibold tracking-tight text-zinc-500';
const API_TOKEN = 'font-mono lowercase text-[10px] tracking-tight text-zinc-400';

/* A named field inside a section: its API token above the control. */
/* "Specced, but not drawn yet." Keeps a declared-early primitive honest: the
   checkbox stays live so you can toggle it on and SEE the empty slot, instead of
   wondering whether the lab is broken. */
function TodoBadge() {
  return <span className={API_TOKEN + ' shrink-0 px-1 rounded bg-zinc-100'}>todo</span>;
}

function FieldGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className={'mb-1 ' + API_TOKEN}>{label}</div>
      {children}
    </div>
  );
}

export function CompactSettings({ onCollapse, className }: { onCollapse?: () => void; className?: string }) {
  const resetAllPrimitives = useChatbot((s) => s.resetAllPrimitives);
  // Inspect mode = the canvas overlays (dashed outlines + hover-to-identify +
  // click-to-inspect). The whole app is the design tool now, so this isn't a
  // "design vs not" mode — it only toggles those overlays.
  const inspectOn = useChatbot((s) => s.highlightMode);
  const toggleInspect = useChatbot((s) => s.toggleHighlightMode);
  const viewMode = useChatbot((s) => s.viewMode);
  const setViewMode = useChatbot((s) => s.setViewMode);
  // The inspected primitive lives in the store: clicking a primitive ON THE
  // CANVAS opens the same accordion row as clicking its name.
  const inspected = useChatbot((s) => s.inspectedPrimitive);
  const setInspected = useChatbot((s) => s.setInspectedPrimitive);

  const surface = useChatbot((s) => s.surface);
  // The panel lists the components of the CURRENT moment and surface — what you
  // list is what you see on the canvas. BOTH gates are per-primitive data
  // (`views` / `surfaces`, omitted = everywhere), so a primitive can honestly be
  // listed in more than one moment: C8's header changes shape between them, and
  // the modals overlay both. chrome (the "+" Context) isn't configurable at all.
  const designItems = PRIMITIVES.filter(
    (p) =>
      !p.chrome &&
      (p.views ?? VIEW_MODES).includes(viewMode) &&
      (p.surfaces ?? SURFACES).includes(surface),
  );

  return (
    <aside className={'w-[340px] shrink-0 bg-white border-r border-zinc-200 flex flex-col min-h-0 ' + (className ?? '')}>
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
        {/* Small lab settings live here, quiet: surface + inspect. Paid-tool
            entitlement moved into the A4 "Suggested action" primitive. */}
        <SurfaceIconGroup />
        <span className="h-4 w-px bg-zinc-200" />
        {/* Inspect — a labeled SWITCH: on, the canvas outlines every component
            and hovering/clicking identifies it. Off = clean preview. */}
        <button
          onClick={toggleInspect}
          role="switch"
          aria-checked={inspectOn}
          title="Inspect — outline components on the canvas; hover to identify, click to open its settings"
          className={
            'h-7 pl-2 pr-1.5 inline-flex items-center gap-1.5 rounded-lg transition-colors shrink-0 t-small-medium ' +
            (inspectOn ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900')
          }
        >
          <Icon name="visibility" className="size-3.5" />
          Inspect
          <span className={'relative inline-flex w-6 h-3.5 rounded-full transition-colors ' + (inspectOn ? 'bg-amber-500' : 'bg-zinc-300')}>
            <span className={'absolute top-0.5 size-2.5 rounded-full bg-white shadow transition-all ' + (inspectOn ? 'left-3' : 'left-0.5')} />
          </span>
        </button>
      </div>


      {/* ONE prominent control: which moment of the chatbot is on the canvas. */}
      <div className="shrink-0 px-3 py-3 border-b border-zinc-200">
        <div className="flex gap-1 p-1 rounded-xl bg-zinc-100">
          {VIEW_MODES.map((id) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              className={
                'flex-1 h-8 rounded-lg t-base-medium transition-colors ' +
                (viewMode === id ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900')
              }
            >
              {VIEW_LABELS[id]}
            </button>
          ))}
        </div>
      </div>

      {/* The panel always lists the current view's components. Design mode only
          toggles the canvas overlays (hover-to-identify + click-to-inspect). */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-2 py-2">
        <PrimitiveGroup
          items={designItems}
          openCode={inspected}
          onToggleRow={(code) => setInspected(inspected === code ? null : (code as typeof inspected))}
        />
      </div>
    </aside>
  );
}

/* The moment toggle's copy. A Record (not an inline array) so adding a ViewMode
   without labelling it is a compile error rather than a blank tab. */
const VIEW_LABELS: Record<ViewMode, string> = { empty: 'Composer', full: 'Answer' };

/* THE MAP OF THE PAGE — one table, top→bottom as it sits on the canvas.
   Typed `Record<PrimitiveCode, Region>`, so `tsc -b` FAILS if a primitive is
   added to the registry and not placed here, and fails again on a typo'd code.
   That's what makes a phantom row (a live checkbox that draws nothing) a build
   error instead of a silent shrug.
   Object key order is insertion order for non-numeric string keys — every code
   starts with a letter — so this literal is ALSO the ordering. One table, not
   two that can drift. */
type Region =
  | 'Header' | 'Composer bar' | 'Transparency' | 'Below the composer'
  | 'Modals' | 'Governance' | 'Promotion'
  | 'Before the answer' | 'Answer body' | 'After the answer' | 'Docked' | 'Éditeur';

const PLACEMENT: Record<PrimitiveCode, Region> = {
  // ── Composer moment ──
  C8: 'Header',
  C9: 'Composer bar', C7: 'Composer bar', C5: 'Composer bar',
  C6: 'Composer bar', C2: 'Composer bar', C18: 'Composer bar',
  C17: 'Composer bar', C12: 'Composer bar',
  // Arrivals come first when you come back — they are why you'd look.
  E7: 'Below the composer',
  E3: 'Below the composer', E4: 'Below the composer', E6: 'Below the composer',
  C14: 'Modals', C15: 'Modals', C13: 'Modals',
  // E5 renders in MANY slots (banner above, placeholder inside, badges on
  // controls, overlays over the canvas) — its own section, not a fake spot.
  E5: 'Promotion',
  // Two hosts (composer footer AND beside the trace), so like E5 it gets its own
  // section rather than a fake single spot on the page map.
  A13: 'Transparency',
  // ── Answer moment ──
  A1: 'Before the answer',
  // A long job is extended reasoning, so it sits with the trace, not on its own.
  A12: 'Before the answer',
  A4: 'Before the answer',
  // D4 renders in the conversation body on BOTH surfaces, so it belongs here
  // and not under 'Éditeur' where it was listed but never drawn.
  D4: 'Before the answer',
  A2: 'Answer body', A9: 'Answer body',
  A7: 'After the answer', A10: 'After the answer', A8: 'After the answer',
  A0: 'Docked',
  // ── Éditeur surface ──
  D2: 'Éditeur', D3: 'Éditeur',
};

/* Ranks are unique (one entry per code), so region ordering is total — no
   tie-break list needed. */
const CODE_ORDER = Object.keys(PLACEMENT) as PrimitiveCode[];
const rank = (code: PrimitiveCode) => CODE_ORDER.indexOf(code);

/* The panel is a MAP OF THE PAGE: rows grouped into the regions you see on the
   canvas, ordered by PLACEMENT above. Stable across visibility toggles — the
   table is complete and static, so toggling a primitive never moves a row. */
function PrimitiveGroup({
  items, openCode, onToggleRow,
}: {
  items: PrimitiveDef[];
  openCode: string | null;
  onToggleRow: (code: string) => void;
}) {
  const buckets = new Map<Region, PrimitiveDef[]>();
  items.forEach((p) => {
    const region = PLACEMENT[p.code];
    (buckets.get(region) ?? buckets.set(region, []).get(region)!).push(p);
  });

  const regions = [...buckets.entries()]
    .map(([region, defs]) => {
      defs.sort((a, b) => rank(a.code) - rank(b.code));
      return { region, defs, min: Math.min(...defs.map((d) => rank(d.code))) };
    })
    .sort((a, b) => a.min - b.min);

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
    </svg>
  );
}

function SurfaceIconGroup() {
  const surface = useChatbot((s) => s.surface);
  const setSurface = useChatbot((s) => s.setSurface);
  const tabs: { id: Surface; label: string }[] = [
    { id: 'fullscreen', label: 'Full screen' },
    { id: 'doc', label: 'Éditeur' },
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
  // `blurb` is required, so EVERY row opens. The chevron's meaning widens from
  // "configure this" to "explain or configure this" — a row that won't even tell
  // you what the thing is was never worth having.
  const expandable = hasVariants || !!def.content || axes.length > 0 || !!def.blurb;

  // Split every knob into React's two buckets: `props` (caller config) and
  // `state` (runtime, component-owned). Axes carry `kind`; content items are
  // props unless flagged as stateIds (real runtime) or previewIds (@lab).
  const content = def.content;
  const propAxes = axes.filter((a) => (a.kind ?? 'prop') === 'prop');
  const stateAxes = axes.filter((a) => a.kind === 'state');
  const contentValues =
    content?.multiSelect && Array.isArray(value.content) ? value.content
    : content?.multiSelect ? content.defaultIds
    : [];
  const singleContent = content && !content.multiSelect ? content : null;
  const propFlags = content?.multiSelect
    ? content.variants.filter((v) => !(content.previewIds ?? []).includes(v.id) && !(content.stateIds ?? []).includes(v.id))
    : [];
  const stateFlags = content?.multiSelect
    ? content.variants.filter((v) => (content.stateIds ?? []).includes(v.id))
    : [];
  const labFlags = content?.multiSelect
    ? content.variants.filter((v) => (content.previewIds ?? []).includes(v.id))
    : [];
  const hasProps = hasVariants || !!singleContent || propAxes.length > 0 || propFlags.length > 0;
  const hasState = stateAxes.length > 0 || stateFlags.length > 0 || labFlags.length > 0;

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
        {def.todo && <TodoBadge />}
      </div>

      {open && expandable && (
        <div className="pl-7 pr-2 pb-2 pt-1">
          {/* The spec, where the decision gets made. Deliberately OUTSIDE the
              dimming below: you read what a primitive IS precisely when it's
              switched off and you're deciding whether to switch it on. */}
          {def.blurb && (
            <p className="mb-2 t-small-regular text-zinc-500 leading-snug">{def.blurb}</p>
          )}
          {/* Config is meaningless while the primitive is hidden — dim + disable it;
              the header checkbox stays live as the way back. */}
          <div
            aria-disabled={hidden}
            className={'transition-opacity ' + (hidden ? 'opacity-40 pointer-events-none select-none' : '')}
          >
          {/* Grouped like a component API: `props` (what the caller configures)
              then `state` (runtime state the component owns). Each field shows
              its own API token (variant / source / status / @lab …). */}

          {/* props — caller-facing config: variant, enum props, boolean flags. */}
          {hasProps && (
            <section className="space-y-2">
              <div className={SECTION_TOKEN}>props</div>

              {hasVariants && (
                <FieldGroup label="variant">
                  <OptionList
                    options={def.variants}
                    value={value.variant}
                    onChange={(id) => setVariant(def.code, id)}
                  />
                </FieldGroup>
              )}

              {singleContent && (
                <FieldGroup label="variant">
                  <OptionList
                    options={singleContent.variants}
                    value={typeof value.content === 'string' ? value.content : singleContent.defaultId}
                    onChange={(id) => setContent(def.code, id)}
                  />
                </FieldGroup>
              )}

              {propAxes.map((axis) => (
                <FieldGroup key={axis.key} label={axis.label}>
                  <OptionList
                    options={axis.variants}
                    value={value.axisVariants?.[axis.key] ?? axis.defaultVariantId}
                    onChange={(id) => setAxisVariant(def.code, axis.key, id)}
                  />
                </FieldGroup>
              ))}

              {/* Boolean props are self-naming (each row IS a prop) — no sub-label. */}
              {propFlags.length > 0 && (
                <CheckboxList options={propFlags} values={contentValues} onToggle={(id) => toggleContent(def.code, id)} />
              )}
            </section>
          )}

          {/* state — runtime state the component owns; @lab = a state forced for preview. */}
          {hasState && (
            <section className={'space-y-2 ' + (hasProps ? 'mt-2 pt-2 border-t border-zinc-100' : '')}>
              <div className={SECTION_TOKEN}>state</div>

              {stateAxes.map((axis) => (
                <FieldGroup key={axis.key} label={axis.label}>
                  <OptionList
                    options={axis.variants}
                    value={value.axisVariants?.[axis.key] ?? axis.defaultVariantId}
                    onChange={(id) => setAxisVariant(def.code, axis.key, id)}
                  />
                </FieldGroup>
              ))}

              {stateFlags.length > 0 && (
                <CheckboxList options={stateFlags} values={contentValues} onToggle={(id) => toggleContent(def.code, id)} />
              )}

              {labFlags.length > 0 && (
                <FieldGroup label="@lab">
                  <CheckboxList options={labFlags} values={contentValues} onToggle={(id) => toggleContent(def.code, id)} />
                </FieldGroup>
              )}
            </section>
          )}
          </div>
        </div>
      )}
    </li>
  );
}

function OptionList({
  options, value, onChange,
}: {
  options: Variant[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  return (
    <div>
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

function CheckboxList({
  options, values, onToggle,
}: {
  options: Variant[];
  values: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div>
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
