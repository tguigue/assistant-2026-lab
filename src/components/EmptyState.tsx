import { useChatbot } from '../chatbot/store';
import { Icon } from './ui';
import { ComposerBar } from './ComposerBar';
import { PrimitiveSlot } from './PrimitiveSlot';
import { uploadSet, type Detection } from '../chatbot/uploadSets';

// Short matter names used in the greeting "…sur {name} ?".
const MATTER_GREETING_NAMES: Record<string, string> = {
  'leroy-merlin': 'Leroy c/ Merlin',
  moreau:         'Moreau c/ SAS Aurelia',
  aurelia:        'Aurelia — Politique RH',
  'acme-corp':    'Matter ACME Corp',
  pernod:         'Pernod Ricard',
};

/**
 * Empty state — composed of primitives:
 *   E2 Suggested Prompts · E3 Quick Actions · E4 History
 * Every variant produces a visible change. Order is fixed; visibility per primitive.
 */
export function EmptyState() {
  const e2v = useChatbot((s) => s.primitives.E2);
  const e3v = useChatbot((s) => s.primitives.E3);
  const e4v = useChatbot((s) => s.primitives.E4);
  const e6v = useChatbot((s) => s.primitives.E6);
  const c5set = useChatbot((s) => s.primitives.C5.axisVariants?.set);
  const e2 = e2v.visible ? e2v.variant : 'hidden';
  const e3 = e3v.visible ? e3v.variant : 'hidden';
  const e3source = e3v.axisVariants?.source ?? 'curated';
  const e4variant = e4v.visible ? e4v.variant : 'hidden';
  const e6 = e6v.visible ? e6v.variant : 'hidden';
  const e3tools = Array.isArray(e3v.content) ? e3v.content : ['exemples', 'extraire', 'traduire', 'analyser', 'comparer'];
  const e4contentSet = Array.isArray(e4v.content) ? e4v.content : ['conversations'];

  // Greeting reads the C8 matter scope: "…aujourd'hui ?" when unscoped,
  // "…sur {matter} ?" when scoped. Chassis, not a primitive.
  const matterScope = useChatbot((s) => s.primitives.C8.variant);
  const scopedName = matterScope !== 'idle' ? MATTER_GREETING_NAMES[matterScope] : null;

  // Demo mode pre-fills the composer with the use-case prompt; sending reveals the answer.
  const promptOverride = useChatbot((s) => s.promptOverride);
  const setViewMode = useChatbot((s) => s.setViewMode);

  // Is there browse content (History / Activity) to show below the composer?
  const hasBelow = (e4variant !== 'hidden' && e4contentSet.length > 0) || e6 !== 'hidden';
  const showE3 = e3 !== 'hidden';
  const showE2 = e2 !== 'hidden';

  return (
    <div
      className={
        'min-h-full flex flex-col items-center px-6 gap-12 ' +
        // No browse content → center the composer in the page.
        // With browse content → push the composer toward center with a top offset,
        //   then let the feed follow immediately (gap-6) instead of stranding the
        //   composer above a tall empty hero. Composer stays ~centered, feed sits
        //   right under it, rest revealed on a short scroll.
        (hasBelow ? 'justify-start pt-[26vh] pb-12' : 'justify-center py-10')
      }
    >
      <h1 className="t-title-3 text-zinc-900 text-center">
        {scopedName ? (
          <>Que voulez-vous faire sur <span className="font-semibold">{scopedName}</span>&nbsp;?</>
        ) : (
          <>Que voulez-vous faire aujourd'hui&nbsp;?</>
        )}
      </h1>
      <div className="w-full max-w-3xl">
        <ComposerBar seed={promptOverride ?? undefined} onSend={() => setViewMode('full')} />
      </div>
      {/* Each block renders only when visible — an empty wrapper would still add a
          gap-6 and bloat the spacing. */}
      {showE3 && (
        <div className="w-full max-w-3xl">
          <PrimitiveSlot code="E3" block>
            <SuggestedActions variant={e3} source={e3source} selectedTools={e3tools} detection={uploadSet(c5set).detection} />
          </PrimitiveSlot>
        </div>
      )}
      {showE2 && (
        <div className="w-full max-w-3xl">
          <PrimitiveSlot code="E2" block><SuggestedPrompts variant={e2} /></PrimitiveSlot>
        </div>
      )}
      {e4variant !== 'hidden' && e4contentSet.length > 0 && (
        <div className="w-full max-w-3xl">
          <PrimitiveSlot code="E4" block><History variant={e4variant} contentSet={e4contentSet} /></PrimitiveSlot>
        </div>
      )}
      {e6 !== 'hidden' && (
        <div className="w-full max-w-3xl">
          <PrimitiveSlot code="E6" block><ActivityFeed variant={e6} /></PrimitiveSlot>
        </div>
      )}
    </div>
  );
}

