import { useLab } from '../../lab/store';
import { SCENARIOS } from '../../lab/scenarios';
import type { PrimitiveId } from '../../lab/types';
import { Icon } from '../ui';
import { UserBubble } from './MessageBubble';
import { ProvenanceBody, ProvenanceGroups } from './doctrinePrimitives/Provenance';

/**
 * The chatbot canvas — reads selections from the lab store and renders the
 * real Doctrine Assistant. Each primitive\'s selected Option drives its
 * visual variant; "current" matches the user\'s real-product screenshots.
 */
export function ChatbotCanvas() {
  const comp = useLab((s) => s.comp);
  const scenario = SCENARIOS[comp.scenario];

  const opt = (id: PrimitiveId) => comp.primitives[id]?.optionId ?? 'current';
  const variant = (id: PrimitiveId) => comp.primitives[id]?.variantId;
  const state = (id: PrimitiveId) => comp.primitives[id]?.stateId;

  const error = comp.runtime.injectError;
  const oopsVisible = error && opt('I3') !== 'current';

  // Split layout: G1 artifact = side-pane
  const splitArtifact =
    !!scenario.artifact && opt('G1') === '1';

  // Matter shell: F4 = workspace
  const matterShell = opt('F4') === '1' && !!scenario.matter;

  if (oopsVisible) {
    return (
      <section className="flex-1 min-h-0 bg-zinc-50 p-6">
        <div className="h-full bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex items-center justify-center">
          <FatalOops variantId={opt('I3')} />
        </div>
      </section>
    );
  }

  const inner = (
    <div className="flex flex-col h-full min-h-0 bg-white">
      {/* I1 — error top strip */}
      {error && opt('I1') === '1' && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2">
          <Icon name="alert" className="size-3.5 text-amber-700" />
          <span className="t-small-medium text-amber-800">Une erreur s'est produite.</span>
          <span className="t-small-regular text-amber-700">Veuillez réessayer ou contacter le support.</span>
        </div>
      )}

      {/* F1 — matter banner */}
      <MatterBanner optionId={opt('F1')} scenarioMatter={scenario.matter} />

      {/* A2 — top-bar actions */}
      <TopBarActions optionId={opt('A2')} />

      {/* Scroll body */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-3xl mx-auto px-8 pt-12 pb-6">
          {/* A1 + B1 — page header / welcome */}
          <PageHeader optionId={opt('A1')} variantId={variant('A1')} />
          <WelcomeBlock optionId={opt('B1')} />

          {/* B2 — suggested prompts (above conversation) */}
          <SuggestedPrompts optionId={opt('B2')} variantId={variant('B2')} />

          {/* Conversation */}
          <div className="mt-10 space-y-6">
            {/* User message */}
            <div className="flex flex-col items-end gap-2">
              {scenario.attached && <Attachment optionId={opt('D2')} file={scenario.attached} />}
              <UserMessage optionId={opt('D1')}>{scenario.prompt}</UserMessage>
            </div>

            {/* E1 intent chip + E2 manual mode toggle — above response */}
            <div className="flex items-center gap-2 flex-wrap">
              <IntentChip optionId={opt('E1')} stateId={state('E1')} intent={scenario.intent} />
              <ManualModeToggle optionId={opt('E2')} />
            </div>

            {/* D5 plan preamble */}
            <PlanPreamble optionId={opt('D5')} html={scenario.preamble} />

            {/* D8 typing indicator (above response when "thinking") */}
            {opt('D8') !== 'current' && opt('D8') !== '4' && state('D4') === 'thinking' && (
              <TypingIndicator optionId={opt('D8')} />
            )}

            {/* D9 skeleton (above response when "thinking") */}
            {opt('D9') !== 'current' && state('D4') === 'thinking' && (
              <SkeletonLoader optionId={opt('D9')} />
            )}

            {/* D4 assistant body + D6 inline citations */}
            <AssistantMessage
              optionId={opt('D4')}
              body={scenario.answer}
              citations={scenario.citations}
              showCitations={opt('D6') !== 'current'}
              citationStyle={opt('D6')}
              showStreamCursor={opt('D8') === '1'}
            />

            {/* D7 grouped citations panel */}
            {opt('D7') !== 'current' && (
              <GroupedCitations optionId={opt('D7')} citations={scenario.citations} />
            )}

            {/* G handoffs */}
            <HandoffArea
              g1Opt={opt('G1')}
              g2Opt={opt('G2')}
              g3Opt={opt('G3')}
              g4Opt={opt('G4')}
              scenario={scenario}
            />

            {/* H1 suggested follow-ups */}
            <SuggestedFollowups optionId={opt('H1')} items={scenario.followups} />

            {/* H2 message actions */}
            <MessageActions optionId={opt('H2')} />

            {/* F5 attach to matter */}
            <AttachToMatter optionId={opt('F5')} matter={scenario.matter} />

            {/* I2 retry */}
            {error && <RetryButton optionId={opt('I2')} />}
          </div>
        </div>
      </div>

      {/* Composer area */}
      <div className="border-t border-zinc-200 bg-white">
        <div className="max-w-3xl mx-auto px-8 py-5">
          {/* C6 — source chips inline */}
          <SourceChips optionId={opt('C6')} />

          {/* Input + composer toolbar */}
          <Composer
            c1={opt('C1')} c1State={state('C1')}
            c2={opt('C2')}
            c3={opt('C3')}
            c4={opt('C4')}
            c7={opt('C7')}
            c8={opt('C8')} c8State={state('C8')}
          />

          {/* C9 disclaimer */}
          <Disclaimer optionId={opt('C9')} />
        </div>
      </div>
    </div>
  );

  const surface = matterShell ? <MatterShell matter={scenario.matter!}>{inner}</MatterShell> : inner;

  return (
    <section className="flex-1 min-h-0 bg-zinc-50 p-6">
      <div className="h-full bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex">
        <div className="flex-1 min-w-0 flex">{surface}</div>
        {splitArtifact && scenario.artifact && (
          <div className="w-[44%] shrink-0 border-l border-zinc-200">
            <ArtifactSidePane artifact={scenario.artifact} />
          </div>
        )}
      </div>
    </section>
  );
}

