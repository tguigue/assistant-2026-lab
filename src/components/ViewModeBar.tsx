import { useChatbot, type ViewMode } from '../chatbot/store';

const MODES: { id: ViewMode; label: string; hint: string }[] = [
  { id: 'empty', label: 'Composer',  hint: 'État vide — composer seul' },
  { id: 'full',  label: 'Answer', hint: 'Conversation — composer + réponse' },
];

export function ViewModeBar() {
  const mode = useChatbot((s) => s.viewMode);
  const setMode = useChatbot((s) => s.setViewMode);

  return (
    <div className="flex justify-center pt-4 px-4 shrink-0">
      <div className="inline-flex items-center gap-0.5 p-1 rounded-full bg-white border border-zinc-200 shadow-sm">
        {MODES.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              title={m.hint}
              aria-pressed={active}
              className={
                'h-7 px-3 rounded-full t-small-medium transition-colors ' +
                (active ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900')
              }
            >
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
