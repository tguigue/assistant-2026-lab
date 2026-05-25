import { useChatbot } from '../chatbot/store';
import { EmptyState } from './EmptyState';
import { Conversation } from './Conversation';
import { ComposerBar } from './ComposerBar';
import { MatterBanner } from './MatterBanner';
import { ViewModeBar } from './ViewModeBar';
import { SCENARIOS } from '../chatbot/scenarios';

/**
 * The chatbot canvas — reacts to view mode:
 *  - full     → composer + conversation (or empty state)
 *  - empty    → empty state with composer (forces conversationVisible=false)
 *  - composer → only the composer, isolated
 *  - answer   → only the assistant response (no composer, no input)
 *  - sources  → citations + reasoning visible in isolation
 */
export function Chatbot() {
  const comp = useChatbot((s) => s.comp);
  const view = useChatbot((s) => s.viewMode);
  const scenario = SCENARIOS[comp.scenario];
  const hasMatter = comp.params.matter !== 'none';

  // Status label below the bar — gives context for the focus mode
  const statusLabels: Record<typeof view, string> = {
    full:     "Vue complète — composer + réponse",
    empty:    "État vide — avant la première question",
    composer: "Composer isolé — zone de saisie en focus",
    answer:   "Réponse isolée — sortie de l'Assistant en focus",
    sources:  "Sources isolées — citations et provenance",
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-zinc-50">
      <ViewModeBar />
      <div className="text-center pt-2 pb-3 t-small-regular text-zinc-500">
        {statusLabels[view]}
      </div>

      <div className="flex-1 min-h-0 flex justify-center overflow-y-auto scrollbar-thin px-4 pb-6">
        <div
          className={
            'w-full max-w-3xl bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col min-h-0 my-2 ' +
            (view === 'composer' || view === 'answer' || view === 'sources' ? 'self-center' : '')
          }
        >
          {hasMatter && view !== 'composer' && view !== 'sources' && <MatterBanner />}

          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
            {view === 'composer' && <ComposerFocus />}
            {view === 'answer' && <AnswerFocus />}
            {view === 'sources' && <SourcesFocus />}
            {view === 'empty' && (
              <div className="flex-1 flex flex-col">
                <EmptyState />
              </div>
            )}
            {view === 'full' && (comp.conversationVisible ? <Conversation /> : <EmptyState />)}
          </div>

          {(view === 'full' || view === 'empty') && (
            <div className="shrink-0 border-t border-zinc-100 bg-white">
              <div className="max-w-3xl mx-auto px-6 py-4">
                <ComposerBar />
                <p className="t-small-regular text-zinc-400 text-center mt-2">
                  L'assistant peut faire des erreurs. Vérifiez les informations importantes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <FooterContext scenario={scenario.title} mode={view} />
    </div>
  );
}

/* ---------- Composer focus ---------- */
function ComposerFocus() {
  return (
    <div className="px-8 py-16 flex flex-col items-center justify-center min-h-full">
      <div className="t-micro text-zinc-400 mb-3">Composer · zone de saisie</div>
      <div className="w-full max-w-2xl">
        <ComposerBar />
        <p className="t-small-regular text-zinc-400 text-center mt-2">
          L'assistant peut faire des erreurs. Vérifiez les informations importantes.
        </p>
      </div>
      <p className="t-small-regular text-zinc-500 italic mt-8 max-w-md text-center">
        Toutes les variantes liées au composer (C1–C8) modifient l'apparence
        ci-dessus en temps réel.
      </p>
    </div>
  );
}

/* ---------- Answer focus ---------- */
function AnswerFocus() {
  return (
    <div className="px-8 py-10">
      <div className="t-micro text-zinc-400 mb-4 text-center">Response · réponse de l'Assistant</div>
      <Conversation />
    </div>
  );
}

/* ---------- Sources focus ---------- */
function SourcesFocus() {
  const comp = useChatbot((s) => s.comp);
  const scenario = SCENARIOS[comp.scenario];
  const p = comp.params;
  const all = Object.values(scenario.citations).filter((c) => {
    if (c.source === 'doctrine' && !p.doctrine) return false;
    if (c.source === 'kb' && !p.kb) return false;
    if (c.source === 'clausier' && !p.clausier) return false;
    if (c.source === 'matter' && p.matter === 'none') return false;
    return true;
  });
  const external = all.filter((c) => c.kind === 'external');
  const internal = all.filter((c) => c.kind === 'internal');

  return (
    <div className="px-8 py-10 max-w-2xl mx-auto">
      <div className="t-micro text-zinc-400 mb-4">Sources & provenance · A5 / A7</div>

      <div className="space-y-3 mb-8">
        {external.length > 0 && (
          <details open className="rounded-md border border-zinc-200 bg-zinc-50">
            <summary className="flex items-center gap-3 px-4 py-2.5 cursor-pointer list-none">
              <span className="size-2 rounded-full bg-zinc-300 border border-zinc-400" />
              <span className="t-micro text-zinc-700">Sources Doctrine</span>
              <span className="ml-auto t-small-regular text-zinc-400 tabular-nums">{external.length}</span>
            </summary>
            <ul className="px-4 pb-3 space-y-1 t-small-regular text-zinc-600">
              {external.map((c) => <li key={c.label}>· {c.full}</li>)}
            </ul>
          </details>
        )}
        {internal.length > 0 && (
          <details open className="rounded-md border border-zinc-200 bg-zinc-50">
            <summary className="flex items-center gap-3 px-4 py-2.5 cursor-pointer list-none">
              <span className="size-2 rounded-full bg-zinc-900" />
              <span className="t-micro text-zinc-700">Sources internes</span>
              <span className="ml-auto t-small-regular text-zinc-400 tabular-nums">{internal.length}</span>
            </summary>
            <ul className="px-4 pb-3 space-y-1 t-small-regular text-zinc-600">
              {internal.map((c) => <li key={c.label}>· {c.full}</li>)}
            </ul>
          </details>
        )}
      </div>

      <div className="border-t border-zinc-100 pt-6">
        <div className="t-micro text-zinc-500 mb-3">Citations inline</div>
        <p className="t-legal-large text-zinc-900">
          Selon une jurisprudence constante <a className="cite-pill">Cass. soc. · 10 nov. 2009</a>,
          la simple organisation de points hebdomadaires ne caractérise pas en soi un harcèlement
          moral. Votre mémo interne <a className="cite-pill cite-pill--internal">Mémo · Encadrement 2024</a> rejoint
          cette analyse.
        </p>
      </div>
    </div>
  );
}

/* ---------- Footer context ---------- */
function FooterContext({ scenario, mode }: { scenario: string; mode: string }) {
  return (
    <div className="shrink-0 border-t border-zinc-200 bg-white px-4 h-8 flex items-center justify-between t-small-regular text-zinc-500">
      <div className="t-mono">
        scenario: <span className="text-zinc-900">{scenario}</span>
      </div>
      <div className="t-mono">
        view: <span className="text-zinc-900">{mode}</span>
      </div>
    </div>
  );
}