/* ==========================================================================
   Per-primitive renderers — inline for v0.4
   ========================================================================== */

function PageHeader({ optionId, variantId }: { optionId: string; variantId?: string }) {
  if (optionId === '3') return null;
  if (optionId === '2') {
    return (
      <div className="mb-6">
        <h1 className="t-title-2 text-zinc-900">Assistant</h1>
        <p className="t-base-regular text-zinc-500 mt-1">Votre copilote juridique intelligent.</p>
      </div>
    );
  }
  // current
  const titleClass = variantId === '1b' ? 'font-legal text-[40px] font-medium text-zinc-900' : 't-title-0 text-zinc-900';
  return (
    <div className="text-center mb-2">
      <h1 className={titleClass}>Assistant</h1>
      <p className="t-large-regular text-zinc-500 mt-2">
        Votre copilote juridique intelligent.<br />
        <a href="#" className="t-large-regular text-zinc-700 underline underline-offset-2 hover:text-zinc-900">Voir les conseils</a>
      </p>
    </div>
  );
}

function WelcomeBlock({ optionId }: { optionId: string }) {
  if (optionId === 'current' || optionId === '3') return null;
  if (optionId === '2') {
    return (
      <p className="text-center mt-4 t-large-regular text-zinc-600">
        Bonjour Maître, sur quoi travaillons-nous aujourd'hui ?
      </p>
    );
  }
  return null;
}

function SuggestedPrompts({ optionId, variantId }: { optionId: string; variantId?: string }) {
  if (optionId === 'current') return null;
  const prompts = [
    { icon: 'search',    text: 'Trouve la jurisprudence sur le harcèlement managérial' },
    { icon: 'pen',       text: 'Rédige un contrat de prestation d\'architecte' },
    { icon: 'file-text', text: 'Analyse ces conclusions du défendeur' },
    { icon: 'folder',    text: 'Extrais les obligations communes des 5 contrats Leroy' },
  ];
  if (optionId === '1') {
    if (variantId === '1b') {
      return (
        <ul className="mt-8 max-w-xl mx-auto space-y-2">
          {prompts.map((p, i) => (
            <li key={i}>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-zinc-200 t-small-medium text-zinc-700 hover:border-zinc-400 hover:text-zinc-900 text-left">
                <Icon name={p.icon} className="size-3.5 text-zinc-500" />
                {p.text}
              </button>
            </li>
          ))}
        </ul>
      );
    }
    return (
      <div className="mt-8 grid grid-cols-2 gap-3 max-w-2xl mx-auto">
        {prompts.map((p, i) => (
          <button key={i} className="px-3 py-3 rounded-md border border-zinc-200 t-small-medium text-zinc-700 hover:border-zinc-400 hover:text-zinc-900 text-left flex items-start gap-2">
            <Icon name={p.icon} className="size-4 text-zinc-500 mt-0.5 shrink-0" />
            <span>{p.text}</span>
          </button>
        ))}
      </div>
    );
  }
  if (optionId === '2') {
    return (
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        {prompts.slice(0, 3).map((p, i) => (
          <button key={i} className="px-3 py-1.5 rounded-full border border-zinc-200 t-small-medium text-zinc-700 hover:border-zinc-400">
            {p.text}
          </button>
        ))}
      </div>
    );
  }
  return null;
}

