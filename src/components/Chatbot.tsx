import { useChatbot } from '../chatbot/store';
import { EmptyState } from './EmptyState';
import { Conversation } from './Conversation';
import { ComposerBar } from './ComposerBar';
import { ConversationHeader } from './ConversationHeader';
import { UpgradeModal } from './UpgradeModal';
import { WatcherModal } from './WatcherCreation';
import { PromoTour, PromoVideoModal, PromoWhatsNew } from './FeaturePromotion';
import { DocSurface, MobileSurface } from './Surfaces';
import { SurfaceScope } from './SurfaceScope';

/**
 * The chatbot canvas — the real prototype (header + content). The Composer/Answer
 * preview toggle is a designer setting and lives in the left panel, not here.
 * The Surface control (full screen / doc panel / mobile) swaps the container;
 * the primitives are the same everywhere.
 */
export function Chatbot() {
  const view = useChatbot((s) => s.viewMode);
  const surface = useChatbot((s) => s.surface);
  const a0Sticky = useChatbot((s) => s.primitives.A0?.visible);

  return (
    <div className="relative flex-1 flex flex-col min-h-0 bg-zinc-50">
      {surface === 'doc' ? (
        <DocSurface />
      ) : surface === 'mobile' ? (
        <MobileSurface />
      ) : (
        <SurfaceScope className="flex-1 min-h-0 flex flex-col bg-white">
          <ConversationHeader />

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
                <div className={'max-w-3xl mx-auto px-3 pb-4 @2xl/surface:px-6 ' + (a0Sticky ? 'pt-0' : 'pt-2')}>
                  <ComposerBar />
                </div>
              </div>
            </>
          )}
        </SurfaceScope>
      )}
      <UpgradeModal />
      <WatcherModal />
      {/* E5 — Feature promotion overlays: tour + demo player + what's-new panel. */}
      <PromoTour />
      <PromoVideoModal />
      <PromoWhatsNew />
    </div>
  );
}
