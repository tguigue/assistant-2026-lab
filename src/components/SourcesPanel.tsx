import { useChatbot } from '../chatbot/store';

type Group = {
  name: string;
  items: string[];
};

const GROUPS: Group[] = [
  {
    name: 'Juridictions',
    items: [
      'Tribunal judiciaire / TGI',
      'Tribunal de commerce / TAE',
      "Cour d'appel",
      'Tribunal administratif',
      'Cour de cassation',
      "Cour administrative d'appel",
    ],
  },
  {
    name: 'Codes',
    items: [
      'Code civil',
      'Code de commerce',
      'Code de déontologie des architectes',
      'Code de justice administrative',
      'Code de justice militaire (nouveau)',
      'Code de la commande publique',
    ],
  },
];

export function SourcesPanel() {
  const open = useChatbot((s) => s.sourcesPanelOpen);
  const setOpen = useChatbot((s) => s.setSourcesPanelOpen);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setOpen(false)} />
      <aside className="fixed top-0 right-0 h-screen w-[420px] bg-white border-l border-zinc-200 shadow-xl z-40 flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-3">
          <h2 className="t-h2-semibold text-zinc-900">Sources</h2>
          <button
            onClick={() => setOpen(false)}
            className="size-7 rounded hover:bg-zinc-100 grid place-items-center text-zinc-500 hover:text-zinc-900"
            aria-label="Fermer"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {GROUPS.map((group, idx) => (
            <div key={group.name} className={idx > 0 ? 'mt-2 pt-4 border-t border-zinc-200' : 'pt-2 border-t border-zinc-200'}>
              <label className="flex items-center gap-3 py-2 cursor-pointer">
                <input type="checkbox" className="size-4 rounded border-zinc-300" />
                <span className="t-large-regular text-zinc-900">{group.name}</span>
              </label>
              <ul className="pl-7">
                {group.items.map((item) => (
                  <li key={item}>
                    <label className="flex items-center gap-3 py-1.5 cursor-pointer">
                      <input type="checkbox" className="size-4 rounded border-zinc-300" />
                      <span className="t-base-regular text-zinc-700">{item}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <button className="pl-7 pt-1 t-small-medium text-blue-600 hover:text-blue-700">Plus</button>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