function TopBarActions({ optionId }: { optionId: string }) {
  if (optionId === 'current') return null;
  return (
    <div className="flex items-center gap-2 px-5 py-2 border-b border-zinc-100">
      <button className="t-small-medium text-zinc-600 hover:text-zinc-900">+ Nouvelle conversation</button>
      <button className="t-small-medium text-zinc-600 hover:text-zinc-900 ml-auto">Historique</button>
      {optionId === '2' && <button className="t-small-medium text-zinc-600 hover:text-zinc-900">Profil</button>}
    </div>
  );
}

function MatterBanner({ optionId, scenarioMatter }: { optionId: string; scenarioMatter?: { name: string; subtitle?: string } }) {
  if (optionId === 'current' || !scenarioMatter) return null;
  if (optionId === '1') {
    return (
      <div className="px-5 py-2 border-b border-zinc-200 bg-zinc-50 flex items-center gap-2 t-small-regular">
        <span className="inline-flex items-center justify-center size-5 rounded bg-zinc-900 text-white t-small-semibold">
          {scenarioMatter.name[0]}
        </span>
        <span className="text-zinc-600">Affaire :</span>
        <span className="t-small-medium text-zinc-900">{scenarioMatter.name}</span>
        {scenarioMatter.subtitle && <span className="text-zinc-400 ml-2">· {scenarioMatter.subtitle}</span>}
      </div>
    );
  }
  if (optionId === '2') {
    return (
      <div className="flex items-center gap-3 px-5 py-3 bg-zinc-900 text-white">
        <span className="inline-flex items-center justify-center size-7 rounded bg-white text-zinc-900 t-small-semibold">
          {scenarioMatter.name[0]}
        </span>
        <div className="flex-1">
          <div className="t-small-regular text-zinc-400">Affaire</div>
          <div className="t-base-semibold">{scenarioMatter.name}</div>
        </div>
        {scenarioMatter.subtitle && (
          <span className="px-2 py-0.5 rounded bg-white/10 t-micro text-zinc-300">{scenarioMatter.subtitle}</span>
        )}
      </div>
    );
  }
  return null;
}

function MatterShell({ matter, children }: { matter: { name: string; subtitle?: string; docs?: string[] }; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[220px_minmax(0,1fr)] divide-x divide-zinc-200 h-full min-h-0 flex-1">
      <aside className="py-4 px-3 bg-zinc-50/60 overflow-y-auto scrollbar-thin">
        <div className="t-micro text-zinc-500 px-2 mb-2">Affaire</div>
        <div className="px-2 mb-4">
          <div className="t-base-semibold text-zinc-900">{matter.name}</div>
          {matter.subtitle && <div className="t-small-regular text-zinc-500 mt-0.5">{matter.subtitle}</div>}
        </div>
        <div className="t-micro text-zinc-500 px-2 mb-2">Documents</div>
        <ul className="space-y-0.5">
          {(matter.docs ?? []).map((d) => (
            <li key={d} className="flex items-center gap-2 px-2 py-1 rounded t-small-regular text-zinc-700 hover:bg-white">
              <Icon name="file-text" className="size-3.5 text-zinc-400" />
              <span className="truncate">{d}</span>
            </li>
          ))}
        </ul>
      </aside>
      <div className="flex flex-col min-h-0">{children}</div>
    </div>
  );
}

