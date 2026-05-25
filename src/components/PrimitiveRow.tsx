import type { PrimitiveId, Role } from '../lab/types';
import { useLab } from '../lab/store';
import { PRIMITIVE_DEFS } from '../lab/primitiveDefs';
import { Segmented } from './ui';

export function PrimitiveRow({ id }: { id: PrimitiveId }) {
  const def = PRIMITIVE_DEFS[id];
  const state = useLab((s) => s.comp.primitives[id]);
  const togglePrimitive = useLab((s) => s.togglePrimitive);
  const setVariant = useLab((s) => s.setVariant);
  const setRole = useLab((s) => s.setRole);

  const enabled = state.enabled;

  return (
    <div className={'px-3 py-2 border-b border-zinc-100 ' + (enabled ? 'bg-white' : 'bg-zinc-50/40')}>
      <div className="flex items-center gap-2 mb-1">
        <span className="t-mono t-small-medium text-zinc-400 tabular-nums w-7 shrink-0">{def.code}</span>
        <span className={'t-small-medium truncate ' + (enabled ? 'text-zinc-900' : 'text-zinc-500')}>{def.name}</span>
        <button
          onClick={() => togglePrimitive(id)}
          className={
            'ml-auto inline-flex items-center justify-center px-2 py-0.5 rounded-md t-small-medium border transition-colors shrink-0 ' +
            (enabled
              ? 'bg-zinc-900 border-zinc-900 text-white'
              : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-400')
          }
          title={enabled ? 'Disable' : 'Enable'}
        >
          {enabled ? 'on' : 'off'}
        </button>
      </div>

      {enabled && (
        <div className="pl-9 space-y-1.5">
          <div>
            <select
              value={state.variant}
              onChange={(e) => setVariant(id, e.target.value)}
              className="w-full h-6 px-1.5 t-small-regular text-zinc-700 border border-zinc-200 rounded bg-white outline-none focus:border-zinc-900 hover:border-zinc-400"
            >
              {def.variants.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <Segmented<Role>
            value={state.role}
            onChange={(v) => setRole(id, v)}
            options={[
              { value: 'dominant', label: 'Dom' },
              { value: 'secondary', label: 'Sec' },
              { value: 'absent', label: 'Off' },
            ]}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
