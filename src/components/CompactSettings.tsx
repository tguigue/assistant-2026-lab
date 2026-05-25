import { useChatbot } from '../chatbot/store';
import { PRIMITIVES, type PrimitiveDef } from '../dashboard/primitiveDefs';
import { SCENARIO_IDS } from '../chatbot/types';
import { SCENARIOS } from '../chatbot/scenarios';

const GROUP_LABELS: Record<'E' | 'C' | 'A', string> = {
  E: 'Empty state',
  C: 'Composer',
  A: 'Response',
};

/**
 * Minimal settings rail.
 * One row per primitive = code + name + variant dropdown.
 * No expand/collapse, no nested dimensions. Just the design choice.
 */
export function CompactSettings() {
  const scenario = useChatbot((s) => s.comp.scenario);
  const setScenario = useChatbot((s) => s.setScenario);
  const resetAllPrimitives = useChatbot((s) => s.resetAllPrimitives);

  const groups: Record<'E' | 'C' | 'A', PrimitiveDef[]> = { E: [], C: [], A: [] };
  for (const p of PRIMITIVES) groups[p.group].push(p);

  return (
    <aside className="w-[300px] shrink-0 bg-white border-r border-zinc-200 flex flex-col min-h-0">
      <div className="px-4 py-3 border-b border-zinc-200 flex flex-col gap-2">
        <div className="t-micro text-zinc-500">Configuration</div>
        <select
          value={scenario}
          onChange={(e) => setScenario(e.target.value as typeof scenario)}
          className="h-8 px-2.5 border border-zinc-200 rounded-md t-small-medium text-zinc-900 outline-none focus:border-zinc-900 hover:border-zinc-400"
        >
          {SCENARIO_IDS.map((id) => (
            <option key={id} value={id}>
              {SCENARIOS[id].code} · {SCENARIOS[id].title}
            </option>
          ))}
        </select>
        <button
          onClick={resetAllPrimitives}
          className="h-7 t-small-medium text-zinc-600 border border-zinc-200 rounded-md hover:border-zinc-400 hover:text-zinc-900"
        >
          reset all
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        {(['E', 'C', 'A'] as const).map((g) => (
          <Section key={g} title={GROUP_LABELS[g]} items={groups[g]} />
        ))}
      </div>
    </aside>
  );
}

function Section({ title, items }: { title: string; items: PrimitiveDef[] }) {
  return (
    <div>
      <div className="px-4 pt-3 pb-1 t-micro text-zinc-500">{title}</div>
      <ul>
        {items.map((p) => (
          <Row key={p.code} def={p} />
        ))}
      </ul>
    </div>
  );
}

function Row({ def }: { def: PrimitiveDef }) {
  const variantId = useChatbot((s) => s.primitives[def.code]);
  const setVariant = useChatbot((s) => s.setPrimitiveVariant);
  const isCustom = variantId !== def.defaultVariantId;

  return (
    <li
      title={def.blurb}
      className="px-4 py-1.5 hover:bg-zinc-50 flex items-center gap-2"
    >
      <span className={'t-mono t-small-medium tabular-nums w-6 shrink-0 ' + (isCustom ? 'text-amber-700' : 'text-zinc-400')}>
        {def.code}
      </span>
      <span className="t-small-medium text-zinc-900 flex-1 min-w-0 truncate">{def.name}</span>
      <select
        value={variantId}
        onChange={(e) => setVariant(def.code, e.target.value)}
        className="h-7 max-w-[140px] px-2 pr-6 border border-zinc-200 rounded text-zinc-700 t-small-regular bg-white outline-none focus:border-zinc-900 hover:border-zinc-400 appearance-none truncate"
        style={{
          backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 6px center',
        }}
      >
        {def.variants.map((v) => (
          <option key={v.id} value={v.id}>{v.name}</option>
        ))}
      </select>
    </li>
  );
}
