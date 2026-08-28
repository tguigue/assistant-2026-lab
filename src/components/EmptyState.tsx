import { useState, useEffect } from 'react';
import { useChatbot } from '../chatbot/store';
import { Icon, SearchField, normalizeQuery } from './ui';
import { ComposerBar } from './ComposerBar';
import { PrimitiveSlot } from './PrimitiveSlot';
import { ArrivalsAbove, ArrivalsBelow } from './Arrivals';
import { uploadSet, type Detection } from '../chatbot/uploadSets';
import { firmPlaybooks, matterSuggestion } from '../chatbot/matterFlows';
import { PromoBanner, PromoBelow, useHeadlineAd, useHoverPreviews, ActionHoverPreview } from './FeaturePromotion';

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
 *   E3 Suggested Actions · E4 History · E6 Activity
 * Every variant produces a visible change. Order is fixed; visibility per primitive.
 */
export function EmptyState() {
  const e3v = useChatbot((s) => s.primitives.E3);
  const e4v = useChatbot((s) => s.primitives.E4);
  const e6v = useChatbot((s) => s.primitives.E6);
  const c5set = useChatbot((s) => s.primitives.C5.axisVariants?.set);
  const e3 = e3v.visible ? e3v.variant : 'hidden';
  const e3source = e3v.axisVariants?.source ?? 'curated';
  const e3deploy = e3v.axisVariants?.deploy ?? 'repliee';
  const e4variant = e4v.visible ? e4v.variant : 'hidden';
  const e6 = e6v.visible ? e6v.variant : 'hidden';
  const e3tools = Array.isArray(e3v.content)
    ? e3v.content
    : ['nouveau-doc', 'modifier-doc', 'exemples', 'risques', 'negocier', 'contre-arguments', 'sources', 'extraire', 'traduire', 'comparer', 'anonymiser', 'resumer'];
  const e4contentSet = Array.isArray(e4v.content) ? e4v.content : ['conversations'];

  // Greeting reads the C8 matter scope: "…aujourd'hui ?" when unscoped,
  // "…sur {matter} ?" when scoped. Chassis, not a primitive. In the Éditeur
  // the open document is the scope — it beats the matter.
  const matterScope = useChatbot((s) => s.primitives.C8.variant);
  const scopedName = matterScope !== 'idle' ? MATTER_GREETING_NAMES[matterScope] : null;
  const docScoped = useChatbot((s) => s.surface) === 'doc';

  // The detection E3 renders depends on its source: folder → the selected
  // dossier's tools, otherwise → the uploaded set's tools.
  const e3detection =
    e3source === 'folder' ? matterSuggestion(matterScope)
    : e3source === 'firm' ? firmPlaybooks()
    : uploadSet(c5set).detection;

  const setViewMode = useChatbot((s) => s.setViewMode);

  // E5 "headline" — the hero itself advertises, rotating capability statements.
  const headlineAd = useHeadlineAd();

  const showE3 = e3 !== 'hidden';

  return (
    <div
      // ALWAYS top-anchored at a fixed offset — never vertically centered. This
      // keeps the greeting, composer and chips in the same place; blocks that
      // appear/disappear (suggestions, history) grow downward instead of
      // pushing the composer around. Smooth when selecting a folder, uploading…
      // The offset is a flat px value below @2xl: `18vh` measures the BROWSER
      // window, so in the 390px frame (and on a phone with the keyboard up) it
      // pushed the composer off the bottom.
      className="min-h-full flex flex-col items-center px-3 gap-7 justify-start pt-10 pb-10 @2xl/surface:px-6 @2xl/surface:gap-10 @2xl/surface:pt-[18vh] @2xl/surface:pb-16"
    >
      <h1 className="t-title-4 @2xl/surface:t-title-3 text-zinc-900 text-center">
        {headlineAd ? (
          <span key={headlineAd} className="inline-block detect-rise">{headlineAd}</span>
        ) : docScoped ? (
          <>Que souhaitez-vous faire sur ce document&nbsp;?</>
        ) : scopedName ? (
          <>Que voulez-vous faire sur <span className="font-semibold">{scopedName}</span>&nbsp;?</>
        ) : (
          <>Que voulez-vous faire aujourd'hui&nbsp;?</>
        )}
      </h1>
      <div className="w-full max-w-3xl flex flex-col gap-3">
        {/* E7 — what arrived while you were gone. Above the composer, never inside
            the thread: an unprompted bubble would forge a turn you never took. */}
        <ArrivalsAbove />
        {/* E5 — Feature promotion, banner form (announcement above the composer). */}
        <PromoBanner />
        <ComposerBar onSend={() => setViewMode('full')} />
        {/* E5 — Feature promotion, below-composer forms (video / tips / checklist). */}
        <PromoBelow />
      </div>
      {/* Each block renders only when visible — an empty wrapper would still add a
          gap-6 and bloat the spacing. */}
      {/* E7 cards form — sits above the suggested actions, since "what arrived"
          is why you came back. */}
      <div className="w-full max-w-3xl empty:hidden"><ArrivalsBelow /></div>
      {showE3 && (
        <div className="w-full max-w-3xl">
          <PrimitiveSlot code="E3" block>
            {/* key on source+set+folder+form so the entrance replays (and the
                search/expand state resets) when the context or form changes */}
            <SuggestedActions key={`${e3source}-${c5set ?? 'x'}-${matterScope}-${e3}-${e3deploy}`} variant={e3} deploy={e3deploy} source={e3source} selectedTools={e3tools} detection={e3detection} />
          </PrimitiveSlot>
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
                  <button className="w-full text-left py-3 min-h-11 flex items-center justify-between group @2xl/surface:py-2 @2xl/surface:min-h-0">
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
   `variant` is the DENSITY — the two production forms: confort (cards whose
   subtitle sells the action) and compacte (joined rows, 2–3× more visible).
   `deploy` is how much shows: repliée (6 + « Voir plus ») or complète
   (everything + search). Inventory = the real fra one, tiered:
   addon (Counsel/Litigate, violet) / outil (inclus, bleu) / prompt (gris). */
type Tier = 'addon' | 'tool' | 'prompt';
const TIER_COLOR: Record<Tier, string> = {
  addon:  'text-violet-600',
  tool:   'text-blue-600',
  prompt: 'text-zinc-500',
};

const ACTIONS: ActionItem[] = [
  // Starters — blank slate
  { id: 'nouveau-doc',       icon: 'plus',       tier: 'prompt', label: 'Nouveau document',                    desc: "Partez d'une page blanche" },
  { id: 'modifier-doc',      icon: 'pen',        tier: 'prompt', label: 'Modifier un document',                desc: 'Éditer un document existant' },
  { id: 'exemples',          icon: 'sparkles',   tier: 'prompt', label: 'Exemples de prompt',                  desc: 'Idées de requêtes' },
  // Addons — Counsel / Litigate
  { id: 'risques',           icon: 'alert',      tier: 'addon',  label: 'Analyser les risques',                desc: 'Identifier les risques juridiques basés sur la loi et la jurisprudence' },
  { id: 'negocier',          icon: 'message',    tier: 'addon',  label: 'Négocier',                            desc: 'Améliorer la position de la partie que vous représentez', badge: 'New' },
  { id: 'contre-arguments',  icon: 'scales',     tier: 'addon',  label: 'Trouver des contre-arguments',        desc: 'Identifier les moyens adverses et générer des contre-arguments sourcés' },
  { id: 'terminologies',     icon: 'check',      tier: 'addon',  label: 'Vérifier les terminologies',          desc: 'Contrôler la cohérence des termes définis dans le document' },
  { id: 'incoherences',      icon: 'slash',      tier: 'addon',  label: 'Repérer les incohérences',            desc: 'Détecter les contradictions internes du document' },
  { id: 'structure',         icon: 'list',       tier: 'addon',  label: 'Vérifier la structure',               desc: "Contrôler la numérotation et l'articulation des clauses" },
  // Outils — inclus
  { id: 'sources',           icon: 'book',       tier: 'tool',   label: 'Détecter les sources citées',         desc: "Repérer les sources d'un texte" },
  { id: 'extraire',          icon: 'table',      tier: 'tool',   label: 'Extraire',                            desc: 'Extraire les clauses et données clés de vos documents' },
  { id: 'traduire',          icon: 'languages',  tier: 'tool',   label: 'Traduire',                            desc: "Traduire en conservant la mise en forme d'origine" },
  { id: 'analyser',          icon: 'scan',       tier: 'tool',   label: 'Analyser',                            desc: "Analyse d'un document" },
  { id: 'comparer',          icon: 'columns',    tier: 'tool',   label: 'Comparer',                            desc: 'Tableau récapitulatif des différences entre versions' },
  { id: 'tableau-decisions', icon: 'apps',       tier: 'tool',   label: 'Tableau de décisions',                desc: "Décisions en lignes, questions à l'IA en colonnes" },
  // Prompts
  { id: 'anonymiser',        icon: 'visibility', tier: 'prompt', label: 'Anonymiser les données personnelles', desc: 'Remplacer noms, adresses et identifiants par des masques' },
  { id: 'corriger',          icon: 'pen',        tier: 'prompt', label: 'Corriger et améliorer la rédaction',  desc: 'Orthographe, grammaire, clarté — à portée juridique constante' },
  { id: 'mise-en-demeure',   icon: 'file-text',  tier: 'prompt', label: 'Rédiger une mise en demeure',         desc: 'Modèle de courrier pour loyers impayés' },
  { id: 'resumer',           icon: 'copy',       tier: 'prompt', label: 'Résumer les points clés',             desc: 'Synthèse structurée du document importé' },
];

type ActionItem = { id: string; icon?: string; tier?: Tier; label: string; desc?: string; badge?: string; flow?: 'counsel' | 'litigate' };

/* Repliée threshold — the top 6 is an editorial choice per surface. */
const COLLAPSED_COUNT = 6;

/* The prod NewChip — one definition for both densities. */
function NewChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-1.5 rounded-full bg-fuchsia-700 text-white text-[9px] font-bold leading-4 shrink-0">{label}</span>
  );
}

function FlowBadge({ flow }: { flow: 'counsel' | 'litigate' }) {
  return (
    <span className="inline-grid place-items-center size-5 rounded-md bg-zinc-900 text-white text-[10px] font-semibold shrink-0">
      {flow === 'counsel' ? 'Cs' : 'Lt'}
    </span>
  );
}

function SuggestedActions({
  variant, deploy, source, selectedTools, detection,
}: { variant: string; deploy: string; source: string; selectedTools: string[]; detection: Detection }) {
  const setActionPickerOpen = useChatbot((s) => s.setActionPickerOpen);
  // E5 "preview" — hovering a card shows a mini of what the action produces.
  const hoverPreviews = useHoverPreviews();
  // "Smart" sources derive from context (uploaded docs or the selected folder)
  // and briefly "analyse" before resolving; curated is a static hand-picked set.
  const smart = source === 'detected' || source === 'folder';
  // `firm` also reads `detection`, but it is NOT smart: a cabinet playbook list
  // was written by a person, so there is nothing to "analyse" and no sparkle to
  // earn. It gets the curated chrome with its own heading.
  const firm = source === 'firm';
  const compact = variant === 'compacte';
  const collapsed = deploy !== 'complete';

  const [analyzing, setAnalyzing] = useState(smart);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  useEffect(() => {
    if (!smart) { setAnalyzing(false); return; }
    setAnalyzing(true);
    const t = setTimeout(() => setAnalyzing(false), 1100);
    return () => clearTimeout(t);
  }, [smart, detection.title]);

  if (variant === 'hidden') return null;

  const items: ActionItem[] = smart || firm
    ? detection.actions
    : ACTIONS.filter((a) => selectedTools.includes(a.id));
  if (items.length === 0) return null;

  // Complète filters by search; repliée slices to the editorial 6 + « Voir plus ».
  const q = normalizeQuery(query.trim());
  const filtered = !collapsed && q
    ? items.filter((a) => normalizeQuery(a.label).includes(q) || normalizeQuery(a.desc ?? '').includes(q))
    : items;
  const truncated = collapsed && !expanded && filtered.length > COLLAPSED_COUNT;
  const visible = truncated ? filtered.slice(0, COLLAPSED_COUNT) : filtered;

  // ── Confort — the MatterActionsSection card: icon + title + subtitle.
  // The subtitle is what sells the action; two columns max, one when narrow.
  const Card = (a: ActionItem, i: number) => (
    // The relative wrapper hosts the E5 hover-preview popover (a mini of the
    // action's OUTPUT) without touching the card's own layout in the grid.
    <div key={a.id} className="relative group/pv">
      <button
        style={smart ? { animationDelay: `${90 + i * 50}ms` } : undefined}
        className={'group w-full h-full flex items-start gap-2.5 p-3 rounded-xl border border-zinc-200 bg-white text-left transition-all hover:border-zinc-400 hover:shadow-sm' + (smart ? ' detect-rise' : '')}
      >
        {a.flow
          ? <FlowBadge flow={a.flow} />
          : a.icon ? <span className={'shrink-0 grid place-items-center size-5 ' + TIER_COLOR[a.tier ?? 'prompt']}><Icon name={a.icon} className="size-4" /></span> : null}
        <span className="min-w-0 flex flex-col gap-0.5">
          <span className="t-small-medium text-zinc-900 leading-snug">
            {a.label}
            {a.badge && <span className="ml-1.5 inline-block align-text-top"><NewChip label={a.badge} /></span>}
          </span>
          {a.desc && <span className="t-small-regular text-zinc-500 leading-snug line-clamp-2">{a.desc}</span>}
        </span>
      </button>
      {hoverPreviews && <ActionHoverPreview id={a.id} />}
    </div>
  );

  // ── Compacte — the ContractAnalysisOverview joined rows: 2–3× more actions
  // visible, single line, the density that breathes in the narrow column.
  const Row = (a: ActionItem, i: number) => (
    // Same relative wrapper as the cards, so the E5 hover previews work in
    // both densities — "previews on Actions rapides" can't depend on the form.
    <div key={a.id} className="relative group/pv">
      <button
        style={smart ? { animationDelay: `${90 + i * 50}ms` } : undefined}
        className={'w-full flex items-center gap-2.5 px-3 py-2.5 min-h-11 bg-white text-left transition-colors hover:bg-zinc-50 @2xl/surface:py-2 @2xl/surface:min-h-0' + (smart ? ' detect-rise' : '')}
      >
        {a.flow
          ? <FlowBadge flow={a.flow} />
          : a.icon ? <span className={'shrink-0 grid place-items-center size-5 ' + TIER_COLOR[a.tier ?? 'prompt']}><Icon name={a.icon} className="size-4" /></span> : null}
        <span className="min-w-0 t-small-medium text-zinc-900 truncate">{a.label}</span>
        {a.badge && <NewChip label={a.badge} />}
        <Icon name="chevron-right" className="ml-auto size-3.5 text-zinc-300 shrink-0" />
      </button>
      {hoverPreviews && <ActionHoverPreview id={a.id} />}
    </div>
  );

  const gridCls = 'grid grid-cols-1 gap-2 @md/surface:grid-cols-2';
  const rowsCls = 'rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100 overflow-hidden';

  // "Toutes les actions" (→ the gallery drawer) only makes sense behind a fold:
  // in Complète the list already claims to show everything, so the button
  // would contradict the mode. Repliée keeps it as the gateway past the 6.
  const gallery = collapsed && (
    compact ? (
      <button onClick={() => setActionPickerOpen(true)} className="w-full flex items-center gap-2.5 px-3 py-2.5 min-h-11 bg-white text-left transition-colors hover:bg-zinc-50 t-small-medium text-zinc-500 @2xl/surface:py-2 @2xl/surface:min-h-0">
        <span className="shrink-0 grid place-items-center size-5"><Icon name="more-horiz" className="size-4" /></span>
        Toutes les actions
      </button>
    ) : (
      <button onClick={() => setActionPickerOpen(true)} className="flex items-center gap-2.5 p-3 min-h-11 rounded-xl border border-dashed border-zinc-300 bg-white hover:border-zinc-400 t-small-medium text-zinc-500 @2xl/surface:min-h-0">
        <span className="shrink-0 grid place-items-center size-5"><Icon name="more-horiz" className="size-4" /></span>
        Toutes les actions
      </button>
    )
  );

  const list = visible.length === 0 ? (
    <p className="t-small-regular text-zinc-400 px-0.5 py-2">Aucune action ne correspond à « {query.trim()} »</p>
  ) : compact ? (
    <div className={rowsCls}>
      {visible.map((a, i) => Row(a, i))}
      {gallery}
    </div>
  ) : (
    <div className={gridCls}>
      {visible.map((a, i) => Card(a, i))}
      {gallery}
    </div>
  );

  const body = (
    <div className="flex flex-col gap-2">
      {!collapsed && (
        <SearchField value={query} onChange={setQuery} placeholder="Rechercher une action…" />
      )}
      {list}
      {collapsed && (truncated || expanded) && (
        <button
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="mx-auto inline-flex items-center gap-1 py-1 t-small-medium text-blue-600 hover:text-blue-700"
        >
          {expanded ? 'Voir moins' : 'Voir plus'}
          <Icon name={expanded ? 'chevron-up' : 'chevron-down'} className="size-3.5" />
        </button>
      )}
    </div>
  );

  // ── SMART (detected upload / folder): "analyse" then resolve. ──
  if (smart && analyzing) {
    const label = source === 'folder' ? 'Analyse du dossier…' : 'Analyse de vos documents…';
    // Match what will actually resolve: the fold + gallery slot in repliée,
    // the whole list in complète — so the block keeps its height, no jump.
    const count = collapsed ? Math.min(items.length, COLLAPSED_COUNT) + 1 : items.length;
    return (
      <div className="w-full">
        <div className="flex items-center gap-1.5 mb-3">
          <Icon name="sparkles" className="size-3.5 text-zinc-400 animate-pulse shrink-0" />
          <span className="t-small-medium text-zinc-500">{label}</span>
        </div>
        {compact ? (
          <div className={rowsCls}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="px-3 py-2.5 @2xl/surface:py-2"><span className="block h-5 rounded shimmer" style={{ width: `${45 + (i % 4) * 12}%` }} /></div>
            ))}
          </div>
        ) : (
          <div className={gridCls}>
            {Array.from({ length: count }).map((_, i) => <span key={i} className="h-[62px] rounded-xl shimmer" />)}
          </div>
        )}
      </div>
    );
  }

  if (smart) {
    return (
      <div className="w-full">
        <div className="flex items-baseline gap-1.5 mb-3 detect-rise">
          <Icon name="sparkles" className="size-3.5 self-center text-zinc-400 detect-spark shrink-0" />
          <span className="t-small-medium text-zinc-700">{detection.title}</span>
          <span className="t-small-regular text-zinc-400 truncate">· {detection.meta}</span>
        </div>
        {body}
      </div>
    );
  }

  // ── CURATED (and FIRM): hand-picked, ending with "Toutes les actions". ──
  return (
    <div className="w-full">
      {firm ? (
        <div className="flex items-baseline gap-1.5 mb-2 px-0.5">
          <span className="t-small-medium text-zinc-700">{detection.title}</span>
          <span className="t-small-regular text-zinc-400 truncate">· {detection.meta}</span>
        </div>
      ) : (
        <div className="flex items-baseline justify-between mb-2 px-0.5">
          <span className="t-small-medium text-zinc-400">Actions rapides</span>
          <span className="t-small-regular text-zinc-400">{filtered.length} action{filtered.length > 1 ? 's' : ''}</span>
        </div>
      )}
      {body}
    </div>
  );
}

