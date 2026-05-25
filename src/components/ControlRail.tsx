import { useState } from 'react';
import { useLab } from '../lab/store';
import { PRIMITIVES } from '../lab/primitiveDefs';
import { SCENARIO_IDS, ZONE_LABELS, type ScenarioId, type ZoneId } from '../lab/types';
import { SCENARIOS } from '../lab/scenarios';
import { PrimitiveRow } from './PrimitiveRow';

export function ControlRail() {
  const scenario = useLab((s) => s.comp.scenario);
  const setScenario = useLab((s) => s.setScenario);
  const runtime = useLab((s) => s.comp.runtime);
  const toggleRuntime = useLab((s) => s.toggleRuntime);
  const resetAll = useLab((s) => s.resetAll);
  const setAllToCurrent = useLab((s) => s.setAllToCurrent);

  const zones = (Object.keys(ZONE_LABELS) as ZoneId[]);

  return (
    <aside className="w-[320px] shrink-0 bg-white border-r border-zinc-200 overflow-y-auto scrollbar-thin flex flex-col min-h-0">
      <div className="px-3 py-3 border-b border-zinc-200 sticky top-0 bg-white z-10">
        <div className="t-micro text-zinc-500 mb-1.5">Sandbox · Scenario</div>
        <select
          value={scenario}
          onChange={(e) => setScenario(e.target.value as ScenarioId)}
          className="w-full h-8 px-2 t-small-medium text-zinc-900 border border-zinc-200 rounded-md bg-white outline-none focus:border-zinc-900 hover:border-zinc-400"
        >
          {SCENARIO_IDS.map((id) => (
            <option key={id} value={id}>
              {SCENARIOS[id].code} · {SCENARIOS[id].title}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1.5 mt-2">
          <button
            onClick={resetAll}
            className="flex-1 px-2 py-1 t-small-medium text-zinc-600 border border-zinc-200 rounded hover:border-zinc-400 hover:text-zinc-900"
            title="Reset to recommended defaults"
          >
            reset
          </button>
          <button
            onClick={setAllToCurrent}
            className="flex-1 px-2 py-1 t-small-medium text-zinc-600 border border-zinc-200 rounded hover:border-zinc-400 hover:text-zinc-900"
            title="Set all to Current (real product)"
          >
            all current
          </button>
        </div>
      </div>

      <nav className="flex-1">
        {zones.map((zone) => {
          const items = PRIMITIVES.filter((p) => p.zone === zone);
          return <ZoneSection key={zone} zone={zone} items={items} />;
        })}

        <div className="px-3 py-2 border-y border-zinc-200">
          <div className="t-micro text-zinc-500">Runtime</div>
        </div>
        <div className="px-3 py-2 space-y-1.5">
          <RuntimeToggle label="Mock streaming" checked={runtime.mockStreaming} onChange={() => toggleRuntime('mockStreaming')} />
          <RuntimeToggle label="Mock latency"   checked={runtime.mockLatency}   onChange={() => toggleRuntime('mockLatency')} />
          <RuntimeToggle label="Inject error"   checked={runtime.injectError}   onChange={() => toggleRuntime('injectError')} />
        </div>
      </nav>
    </aside>
  );
}

function ZoneSection({ zone, items }: { zone: ZoneId; items: typeof PRIMITIVES }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-zinc-200">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-50 hover:bg-zinc-100"
      >
        <span className="t-mono t-small-medium text-zinc-500 w-4">{zone}</span>
        <span className="t-micro text-zinc-700 flex-1 text-left">{ZONE_LABELS[zone]}</span>
        <span className="t-mono t-small-regular text-zinc-400 tabular-nums">{items.length}</span>
        <svg className={'size-3 transition-transform ' + (open ? 'rotate-90' : '')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
      {open && (
        <div>
          {items.map((p) => (
            <PrimitiveRow key={p.id} id={p.id} />
          ))}
        </div>
      )}
    </div>
  );
}

function RuntimeToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-zinc-50">
      <span className="t-small-regular text-zinc-700">{label}</span>
      <span className={'inline-flex items-center justify-center px-2 py-0.5 rounded t-small-medium border ' + (checked ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-500')}>
        {checked ? 'on' : 'off'}
      </span>
    </button>
  );
}
