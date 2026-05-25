import { useLab } from '../lab/store';
import { ALL_PRIMITIVES } from '../lab/types';
import { SCENARIOS } from '../lab/scenarios';

export function StatusBar() {
  const comp = useLab((s) => s.comp);
  const active = ALL_PRIMITIVES.filter(
    (id) => comp.primitives[id].enabled && comp.primitives[id].role !== 'absent',
  ).length;
  const total = ALL_PRIMITIVES.length;

  return (
    <footer className="h-7 shrink-0 border-t border-zinc-200 bg-white px-4 flex items-center justify-between t-small-regular text-zinc-500">
      <div className="flex items-center gap-4">
        <span className="t-mono tabular-nums">{active}/{total} primitives</span>
        <span className="text-zinc-300">·</span>
        <span className="t-mono">{SCENARIOS[comp.scenario].code} · {SCENARIOS[comp.scenario].title}</span>
        {comp.runtime.injectError && (
          <>
            <span className="text-zinc-300">·</span>
            <span className="t-mono text-amber-700">error injected</span>
          </>
        )}
      </div>
      <div className="t-mono text-zinc-400">assistant-2026-lab</div>
    </footer>
  );
}
