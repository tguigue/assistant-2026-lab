import { useComposition } from '../state/store';
import { PRESET_LABELS } from '../state/types';

export function StatusBar() {
  const { composition } = useComposition();
  const active = (Object.values(composition.primitives).filter((r) => r !== 'absent')).length;
  const sources = Object.values(composition.sources).filter(Boolean).length;
  const dirty = composition.preset === 'custom';

  return (
    <footer className="h-8 border-t border-zinc-200 bg-zinc-50 px-4 flex items-center justify-between t-small-regular text-zinc-500">
      <div className="flex items-center gap-4">
        <span className="t-mono tabular-nums">
          preset: <span className={dirty ? 'text-zinc-400' : 'text-zinc-900'}>{PRESET_LABELS[composition.preset]}</span>
        </span>
        <span className="text-zinc-300">·</span>
        <span className="t-mono tabular-nums">{active}/6 primitives</span>
        <span className="text-zinc-300">·</span>
        <span className="t-mono tabular-nums">{sources}/4 sources</span>
      </div>
      <div className="flex items-center gap-4">
        {dirty && (
          <span className="t-mono text-zinc-500">
            <span className="inline-block size-1.5 rounded-full bg-zinc-900 align-middle mr-1.5" />
            modifié
          </span>
        )}
        <span className="t-mono text-zinc-400">assistant-2026-lab · v0.1</span>
      </div>
    </footer>
  );
}
