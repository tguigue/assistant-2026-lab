import { useState } from 'react';
import { useChatbot } from '../chatbot/store';
import { cn, Icon, MODAL_MAX_H, Sw } from './ui';
import { CardFooterButton, ToolCard } from './ToolCard';
import { PrimitiveSlot } from './PrimitiveSlot';

/**
 * A10 — Watcher creation. Turns what the Assistant ALREADY did into watchers.
 *
 * Production model (mirrored here): a watcher is never a theme — it is either
 *   - a KEYWORD QUERY + filters (the "Créer une alerte" modal on search), or
 *   - an ENTITY + its legal graph (the "Suivre l'article" modal: évolutions,
 *     décisions citantes, commentaires, textes).
 * The chatbot's edge: the reasoning trace already contains the exact queries
 * the agent ran, and the answer cites the exact entities. So suggestions are
 * grounded — never invented.
 *
 * Forms (variant): picker (multi-select suggestions — the hero), card (single
 * watcher setup inline), strip (one row), modal (the classic dialog).
 * `kind` picks WHICH single watcher the card/strip/modal configure: the main
 * search query, or the cited article. Status: setup → created (CTA flips it).
 */

/* ------------------------------------------------------------------ *
 * Fixture — the candidate watchers detected in the S1 conversation.
 * ONE source of truth: these match the A1 trace hits verbatim (the
 * queries) and the answer's citations (the article).
 * ------------------------------------------------------------------ */
export type WatcherSuggestion = {
  id: string;
  kind: 'search' | 'article';
  /** The exact keyword query (search) or entity ref (article). */
  label: string;
  /** Jurisdiction / corpus filters carried by a search watcher. */
  filters?: string[];
  /** Where the suggestion comes from — shown so the user trusts it. */
  origin: string;
};

export const WATCHER_SUGGESTIONS: WatcherSuggestion[] = [
  {
    id: 'w-constitutifs',
    kind: 'search',
    label: '"harcèlement moral" éléments constitutifs répétition',
    filters: ['CASS', 'CA'],
    origin: 'Recherche effectuée — étape 1 du raisonnement',
  },
  {
    id: 'w-hebdo',
    kind: 'search',
    label: '"points hebdomadaires" harcèlement managérial',
    filters: ['CASS', 'CA'],
    origin: 'Recherche effectuée — étape 2 du raisonnement',
  },
  {
    id: 'w-l1152',
    kind: 'article',
    label: 'Article L1152-1 du Code du travail',
    origin: 'Cité dans la réponse',
  },
];

/* ------------------------------------------------------------------
 * Fixture — EVENT watchers. Deliberately NOT part of WATCHER_SUGGESTIONS:
 * the picker's whole promise is that every candidate it lists is verbatim
 * from THIS conversation, and an event trigger is not — it watches the
 * user's own dossiers, not the corpus. Mixing them would make the picker
 * claim an origin it doesn't have. E7 Arrivals reads this list.
 * ------------------------------------------------------------------ */
export type WatcherEvent = {
  id: 'depot' | 'statut' | 'echeance';
  icon: string;
  label: string;
  /** What actually fires it, in one sentence. */
  trigger: string;
  /** The one setting that kind of event needs. */
  setting: { label: string; value: string };
};

export const WATCHER_EVENTS: WatcherEvent[] = [
  {
    id: 'depot', icon: 'folder',
    label: 'Suivre l’arrivée d’un document',
    trigger: 'Un document est déposé dans Leroy c/ Merlin',
    setting: { label: 'Types de fichiers', value: 'Tous · .docx · .pdf' },
  },
  {
    id: 'statut', icon: 'refresh',
    label: 'Suivre le statut d’un dossier',
    trigger: 'Le dossier Moreau c/ SAS Aurelia change de statut',
    setting: { label: 'Statuts suivis', value: 'Audience fixée · Clôturé' },
  },
  {
    id: 'echeance', icon: 'alert',
    label: 'Être prévenu avant une échéance',
    trigger: 'Une échéance approche dans mes dossiers',
    setting: { label: 'Délai d’avance', value: '7 jours' },
  },
];

const EVENT_KINDS = new Set(['depot', 'statut', 'echeance']);

/* The registry — the veilles that already exist. Without it, E7's "mettre en
   pause" and the created card's "Voir mes veilles" both dead-end. */