function Attachment({ optionId, file }: { optionId: string; file: { name: string; meta: string; kind?: string } }) {
  if (optionId === '3') {
    return (
      <div className="border-2 border-dashed border-zinc-300 rounded-md px-4 py-6 text-center bg-zinc-50/50 max-w-md">
        <Icon name="upload" className="size-5 text-zinc-400 mx-auto mb-2" />
        <div className="t-small-medium text-zinc-700">Glissez-déposez un document</div>
        <div className="t-small-regular text-zinc-500 mt-0.5">PDF, DOCX · 50 Mo max</div>
      </div>
    );
  }
  if (optionId === '1' || optionId === 'current') {
    return (
      <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md border border-zinc-300 bg-white t-small-regular text-zinc-700">
        <Icon name="file-text" className="size-3 text-zinc-500" />
        <span className="t-small-medium">{file.name}</span>
        <span className="text-zinc-400">· {file.meta}</span>
      </span>
    );
  }
  // option 2 — preview card
  return (
    <div className="inline-flex items-center gap-3 px-3 py-2 rounded-lg border border-zinc-300 bg-zinc-50">
      <span className="inline-flex items-center justify-center size-8 rounded bg-white border border-zinc-200">
        <Icon name="file-text" className="size-4 text-zinc-700" />
      </span>
      <div>
        <div className="t-small-medium text-zinc-900">{file.name}</div>
        <div className="t-small-regular text-zinc-500">{file.meta}</div>
      </div>
    </div>
  );
}

function UserMessage({ optionId, children }: { optionId: string; children: React.ReactNode }) {
  if (optionId === '2') {
    return (
      <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-md border border-zinc-300 t-large-regular text-zinc-900">
        {children}
      </div>
    );
  }
  if (optionId === '3') {
    return (
      <div className="max-w-[80%] t-large-regular text-zinc-900 text-right pr-1">{children}</div>
    );
  }
  return <UserBubble>{children}</UserBubble>;
}

function IntentChip({ optionId, stateId, intent }: { optionId: string; stateId?: string; intent: { icon: string; label: string } }) {
  if (optionId === 'current') return null;
  if (optionId === '2') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-zinc-200 t-small-regular text-zinc-600">
        <Icon name={intent.icon} className="size-3" />
      </span>
    );
  }
  // option 1
  if (stateId === 'detecting') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-200 bg-white t-small-regular text-zinc-500">
        <span className="size-1.5 rounded-full bg-zinc-400 animate-pulse" />
        Détection…
      </span>
    );
  }
  if (stateId === 'low-confidence') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-dashed border-zinc-400 bg-white t-small-medium text-zinc-700">
        <Icon name="alert" className="size-3 text-zinc-500" />
        {intent.label}&nbsp;? <span className="t-small-regular text-zinc-400">confirmer</span>
      </span>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-md border border-zinc-900 bg-zinc-900 t-small-medium text-white">
        <Icon name={intent.icon} className="size-3" />
        {intent.label}
        <button className="ml-1 px-1.5 py-0.5 t-small-regular text-zinc-400 hover:text-white">changer</button>
      </span>
      <span className="t-small-regular text-zinc-400">détecté</span>
    </div>
  );
}

function ManualModeToggle({ optionId }: { optionId: string }) {
  if (optionId === 'current') return null;
  if (optionId === '2') {
    return (
      <span className="t-mono t-small-regular text-zinc-400">/research · /draft · /extract</span>
    );
  }
  return (
    <div className="inline-flex rounded-md border border-zinc-200 bg-zinc-50 p-0.5">
      {['Research', 'Draft', 'Extract'].map((m, i) => (
        <button
          key={m}
          className={
            'h-6 px-2 rounded-[5px] t-small-medium ' +
            (i === 0 ? 'bg-white text-zinc-900 border border-zinc-200' : 'text-zinc-500 hover:text-zinc-900')
          }
        >
          {m}
        </button>
      ))}
    </div>
  );
}

