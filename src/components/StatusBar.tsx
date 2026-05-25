import { useLab } from '../lab/store';
import { ALL_PRIMITIVE_IDS } from '../lab/primitiveDefs';
import { SCENARIOS } from '../lab/scenarios';

export function StatusBar() {
  const comp = useLab((s) => s.comp);
  const nonCurrent = ALL_PRIMITIVE_IDS.filter(
    (id) => comp.primitives[id]?.optionId && comp.primitives[id].optionId !== 'current',
  ).length;
  const total = ALL_PRIMITIVE_IDS.length;

  return (
    <footer className="h-7 shrink-0 border-t border-zinc-200 bg-white px-4 flex items-center justify-between t-small-regular text-zinc-500">
      <div className="flex items-center gap-4">
        <span className="t-mono tabular-nums">{nonCurrent}/{total} customized</span>
        <span className="text-zinc-300">·</span>
        <span className="t-mono">{SCENARIOS[comp.scenario].code} · {SCENARIOS[comp.scenario].title}</span>
        {comp.runtime.injectError && (
          <>
            <span className="text-zinc-300">·</span>
            <span className="t-mono text-amber-700">error injected</span>
          </>
        )}
      </div>
      <div className="t-mono text-zinc-400">v0.4</div>
    </footer>
  );
}