const MY_WATCHERS = [
  { id: 'r1', icon: 'search', label: '"harcèlement moral" éléments constitutifs répétition', last: 'Dernier déclenchement : 12 août — 3 décisions' },
  { id: 'r2', icon: 'scales', label: 'Article L1152-1 du Code du travail',                    last: 'Dernier déclenchement : 4 août — 1 évolution' },
  { id: 'r3', icon: 'folder', label: 'Dépôts dans Leroy c/ Merlin',                           last: 'Dernier déclenchement : hier — 1 document' },
  { id: 'r4', icon: 'alert',  label: 'Échéances à 7 jours',                                   last: 'Aucun déclenchement depuis le 2 août' },
];

/* The article watcher's legal graph — same four rows as the production
   "Suivre l'article" modal. */
const ARTICLE_GRAPH = [
  { id: 'evolutions',   label: 'Évolutions de l’article',                 desc: 'Modifications et abrogations' },
  { id: 'decisions',    label: 'Décisions',                               desc: 'Décisions citant l’article' },
  { id: 'commentaires', label: 'Commentaires',                            desc: 'Commentaires citant l’article' },
  { id: 'textes',       label: 'Textes législatifs et réglementaires',    desc: 'Articles de lois, ordonnances, décrets et arrêtés citant l’article' },
];

const ALL_FILTERS = ['CASS', 'CA', 'CE', 'Cons. const.'];

const FREQUENCIES = [
  { id: 'realtime', label: 'Temps réel' },
  { id: 'daily',    label: 'Quotidienne' },
  { id: 'weekly',   label: 'Hebdomadaire' },
];
const FREQ_LABEL: Record<string, string> = Object.fromEntries(FREQUENCIES.map((f) => [f.id, f.label]));

const CREATE_BTN = 'inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md t-base-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/30 focus-visible:ring-offset-1';

/* ------------------------- store plumbing ------------------------- */
function useWatcher() {
  const a10 = useChatbot((s) => s.primitives.A10);
  const setAxis = useChatbot((s) => s.setPrimitiveAxisVariant);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  const content = Array.isArray(a10.content) ? a10.content : [];
  return {
    visible: a10.visible,
    variant: a10.variant,
    status: a10.axisVariants?.status ?? 'setup',
    kind: a10.axisVariants?.kind ?? 'requete',
    content,
    create: () => setAxis('A10', 'status', 'created'),
    reopen: () => setAxis('A10', 'status', 'setup'),
    close: () => { setVisible('A10', false); setAxis('A10', 'status', 'setup'); },
  };
}

/** Open the A10 surface from anywhere (A1 bells, A7, A4, A0, C8 menu).
 *  `kind` targets the single-watcher forms; `picker: true` jumps to the
 *  multi-select suggestions list. */
export function useOpenWatcher() {
  const setAxis = useChatbot((s) => s.setPrimitiveAxisVariant);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  const setVariant = useChatbot((s) => s.setPrimitiveVariant);
  return (opts?: { kind?: 'requete' | 'article'; picker?: boolean }) => {
    if (opts?.picker) setVariant('A10', 'picker');
    if (opts?.kind) {
      setAxis('A10', 'kind', opts.kind);
      // A kind-targeted open means "follow THIS one" — if the designer left the
      // picker selected, fall back to the single-watcher card so the surface
      // matches the intent. Explicit picker opens keep the list.
      if (!opts.picker && useChatbot.getState().primitives.A10.variant === 'picker') {
        setVariant('A10', 'card');
      }
    }
    setAxis('A10', 'status', 'setup');
    setVisible('A10', true);
  };
}

/* Success cue for the created states — a ring + checkmark that draw themselves
   in with a gentle pop (see .wc-success in index.css). `size` is a Tailwind
   size-* class so it scales from the inline card leading to the modal hero.
   Restrained emerald, thin strokes, transparent — a crafted confirmation, not
   a default success blob. */
function SuccessCheck({ size = 'size-5' }: { size?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={'wc-success shrink-0 ' + size} aria-hidden>
      <circle className="ring" cx="12" cy="12" r="10" pathLength={1}
        stroke="#a7f3d0" strokeWidth={2} />
      <path className="tick" d="M7.5 12.5l3 3 6-6.5" pathLength={1}
        stroke="#059669" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------- small controls ------------------------- */

/* Production-style switch (the "Suivre l'article" toggles), lab palette. */
/* Jurisdiction filter chip — toggleable, mirrors the prod alerte chips. */
function FilterChip({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-1 h-7 px-2.5 rounded-full border t-base-medium transition-colors',
        on ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-400',
      )}
    >
      {label}
    </button>
  );
}