function PlanPreamble({ optionId, html }: { optionId: string; html: string }) {
  if (optionId === 'current') return null;
  if (optionId === '1') {
    return (
      <p className="t-small-regular text-zinc-500 italic inline-flex items-baseline gap-1.5">
        <Icon name="sparkles" className="size-3 text-zinc-400" />
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </p>
    );
  }
  if (optionId === '3') {
    return (
      <div className="space-y-1 t-small-regular text-zinc-600">
        <div className="flex items-center gap-1.5">
          <Icon name="sparkles" className="size-3 text-zinc-400" />
          <span className="t-small-medium text-zinc-700">Plan</span>
        </div>
        <div className="pl-4 border-l border-zinc-200 space-y-0.5 t-mono">
          <div>→ chercher dans Doctrine</div>
          <div>→ chercher dans la KB</div>
          <div>→ rapprocher et trancher</div>
        </div>
      </div>
    );
  }
  if (optionId === '4') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-100 t-small-medium text-zinc-700">
        <Icon name="sparkles" className="size-3 text-zinc-500" />
        Searching · 3 sources · grouped
      </div>
    );
  }
  // option 2 — gray inline box
  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-md">
      <Icon name="sparkles" className="size-4 text-zinc-500 mt-0.5 shrink-0" />
      <p className="t-base-regular text-zinc-900" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

function TypingIndicator({ optionId }: { optionId: string }) {
  if (optionId === '2') return <span className="t-small-regular text-zinc-500">Doctrine réfléchit…</span>;
  if (optionId === '3') return <div className="h-3 w-32 rounded bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-100 bg-[length:200%_100%]" />;
  return (
    <span className="inline-flex items-center gap-1">
      <span className="size-1.5 rounded-full bg-zinc-500 animate-bounce" />
      <span className="size-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:150ms]" />
      <span className="size-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:300ms]" />
    </span>
  );
}

function SkeletonLoader({ optionId }: { optionId: string }) {
  if (optionId === '3') return <span className="inline-block h-3 w-20 rounded bg-zinc-200 animate-pulse" />;
  if (optionId === '2') {
    return (
      <div className="border border-zinc-200 rounded-md p-4 max-w-md">
        <div className="h-3 w-2/3 rounded bg-zinc-200 animate-pulse mb-3" />
        <div className="h-3 w-full rounded bg-zinc-100 animate-pulse mb-1.5" />
        <div className="h-3 w-5/6 rounded bg-zinc-100 animate-pulse" />
      </div>
    );
  }
  return (
    <div className="space-y-2 max-w-2xl">
      <div className="h-3 w-3/4 rounded bg-zinc-200 animate-pulse" />
      <div className="h-3 w-full rounded bg-zinc-200 animate-pulse" />
      <div className="h-3 w-5/6 rounded bg-zinc-200 animate-pulse" />
    </div>
  );
}

function AssistantMessage({
  optionId,
  body,
  citations,
  showCitations,
  citationStyle,
  showStreamCursor,
}: {
  optionId: string;
  body: import('../../lab/scenarios').AnswerBlock[];
  citations: Record<string, import('../../lab/scenarios').Citation>;
  showCitations: boolean;
  citationStyle: string;
  showStreamCursor: boolean;
}) {
  const variant = citationStyle === 'numbered-footnotes' ? 'numbered-footnotes' : 'inline-pills';
  const role = showCitations ? 'dominant' : 'absent';
  if (optionId === '3') {
    return (
      <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-bl-md bg-zinc-100 t-large-regular text-zinc-900">
        <ProvenanceBody blocks={body} citations={citations} variant={variant} role={role} />
        {showStreamCursor && <span className="ml-1 animate-pulse">▍</span>}
      </div>
    );
  }
  if (optionId === '2') {
    return (
      <div className="rounded-md bg-zinc-50 border border-zinc-100 px-4 py-3">
        <ProvenanceBody blocks={body} citations={citations} variant={variant} role={role} />
        {showStreamCursor && <span className="ml-1 animate-pulse">▍</span>}
      </div>
    );
  }
  return (
    <div>
      <ProvenanceBody blocks={body} citations={citations} variant={variant} role={role} />
      {showStreamCursor && <span className="ml-1 animate-pulse">▍</span>}
    </div>
  );
}

function GroupedCitations({ optionId, citations }: { optionId: string; citations: Record<string, import('../../lab/scenarios').Citation> }) {
  if (optionId === 'current' || optionId === '1') {
    return <ProvenanceGroups citations={citations} variant="grouped-below" role="dominant" />;
  }
  if (optionId === '3') {
    return <ProvenanceGroups citations={citations} variant="expanded-cards" role="dominant" />;
  }
  // option 2 — same as grouped (collapsible accordion)
  return <ProvenanceGroups citations={citations} variant="grouped-below" role="dominant" />;
}

