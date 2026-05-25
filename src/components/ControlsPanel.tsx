import { useComposition } from '../state/store';
import {
  PRIMITIVE_IDS,
  PRIMITIVE_LABELS,
  SCENARIO_IDS,
  SCENARIO_LABELS,
  SOURCE_IDS,
  SOURCE_LABELS,
  PRESET_LABELS,
  type PresetId,
  type Role,
  type ScenarioId,
} from '../state/types';
import { Segmented, Select, Toggle, Button, Separator } from './ui';

export function ControlsPanel() {
  const { composition, setRole, setScenario, toggleSource, loadPreset, reset } =
    useComposition();

  return (
    <aside className="overflow-y-auto scrollbar-thin bg-white border-r border-zinc-200">
      <div className="px-4 py-4 border-b border-zinc-200 sticky top-0 bg-white z-10">
        <div className="t-micro text-zinc-500 mb-1">Composition</div>
        <div className="flex items-center gap-2">
          <Select<PresetId>
            value={composition.preset}
            onChange={(v) => loadPreset(v)}
            options={(['A', 'B', 'C', 'custom'] as PresetId[]).map((v) => ({
              value: v,
              label: PRESET_LABELS[v],
            }))}
            className="flex-1"
          />
          <Button size="sm" variant="ghost" onClick={reset} title="Reset to default">↺</Button>
        </div>
      </div>

      {/* Primitives */}
      <Section title="Primitives" hint="Rôle de chaque brique dans la composition">
        <ul className="space-y-2">
          {PRIMITIVE_IDS.map((id) => {
            const meta = PRIMITIVE_LABELS[id];
            return (
              <li key={id} className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="t-mono t-small-medium text-zinc-500 tabular-nums">{meta.code}</span>
                    <span className="t-base-medium text-zinc-900 truncate">{meta.name}</span>
                  </div>
                </div>
                <Segmented<Role>
                  value={composition.primitives[id]}
                  onChange={(v) => setRole(id, v)}
                  options={[
                    { value: 'dominant',  label: 'Dom',  hint: 'Dominant — rendu à pleine intensité' },
                    { value: 'secondary', label: 'Sec',  hint: 'Secondaire — rendu compact' },
                    { value: 'absent',    label: 'Off',  hint: 'Absent — non rendu' },
                  ]}
                  className="w-full"
                />
              </li>
            );
          })}
        </ul>
      </Section>

      <Separator />

      {/* Scenario */}
      <Section title="Scénario" hint="Prompt et fixtures utilisés dans la prévisualisation">
        <div className="flex flex-col gap-1.5">
          {SCENARIO_IDS.map((id) => {
            const active = composition.scenario === id;
            const meta = SCENARIO_LABELS[id];
            return (
              <button
                key={id}
                onClick={() => setScenario(id as ScenarioId)}
                className={
                  'flex items-baseline gap-2 px-2 py-1.5 rounded-md text-left transition-colors ' +
                  (active
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-zinc-700 border border-transparent hover:border-zinc-200')
                }
              >
                <span className={'t-mono t-small-medium tabular-nums ' + (active ? 'text-zinc-400' : 'text-zinc-400')}>
                  {meta.code}
                </span>
                <span className="t-base-medium">{meta.name}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Separator />

      {/* Sources */}
      <Section title="Sources" hint="Périmètre des sources mobilisées">
        <div className="flex flex-wrap gap-1.5">
          {SOURCE_IDS.map((id) => {
            const meta = SOURCE_LABELS[id];
            return (
              <Toggle
                key={id}
                checked={composition.sources[id]}
                onChange={() => toggleSource(id)}
              >
                <span>{meta.name}</span>
                <span className={composition.sources[id] ? 'text-zinc-400 ml-0.5' : 'text-zinc-400 ml-0.5'}>
                  {meta.count}
                </span>
              </Toggle>
            );
          })}
        </div>
      </Section>
    </aside>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-4 py-4">
      <div className="mb-3">
        <div className="t-micro text-zinc-500">{title}</div>
        {hint && <div className="t-small-regular text-zinc-400 mt-0.5">{hint}</div>}
      </div>
      {children}
    </section>
  );
}
