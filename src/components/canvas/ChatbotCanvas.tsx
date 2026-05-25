import { useLab } from '../../lab/store';
import { SCENARIOS } from '../../lab/scenarios';
import type { PrimitiveId } from '../../lab/types';

import { UserBubble, AssistantBubble } from './MessageBubble';
import { InputField } from './InputField';

import { IntentChip } from './doctrinePrimitives/IntentChip';
import { SourceRow } from './doctrinePrimitives/SourceRow';
import { ProvenanceBody, ProvenanceGroups } from './doctrinePrimitives/Provenance';
import { ArtifactPanel } from './doctrinePrimitives/ArtifactPanel';
import { MatterHeader, MatterShell } from './doctrinePrimitives/MatterScope';
import { PlanPreamble } from './doctrinePrimitives/PlanPreamble';

import { TypingIndicator } from './chatPrimitives/TypingIndicator';
import { StreamingCursor } from './chatPrimitives/StreamingCursor';
import { Skeleton } from './chatPrimitives/Skeleton';
import { Attachment } from './chatPrimitives/Attachment';
import { SuggestedFollowups } from './chatPrimitives/SuggestedFollowups';
import { ErrorBanner } from './chatPrimitives/ErrorBanner';
import { InlineRetry } from './chatPrimitives/InlineRetry';
import { FullScreenOops } from './chatPrimitives/FullScreenOops';

