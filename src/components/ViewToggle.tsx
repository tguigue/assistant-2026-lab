import { useChatbot } from '../chatbot/store';

export function ViewToggle() {
  const view = useChatbot((s) => s.view);
  const setView = useChatbot((s) => s.setView);

  return (
    <div className="h-10 shrink-0 border-b border-zinc-200 bg-white flex items-center justify-center gap-1 px-4">
      <div className="inline-flex rounded-md border border-zinc-200 bg-zinc-50 p-0.5">
        <button
          onClick={() => setView('catalog')}
          className={
            'h-7 px-3 t-small-medium rounded-[5px] ' +
            (view === 'catalog'
              ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200'
              : 'text-zinc-500 hover:text-zinc-900')
          }
        >
          Catalog
        </button>
        <button
          onClick={() => setView('chatbot')}
          className={
            'h-7 px-3 t-small-medium rounded-[5px] ' +
            (view === 'chatbot'
              ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200'
              : 'text-zinc-500 hover:text-zinc-900')
          }
        >
          Chatbot
        </button>
      </div>
      <span className="t-small-regular text-zinc-400 ml-3">
        {view === 'catalog' ? 'Inventaire des primitives' : 'Le chatbot composé'}
      </span>
    </div>
  );
}