/* Frequency pill group — VARIANT semantics (one at a time). */
function FreqPills({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5" role="radiogroup">
      {FREQUENCIES.map((f) => {
        const active = f.id === value;
        return (
          <button
            key={f.id}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(f.id)}
            className={cn(
              'h-6 px-2.5 rounded-md t-base-medium transition-colors',
              active ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-zinc-900',
            )}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

function ChannelCheck({ checked, onToggle, label, meta }: { checked: boolean; onToggle: () => void; label: string; meta?: string }) {
  return (
    <button onClick={onToggle} className="inline-flex items-center gap-2 h-7 px-1 rounded-md hover:bg-zinc-50 text-left">
      <input type="checkbox" readOnly checked={checked} className="size-3.5 rounded border-zinc-300 accent-zinc-900 pointer-events-none" />
      <span className="t-base-regular text-zinc-800">{label}</span>
      {meta && <span className="t-small-regular text-zinc-400">{meta}</span>}
    </button>
  );
}

/* A labelled setup row — muted label column, content right. */
function SetupRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-[76px] shrink-0 pt-1 t-small-medium text-zinc-500">{label}</span>
      <div className="flex-1 min-w-0 flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

/* The exact query, displayed the way production displays it: prominent,
   verbatim, quotes kept. The query IS the watcher — never a paraphrase. */
function QueryBlock({ query, origin }: { query: string; origin?: string }) {
  return (
    <div>
      <p className="t-large-semibold text-zinc-900 leading-snug">{query}</p>
      {origin && <p className="mt-0.5 t-small-regular text-zinc-400">{origin}</p>}
    </div>
  );
}

/* ------------------- per-kind local setup state ------------------- */
function useSetupState() {
  const [filters, setFilters] = useState<Record<string, boolean>>({ CASS: true, CA: true, CE: false, 'Cons. const.': false });
  const [comments, setComments] = useState(false);
  const [graph, setGraph] = useState<Record<string, boolean>>({ evolutions: true, decisions: true, commentaires: true, textes: false });
  const [freq, setFreq] = useState('weekly');
  const [email, setEmail] = useState(true);
  const [inApp, setInApp] = useState(true);
  return {
    filters, toggleFilter: (f: string) => setFilters((s) => ({ ...s, [f]: !s[f] })),
    comments, setComments,
    graph, toggleGraph: (g: string) => setGraph((s) => ({ ...s, [g]: !s[g] })),
    freq, setFreq, email, setEmail, inApp, setInApp,
  };
}

/* ------------------- setup bodies (per watcher kind) ------------------- *
 * REQUÊTE mirrors the prod "Créer une alerte" modal: intro line, the query
 * big and verbatim, jurisdiction chips, the comments switch.
 * ARTICLE mirrors the prod "Suivre l'article" modal: the four legal-graph
 * switch rows. Both append fréquence / canal per the content toggles.
 * ------------------------------------------------------------------ */
function RequeteBody({ s, content }: { s: ReturnType<typeof useSetupState>; content: string[] }) {
  const w = WATCHER_SUGGESTIONS[0];
  return (
    <div className="space-y-3.5">
      <div>
        <p className="t-small-regular text-zinc-500 mb-1.5">Recevez les nouvelles décisions liées à vos mots-clés et filtres suivants :</p>
        <QueryBlock query={w.label} origin={w.origin} />
      </div>
      {content.includes('filtres') && (
        <SetupRow label="Juridictions">
          {ALL_FILTERS.map((f) => <FilterChip key={f} label={f} on={!!s.filters[f]} onToggle={() => s.toggleFilter(f)} />)}
        </SetupRow>
      )}
      {content.includes('commentaires') && (
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <div>
            <p className="t-base-medium text-zinc-900">Alerte sur les commentaires</p>
            <p className="t-small-regular text-zinc-500">Recevoir aussi les commentaires liés à ces mots-clés</p>
          </div>
          <Sw checked={s.comments} onChange={s.setComments} />
        </div>
      )}
      {content.includes('frequence') && (
        <SetupRow label="Fréquence"><FreqPills value={s.freq} onChange={s.setFreq} /></SetupRow>
      )}
      {content.includes('canal') && (
        <SetupRow label="Canal">
          <ChannelCheck checked={s.email} onToggle={() => s.setEmail(!s.email)} label="E-mail" meta="thomas@doctrine.fr" />
          <ChannelCheck checked={s.inApp} onToggle={() => s.setInApp(!s.inApp)} label="Notification Doctrine" />
        </SetupRow>
      )}
    </div>
  );
}

function ArticleBody({ s, content }: { s: ReturnType<typeof useSetupState>; content: string[] }) {
  const w = WATCHER_SUGGESTIONS.find((x) => x.kind === 'article')!;
  return (
    <div className="space-y-3.5">
      <QueryBlock query={w.label} origin={w.origin} />
      <div className="divide-y divide-zinc-100 rounded-md border border-zinc-200">
        {ARTICLE_GRAPH.map((g) => (
          <div key={g.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
            <div className="min-w-0">
              <p className="t-base-medium text-zinc-900">{g.label}</p>
              <p className="t-small-regular text-zinc-500">{g.desc}</p>
            </div>
            <Sw checked={!!s.graph[g.id]} onChange={() => s.toggleGraph(g.id)} />
          </div>
        ))}
      </div>
      {content.includes('frequence') && (
        <SetupRow label="Fréquence"><FreqPills value={s.freq} onChange={s.setFreq} /></SetupRow>
      )}
      {content.includes('canal') && (
        <SetupRow label="Canal">
          <ChannelCheck checked={s.email} onToggle={() => s.setEmail(!s.email)} label="E-mail" meta="thomas@doctrine.fr" />
          <ChannelCheck checked={s.inApp} onToggle={() => s.setInApp(!s.inApp)} label="Notification Doctrine" />
        </SetupRow>
      )}
    </div>
  );
}

/* ------------------------- CARD (single watcher) ------------------------- */
/* Event watchers reuse the whole existing kit — QueryBlock for the trigger,
   SetupRow / FreqPills / ChannelCheck for the settings. No new controls: an
   event watcher differs from a query watcher in WHAT fires it, not in how it
   is configured. */
function EventBody({ s, content, kind }: { s: ReturnType<typeof useSetupState>; content: string[]; kind: string }) {
  const e = WATCHER_EVENTS.find((x) => x.id === kind) ?? WATCHER_EVENTS[0];
  return (
    <div className="space-y-3.5">
      <QueryBlock query={e.trigger} origin="Déclencheur — vos dossiers" />
      <SetupRow label={e.setting.label}>
        <span className="t-base-regular text-zinc-700">{e.setting.value}</span>
      </SetupRow>
      {/* An échéance watcher is useless without a lead time, so its own setting
          is promoted rather than hidden behind a toggle. */}
      {kind === 'echeance' && content.includes('delai') && (
        <SetupRow label="Délai d’avance">
          <FilterChip label="3 jours" on={false} onToggle={() => {}} />
          <FilterChip label="7 jours" on onToggle={() => {}} />
          <FilterChip label="15 jours" on={false} onToggle={() => {}} />
        </SetupRow>
      )}
      {content.includes('frequence') && (
        <SetupRow label="Fréquence"><FreqPills value={s.freq} onChange={s.setFreq} /></SetupRow>
      )}
      {content.includes('canal') && (
        <SetupRow label="Canal">
          <ChannelCheck checked={s.email} onToggle={() => s.setEmail(!s.email)} label="E-mail" meta="thomas@doctrine.fr" />
          <ChannelCheck checked={s.inApp} onToggle={() => s.setInApp(!s.inApp)} label="Notification Doctrine" />
        </SetupRow>
      )}
    </div>
  );
}

/* The register of what already exists. This is what "Voir mes veilles" and
   E7's "mettre en pause" point at — both dead-ended before it. */
function WatcherRegistry() {
  const v = useWatcher();
  return (
    <ToolCard
      leading={<Icon name="bell" className="size-4 text-zinc-400" />}
      title="Mes veilles"
      subtitle={`${MY_WATCHERS.length} veilles actives · 3 nouveautés cette semaine`}
      actions={
        <button onClick={v.close} className="size-7 grid place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" title="Fermer">
          <Icon name="x" className="size-4" />
        </button>
      }
      bodyFlush
      footer={<CardFooterButton>Voir toutes mes veilles</CardFooterButton>}
    >
      <ul className="divide-y divide-zinc-100">
        {MY_WATCHERS.map((w) => (
          <li key={w.id} className="flex items-start gap-3 px-4 py-2.5">
            <Icon name={w.icon} className="size-4 text-zinc-400 shrink-0 mt-0.5" />
            <span className="flex-1 min-w-0">
              <span className="block t-base-medium text-zinc-900 leading-snug truncate">{w.label}</span>
              {/* "Why did this fire" is the question a registry has to answer. */}
              <span className="block t-small-regular text-zinc-500 mt-0.5">{w.last}</span>
            </span>
            <span className="shrink-0 flex items-center gap-2.5">
              <button className="t-small-medium text-zinc-500 hover:text-zinc-900 underline decoration-zinc-300">Mettre en pause</button>
              <button className="t-small-medium text-zinc-400 hover:text-zinc-700 underline decoration-zinc-200">Supprimer</button>
            </span>
          </li>
        ))}
      </ul>
    </ToolCard>
  );
}

function WatcherCardSetup() {
  const v = useWatcher();
  const s = useSetupState();
  const isArticle = v.kind === 'article';
  const isEvent = EVENT_KINDS.has(v.kind);
  const ev = isEvent ? (WATCHER_EVENTS.find((x) => x.id === v.kind) ?? WATCHER_EVENTS[0]) : null;
  return (
    <ToolCard
      leading={<Icon name={ev ? ev.icon : isArticle ? 'scales' : 'search'} className="size-4 text-zinc-400" />}
      eyebrow={<span className="t-small-medium text-zinc-500">Veille · {ev ? 'Événement' : isArticle ? 'Article de loi' : 'Recherche par mots-clés'}</span>}
      title={ev ? ev.label : isArticle ? 'Suivre l’article' : 'Suivre cette recherche'}
      actions={
        <button onClick={v.close} className="size-7 grid place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" title="Fermer">
          <Icon name="x" className="size-4" />
        </button>
      }
    >
      {isEvent
        ? <EventBody s={s} content={v.content} kind={v.kind} />
        : isArticle ? <ArticleBody s={s} content={v.content} /> : <RequeteBody s={s} content={v.content} />}
      <div className="mt-3.5 pt-3 border-t border-zinc-100 flex items-center justify-between gap-3">
        <span className="t-small-regular text-zinc-400">Modifiable à tout moment depuis « Mes veilles »</span>
        <button onClick={v.create} className={CREATE_BTN}>
          <Icon name="bell" className="size-3.5" />
          {isEvent ? 'Créer la veille' : isArticle ? 'Suivre l’article' : 'Créer la veille'}
        </button>
      </div>
    </ToolCard>
  );
}

function WatcherCardCreated() {
  const v = useWatcher();
  const isArticle = v.kind === 'article';
  const w = isArticle ? WATCHER_SUGGESTIONS.find((x) => x.kind === 'article')! : WATCHER_SUGGESTIONS[0];
  return (
    <ToolCard
      leading={<SuccessCheck size="size-5" />}
      title="Veille créée"
      subtitle={<>{w.label} · Alerte hebdomadaire par e-mail</>}
      actions={
        <>
          <button onClick={v.reopen} className="inline-flex items-center gap-1 h-7 px-2 rounded-md t-base-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900">
            Modifier
          </button>
          <button className="inline-flex items-center gap-1 t-base-medium text-zinc-900 hover:text-zinc-600 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/25">
            Voir mes veilles
            <Icon name="arrow-right" className="size-3" />
          </button>
        </>
      }
    />
  );
}

/* --------------------- PICKER (suggested watchers) --------------------- *
 * The opinionated form: the agent extracts the CONCRETE watcher candidates
 * from what it already did (its searches, the cited article) and proposes
 * them as a multi-select list. Nothing to type, nothing invented — each row
 * shows the verbatim query/entity plus WHERE it comes from.
 * ------------------------------------------------------------------ */
function PickerRow({ w, on, onToggle }: { w: WatcherSuggestion; on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-zinc-50 transition-colors">
      <input type="checkbox" readOnly checked={on} className="mt-1 size-3.5 rounded border-zinc-300 accent-zinc-900 pointer-events-none shrink-0" />
      <Icon name={w.kind === 'article' ? 'scales' : 'search'} className="size-4 text-zinc-400 shrink-0 mt-0.5" />
      <span className="flex-1 min-w-0">
        <span className={cn('block t-base-medium leading-snug', on ? 'text-zinc-900' : 'text-zinc-400')}>{w.label}</span>
        <span className="block t-small-regular text-zinc-500 mt-0.5">
          {w.kind === 'article'
            ? 'Évolutions · décisions, commentaires et textes citant l’article'
            : `Décisions · ${w.filters?.join(', ')}`}
          <span className="text-zinc-300"> — </span>
          <span className="text-zinc-400">{w.origin}</span>
        </span>
      </span>
    </button>
  );
}

function WatcherPicker() {
  const v = useWatcher();
  const [sel, setSel] = useState<Record<string, boolean>>(Object.fromEntries(WATCHER_SUGGESTIONS.map((w) => [w.id, true])));
  const count = Object.values(sel).filter(Boolean).length;

  if (v.status === 'created') {
    return (
      <ToolCard
        leading={<SuccessCheck size="size-5" />}
        title={`${count} veille${count > 1 ? 's' : ''} créée${count > 1 ? 's' : ''}`}
        subtitle="Alerte hebdomadaire par e-mail · modifiables depuis « Mes veilles »"
        actions={
          <>
            <button onClick={v.reopen} className="inline-flex items-center gap-1 h-7 px-2 rounded-md t-base-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900">
              Modifier
            </button>
            <button className="inline-flex items-center gap-1 t-base-medium text-zinc-900 hover:text-zinc-600">
              Voir mes veilles
              <Icon name="arrow-right" className="size-3" />
            </button>
          </>
        }
        bodyFlush
      >
        <div className="divide-y divide-zinc-100">
          {WATCHER_SUGGESTIONS.filter((w) => sel[w.id]).map((w) => (
            <div key={w.id} className="flex items-center gap-2.5 px-4 py-2">
              <Icon name={w.kind === 'article' ? 'scales' : 'search'} className="size-3.5 text-zinc-400 shrink-0" />
              <span className="flex-1 min-w-0 t-base-regular text-zinc-800 truncate">{w.label}</span>
              <span className="t-small-regular text-zinc-400 shrink-0">{w.kind === 'article' ? 'Article' : 'Recherche'}</span>
            </div>
          ))}
        </div>
      </ToolCard>
    );
  }

  return (
    <ToolCard
      leading={<Icon name="bell" className="size-4 text-zinc-400" />}
      eyebrow={<span className="t-small-medium text-zinc-500">Veilles suggérées · D’après cette conversation</span>}
      title="Suivre ce que j’ai cherché pour vous répondre"
      subtitle="Les recherches effectuées et l’article cité peuvent devenir des veilles — telles quelles, mots-clés inclus."
      actions={
        <button onClick={v.close} className="size-7 grid place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" title="Fermer">
          <Icon name="x" className="size-4" />
        </button>
      }
      bodyFlush
      footer={
        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          <span className="t-small-regular text-zinc-400">Alerte hebdomadaire par e-mail — modifiable ensuite</span>
          <button onClick={v.create} disabled={count === 0} className={CREATE_BTN + ' disabled:opacity-40 disabled:pointer-events-none'}>
            <Icon name="bell" className="size-3.5" />
            Créer {count > 1 ? `${count} veilles` : 'la veille'}
          </button>
        </div>
      }
    >
      <div className="divide-y divide-zinc-100">
        {WATCHER_SUGGESTIONS.map((w) => (
          <PickerRow key={w.id} w={w} on={!!sel[w.id]} onToggle={() => setSel((s) => ({ ...s, [w.id]: !s[w.id] }))} />
        ))}
      </div>
    </ToolCard>
  );
}

/* --------------------------- STRIP (one row) ---------------------------- */
function WatcherStrip() {
  const v = useWatcher();
  const s = useSetupState();
  const isArticle = v.kind === 'article';
  const w = isArticle ? WATCHER_SUGGESTIONS.find((x) => x.kind === 'article')! : WATCHER_SUGGESTIONS[0];

  if (v.status === 'created') {
    return (
      <div className="sg-suggest flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-3 py-2">
        <SuccessCheck size="size-4" />
        <span className="t-base-medium text-zinc-900 shrink-0">Veille créée</span>
        <span className="flex-1 min-w-0 t-base-regular text-zinc-400 truncate">{w.label} · {FREQ_LABEL[s.freq]}</span>
        <button onClick={v.reopen} className="shrink-0 t-base-medium text-zinc-500 hover:text-zinc-900">Modifier</button>
        <button className="shrink-0 inline-flex items-center gap-1 t-base-medium text-zinc-900 hover:text-zinc-600">
          Voir mes veilles
          <Icon name="arrow-right" className="size-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="sg-suggest flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-3 py-2">
      <Icon name={isArticle ? 'scales' : 'search'} className="size-4 shrink-0 text-zinc-400" />
      <span className="t-base-medium text-zinc-900 shrink-0">{isArticle ? 'Suivre l’article' : 'Suivre cette recherche'}</span>
      <span className="flex-1 min-w-0 t-base-regular text-zinc-500 truncate">{w.label}</span>
      {/* No settings to decide here — that's the strip's whole point (prod
          creates instantly too). The default is shown as an inert hint; tuning
          happens after creation via "Modifier" / « Mes veilles ». */}
      <span className="shrink-0 t-small-regular text-zinc-400">Hebdomadaire · e-mail</span>
      <button onClick={v.create} className={CREATE_BTN + ' shrink-0'}>Créer la veille</button>
      <button onClick={v.close} className="shrink-0 size-6 grid place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" title="Fermer">
        <Icon name="x" className="size-3.5" />
      </button>
    </div>
  );
}

/* --------------------------- INLINE MOUNT ------------------------------- */
/** Picker + card + strip forms, mounted in the conversation flow. */
export function WatcherInline() {
  const v = useWatcher();
  if (!v.visible || v.variant === 'modal') return null;
  return (
    <PrimitiveSlot code="A10" block>
      {v.variant === 'registry'
        ? <WatcherRegistry />
        : v.variant === 'picker'
          ? <WatcherPicker />
          : v.variant === 'strip'
            ? <WatcherStrip />
            : v.status === 'created' ? <WatcherCardCreated /> : <WatcherCardSetup />}
    </PrimitiveSlot>
  );
}

/* ------------------------------ MODAL ----------------------------------- */
/** The classic dialog, over the canvas — "Créer une veille" for a query
 *  (mirrors the prod search alerte) or "Suivre l'article" for an entity. */
export function WatcherModal() {
  const v = useWatcher();
  const s = useSetupState();
  if (!v.visible || v.variant !== 'modal') return null;
  const isArticle = v.kind === 'article';
  const w = isArticle ? WATCHER_SUGGESTIONS.find((x) => x.kind === 'article')! : WATCHER_SUGGESTIONS[0];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={v.close} />
      <div className={`relative w-full max-w-[520px] ${MODAL_MAX_H} flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden`}>
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-2">
            <Icon name="bell" className="size-4 text-zinc-500" />
            <h2 className="t-title-4 text-zinc-900">{isArticle ? 'Suivre l’article' : 'Créer une veille'}</h2>
          </div>
          <button onClick={v.close} className="size-7 grid place-items-center rounded-md text-zinc-500 hover:bg-zinc-100" title="Fermer">
            <Icon name="x" className="size-4" />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto scrollbar-thin">
          {v.status === 'created' ? (
            <div className="px-5 py-8 flex flex-col items-center text-center gap-3">
              <SuccessCheck size="size-10" />
              <div>
                <p className="t-base-semibold text-zinc-900">Veille créée</p>
                <p className="t-small-regular text-zinc-500 mt-1">{w.label} · {FREQ_LABEL[s.freq]}</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <button onClick={v.reopen} className="h-8 px-3 rounded-md border border-zinc-200 t-base-medium text-zinc-700 hover:border-zinc-400">Modifier</button>
                <button onClick={v.close} className={CREATE_BTN}>Voir mes veilles</button>
              </div>
            </div>
          ) : (
            <div className="px-5 py-4">
              {isArticle ? <ArticleBody s={s} content={v.content} /> : <RequeteBody s={s} content={v.content} />}
            </div>
          )}
        </div>

        {v.status !== 'created' && (
          <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between gap-3 shrink-0">
            <span className="t-small-regular text-zinc-400">Modifiable à tout moment depuis « Mes veilles »</span>
            <button onClick={v.create} className={CREATE_BTN}>
              <Icon name="bell" className="size-3.5" />
              {isArticle ? 'Suivre l’article' : 'Créer la veille'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
