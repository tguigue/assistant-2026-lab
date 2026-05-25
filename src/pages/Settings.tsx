import { PageShell, PageSection } from '../components/sandbox/PageShell';
import { useSandbox } from '../state/store';
import { RENDER_AS_LABELS, type RenderAs } from '../state/types';
import { Toggle, Select } from '../components/ui';

export default function Settings() {
  const flags = useSandbox((s) => s.flags);
  const toggleFlag = useSandbox((s) => s.toggleFlag);
  const setRenderAs = useSandbox((s) => s.setRenderAs);

  return (
    <PageShell
      eyebrow="Sandbox"
      title="Settings"
      lede="Toggles internes, infos d’environnement, version du build. Mêmes contrôles que le flyout du sommet droit, exposés ici pour la doc."
    >
      <PageSection eyebrow="Environment" title="Build">
        <dl className="grid grid-cols-2 gap-x-12 gap-y-2 max-w-xl">
          <Row k="Environment" v="Local Development" />
          <Row k="Frontend"    v="0.2.0 · 4b864fb" mono />
          <Row k="Backend"     v="N/A" mono />
          <Row k="Node"        v="24.11.1" mono />
          <Row k="Vite"        v="8.0.14" mono />
          <Row k="React"       v="19.2.6" mono />
        </dl>
      </PageSection>

      <PageSection eyebrow="Internal only" title="Toggles">
        <div className="space-y-3 max-w-md">
          <Row k="Mock streaming" v={<Toggle checked={flags.mockStreaming} onChange={() => toggleFlag('mockStreaming')}><span>{flags.mockStreaming ? 'on' : 'off'}</span></Toggle>} />
          <Row k="Mock latency"   v={<Toggle checked={flags.mockLatency}   onChange={() => toggleFlag('mockLatency')}>  <span>{flags.mockLatency   ? 'on' : 'off'}</span></Toggle>} />
          <Row k="Inject error"   v={<Toggle checked={flags.injectError}   onChange={() => toggleFlag('injectError')}>  <span>{flags.injectError   ? 'on' : 'off'}</span></Toggle>} />
        </div>
      </PageSection>

      <PageSection eyebrow="Sandbox only" title="Render as">
        <div className="flex items-center gap-3">
          <span className="t-base-regular text-zinc-600">Surface rendue dans le scénario actif :</span>
          <Select<RenderAs>
            value={flags.renderAs}
            onChange={setRenderAs}
            options={(['admin','enduser','empty','loading'] as RenderAs[]).map((v) => ({
              value: v,
              label: RENDER_AS_LABELS[v],
            }))}
            className="w-[200px]"
          />
        </div>
      </PageSection>
    </PageShell>
  );
}

function Row({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <>
      <dt className="t-base-regular text-zinc-500">{k}</dt>
      <dd className={(mono ? 't-mono ' : '') + 't-base-regular text-zinc-900'}>{v}</dd>
    </>
  );
}
