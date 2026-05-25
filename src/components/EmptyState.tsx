import { useChatbot } from '../chatbot/store';
import { SCENARIOS } from '../chatbot/scenarios';

/**
 * Centered hero matching the real Doctrine Assistant screenshots:
 *   "Assistant"
 *   "Votre copilote juridique intelligent."
 *   "Voir les conseils"
 * Plus 4 suggested prompts (the 4 Notion scenarios).
 */
export function EmptyState() {
  const setScenario = useChatbot((s) => s.setScenario);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <h1 className="t-title-0 text-zinc-900 font-semibold">Assistant</h1>
      <p className="t-large-regular text-zinc-600 mt-3 text-center">Votre copilote juridique intelligent.</p>
      <a href="#" className="t-large-regular text-zinc-800 mt-1 underline underline-offset-2 hover:text-zinc-900">Voir les conseils</a>

      <div className="mt-10 w-full max-w-2xl grid grid-cols-2 gap-2">
        {(['S1','S2','S3','S4'] as const).map((id) => {
          const s = SCENARIOS[id];
          return (
            <button
              key={id}
              onClick={() => setScenario(id)}
              className="text-left px-4 py-3 rounded-md border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="t-mono t-small-medium text-zinc-400 tabular-nums">{s.code}</span>
                <span className="t-small-medium text-zinc-900">{s.title}</span>
              </div>
              <p className="t-small-regular text-zinc-500 font-legal italic line-clamp-2">« {s.prompt} »</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
