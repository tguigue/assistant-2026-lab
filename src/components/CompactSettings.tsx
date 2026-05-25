import { useMemo } from 'react';
import { useChatbot } from '../chatbot/store';
import { PRIMITIVES, type PrimitiveDef, type Choice } from '../dashboard/primitiveDefs';
import { SCENARIO_IDS } from '../chatbot/types';
import { SCENARIOS } from '../chatbot/scenarios';

const GROUP_LABELS: Record<'H' | 'C' | 'A', string> = {
  H: 'Header',
  C: 'Composer',
  A: 'Response',
};

export function CompactSettings() {
  const scenario = useChatbot((s) => s.comp.scenario);
  const setScenario = useChatbot((s) => s.setScenario);
  const search = useChatbot((s) => s.search);
  const setSearch = useChatbot((s) => s.setSearch);
  const expandAll = useChatbot((s) => s.expandAll);
  const collapseAll = useChatbot((s) => s.collapseAll);
  const resetAllPrimitives = useChatbot((s) => s.resetAllPrimitives);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return PRIMITIVES;
    return PRIMITIVES.filter((p) => {
      const blob = (p.code + ' ' + p.name + ' ' + p.blurb).toLowerCase();
      return blob.includes(q);
    });
  }, [search]);

  const grouped = useMemo(() => {
    const groups: Record<'H' | 'C' | 'A', PrimitiveDef[]> = { H: [], C: [], A: [] };
    for (const p of filtered) groups[p.group].push(p);
    return groups;
  }, [filtered]);

  return (
    <aside className="cfg-rail">
      {/* Header */}
      <div className="cfg-rail-head">
        <div className="cfg-eyebrow">Sandbox · Configuration</div>
        <select
          className="cfg-input"
          value={scenario}
          onChange={(e) => setScenario(e.target.value as typeof scenario)}
        >
          {SCENARIO_IDS.map((id) => (
            <option key={id} value={id}>
              {SCENARIOS[id].code} · {SCENARIOS[id].title}
            </option>
          ))}
        </select>
        <input
          className="cfg-input"
          placeholder="Filtrer (code, nom, mot-clé)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-1">
          <button onClick={expandAll}    className="cfg-rail-action">expand all</button>
          <button onClick={collapseAll}  className="cfg-rail-action">collapse</button>
          <button onClick={resetAllPrimitives} className="cfg-rail-action">reset</button>
        </div>
      </div>

      {/* Groups */}
      <div className="cfg-rail-body">
        {(['H', 'C', 'A'] as const).map((g) => {
          const items = grouped[g];
          if (items.length === 0) return null;
          return (
            <div key={g}>
              <div className="cfg-group-header">
                <span>{GROUP_LABELS[g]}</span>
                <span className="cfg-group-count">{items.length}</span>
              </div>
              {items.map((p) => <PrimitiveRow key={p.code} def={p} />)}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function PrimitiveRow({ def }: { def: PrimitiveDef }) {
  const sel = useChatbot((s) => s.primitives[def.code]);
  const expanded = useChatbot((s) => s.expanded[def.code]);
  const toggle = useChatbot((s) => s.toggleExpanded);
  const setOption = useChatbot((s) => s.setPrimitiveOption);
  const setDim = useChatbot((s) => s.setPrimitiveDim);

  const opt = def.options.find((o) => o.id === sel.optionId) ?? def.options[0];
  const isCustom = sel.optionId !== def.defaultOptionId;

  return (
    <div className={'cfg-row ' + (expanded ? 'is-open' : '')}>
      <button onClick={() => toggle(def.code)} className="cfg-row-head">
        <span className="cfg-row-code">{def.code}</span>
        <span className="cfg-row-name">{def.name}</span>
        <span className={'cfg-row-val ' + (isCustom ? 'is-custom' : '')}>
          {opt.id === 'current' ? 'current' : `opt ${opt.id}`}
        </span>
        <span className={'cfg-row-caret ' + (expanded ? 'is-open' : '')}>›</span>
      </button>

      {expanded && (
        <div className="cfg-row-body">
          <p className="cfg-blurb">{def.blurb}</p>

          {/* Options radio */}
          <div className="cfg-options">
            {def.options.map((o) => {
              const active = o.id === sel.optionId;
              return (
                <button
                  key={o.id}
                  onClick={() => setOption(def.code, o.id)}
                  className={'cfg-opt ' + (active ? 'is-active' : '')}
                >
                  <span className="cfg-opt-radio">
                    <span className="cfg-opt-dot" />
                  </span>
                  <span className="cfg-opt-label">
                    {o.id === 'current' ? 'Current' : `Option ${o.id}`}
                    {o.id !== 'current' && <span className="cfg-opt-name"> — {o.name}</span>}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dimension dropdowns — only for the active option */}
          {(opt.variants || opt.states || opt.designs || opt.locations) && (
            <div className="cfg-dims">
              <DimField label="Variant"  choices={opt.variants}  value={sel.variantId}  onChange={(v) => setDim(def.code, 'variantId',  v)} />
              <DimField label="State"    choices={opt.states}    value={sel.stateId}    onChange={(v) => setDim(def.code, 'stateId',    v)} />
              <DimField label="Design"   choices={opt.designs}   value={sel.designId}   onChange={(v) => setDim(def.code, 'designId',   v)} />
              <DimField label="Location" choices={opt.locations} value={sel.locationId} onChange={(v) => setDim(def.code, 'locationId', v)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DimField({
  label, choices, value, onChange,
}: {
  label: string;
  choices?: Choice[];
  value?: string;
  onChange: (v: string) => void;
}) {
  if (!choices || choices.length === 0) return null;
  return (
    <div className="cfg-dim">
      <span className="cfg-dim-label">{label}</span>
      <select
        className="cfg-dim-select"
        value={value ?? choices[0].id}
        onChange={(e) => onChange(e.target.value)}
      >
        {choices.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  );
}