/* -------------------- E6 — Activity -------------------- */
const ACTIVITY: { who: string; tint: string; title: string; snippet: string; artifact?: { icon: string; label: string }; date: string }[] = [
  {
    who: 'Vous', tint: 'bg-gradient-to-br from-sky-300 to-blue-400',
    title: 'Analyser les 12 contrats de travail',
    snippet: 'je veux comparer ces contrats de travail en analysant le salaire, les clauses qui divergent',
    artifact: { icon: 'table', label: 'Analyse des contrats de travail' },
    date: '13 avril 2026',
  },
  {
    who: 'Audrey', tint: 'bg-gradient-to-br from-fuchsia-300 to-pink-300',
    title: 'Rédaction des conclusions en réponse',
    snippet: 'aide-moi à contrer les arguments de cette assignation. Je veux surtout axer autour de…',
    artifact: { icon: 'columns', label: 'Contre-arguments — Assignation_Leroy_12_12_2025' },
    date: '3 décembre 2025',
  },
  {
    who: 'Mehdi', tint: 'bg-gradient-to-br from-amber-200 to-orange-300',
    title: 'Analyser des sources citées',
    snippet: 'est-ce que les sources citées sont correctes ? Est-ce qu’il y a un écart entre ce que…',
    date: '24 novembre 2026',
  },
];

