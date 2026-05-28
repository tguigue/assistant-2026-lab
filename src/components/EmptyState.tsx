import { useChatbot } from '../chatbot/store';
import { Icon } from './ui';
import { ComposerBar } from './ComposerBar';
import { PrimitiveSlot } from './PrimitiveSlot';

/**
 * Empty state — composed of primitives:
 *   E2 Suggested Prompts · E3 Quick Actions · E4 History
 * Every variant produces a visible change. Order is fixed; visibility per primitive.
 */
export function EmptyState() {
  const e2v = useChatbot((s) => s.primitives.E2);
  const e3v = useChatbot((s) => s.primitives.E3);
  const e4v = useChatbot((s) => s.primitives.E4);
  const e5v = useChatbot((s) => s.primitives.E5);
  const e2 = e2v.visible ? e2v.variant : 'hidden';
  const e3 = e3v.visible ? e3v.variant : 'hidden';
  const e4variant = e4v.visible ? e4v.variant : 'hidden';
  const e5 = e5v.visible ? e5v.variant : 'hidden';
  const e3tools = Array.isArray(e3v.content) ? e3v.content : ['exemples', 'extraire', 'traduire', 'analyser', 'comparer'];
  const e4contentSet = Array.isArray(e4v.content) ? e4v.content : ['conversations'];

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 py-10 gap-6">
      <h1 className="t-title-3 text-zinc-900 text-center">Que voulez-vous faire aujourd'hui&nbsp;?</h1>
      <div className="w-full max-w-3xl">
        <ComposerBar />
      </div>
      <PrimitiveSlot code="E3" block><QuickActions variant={e3} selectedTools={e3tools} /></PrimitiveSlot>
      <div className="w-full max-w-3xl">
        <PrimitiveSlot code="E5" block><SuggestedMatters variant={e5} /></PrimitiveSlot>
      </div>
      {/* Wrap in a plain block so primitives stretch to the composer's width — a bare
          PrimitiveSlot is an items-center flex child and would shrink to content. */}
      <div className="w-full max-w-3xl">
        <PrimitiveSlot code="E2" block><SuggestedPrompts variant={e2} /></PrimitiveSlot>
      </div>
      <div className="w-full max-w-3xl">
        <PrimitiveSlot code="E4" block><History variant={e4variant} contentSet={e4contentSet} /></PrimitiveSlot>
      </div>
    </div>
  );
}

/* -------------------- E5 — Suggested Matters --------------------
   Matters surfaced in the empty state. Same color avatars as ComposerBar
   so the visual identity of a matter is consistent across the app. */
const SUGGESTED_MATTERS: { id: string; label: string; meta: string; tint: string }[] = [
  { id: 'matter-moreau',  label: 'Moreau c/ SAS Aurelia',          meta: '2024-018 · ouvert hier',          tint: 'bg-gradient-to-br from-emerald-200 to-cyan-300' },
  { id: 'matter-aurelia', label: 'Aurelia — Politique RH 2024',    meta: '2024-037 · 3 jours',              tint: 'bg-gradient-to-br from-indigo-300 to-violet-400' },
  { id: 'matter-cabinet', label: 'Cabinet — Encadrement managérial', meta: 'interne · semaine dernière',      tint: 'bg-gradient-to-br from-amber-200 to-orange-300' },
  { id: 'matter-pernod',  label: 'Pernod Ricard — Distribution',   meta: '2024-022 · 4 jours',              tint: 'bg-gradient-to-br from-fuchsia-300 to-pink-300' },
  { id: 'matter-leroy',   label: 'Leroy c/ Merlin',                meta: '2024-009 · semaine dernière',     tint: 'bg-gradient-to-br from-sky-300 to-blue-400' },
];

