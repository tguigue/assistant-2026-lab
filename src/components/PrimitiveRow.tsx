import { useState } from 'react';
import { useLab } from '../lab/store';
import { PRIMITIVES_BY_ID } from '../lab/primitiveDefs';
import type { PrimitiveId } from '../lab/types';

/**
 * Ceros-style section for one primitive:
 *   Header (code + name) — collapsible
 *   ○ Current
 *   ● Option N
 *     Variant:  [dropdown]
 *     State:    [dropdown]
 *     Location: [dropdown]
 *   ○ Option N+1
 *   …
 */
export function PrimitiveRow({ id }: { id: PrimitiveId }) {
  const def = PRIMITIVES_BY_ID[id];
  const selection = useLab((s) => s.comp.primitives[id]);
  const setOption = useLab((s) => s.setOption);
  const setVariant = useLab((s) => s.setVariant);
  const setState = useLab((s) => s.setState);
  const setLocation = useLab((s) => s.setLocation);

  const [open, setOpen] = useState(false);
  const isCurrent = selection.optionId === 'current';

  return (
    <div className="border-b border-zinc-100">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 hover:bg-zinc-50 transition-colors"
      >
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="t-mono t-small-medium text-zinc-400 tabular-nums w-7 shrink-0">{def.code}</span>
          <span className="t-small-medium text-zinc-900 truncate">{def.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={'t-mono t-small-regular tabular-nums ' + (isCurrent ? 'text-zinc-400' : 'text-zinc-900')}>
            {isCurrent ? 'current' : 'opt ' + selection.optionId}
          </span>
          <svg
            className={'size-3 transition-transform ' + (open ? 'rotate-90' : '')}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 space-y-1">
          <p className="t-small-regular text-zinc-500 mb-2 pl-9">{def.blurb}</p>

          <div className="space-y-1">
            {def.options.map((opt) => {
              const active = opt.id === selection.optionId;
              return (
                <div key={opt.id}>
                  <button
                    onClick={() => setOption(id, opt.id)}
                    className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-50 text-left"
                  >
                    <span
                      className={
                        'inline-flex items-center justify-center size-3.5 rounded-full border ' +
                        (active ? 'border-zinc-900 bg-white' : 'border-zinc-300 bg-white')
                      }
                    >
                      {active && <span className="size-1.5 rounded-full bg-zinc-900" />}
                    </span>
                    <span className={'t-small-medium ' + (active ? 'text-zinc-900' : 'text-zinc-600')}>
                      {opt.id === 'current' ? 'Current' : `Option ${opt.id}`}
                      {opt.id !== 'current' && (
                        <span className="ml-1 t-small-regular text-zinc-500">— {opt.name}</span>
                      )}
                    </span>
                  </button>

                  {active && (opt.variants || opt.states || opt.locations) && (
                    <div className="pl-7 pr-2 mt-1.5 space-y-1.5">
                      {opt.variants && opt.variants.length > 1 && (
                        <Field label="Variant">
                          <select
                            value={selection.variantId ?? opt.variants[0].id}
                            onChange={(e) => setVariant(id, e.target.value)}
                            className="w-full h-6 px-1.5 t-small-regular text-zinc-800 border border-zinc-200 rounded bg-white outline-none focus:border-zinc-900 hover:border-zinc-400"
                          >
                            {opt.variants.map((v) => (
                              <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                          </select>
                        </Field>
                      )}
                      {opt.states && opt.states.length > 1 && (
                        <Field label="State">
                          <select
                            value={selection.stateId ?? opt.states[0].id}
                            onChange={(e) => setState(id, e.target.value)}
                            className="w-full h-6 px-1.5 t-small-regular text-zinc-800 border border-zinc-200 rounded bg-white outline-none focus:border-zinc-900 hover:border-zinc-400"
                          >
                            {opt.states.map((v) => (
                              <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                          </select>
                        </Field>
                      )}
                      {opt.locations && opt.locations.length > 1 && (
                        <Field label="Location">
                          <select
                            value={selection.locationId ?? opt.locations[0].id}
                            onChange={(e) => setLocation(id, e.target.value)}
                            className="w-full h-6 px-1.5 t-small-regular text-zinc-800 border border-zinc-200 rounded bg-white outline-none focus:border-zinc-900 hover:border-zinc-400"
                          >
                            {opt.locations.map((v) => (
                              <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                          </select>
                        </Field>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="t-small-regular text-zinc-500 w-14 shrink-0">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
