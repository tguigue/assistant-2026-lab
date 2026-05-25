import { useEffect, useRef, useState } from 'react';
import { useChatbot } from '../chatbot/store';
import { SCENARIOS } from '../chatbot/scenarios';
import { SCENARIO_IDS, type ScenarioId } from '../chatbot/types';

/**
 * Empty state — matches the real Doctrine product:
 *   Centered "Assistant" hero
 *   Tagline
 *   "Voir les conseils" link → opens a small popover with example prompts
 *
 * No cards. The example prompts are secondary, behind a click.
 */
export function EmptyState() {
  const [tipsOpen, setTipsOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
      <h1 className="t-title-0 text-zinc-900 font-semibold">Assistant</h1>
      <p className="t-large-regular text-zinc-600 mt-3 text-center">
        Votre copilote juridique intelligent.
      </p>
      <div className="mt-1 relative">
        <button
          onClick={() => setTipsOpen((v) => !v)}
          className="t-large-regular text-zinc-800 underline underline-offset-2 hover:text-zinc-900"
        >
          Voir les conseils
        </button>
        {tipsOpen && <TipsPopover onClose={() => setTipsOpen(false)} />}
      </div>
    </div>
  );
}

function TipsPopover({ onClose }: { onClose: () => void }) {
  const setScenario = useChatbot((s) => s.setScenario);
  const showConv = useChatbot((s) => s.showConversation);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [onClose]);

  const pick = (id: ScenarioId) => {
    setScenario(id);
    showConv();
    onClose();
  };

  return (
    <div
      ref={ref}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[440px] bg-white border border-zinc-200 rounded-xl shadow-xl z-20 overflow-hidden"
    >
      <div className="px-4 pt-3 pb-2 t-micro text-zinc-500">
        Exemples de questions
      </div>
      <ul className="pb-2">
        {SCENARIO_IDS.map((id) => {
          const s = SCENARIOS[id];
          return (
            <li key={id}>
              <button
                onClick={() => pick(id)}
                className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex items-start gap-3 group"
              >
                <span className="t-mono t-small-medium tabular-nums text-zinc-400 mt-0.5">
                  {s.code}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="t-small-medium text-zinc-900 block">{s.title}</span>
                  <span className="font-legal italic t-small-regular text-zinc-500 line-clamp-1">
                    « {s.prompt} »
                  </span>
                </span>
                <span className="t-small-regular text-zinc-300 group-hover:text-zinc-700">→</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="px-4 py-2.5 border-t border-zinc-100 t-small-regular text-zinc-400 italic">
        Cliquez sur un exemple pour voir comment l'Assistant répond.
      </div>
    </div>
  );
}
