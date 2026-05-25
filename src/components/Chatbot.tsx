import { useChatbot } from '../chatbot/store';
import { EmptyState } from './EmptyState';
import { Conversation } from './Conversation';
import { ComposerBar } from './ComposerBar';
import { MatterBanner } from './MatterBanner';
import { ViewModeBar } from './ViewModeBar';
import { SCENARIOS } from '../chatbot/scenarios';

/**
 * The chatbot canvas.
 * Two modes:
 *   - empty: greeting + composer, no conversation
 *   - full:  composer + conversation
 */
export function Chatbot() {
  const comp = useChatbot((s) => s.comp);
  const view = useChatbot((s) => s.viewMode);
  const scenario = SCENARIOS[comp.scenario];
  const hasMatter = comp.params.matter !== 'none';

  const statusLabels: Record<typeof view, string> = {
    empty: "État vide — greeting + composer",
    full:  "Conversation en cours — composer + réponse",
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-zinc-50">
      <ViewModeBar />
      <div className="text-center pt-2 pb-3 t-small-regular text-zinc-500">
        {statusLabels[view]}
      </div>

      <div className="flex-1 min-h-0 flex flex-col bg-white">
        {hasMatter && <MatterBanner />}

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
          {view === 'empty' ? <EmptyState /> : <Conversation />}
        </div>

        <div className="shrink-0 border-t border-zinc-100 bg-white">
          <div className="max-w-3xl mx-auto px-6 py-4">
            <ComposerBar />
            <p className="t-small-regular text-zinc-400 text-center mt-2">
              L'assistant peut faire des erreurs. Vérifiez les informations importantes.
            </p>
          </div>
        </div>
      </div>

      <FooterContext scenario={scenario.title} mode={view} />
    </div>
  );
}

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