function HandoffArea({
  g1Opt, g2Opt, g3Opt, g4Opt, scenario,
}: {
  g1Opt: string; g2Opt: string; g3Opt: string; g4Opt: string;
  scenario: { artifact?: { title: string }; id: string };
}) {
  // G1 is the artifact panel — handled in the outer layout (side-pane or inline)
  // If G1 = inline-card, render here:
  return (
    <>
      {g1Opt === '2' && scenario.artifact && (
        <ArtifactInlineCard title={scenario.artifact.title} />
      )}
      {g2Opt !== 'current' && scenario.id === 'drafting' && (
        <HandoffCTA tool="Draft" />
      )}
      {g3Opt !== 'current' && scenario.id === 'internal' && (
        <HandoffCTA tool="Extract" />
      )}
      {g4Opt !== 'current' && <HandoffCTA tool="Counsel" />}
    </>
  );
}

function HandoffCTA({ tool }: { tool: string }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon name="pen" className="size-3.5 text-zinc-700" />
        <span className="t-small-medium text-zinc-900">Continuer dans {tool}</span>
      </div>
      <button className="px-2.5 py-1 t-small-medium text-white rounded-md bg-zinc-900 hover:bg-zinc-800 inline-flex items-center gap-1">
        Ouvrir <Icon name="arrow-right" className="size-3" />
      </button>
    </div>
  );
}

function ArtifactInlineCard({ title }: { title: string }) {
  return (
    <div className="rounded-md border border-zinc-200 overflow-hidden">
      <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 t-small-semibold text-zinc-900">
          <Icon name="pen" className="size-3.5" /> Draft
        </span>
        <button className="px-2 py-0.5 t-small-medium text-white rounded bg-zinc-900">Ouvrir</button>
      </div>
      <div className="px-4 py-3 t-legal-base text-zinc-700">
        <div className="t-micro text-zinc-500 mb-1">Article 1 — Objet</div>
        <p>{title}. Aperçu du brouillon généré, 8 articles disponibles dans Draft.</p>
      </div>
    </div>
  );
}

function ArtifactSidePane({ artifact }: { artifact: { title: string; body: import('../../lab/scenarios').AnswerBlock[]; footer: string } }) {
  return (
    <div className="flex flex-col h-full bg-zinc-50/40">
      <div className="px-5 py-3 border-b border-zinc-200 bg-white flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 t-small-semibold text-zinc-900">
          <Icon name="pen" className="size-3.5" /> Draft
        </span>
        <button className="px-2.5 py-1 t-small-medium text-white rounded-md bg-zinc-900">Ouvrir</button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin px-7 py-6 t-legal-base text-zinc-900">
        <h3 className="t-title-4 text-zinc-900 mb-3">{artifact.title}</h3>
        {artifact.body.map((b, i) =>
          b.kind === 'h' ? (
            <div key={i} className="t-micro text-zinc-500 mb-1.5 mt-4 first:mt-0">{b.text}</div>
          ) : (
            <p key={i} className="mb-4" dangerouslySetInnerHTML={{ __html: b.html }} />
          ),
        )}
      </div>
      <div className="px-5 py-2.5 border-t border-zinc-200 bg-white t-small-regular text-zinc-500">{artifact.footer}</div>
    </div>
  );
}

