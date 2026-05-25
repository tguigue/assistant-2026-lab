import { useChatbot } from '../chatbot/store';
import { EmptyState } from './EmptyState';
import { Conversation } from './Conversation';
import { ComposerBar } from './ComposerBar';
import { MatterBanner } from './MatterBanner';
import { ViewModeBar } from './ViewModeBar';

/**
 * The chatbot canvas.
 * Two modes:
 *   - empty: greeting + composer, no conversation
 *   - full:  composer + conversation
 */
export function Chatbot() {
  const comp = useChatbot((s) => s.comp);
  const view = useChatbot((s) => s.viewMode);
  const hasMatter = comp.params.matter !== 'none';

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-zinc-50">
      <ViewModeBar />

      <div className="flex-1 min-h-0 flex flex-col bg-white">
        {hasMatter && <MatterBanner />}

        {view === 'empty' ? (
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
            <EmptyState />
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
              <Conversation />
            </div>
            <div className="shrink-0">
              <div className="max-w-3xl mx-auto px-6 pb-4 pt-2">
                <ComposerBar />
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