function SuggestedMatters({ variant }: { variant: string }) {
  if (variant === 'hidden') return null;
  const toggleContent = useChatbot((s) => s.togglePrimitiveContent);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  const content = useChatbot((s) => s.primitives.C6.content);
  const active = Array.isArray(content) ? content : [];

  const pick = (id: string) => {
    if (!active.includes(id)) toggleContent('C6', id);
    setVisible('C6', true);
  };

  if (variant === 'rows') {
    return (
      <div className="w-full">
        <div className="t-micro text-zinc-500 mb-2 text-center">Dossiers suggérés</div>
        <ul className="rounded-md border border-zinc-200 divide-y divide-zinc-100 bg-white">
          {SUGGESTED_MATTERS.map((m) => (
            <li key={m.id}>
              <button onClick={() => pick(m.id)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 text-left">
                <span className={'inline-block rounded-full size-3.5 shrink-0 ' + m.tint} />
                <span className="flex-1 t-base-regular text-zinc-800 truncate">{m.label}</span>
                <span className="t-small-regular text-zinc-400 shrink-0">{m.meta}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // avatars (default) — colored disc + label, wrapped grid
  return (
    <div className="w-full">
      <div className="t-micro text-zinc-500 mb-2 text-center">Dossiers suggérés</div>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {SUGGESTED_MATTERS.map((m) => (
          <button
            key={m.id}
            onClick={() => pick(m.id)}
            title={m.meta}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-white t-small-medium text-zinc-800 hover:border-zinc-400"
          >
            <span className={'inline-block rounded-full size-3 shrink-0 ' + m.tint} />
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* -------------------- E2 — Suggested Prompts -------------------- */
const PROMPTS = [
  'Le harcèlement managérial est-il caractérisé par des points hebdo ?',
  'Rédige un contrat de prestation d\'architecte avec clauses spécifiques',
  'Trouve-moi des jurisprudences confirmant le rejet de la demande',
  'Quelles obligations communes dans les contrats Leroy c/ Merlin ?',
];

function SuggestedPrompts({ variant }: { variant: string }) {
  if (variant === 'hidden') return null;

  if (variant === 'cards') {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="t-micro text-zinc-500 mb-2 text-center">Prompts suggérés</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {PROMPTS.map((p) => (
            <button
              key={p}
              className="text-left px-4 py-3 rounded-md border border-zinc-200 bg-white t-base-regular text-zinc-700 hover:border-zinc-400 hover:text-zinc-900"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // rows (default) — bordered, divided list, matching History
  return (
    <div className="w-full">
      <div className="t-micro text-zinc-500 mb-2 text-center">Prompts suggérés</div>
      <ul className="rounded-md border border-zinc-200 divide-y divide-zinc-100 bg-white">
        {PROMPTS.map((p) => (
          <li key={p}>
            <button className="w-full text-left px-4 py-2.5 t-base-regular text-zinc-800 hover:bg-zinc-50">
              {p}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------- E4 — History -------------------- */
const HISTORY_DATA = {
  conversations: [
    { title: 'Vice caché — délai biennal', meta: 'Hier · 14:22' },
    { title: 'Contrat MOP — articles obligatoires', meta: 'Hier · 11:05' },
    { title: 'Licenciement Moreau — moyens', meta: '3 mai · 16:40' },
  ],
  documents: [
    { title: 'Conclusions_def_Moreau.pdf', meta: 'Hier · 09:14 · 42 pages' },
    { title: 'Contrat_architecte_v3.docx', meta: '3 mai · 17:02 · 8 pages' },
    { title: 'PV_AG_2024.pdf', meta: '2 mai · 11:30 · 15 pages' },
  ],
  matters: [
    { title: 'Leroy c/ Merlin', meta: 'Modifié hier · 3 docs' },
    { title: 'Moreau — Licenciement', meta: 'Modifié 3 mai · 7 docs' },
    { title: 'Succession Dupont', meta: 'Modifié 2 mai · 2 docs' },
  ],
};

const HISTORY_LABELS: Record<string, string> = {
  conversations: 'Conversations récentes',
  documents: 'Documents récents',
  matters: 'Dossiers récents',
};

function History({ variant, contentSet }: { variant: string; contentSet: string[] }) {
  if (variant === 'hidden' || contentSet.length === 0) return null;

  return (
    <div className="w-full max-w-3xl flex flex-col gap-4">
      {contentSet.map((content) => {
        const items = HISTORY_DATA[content as keyof typeof HISTORY_DATA] ?? [];
        const label = HISTORY_LABELS[content] ?? 'Récents';
        return (
          <div key={content}>
            <div className="t-micro text-zinc-500 mb-2 text-center">{label}</div>
            <ul className="rounded-md border border-zinc-200 divide-y divide-zinc-100 bg-white">
              {items.map((item) => (
                <li key={item.title} className="px-4 py-2.5 flex items-center justify-between hover:bg-zinc-50">
                  <span className="t-base-regular text-zinc-800 truncate">{item.title}</span>
                  <span className="t-small-regular text-zinc-400 shrink-0 ml-3">{item.meta}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------- E3 — Quick Actions -------------------- */
const ACTIONS = [
  { id: 'exemples', icon: 'sparkles',  label: 'Exemples de prompt', desc: 'Idées de requêtes' },
  { id: 'extraire', icon: 'table',     label: 'Extraire',           desc: 'Données structurées d\'un doc' },
  { id: 'traduire', icon: 'languages', label: 'Traduire',           desc: 'Traduire un document' },
  { id: 'analyser', icon: 'scan',      label: 'Analyser',           desc: 'Analyse d\'un document' },
  { id: 'comparer', icon: 'columns',   label: 'Comparer',           desc: 'Comparer des documents' },
];

function QuickActions({ variant, selectedTools }: { variant: string; selectedTools: string[] }) {
  if (variant === 'hidden') return null;

  const actions = ACTIONS.filter((a) => selectedTools.includes(a.id));
  if (actions.length === 0) return null;

  if (variant === 'verbose') {
    return (
      <div className="w-full max-w-3xl">
        <div className="t-micro text-zinc-500 mb-2 text-center">Outils suggérés</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {actions.map((a) => (
            <button
              key={a.id}
              className="text-left p-3 rounded-md border border-zinc-200 bg-white hover:border-zinc-400"
            >
              <Icon name={a.icon} className="size-4 text-zinc-700 mb-1.5" />
              <div className="t-small-semibold text-zinc-900">{a.label}</div>
              <div className="t-small-regular text-zinc-500">{a.desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // labeled (pills)
  return (
    <div className="w-full">
      <div className="t-micro text-zinc-500 mb-2 text-center">Outils suggérés</div>
      <div className="flex flex-wrap items-center gap-1.5 justify-center">
      {actions.map((a) => (
        <button
          key={a.id}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 bg-white t-small-medium text-zinc-700 hover:border-zinc-400"
        >
          <Icon name={a.icon} className="size-3.5" />
          {a.label}
        </button>
      ))}
      </div>
    </div>
  );
}