export function ChatbotCanvas() {
  const comp = useLab((s) => s.comp);
  const scenario = SCENARIOS[comp.scenario];

  const on = (id: PrimitiveId) =>
    comp.primitives[id].enabled && comp.primitives[id].role !== 'absent';
  const variant = (id: PrimitiveId) => comp.primitives[id].variant;
  const role = (id: PrimitiveId) => comp.primitives[id].role;

  const errorInjected = comp.runtime.injectError;

  // Full-screen oops takes over the entire canvas
  if (on('oops') && errorInjected) {
    return (
      <section className="flex-1 min-h-0 bg-zinc-50 p-6">
        <div className="h-full bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <FullScreenOops variant={variant('oops')} role={role('oops')} />
        </div>
      </section>
    );
  }

  // Modal error banner (overlays everything)
  const showModalError = on('errorBanner') && errorInjected && variant('errorBanner') === 'modal';

  const splitArtifact =
    on('artifact') &&
    role('artifact') === 'dominant' &&
    variant('artifact') === 'side-pane' &&
    !!scenario.artifact;

  // Matter info — fall back to a sensible default if scenario doesn't carry one
  const matter = scenario.matter ?? {
    name: 'Leroy c/ Merlin',
    subtitle: 'Contentieux commercial',
    docs: ['Contrat_001', 'Contrat_002', 'Conclusions_def.pdf'],
  };

  /* ---------- The chat surface ---------- */
  const chatSurface = (
    <div className="flex flex-col h-full min-h-0">
      {/* Top error banner */}
      {on('errorBanner') && errorInjected && variant('errorBanner') === 'top-strip' && (
        <ErrorBanner variant={variant('errorBanner')} role={role('errorBanner')} />
      )}

      {/* Matter header — dominant header-banner (workspace-shell wraps externally) */}
      {on('matter') &&
        role('matter') === 'dominant' &&
        variant('matter') === 'header-banner' && (
          <MatterHeader
            variant={variant('matter')}
            role={role('matter')}
            matter={matter}
          />
        )}

      {/* Scroll area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-8 py-7">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Inline error inside conversation */}
          {on('errorBanner') && errorInjected && variant('errorBanner') === 'inline' && (
            <ErrorBanner variant={variant('errorBanner')} role={role('errorBanner')} />
          )}

          {/* User message */}
          <div className="flex flex-col items-end gap-2">
            {scenario.attached && on('attachment') && (
              <Attachment
                variant={variant('attachment')}
                role={role('attachment')}
                file={{ name: scenario.attached.name, meta: scenario.attached.meta }}
              />
            )}
            <UserBubble>{scenario.prompt}</UserBubble>
          </div>

          {/* Per-message matter tag */}
          {on('matter') && variant('matter') === 'per-message-tag' && (
            <MatterHeader variant={variant('matter')} role={role('matter')} matter={matter} />
          )}

          {/* Typing indicator (above the assistant answer) */}
          {on('typing') && (
            <div className="t-base-regular text-zinc-500">
              <TypingIndicator variant={variant('typing')} role={role('typing')} />
            </div>
          )}

          {/* Skeleton loader (above the assistant answer, separate from the final text) */}
          {on('skeleton') && (
            <Skeleton variant={variant('skeleton')} role={role('skeleton')} />
          )}

          {/* Plan preamble */}
          {on('preamble') && (
            <PlanPreamble
              variant={variant('preamble')}
              role={role('preamble')}
              html={scenario.preamble}
            />
          )}

          {/* Assistant answer (with inline provenance pills) */}
          <AssistantBubble>
            <ProvenanceBody
              blocks={scenario.answer}
              citations={scenario.citations}
              variant={on('provenance') ? variant('provenance') : 'inline-pills'}
              role={on('provenance') ? role('provenance') : 'absent'}
            />
            {on('streamCursor') && (
              <span className="ml-1 align-baseline">
                <StreamingCursor
                  variant={variant('streamCursor')}
                  role={role('streamCursor')}
                />
              </span>
            )}
          </AssistantBubble>

          {/* Inline retry next to a failed message */}
          {on('inlineRetry') && errorInjected && (
            <div>
              <InlineRetry variant={variant('inlineRetry')} role={role('inlineRetry')} />
            </div>
          )}

          {/* Provenance groups / cards below the answer */}
          {on('provenance') && (
            <ProvenanceGroups
              citations={scenario.citations}
              variant={variant('provenance')}
              role={role('provenance')}
            />
          )}

          {/* Artifact panel — inline-card and link-out variants render here */}
          {on('artifact') &&
            !splitArtifact &&
            scenario.artifact && (
              <ArtifactPanel
                variant={variant('artifact')}
                role={role('artifact')}
                title={scenario.artifact.title}
                body={scenario.artifact.body}
                footer={scenario.artifact.footer}
                layout="inline"
              />
            )}

          {/* Follow-ups — chips below answer */}
          {on('followups') &&
            (variant('followups') === 'chips-below' || variant('followups') === 'prompt-buttons') && (
              <SuggestedFollowups
                variant={variant('followups')}
                role={role('followups')}
                items={scenario.followups}
              />
            )}
        </div>
      </div>

      {/* Below-chat composition area: source row, intent chip, matter pill, follow-ups, input */}
      <div className="border-t border-zinc-200 bg-white px-8 py-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Follow-ups list above input */}
          {on('followups') && variant('followups') === 'list-above' && (
            <SuggestedFollowups
              variant={variant('followups')}
              role={role('followups')}
              items={scenario.followups}
            />
          )}

          {/* Source row */}
          {on('sources') && (
            <SourceRow variant={variant('sources')} role={role('sources')} />
          )}

          {/* Intent chip + matter pill row */}
          {(on('intent') || (on('matter') && variant('matter') === 'pill-near-input')) && (
            <div className="flex items-center flex-wrap gap-2">
              {on('intent') && (
                <IntentChip
                  variant={variant('intent')}
                  role={role('intent')}
                  intent={scenario.intent}
                />
              )}
              {on('matter') && variant('matter') === 'pill-near-input' && (
                <MatterHeader
                  variant={variant('matter')}
                  role={role('matter')}
                  matter={matter}
                />
              )}
            </div>
          )}

          {/* Input */}
          <InputField placeholder={scenario.prompt} />
        </div>
      </div>
    </div>
  );

  /* ---------- Outer assembly ---------- */

  // If matter is wrapping as workspace-shell, wrap the chat surface with the doc sidebar
  const surface =
    on('matter') && role('matter') === 'dominant' && variant('matter') === 'workspace-shell' ? (
      <MatterShell variant="workspace-shell" role="dominant" matter={matter}>
        {chatSurface}
      </MatterShell>
    ) : (
      chatSurface
    );

  return (
    <section className="flex-1 min-h-0 bg-zinc-50 p-6">
      <div className="h-full bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex">
        <div className={'flex-1 min-w-0 ' + (splitArtifact ? '' : '')}>
          {surface}
        </div>

        {/* Side pane artifact */}
        {splitArtifact && scenario.artifact && (
          <div className="w-[44%] shrink-0">
            <ArtifactPanel
              variant={variant('artifact')}
              role={role('artifact')}
              title={scenario.artifact.title}
              body={scenario.artifact.body}
              footer={scenario.artifact.footer}
              layout="split"
            />
          </div>
        )}
      </div>

      {/* Modal error banner overlays everything */}
      {showModalError && (
        <ErrorBanner variant="modal" role={role('errorBanner')} />
      )}
    </section>
  );
}
