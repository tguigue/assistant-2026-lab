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
  const e2 = e2v.visible ? e2v.variant : 'hidden';
  const e3 = e3v.visible ? e3v.variant : 'hidden';
  const e4variant = e4v.visible ? e4v.variant : 'hidden';
  const e4content = e4v.content ?? 'conversations';

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 py-10 gap-6">
      <h1 className="t-h1-semibold text-zinc-900 text-center">Que voulez-vous faire aujourd'hui&nbsp;?</h1>
      <div className="w-full max-w-3xl">
        <ComposerBar />
      </div>
      <PrimitiveSlot code="E3" block><QuickActions variant={e3} /></PrimitiveSlot>
      <PrimitiveSlot code="E2" block><SuggestedPrompts variant={e2} /></PrimitiveSlot>
      <PrimitiveSlot code="E4" block><History variant={e4variant} content={e4content} /></PrimitiveSlot>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-2xl">
        {PROMPTS.map((p) => (
          <button
            key={p}
            className="text-left px-4 py-3 rounded-md border border-zinc-200 bg-white t-base-regular text-zinc-700 hover:border-zinc-400 hover:text-zinc-900"
          >
            {p}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <ol className="space-y-1.5 t-base-regular text-zinc-700 list-decimal pl-6 max-w-xl">
        {PROMPTS.map((p) => (
          <li key={p}>
            <button className="hover:text-zinc-900 underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-900 text-left">
              {p}
            </button>
          </li>
        ))}
      </ol>
    );
  }

  // chips (default)
  return (
    <div className="flex flex-wrap gap-1.5 justify-center max-w-2xl">
      {PROMPTS.map((p) => (
        <button
          key={p}
          className="px-3 py-1.5 rounded-full border border-zinc-200 bg-white t-small-medium text-zinc-700 hover:border-zinc-400"
        >
          {p.length > 48 ? p.slice(0, 46) + '…' : p}
        </button>
      ))}
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

function History({ variant, content }: { variant: string; content: string }) {
  if (variant === 'hidden') return null;

  const items = HISTORY_DATA[content as keyof typeof HISTORY_DATA] ?? HISTORY_DATA.conversations;
  const label = HISTORY_LABELS[content] ?? 'Récents';

  if (variant === 'cards') {
    return (
      <div className="w-full max-w-xl">
        <div className="t-micro text-zinc-500 mb-2 text-center">{label}</div>
        <div className="grid grid-cols-1 gap-2">
          {items.map((item) => (
            <button
              key={item.title}
              className="text-left px-4 py-3 rounded-md border border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50"
            >
              <div className="t-base-regular text-zinc-800 truncate">{item.title}</div>
              <div className="t-small-regular text-zinc-400 mt-0.5">{item.meta}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // list (default)
  return (
    <div className="w-full max-w-xl">
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
}

/* -------------------- E3 — Quick Actions -------------------- */
const ACTIONS = [
  { id: 'research', icon: 'search',   label: 'Recherche',  desc: 'Caselaw + codes' },
  { id: 'draft',    icon: 'pen',      label: 'Rédaction',  desc: 'Contrat ou conclusions' },
  { id: 'extract',  icon: 'list',     label: 'Extraction', desc: 'Obligations d\'un doc' },
  { id: 'counsel',  icon: 'scales',   label: 'Counsel',    desc: 'Stratégie contentieuse' },
];

function QuickActions({ variant }: { variant: string }) {
  if (variant === 'hidden') return null;

  if (variant === 'icons') {
    return (
      <div className="flex items-center gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            title={a.label}
            className="size-9 rounded-md border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-900 grid place-items-center"
          >
            <Icon name={a.icon} className="size-4" />
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'verbose') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full max-w-3xl">
        {ACTIONS.map((a) => (
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
    );
  }

  // labeled (pills)
  return (
    <div className="flex flex-wrap items-center gap-1.5 justify-center">
      {ACTIONS.map((a) => (
        <button
          key={a.id}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 bg-white t-small-medium text-zinc-700 hover:border-zinc-400"
        >
          <Icon name={a.icon} className="size-3.5" />
          {a.label}
        </button>
      ))}
    </div>
  );
}

