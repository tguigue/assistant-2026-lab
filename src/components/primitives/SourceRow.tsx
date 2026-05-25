import type { Role, SourceId } from '../../state/types';
import { SOURCE_IDS, SOURCE_LABELS } from '../../state/types';
import { Icon } from '../ui';

export function SourceRow({
  role,
  sources,
}: {
  role: Role;
  sources: Record<SourceId, boolean>;
}) {
  if (role === 'absent') return null;

  const active = SOURCE_IDS.filter((id) => sources[id]);

  if (role === 'secondary') {
    // Compact: just count + a small "voir" affordance
    return (
      <div className="inline-flex items-center gap-1.5 t-small-regular text-zinc-500">
        <Icon name="folder" className="size-3" />
        <span>
          {active.length} source{active.length > 1 ? 's' : ''} active
          {active.length > 1 ? 's' : ''}
        </span>
        <button className="underline underline-offset-2 text-zinc-500 hover:text-zinc-900">
          voir
        </button>
      </div>
    );
  }

  // dominant — full chip row with counts
  return (
    <div className="flex flex-wrap gap-1.5">
      {SOURCE_IDS.map((id) => {
        const meta = SOURCE_LABELS[id];
        const on = sources[id];
        return (
          <span
            key={id}
            className={
              on
                ? 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 t-small-medium text-white'
                : 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-200 bg-white t-small-medium text-zinc-500'
            }
          >
            {on && <Icon name="check" className="size-3" />}
            {meta.name}
            <span className={on ? 'text-zinc-400 ml-1 tabular-nums' : 'text-zinc-400 ml-1 tabular-nums'}>
              {meta.count}
            </span>
          </span>
        );
      })}
    </div>
  );
}
