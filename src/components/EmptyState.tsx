import { useChatbot } from '../chatbot/store';
import { Icon } from './ui';
import { ComposerBar } from './ComposerBar';
import { PrimitiveSlot } from './PrimitiveSlot';

/**
 * Empty state — composed of 4 primitives:
 *   E1 Greeting · E2 Suggested Prompts · E3 Quick Actions · E4 Empty Hint
 * Every variant produces a visible change. Order is fixed; visibility per primitive.
 */
export function EmptyState() {
  const e2v = useChatbot((s) => s.primitives.E2);
  const e3v = useChatbot((s) => s.primitives.E3);
  const e2 = e2v.visible ? e2v.variant : 'hidden';
  const e3 = e3v.visible ? e3v.variant : 'hidden';

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 py-10 gap-6">
      <h1 className="t-h1-semibold text-zinc-900 text-center">Que voulez-vous faire aujourd'hui&nbsp;?</h1>
      <div className="w-full max-w-3xl">
        <ComposerBar />
      </div>
      <PrimitiveSlot code="E3" block><QuickActions variant={e3} /></PrimitiveSlot>
      <PrimitiveSlot code="E2" block><SuggestedPrompts variant={e2} /></PrimitiveSlot>
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
const RECENT = [
  { title: 'Vice caché — délai biennal', when: 'Hier · 14:22' },
  { title: 'Contrat MOP — articles obligatoires', when: 'Hier · 11:05' },
  { title: 'Licenciement Moreau — moyens', when: '3 mai · 16:40' },
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

  if (variant === 'recent') {
    return (
      <div className="w-full max-w-xl">
        <div className="t-micro text-zinc-500 mb-2 text-center">Reprendre une conversation</div>
        <ul className="rounded-md border border-zinc-200 divide-y divide-zinc-100 bg-white">
          {RECENT.map((r) => (
            <li key={r.title} className="px-4 py-2.5 flex items-center justify-between hover:bg-zinc-50">
              <span className="t-base-regular text-zinc-800 truncate">{r.title}</span>
              <span className="t-small-regular text-zinc-400 shrink-0 ml-3">{r.when}</span>
            </li>
          ))}
        </ul>
      </div>
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

