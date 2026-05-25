import { useLab } from '../lab/store';
import {
  DOCTRINE_PRIMITIVES,
  CHAT_PRIMITIVES,
  SCENARIO_IDS,
  type ScenarioId,
} from '../lab/types';
import { SCENARIOS } from '../lab/scenarios';
import { PrimitiveRow } from './PrimitiveRow';

export function ControlRail() {
  const scenario = useLab((s) => s.comp.scenario);
  const setScenario = useLab((s) => s.setScenario);
  const runtime = useLab((s) => s.comp.runtime);
  const toggleRuntime = useLab((s) => s.toggleRuntime);
  const resetAll = useLab((s) => s.resetAll);
  const enableAll = useLab((s) => s.enableAll);

  return (
    <aside className="w-[280px] shrink-0 bg-white border-r border-zinc-200 overflow-y-auto scrollbar-thin flex flex-col min-h-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-200">
        <div className="t-micro text-zinc-500 mb-2">Scenario</div>
        <select
          value={scenario}
          onChange={(e) => setScenario(e.target.value as ScenarioId)}
          className="w-full h-8 px-2.5 t-small-medium text-zinc-900 border border-zinc-200 rounded-md bg-white outline-none focus:border-zinc-900 hover:border-zinc-400"
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
            title="Tout désactiver"
          >
            reset
          </button>
          <button
            onClick={enableAll}
            className="flex-1 px-2 py-1 t-small-medium text-zinc-600 border border-zinc-200 rounded hover:border-zinc-400 hover:text-zinc-900"
            title="Tout activer en dominant"
          >
            enable all
          </button>
        </div>
      </div>

      {/* Doctrine primitives */}
      <div className="px-3 py-2 border-b border-zinc-200">
        <div className="t-micro text-zinc-500 px-1">Doctrine</div>
      </div>
      <div>
        {DOCTRINE_PRIMITIVES.map((id) => (
          <PrimitiveRow key={id} id={id} />
        ))}
      </div>

      {/* Chat UI primitives */}
      <div className="px-3 py-2 border-y border-zinc-200">
        <div className="t-micro text-zinc-500 px-1">Chat UI</div>
      </div>
      <div>
        {CHAT_PRIMITIVES.map((id) => (
          <PrimitiveRow key={id} id={id} />
        ))}
      </div>

      {/* Runtime */}
      <div className="px-3 py-2 border-y border-zinc-200">
        <div className="t-micro text-zinc-500 px-1">Runtime</div>
      </div>
      <div className="px-3 py-2 space-y-1.5">
        <RuntimeToggle
          label="Mock streaming"
          checked={runtime.mockStreaming}
          onChange={() => toggleRuntime('mockStreaming')}
        />
        <RuntimeToggle
          label="Mock latency"
          checked={runtime.mockLatency}
          onChange={() => toggleRuntime('mockLatency')}
        />
        <RuntimeToggle
          label="Inject error"
          checked={runtime.injectError}
          onChange={() => toggleRuntime('injectError')}
        />
      </div>
    </aside>
  );
}

function RuntimeToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-zinc-50"
    >
      <span className="t-small-regular text-zinc-700">{label}</span>
      <span
        className={
          'inline-flex items-center justify-center px-2 py-0.5 rounded t-small-medium border ' +
          (checked
            ? 'bg-zinc-900 border-zinc-900 text-white'
            : 'bg-white border-zinc-200 text-zinc-500')
        }
      >
        {checked ? 'on' : 'off'}
      </span>
    </button>
  );
}
