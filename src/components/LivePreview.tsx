import { useComposition } from '../state/store';
import { SCENARIOS } from '../scenarios/data';
import { IntentChip } from './primitives/IntentChip';
import { SourceRow } from './primitives/SourceRow';
import { MatterScopeHeader, MatterShell } from './primitives/MatterScope';
import { PlanPreamble } from './primitives/PlanPreamble';
import { ArtifactPanel } from './primitives/ArtifactPanel';
import { ProvenanceBody, ProvenanceGroups } from './primitives/Provenance';
import { Icon } from './ui';

export function LivePreview() {
  const { composition } = useComposition();
  const scenario = SCENARIOS[composition.scenario];
  const p = composition.primitives;

  // Layout rules:
  //  - P5 dominant → wrap in MatterShell (Bundle-C-style 2-col workspace)
  //  - P4 dominant + scenario has artifact → split: chat | artifact
  //  - else → single column, artifact (if any) inline as card
  const splitArtifact = p.artifact === 'dominant' && !!scenario.artifactTitle;

  const chatColumn = (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-thin px-8 py-7">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* user prompt */}
          <div className="flex justify-end">
            <div className="max-w-[80%] flex flex-col items-end gap-2">
              {scenario.attached && (
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-300 bg-zinc-50 t-small-regular text-zinc-900">
                  <Icon name="file-text" className="size-3.5 text-zinc-500" />
                  <span className="t-small-medium">{scenario.attached.name}</span>
                  <span className="text-zinc-400">· {scenario.attached.meta}</span>
                </span>
              )}
              <div className="px-4 py-2.5 rounded-2xl rounded-br-md bg-zinc-900 t-large-regular text-white">
                {scenario.prompt}
              </div>
            </div>
          </div>

          {/* P1 intent chip */}
          <div className="flex items-center gap-2 flex-wrap">
            <IntentChip intent={scenario.intent} role={p.intent} />
            {/* P5 secondary → per-message pill near intent */}
            {p.matter === 'secondary' && <MatterScopeHeader role="secondary" />}
          </div>

          {/* P2 source row — inside the chat when dominant */}
          {p.sources !== 'absent' && (
            <SourceRow role={p.sources} sources={composition.sources} />
          )}

          {/* P6 plan preamble */}
          <PlanPreamble role={p.preamble} html={scenario.preamble} />

          {/* answer body with P3 provenance inline */}
          <ProvenanceBody
            blocks={scenario.answer}
            citations={scenario.citations}
            role={p.provenance}
          />

          {/* artifact: inline (card) when P4 is secondary OR (dominant but no split layout possible) */}
          {!splitArtifact && p.artifact !== 'absent' && (
            <ArtifactPanel
              role={p.artifact}
              title={scenario.artifactTitle}
              body={scenario.artifactBody}
              footer={scenario.artifactFooter}
              layout="inline"
            />
          )}

          {/* P3 group headers below the body */}
          <ProvenanceGroups citations={scenario.citations} role={p.provenance} />
        </div>
      </div>
    </div>
  );

  const conversationSurface = (
    <div className="flex flex-col h-full min-h-0">
      {/* P5 dominant header band */}
      {p.matter === 'dominant' && <MatterScopeHeader role="dominant" />}

      {splitArtifact ? (
        <div className="flex-1 grid grid-cols-[1fr_1.3fr] min-h-0">
          {chatColumn}
          <ArtifactPanel
            role={p.artifact}
            title={scenario.artifactTitle}
            body={scenario.artifactBody}
            footer={scenario.artifactFooter}
            layout="split"
          />
        </div>
      ) : (
        chatColumn
      )}
    </div>
  );

  return (
    <section className="min-h-0 bg-zinc-100 p-6 overflow-hidden">
      <div className="h-full bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
        {/* Preview header strip */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-2">
            <span className="t-micro text-zinc-500">Prévisualisation</span>
            <span className="text-zinc-300">·</span>
            <span className="t-small-regular text-zinc-500">
              {scenario.id} · {countActive(p)} primitives actives
            </span>
          </div>
          <div className="t-small-regular text-zinc-400 t-mono tabular-nums">
            {splitArtifact ? 'layout: split' : 'layout: single'} ·{' '}
            {p.matter === 'dominant' ? 'shell: matter' : 'shell: none'}
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <MatterShell role={p.matter}>{conversationSurface}</MatterShell>
        </div>
      </div>
    </section>
  );
}

function countActive(p: Record<string, string>): number {
  return Object.values(p).filter((r) => r !== 'absent').length;
}
