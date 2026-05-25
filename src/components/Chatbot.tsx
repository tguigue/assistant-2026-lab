import { useChatbot } from '../chatbot/store';
import { EmptyState } from './EmptyState';
import { Conversation } from './Conversation';
import { ComposerBar } from './ComposerBar';
import { MatterBanner } from './MatterBanner';

/**
 * The chatbot itself — looks like the real Doctrine Assistant.
 * Matter banner (if Matter=Selected) sits above the content;
 * Empty state OR Conversation fills the body;
 * Composer is anchored at the bottom.
 */
export function Chatbot() {
  const comp = useChatbot((s) => s.comp);
  const showConv = comp.conversationVisible;
  const hasMatter = comp.params.matter !== 'none';

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      {hasMatter && <MatterBanner />}

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin flex flex-col">
        {showConv ? <Conversation /> : <EmptyState />}
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
  );
}
