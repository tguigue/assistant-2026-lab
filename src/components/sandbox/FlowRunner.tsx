import { useEffect, useRef, useState } from 'react';
import type { ScenarioId } from '../../state/types';
import { FLOW_VARIANTS, type FlowLine, type FlowVariant } from '../../sandbox/flowVariants';
import { useSandbox } from '../../state/store';
import { Button, Select } from '../ui';
import { TerminalBlock } from './TerminalBlock';

export function FlowRunner({ scenario }: { scenario: ScenarioId }) {
  const variants = FLOW_VARIANTS[scenario];
  const [variantId, setVariantId] = useState<string>(variants[0]?.id ?? '');
  const variant: FlowVariant | undefined = variants.find((v) => v.id === variantId);
  const [streamed, setStreamed] = useState<FlowLine[]>([]);
  const [running, setRunning] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const timers = useRef<number[]>([]);
  const mockStreaming = useSandbox((s) => s.flags.mockStreaming);
  const mockLatency = useSandbox((s) => s.flags.mockLatency);

  // Reset when variant changes
  useEffect(() => {
    cleanup();
    setStreamed([]);
    setShowQuote(false);
    setRunning(false);
  }, [variantId, scenario]);

  function cleanup() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }

  function run() {
    if (!variant) return;
    cleanup();
    setStreamed([]);
    setShowQuote(false);
    setRunning(true);

    if (!mockStreaming) {
      // Instant
      setStreamed(variant.lines);
      setShowQuote(true);
      setRunning(false);
      return;
    }

    const baseDelay = mockLatency ? 180 : 90;
    variant.lines.forEach((line, i) => {
      const t = window.setTimeout(() => {
        setStreamed((prev) => [...prev, line]);
      }, baseDelay * (i + 1));
      timers.current.push(t);
    });
    const total = baseDelay * variant.lines.length + baseDelay;
    const tEnd = window.setTimeout(() => {
      setShowQuote(true);
      setRunning(false);
    }, total);
    timers.current.push(tEnd);
  }

  // Cleanup on unmount
  useEffect(() => cleanup, []);

  if (!variant) {
    return <div className="t-base-regular text-zinc-500">Aucune variante disponible.</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Select<string>
            value={variantId}
            onChange={(v) => setVariantId(v)}
            options={variants.map((v) => ({ value: v.id, label: v.label }))}
          />
        </div>
        <Button variant="solid" onClick={run} disabled={running}>
          {running ? 'Running…' : 'Run'}
        </Button>
      </div>

      <TerminalBlock
        path={variant.path}
        lines={streamed}
        quote={showQuote ? variant.quote : undefined}
        citations={showQuote ? variant.citations : undefined}
      />
    </div>
  );
}