function SuggestedFollowups({ optionId, items }: { optionId: string; items: string[] }) {
  if (optionId === 'current' || items.length === 0) return null;
  if (optionId === '2') {
    return (
      <ul className="space-y-1 t-small-regular text-zinc-700">
        {items.map((it, i) => (
          <li key={i}>{i + 1}. <button className="underline underline-offset-2 hover:text-zinc-900">{it}</button></li>
        ))}
      </ul>
    );
  }
  if (optionId === '3') {
    return (
      <div className="border border-zinc-200 rounded-md p-3 grid grid-cols-1 md:grid-cols-3 gap-2">
        {items.map((it, i) => (
          <button key={i} className="px-3 py-2 t-small-medium text-zinc-700 hover:text-zinc-900 text-left">{it}</button>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it, i) => (
        <button key={i} className="px-2.5 py-1 rounded-full border border-zinc-200 bg-white t-small-medium text-zinc-700 hover:border-zinc-400">{it}</button>
      ))}
    </div>
  );
}

function MessageActions({ optionId }: { optionId: string }) {
  if (optionId === 'current') return null;
  return (
    <div className={'flex items-center gap-1 ' + (optionId === '2' ? 'opacity-100' : 'opacity-60 hover:opacity-100')}>
      {['📋 Copier', '↻ Régénérer', '👍', '👎'].map((a) => (
        <button key={a} className="px-2 py-1 t-small-regular text-zinc-500 hover:text-zinc-900 rounded hover:bg-zinc-100">{a}</button>
      ))}
    </div>
  );
}

function AttachToMatter({ optionId, matter }: { optionId: string; matter?: { name: string } }) {
  if (optionId === 'current' || !matter) return null;
  if (optionId === '2') {
    return (
      <div className="inline-flex items-center gap-1.5 t-small-regular text-zinc-500">
        <Icon name="check" className="size-3" />
        Attaché à {matter.name}
      </div>
    );
  }
  return (
    <button className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-dashed border-zinc-300 t-small-regular text-zinc-500 hover:border-zinc-400 hover:text-zinc-700">
      <Icon name="paperclip" className="size-3" />
      Attacher à une affaire
    </button>
  );
}

function RetryButton({ optionId }: { optionId: string }) {
  if (optionId === 'current') return null;
  if (optionId === '2') return <button className="t-small-medium text-zinc-600 hover:text-zinc-900 underline">Réessayer</button>;
  if (optionId === '3') {
    return (
      <span className="inline-flex items-center gap-1.5 t-small-regular text-zinc-500">
        <span className="size-1.5 rounded-full bg-zinc-400 animate-pulse" />
        Nouvelle tentative dans 3 s…
      </span>
    );
  }
  return (
    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 t-small-medium rounded-md border border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400">
      <Icon name="arrow-right" className="size-3.5" /> Réessayer la requête
    </button>
  );
}

function FatalOops({ variantId }: { variantId: string }) {
  return (
    <div className="max-w-lg text-center">
      <Icon name="alert" className="size-10 text-zinc-700 mx-auto mb-4" />
      <h2 className="t-title-2 text-zinc-900 mb-3">Une erreur inattendue</h2>
      <p className="t-large-regular text-zinc-600 mb-6">L'Assistant a rencontré un problème.</p>
      <div className="flex justify-center gap-3">
        <button className="px-4 py-2 t-small-medium rounded-md border border-zinc-200 text-zinc-900">Recharger</button>
        <button className="px-4 py-2 t-small-medium rounded-md bg-zinc-900 text-white">Réessayer</button>
      </div>
      {variantId === '2' && (
        <pre className="mt-6 t-mono text-[11px] text-left bg-zinc-50 border border-zinc-200 rounded p-3 text-zinc-700">
{`Error: ScopedSearchFailed
  at sources.doctrine.search (doctrine:312)
  trace_id: 4b8-64fb-2026-05-25`}
        </pre>
      )}
    </div>
  );
}

function SourceChips({ optionId }: { optionId: string }) {
  // C6 — show only when source is enabled; default 1 selected source
  if (optionId === '2') {
    return (
      <div className="flex items-center gap-2 mb-2">
        <div className="inline-flex -space-x-1">
          <span className="size-5 rounded-full border-2 border-white bg-green-200 t-small-semibold text-green-900 inline-flex items-center justify-center">S</span>
          <span className="size-5 rounded-full border-2 border-white bg-blue-200 t-small-semibold text-blue-900 inline-flex items-center justify-center">D</span>
        </div>
        <span className="t-small-regular text-zinc-500">2 sources actives</span>
      </div>
    );
  }
  if (optionId === '3') {
    return <p className="t-small-regular text-zinc-500 mb-2">2 sources actives</p>;
  }
  // current — single chip
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-100 t-small-regular text-zinc-700">
        <span className="inline-flex items-center justify-center size-4 rounded bg-emerald-100 text-emerald-700 t-small-semibold">S</span>
        Sharepoint
        <button className="t-small-regular text-zinc-500 hover:text-zinc-900 ml-0.5">×</button>
      </span>
    </div>
  );
}

