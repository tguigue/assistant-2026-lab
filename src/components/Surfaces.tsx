import { useState, useEffect } from 'react';
import { useChatbot } from '../chatbot/store';
import { SCENARIOS } from '../chatbot/scenarios';
import { Icon } from './ui';
import { EmptyState } from './EmptyState';
import { Conversation, DIFF_TOTAL } from './Conversation';
import { ComposerBar } from './ComposerBar';
import { ConversationHeader } from './ConversationHeader';

/**
 * Surfaces — WHERE the chatbot lives. The same primitives render everywhere;
 * only the container changes. Off full-screen, the composer applies its
 * compact rule (see InputCard). The document mock and the panel chrome are
 * canvas scenery, not primitives.
 */

/* ─────────────────── Doc surface — draft + assistant panel ─────────────────── */

export function DocSurface() {
  const view = useChatbot((s) => s.viewMode);
  // When the answer proposes edits (A5 visible), the document carries the
  // floating review toolbar — navigate / ignore / apply, like the draft UI.
  const reviewing = useChatbot((s) => s.primitives.A5.visible) && view === 'full';
  // D3 — the Sources side panel replaces the assistant column when open.
  const sourcesOpen = useChatbot((s) => s.primitives.D3.visible || s.sourcesPanel.open);
  // Multi-doc generation (S6): the document column becomes a tabbed set.
  const artifacts = useChatbot((s) => SCENARIOS[s.comp.scenario].artifacts);
  const [tab, setTab] = useState<'actions' | 'assistant'>('actions');
  // Follow the canvas state: switching to Answer should reveal the answer in
  // the panel (Assistant tab), not leave you stranded on the Actions gallery.
  useEffect(() => { setTab(view === 'full' ? 'assistant' : 'actions'); }, [view]);

  return (
    <div className="flex-1 min-h-0 flex bg-white">
      {/* Document (scenery) — single doc, or a tabbed set for multi-doc generation. */}
      <div className="relative flex-1 min-w-0 flex flex-col border-r border-zinc-200">
        <DocHeader />
        {artifacts && artifacts.length > 0 ? (
          <MultiDocView artifacts={artifacts} />
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin bg-zinc-50/60">
            <DocMock />
          </div>
        )}
        {reviewing && <ReviewToolbar />}
      </div>

      {/* Right column: the Sources panel takes over when open, else the assistant. */}
      {sourcesOpen && <SourcesPanel />}

      {/* Assistant panel — the chatbot, narrow */}
      <div className={'w-[400px] shrink-0 flex flex-col min-h-0 ' + (sourcesOpen ? 'hidden' : '')}>
        <div className="shrink-0 p-3 border-b border-zinc-100">
          <div className="flex gap-0.5 p-0.5 rounded-lg bg-zinc-100">
            {([['actions', 'Actions'], ['assistant', 'Assistant']] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={'flex-1 h-7 rounded-md t-base-medium transition-colors ' +
                  (tab === id ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'assistant' && view === 'empty' ? (
          // EmptyState brings its own composer (compact via the surface rule).
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
            <EmptyState />
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-5 py-4">
              {tab === 'actions' ? <ActionsGallery /> : <Conversation />}
            </div>
            <div className="shrink-0 px-3 pb-3">
              <ComposerBar />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* Floating review toolbar over the document — step through the proposed
   changes, ignore/apply one, or apply them all (the draft experience). */
function ReviewToolbar() {
  const [current, setCurrent] = useState(1);
  const total = DIFF_TOTAL; // keep in sync with the edits-review change count
  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0.5 px-1.5 py-1 rounded-xl bg-white border border-zinc-200 shadow-lg">
      <button
        onClick={() => setCurrent((c) => Math.max(1, c - 1))}
        className="size-7 grid place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100"
        title="Changement précédent"
      >
        <Icon name="chevron-up" className="size-3.5" />
      </button>
      <span className="px-1 t-base-medium text-zinc-900 whitespace-nowrap tabular-nums">{current} sur {total}</span>
      <button
        onClick={() => setCurrent((c) => Math.min(total, c + 1))}
        className="size-7 grid place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100"
        title="Changement suivant"
      >
        <Icon name="chevron-down" className="size-3.5" />
      </button>
      <span className="mx-1 h-5 w-px bg-zinc-200" />
      <button className="h-8 px-3 rounded-lg t-base-medium text-zinc-700 hover:bg-zinc-100 whitespace-nowrap">Ignorer</button>
      <button className="h-8 px-3 rounded-lg t-base-medium text-zinc-700 hover:bg-zinc-100 whitespace-nowrap">Appliquer</button>
      <button className="h-8 px-3 rounded-lg t-base-medium bg-zinc-900 text-white hover:bg-zinc-800 whitespace-nowrap">Tout appliquer</button>
      <button className="size-7 grid place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100" title="Fermer">
        <Icon name="x" className="size-4" />
      </button>
    </div>
  );
}

/* D3 — Sources side panel: reference-document excerpts + legal article cards.
   Opened from an edits-review change’s "Sources"; reads scenario.sourcesPanel. */
const ARTICLE_STATUS: Record<string, { label: string; cls: string }> = {
  'à-jour':   { label: '✅ À jour',   cls: 'bg-emerald-50 text-emerald-700' },
  'obsolète': { label: '⚠ Obsolète',  cls: 'bg-amber-50 text-amber-700' },
  'modifié':  { label: '✎ Modifié',   cls: 'bg-blue-50 text-blue-700' },
};

function SourcesPanel() {
  const data = useChatbot((s) => SCENARIOS[s.comp.scenario].sourcesPanel);
  const refDoc = useChatbot((s) => SCENARIOS[s.comp.scenario].referenceDoc);
  const close = useChatbot((s) => s.closeSourcesPanel);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  const onClose = () => { close(); setVisible('D3', false); };

  return (
    <div className="w-[400px] shrink-0 flex flex-col min-h-0 border-l border-zinc-200">
      <div className="shrink-0 flex items-center justify-between gap-2 h-14 px-4 border-b border-zinc-200">
        <span className="t-base-semibold text-zinc-900 truncate">Sources — Désignation</span>
        <button onClick={onClose} className="size-7 grid place-items-center rounded-md text-zinc-500 hover:bg-zinc-100" title="Fermer">
          <Icon name="x" className="size-4" />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-4 py-4 space-y-5">
        {!data ? (
          <p className="t-small-regular text-zinc-400">Aucune source pour cette section.</p>
        ) : (
          <>
            {/* Reference-document excerpts */}
            {data.excerpts.map((e, i) => (
              <div key={i}>
                <div className="t-small-semibold text-zinc-900 mb-1 truncate">{e.docLabel}</div>
                <p className="t-small-regular text-zinc-600 leading-relaxed">« {e.quote} »</p>
              </div>
            ))}
            {/* Legal article cards */}
            <div className="pt-1 border-t border-zinc-100 space-y-2.5">
              {data.articles.map((a) => {
                const st = ARTICLE_STATUS[a.status];
                return (
                  <div key={a.ref} className="rounded-lg border border-zinc-200 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="t-small-semibold text-zinc-900">{a.ref}</span>
                      <span className={'inline-flex items-center px-2 h-5 rounded-full t-micro normal-case tracking-normal font-medium shrink-0 ' + st.cls}>{st.label}</span>
                    </div>
                    {a.note && <p className="mt-0.5 t-small-regular text-zinc-500">{a.note}</p>}
                  </div>
                );
              })}
            </div>
            {refDoc && (
              <p className="t-micro text-zinc-400 normal-case tracking-normal">Source : {refDoc.name}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function DocHeader() {
  const prim = useChatbot((s) => s.primitives);
  const refDoc = useChatbot((s) => SCENARIOS[s.comp.scenario].referenceDoc);
  const showVersions = prim.D1.visible;
  const versionsVariant = prim.D1.variant;
  const showRefDoc = prim.D2.visible && !!refDoc;
  return (
    <div className="shrink-0 flex items-center gap-3 h-14 px-4 border-b border-zinc-200 bg-white">
      <button className="inline-flex items-center gap-1.5 t-base-medium text-zinc-700 hover:text-zinc-900">
        <Icon name="arrow-left" className="size-4" /> Retour
      </button>
      <span className="h-5 w-px bg-zinc-200" />
      <button className="inline-flex items-center gap-2 t-base-semibold text-zinc-900">
        <span className="size-2.5 rounded-full bg-indigo-500" />
        BAIL COMMERCIAL
        <Icon name="chevron-down" className="size-3.5 text-zinc-400" />
      </button>

      {/* D1 — document versions */}
      {showVersions && (
        <button className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-zinc-200 t-small-medium text-zinc-600 hover:bg-zinc-50 shrink-0" title="Versions du document">
          {versionsVariant === 'history' ? <Icon name="refresh" className="size-3.5 text-zinc-400" /> : null}
          {versionsVariant === 'history' ? 'Historique' : 'v3'}
          <Icon name="chevron-down" className="size-3 text-zinc-400" />
        </button>
      )}

      {/* D2 — reference document badge */}
      {showRefDoc && (
        <span className="inline-flex items-center gap-1.5 h-7 px-2 rounded-md bg-zinc-100 t-small-regular text-zinc-600 max-w-[280px] shrink min-w-0" title={refDoc!.name}>
          <Icon name="file-text" className="size-3.5 text-zinc-400 shrink-0" />
          <span className="truncate">Réf. : {refDoc!.name}</span>
        </span>
      )}

      <div className="ml-auto flex items-center gap-2.5 shrink-0">
        <div className="flex items-center -space-x-1.5">
          <span className="grid place-items-center size-6 rounded-full bg-fuchsia-400 text-white t-micro ring-2 ring-white">SG</span>
          <span className="grid place-items-center size-6 rounded-full bg-emerald-400 text-white t-micro ring-2 ring-white">AT</span>
          <span className="grid place-items-center size-6 rounded-full bg-zinc-200 text-zinc-600 t-micro ring-2 ring-white">+1</span>
        </div>
        <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white t-small-medium transition-colors">
          <Icon name="upload" className="size-3.5" /> Télécharger
        </button>
      </div>
    </div>
  );
}

const BLANK = <span className="inline-block min-w-28 border-b border-zinc-400 align-baseline" />;

function DocMock() {
  return (
    <div className="max-w-2xl mx-auto bg-white border-x border-zinc-100 min-h-full px-12 py-12 text-zinc-800">
      <h1 className="text-center t-title-3 text-zinc-900 mb-10">BAIL COMMERCIAL</h1>

      <h2 className="t-base-semibold text-zinc-900 mb-2">DÉSIGNATION DES PARTIES</h2>
      <p className="t-base-regular mb-3">Le présent contrat est conclu entre les soussignés :</p>
      <p className="t-base-regular mb-2">D’une part,</p>
      <p className="t-base-semibold mb-2">1. Le(s) Bailleur(s)</p>
      <p className="t-base-regular leading-loose mb-3">{BLANK}, {BLANK} de nationalité {BLANK}, né(e) le {BLANK} à {BLANK}, demeurant {BLANK} ;</p>
      <p className="t-base-regular mb-3">Désigné(s) ci-après, le <b>« Bailleur »</b> ;</p>
      <p className="t-base-regular mb-2">Et, d’autre part,</p>
      <p className="t-base-semibold mb-2">2. Le Preneur</p>
      <p className="t-base-regular leading-loose mb-3">{BLANK}, {BLANK} de nationalité {BLANK}, né(e) le {BLANK} à {BLANK}, demeurant {BLANK} ;</p>
      <p className="t-base-regular mb-4">désigné(s) ci-après le <b>« Preneur »</b>. Le Bailleur et le Preneur étant ci-après désignés, ensemble, les <b>« Parties »</b>.</p>

      <h2 className="t-base-semibold text-zinc-900 mb-2">IL EST PRÉALABLEMENT EXPOSÉ CE QUI SUIT :</h2>
      <p className="t-base-regular mb-4">
        Par les présentes, le Bailleur donne à bail commercial, conformément aux dispositions des articles L.145-1 à L.145-60,
        R.145-1 à R.145-11, R.145-20 à R.145-33 et D.145-12 à D.145-19 du Code de commerce, à celles non abrogées du décret
        du 30 septembre 1953 modifié et des textes subséquents, au Preneur qui accepte, les locaux ci-après désignés.
      </p>

      <h2 className="t-title-4 text-zinc-900 mb-2">Article 1 - Désignation</h2>
      <p className="t-base-regular leading-loose">
        Le présent bail porte sur des locaux (les <b>« Lieux Loués »</b>) dépendant d’un immeuble sis {BLANK}, {BLANK}, comprenant :
        {BLANK} pièces principales, d’une superficie de {BLANK} m², situé à(aux) étage(s) n° {BLANK} ;
      </p>
    </div>
  );
}

/* Multi-doc Éditeur — a tab strip of the generated documents (S6); the active
   document's body renders below. */
type Artifact = { title: string; body: { kind: string; text?: string; html?: string }[]; footer: string };

function MultiDocView({ artifacts }: { artifacts: Artifact[] }) {
  const [active, setActive] = useState(0);
  const doc = artifacts[Math.min(active, artifacts.length - 1)];
  return (
    <>
      <div className="shrink-0 flex items-center gap-1 px-3 pt-2 border-b border-zinc-200 bg-white overflow-x-auto scrollbar-thin">
        {artifacts.map((a, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={'shrink-0 px-3 h-9 -mb-px border-b-2 t-small-medium transition-colors whitespace-nowrap ' +
              (i === active ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-800')}
          >
            {a.title}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin bg-zinc-50/60">
        <div className="max-w-2xl mx-auto bg-white border-x border-zinc-100 min-h-full px-12 py-12 text-zinc-800">
          <h1 className="text-center t-title-3 text-zinc-900 mb-8">{doc.title}</h1>
          {doc.body.map((b, i) =>
            b.kind === 'h'
              ? <h2 key={i} className="t-base-semibold text-zinc-900 mt-4 mb-2">{b.text}</h2>
              : <p key={i} className="t-base-regular leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: b.html ?? '' }} />,
          )}
          <p className="mt-8 t-small-regular text-zinc-400">{doc.footer}</p>
        </div>
      </div>
    </>
  );
}

/* The actions gallery — same data family as the action picker; unified section
   style (dark medium title + quiet divided list). "Voir plus" opens the picker. */
const GALLERY = [
  'Anonymiser les données personnelles',
  'Compléter le modèle avec vos fichiers',
  'Corriger les fautes et améliorer la rédaction',
];

function ActionsGallery() {
  const setActionPickerOpen = useChatbot((s) => s.setActionPickerOpen);
  return (
    <div>
      <div className="t-base-medium text-zinc-900 mb-1">Galerie d’actions</div>
      <ul className="divide-y divide-zinc-100">
        {GALLERY.map((a) => (
          <li key={a}>
            <button className="w-full text-left py-2.5 t-base-regular text-zinc-700 hover:text-zinc-900 transition-colors">
              {a}
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() => setActionPickerOpen(true)}
        className="mt-2 w-full inline-flex items-center justify-center gap-1 py-1.5 t-base-medium text-blue-600 hover:text-blue-700"
      >
        <Icon name="plus" className="size-3.5" /> Voir plus
      </button>
    </div>
  );
}

/* ─────────────────────────── Mobile surface ─────────────────────────── */

export function MobileSurface() {
  const view = useChatbot((s) => s.viewMode);
  return (
    <div className="flex-1 min-h-0 grid place-items-center bg-zinc-100 p-6">
      <div className="w-[390px] h-[780px] max-h-full flex flex-col bg-white rounded-[2.2rem] border border-zinc-300 shadow-xl overflow-hidden">
        <ConversationHeader />
        {view === 'empty' ? (
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
            <EmptyState />
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
              <Conversation />
            </div>
            <div className="shrink-0 px-3 pb-4">
              <ComposerBar />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