function ActivityFeed({ variant }: { variant: string }) {
  if (variant === 'hidden') return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="t-base-medium text-zinc-900">Activités sur le dossier</div>
        <div className="flex items-center gap-1 text-zinc-400">
          <span className="size-7 grid place-items-center rounded-md hover:bg-zinc-100 hover:text-zinc-700 cursor-pointer"><Icon name="search" className="size-4" /></span>
          <span className="size-7 grid place-items-center rounded-md hover:bg-zinc-100 hover:text-zinc-700 cursor-pointer"><Icon name="list" className="size-4" /></span>
        </div>
      </div>

      <div className="relative pl-5">
        <span className="absolute left-1 top-1.5 bottom-1.5 w-px bg-zinc-200" />
        {ACTIVITY.map((a, i) => (
          <div key={i} className="relative pb-3 last:pb-0">
            <span className="absolute -left-[15px] top-1.5 size-2 rounded-full bg-zinc-300 ring-2 ring-white" />
            <div className="t-small-regular text-zinc-400 mb-1.5">{a.date}</div>
            <div className="rounded-lg border border-zinc-200 bg-white p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={'inline-grid place-items-center size-5 rounded-full text-white text-[10px] font-semibold shrink-0 ' + a.tint}>{a.who[0]}</span>
                <span className="t-small-medium text-zinc-700">{a.who}</span>
              </div>
              <div className="t-base-medium text-zinc-900 leading-snug">{a.title}</div>
              <p className="t-small-regular text-zinc-500 leading-snug mt-0.5 line-clamp-1">{a.snippet}</p>
              {a.artifact && (
                <span className="inline-flex items-center gap-1.5 mt-2 h-7 px-2.5 rounded-md bg-zinc-100 t-small-medium text-zinc-700">
                  <Icon name={a.artifact.icon} className="size-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate max-w-[260px]">{a.artifact.label}</span>
                </span>
              )}
            </div>
          </div>
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
        <div className="t-base-medium text-zinc-900 mb-3">Prompts suggérés</div>
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

  // rows (default) — quiet divided list, same design as Follow-ups (A8)
  return (
    <div className="w-full">
      <div className="t-base-medium text-zinc-900 mb-1">Prompts suggérés</div>
      <ul className="divide-y divide-zinc-100">
        {PROMPTS.map((p) => (
          <li key={p}>
            <button className="w-full text-left py-2 t-base-regular text-zinc-700 hover:text-zinc-900 transition-colors">
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
  matters: 'Matters récents',
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
            <div className="t-base-medium text-zinc-900 mb-1">{label}</div>
            <ul className="divide-y divide-zinc-100">
              {items.map((item) => (
                <li key={item.title}>
                  <button className="w-full text-left py-2 flex items-center justify-between group">
                    <span className="t-base-regular text-zinc-700 group-hover:text-zinc-900 truncate transition-colors">{item.title}</span>
                    <span className="t-small-regular text-zinc-400 shrink-0 ml-3">{item.meta}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------- E3 — Suggested Actions --------------------
   ONE composer launcher. `source` decides where the list comes from:
     • curated  — a hand-picked tool list, ending with "Toutes les actions"
     • detected — derived from the C5 uploaded set, with a "what + why" summary
                  and Flow Counsel/Litigate (one source of truth with the bar
                  + manager, so they can never contradict).
   `variant` is the form only: labeled (pills) / verbose (cards) / rows. */
const ACTIONS = [
  { id: 'exemples', icon: 'sparkles',  label: 'Exemples de prompt', desc: 'Idées de requêtes' },
  { id: 'extraire', icon: 'table',     label: 'Extraire',           desc: 'Données structurées d\'un doc' },
  { id: 'traduire', icon: 'languages', label: 'Traduire',           desc: 'Traduire un document' },
  { id: 'analyser', icon: 'scan',      label: 'Analyser',           desc: 'Analyse d\'un document' },
  { id: 'comparer', icon: 'columns',   label: 'Comparer',           desc: 'Comparer des documents' },
];

type ActionItem = { id: string; icon?: string; label: string; desc?: string; badge?: string; flow?: 'counsel' | 'litigate' };

function FlowBadge({ flow }: { flow: 'counsel' | 'litigate' }) {
  return (
    <span className="inline-grid place-items-center size-5 rounded bg-zinc-900 text-white t-mono text-[10px] font-semibold shrink-0">
      {flow === 'counsel' ? 'Cs' : 'Lt'}
    </span>
  );
}

function SuggestedActions({
  variant, source, selectedTools, detection,
}: { variant: string; source: string; selectedTools: string[]; detection: Detection }) {
  const setActionPickerOpen = useChatbot((s) => s.setActionPickerOpen);
  if (variant === 'hidden') return null;

  const detected = source === 'detected';
  const items: ActionItem[] = detected
    ? detection.actions
    : ACTIONS.filter((a) => selectedTools.includes(a.id));
  if (items.length === 0) return null;

  const glyph = (a: ActionItem, cls: string) =>
    a.flow ? <FlowBadge flow={a.flow} /> : a.icon ? <Icon name={a.icon} className={cls} /> : null;

  // Header: detected → centered "what + why" summary; curated → left-aligned label.
  const header = detected ? (
    <div className="text-center mb-4">
      <div className="t-base-semibold text-zinc-900">{detection.title}</div>
      <div className="t-small-regular text-zinc-500 mt-0.5">{detection.meta}</div>
    </div>
  ) : (
    <div className="t-base-medium text-zinc-900 mb-3">Actions suggérées</div>
  );

  // labeled (pills)
  if (variant === 'labeled') {
    return (
      <div className="w-full">
        {header}
        <div className={'flex flex-wrap items-center gap-1.5 ' + (detected ? 'justify-center' : 'justify-start')}>
          {items.map((a) => (
            <button key={a.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 bg-white t-base-medium text-zinc-700 hover:border-zinc-400">
              {glyph(a, 'size-3.5')}
              {a.label}
              {a.badge && <span className="t-small-regular text-zinc-400">· {a.badge}</span>}
            </button>
          ))}
          {!detected && (
            <button onClick={() => setActionPickerOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 bg-white t-base-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-900">
              Toutes les actions
              <Icon name="more-horiz" className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // verbose (cards)
  if (variant === 'verbose') {
    return (
      <div className="w-full">
        {header}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {items.map((a) => (
            <button key={a.id} className="text-left p-3 rounded-md border border-zinc-200 bg-white hover:border-zinc-400">
              {glyph(a, 'size-4 text-zinc-700 mb-1.5')}
              <div className="t-base-semibold text-zinc-900 leading-snug mt-1.5">{a.label}</div>
              {(a.desc || a.badge) && <div className="t-small-regular text-zinc-500 leading-snug">{a.desc ?? a.badge}</div>}
            </button>
          ))}
          {!detected && (
            <button onClick={() => setActionPickerOpen(true)} className="flex items-center gap-2 p-3 rounded-md border border-dashed border-zinc-200 bg-white hover:border-zinc-400 t-base-medium text-zinc-500">
              <Icon name="more-horiz" className="size-4" /> Toutes les actions
            </button>
          )}
        </div>
      </div>
    );
  }

  // rows — header + full-width rows with a trailing chevron.
  return (
    <div className="w-full">
      {header}
      <div className="flex flex-col gap-2">
        {items.map((a) => (
          <button key={a.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-200 bg-white hover:border-zinc-400 text-left">
            {glyph(a, 'size-4 text-zinc-600 shrink-0')}
            <span className="flex-1 min-w-0 t-base-medium text-zinc-900 truncate">
              {a.label}
              {a.badge ? <span className="t-base-regular text-zinc-400"> · {a.badge}</span>
                : a.desc ? <span className="t-base-regular text-zinc-400"> · {a.desc}</span> : null}
            </span>
            <Icon name="chevron-down" className="size-4 text-zinc-400 shrink-0" />
          </button>
        ))}
        {!detected && (
          <button onClick={() => setActionPickerOpen(true)} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-zinc-200 bg-white hover:border-zinc-400 text-left t-base-medium text-zinc-500">
            <Icon name="more-horiz" className="size-4 shrink-0" />
            <span className="flex-1">Toutes les actions</span>
          </button>
        )}
      </div>
    </div>
  );
}