function Composer({
  c1, c1State, c2, c3, c4, c7, c8, c8State,
}: {
  c1: string; c1State?: string;
  c2: string; c3: string; c4: string; c7: string; c8: string; c8State?: string;
}) {
  const placeholder =
    c1 === '2' ? 'Tapez @ pour mentionner…' :
    c1 === '3' ? 'Posez une question complète. Exemple : "Le fait d\'organiser des points hebdomadaires peut-il être qualifié de harcèlement ?"' :
    'Poser une question à l\'IA, tapez @ pour référencer un document ou faire une action';

  return (
    <div className="rounded-xl border border-zinc-300 bg-white p-3 focus-within:border-zinc-900 transition-colors">
      <textarea
        className="w-full t-large-regular text-zinc-900 placeholder:text-zinc-400 outline-none resize-none bg-transparent"
        rows={c1 === '3' ? 3 : 2}
        placeholder={placeholder}
        disabled={c1State === 'disabled'}
      />
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {/* C2 + button */}
          {c2 !== '3' && (
            <button className="inline-flex items-center justify-center size-7 rounded border border-zinc-200 text-zinc-700 hover:border-zinc-400">
              <Icon name="plus" className="size-4" />
            </button>
          )}
          {/* C3 Sources button */}
          {c3 !== 'removed' && (
            <button className="inline-flex items-center gap-1.5 px-2 py-1 t-small-medium text-zinc-700 hover:bg-zinc-50 rounded">
              <Icon name="scales" className="size-3.5 text-zinc-500" />
              Sources
              {c3 === '3' && <span className="t-small-regular text-zinc-400 ml-0.5">· 2</span>}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* C7 mic */}
          {c7 !== '3' && (
            <button
              className={
                'inline-flex items-center justify-center size-7 rounded border ' +
                (c7 === '2' ? 'border-red-400 text-red-600 bg-red-50 animate-pulse' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400')
              }
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
            </button>
          )}
          {/* C8 send */}
          <SendButton optionId={c8} stateId={c8State} />
        </div>
      </div>
      {/* C4 / C5 dropdowns are stylized as static visual hints; on a real implementation they'd open */}
      {c4 === '2' && <SourcesFlatPreview />}
      {c4 === '3' && <SourcesSearchPreview />}
    </div>
  );
}

function SendButton({ optionId, stateId }: { optionId: string; stateId?: string }) {
  if (optionId === '3') {
    return (
      <button className="px-3 h-7 t-small-medium rounded bg-zinc-900 text-white">
        Envoyer
      </button>
    );
  }
  if (optionId === '2') {
    return (
      <button className="inline-flex items-center justify-center size-8 rounded-md bg-zinc-900 text-white hover:bg-zinc-800">
        <Icon name="arrow-up" className="size-4" />
      </button>
    );
  }
  // current — outlined
  const idle = stateId === 'idle' || !stateId;
  return (
    <button
      className={
        'inline-flex items-center justify-center size-7 rounded border ' +
        (idle ? 'border-zinc-200 text-zinc-400' : 'border-zinc-900 text-zinc-900 hover:bg-zinc-50')
      }
    >
      <Icon name="arrow-up" className="size-3.5" />
    </button>
  );
}

function SourcesFlatPreview() {
  return (
    <div className="mt-2 grid grid-cols-2 gap-1 p-2 border border-zinc-100 rounded text-[11px] text-zinc-500">
      <span>○ Doctrine</span><span>● Sharepoint</span>
      <span>○ KB</span><span>○ Google Drive</span>
    </div>
  );
}

function SourcesSearchPreview() {
  return (
    <div className="mt-2 p-2 border border-zinc-100 rounded">
      <input type="text" placeholder="Filtrer les sources…" className="w-full t-small-regular text-zinc-700 outline-none placeholder:text-zinc-400" />
    </div>
  );
}

function Disclaimer({ optionId }: { optionId: string }) {
  if (optionId === '3') return null;
  if (optionId === '2') {
    return (
      <p className="t-small-regular text-zinc-400 text-center mt-3">
        ℹ︎ Peut faire des erreurs
      </p>
    );
  }
  return (
    <p className="t-small-regular text-zinc-400 text-center mt-3">
      L'assistant peut faire des erreurs. Vérifiez les informations importantes.
    </p>
  );
}
