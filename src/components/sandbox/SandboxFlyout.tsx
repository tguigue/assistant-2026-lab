import { useEffect, useRef } from 'react';
import { useSandbox } from '../../state/store';
import { RENDER_AS_LABELS, type RenderAs } from '../../state/types';
import { Toggle, Select } from '../ui';

export function SandboxFlyout() {
  const flyoutOpen = useSandbox((s) => s.flyoutOpen);
  const closeFlyout = useSandbox((s) => s.closeFlyout);
  const flags = useSandbox((s) => s.flags);
  const toggleFlag = useSandbox((s) => s.toggleFlag);
  const setRenderAs = useSandbox((s) => s.setRenderAs);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!flyoutOpen) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) closeFlyout();
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [flyoutOpen, closeFlyout]);

  if (!flyoutOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute top-[52px] right-3 w-[300px] bg-white border border-zinc-200 rounded-md shadow-lg z-50 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-zinc-100">
        <div className="t-small-medium text-zinc-900">jane.doe@doctrine.fr</div>
      </div>

      <div className="px-4 py-3 border-b border-zinc-100">
        <div className="t-micro text-zinc-500 mb-2">Internal only</div>
        <dl className="space-y-1 t-small-regular text-zinc-600">
          <Row label="Environment" value="Local Development" />
          <Row label="Frontend" value="0.2.0 · 4b864fb" mono />
          <Row label="Backend" value="N/A" mono />
        </dl>
        <div className="mt-3 space-y-2">
          <FlagToggle
            label="Mock streaming"
            checked={flags.mockStreaming}
            onChange={() => toggleFlag('mockStreaming')}
          />
          <FlagToggle
            label="Mock latency"
            checked={flags.mockLatency}
            onChange={() => toggleFlag('mockLatency')}
          />
          <FlagToggle
            label="Inject error"
            checked={flags.injectError}
            onChange={() => toggleFlag('injectError')}
          />
        </div>
      </div>

      <div className="px-4 py-3 border-b border-zinc-100">
        <div className="t-micro text-zinc-500 mb-2">Sandbox only</div>
        <div className="flex items-center justify-between gap-2">
          <span className="t-small-regular text-zinc-600">Render as</span>
          <Select<RenderAs>
            value={flags.renderAs}
            onChange={(v) => setRenderAs(v)}
            options={(['admin', 'enduser', 'empty', 'loading'] as RenderAs[]).map((v) => ({
              value: v,
              label: RENDER_AS_LABELS[v],
            }))}
            className="w-[170px]"
          />
        </div>
      </div>

      <button className="w-full text-left px-4 py-2.5 t-small-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
        Sign out
      </button>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt>{label}</dt>
      <dd className={mono ? 't-mono text-zinc-900' : 'text-zinc-900'}>{value}</dd>
    </div>
  );
}

function FlagToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="t-small-regular text-zinc-700">{label}</span>
      <Toggle checked={checked} onChange={onChange}>
        <span>{checked ? 'on' : 'off'}</span>
      </Toggle>
    </div>
  );
}
