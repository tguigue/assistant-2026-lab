import { useState, useEffect } from 'react';
import { useChatbot } from '../chatbot/store';
import { SCENARIOS } from '../chatbot/scenarios';
import { Icon } from './ui';
import { EmptyState } from './EmptyState';
import { Conversation, DIFF_TOTAL } from './Conversation';
import { ComposerBar } from './ComposerBar';
import { SurfaceScope, useElementNarrow } from './SurfaceScope';

/**
 * Surfaces — WHERE the chatbot lives. The same primitives render everywhere;
 * only the container changes. Off full-screen, the composer applies its
 * compact rule (see InputCard). The document mock and the panel chrome are
 * canvas scenery, not primitives.
 */

/* ─────────────────── Doc surface — draft + assistant panel ─────────────────── */

export function DocSurface() {
  const view = useChatbot((s) => s.viewMode);
  // When the Tool output is a diff (edits review / clause analysis), the
  // document carries the floating review toolbar — navigate / ignore / apply.
  const reviewing = useChatbot((s) => {
    const a9 = s.primitives.A9;
    return a9.visible && (a9.content === 'edits' || a9.content === 'clause-analysis');
  }) && view === 'full';
  // D3 — the Sources side panel replaces the assistant column when open.
  const sourcesOpen = useChatbot((s) => s.primitives.D3.visible || s.sourcesPanel.open);
  // Multi-doc generation (S6): the document column becomes a tabbed set.
  const artifacts = useChatbot((s) => SCENARIOS[s.comp.scenario].artifacts);

  // Below ~46rem the document and the panel can't share a row: the doc needs a
  // readable measure and the panel needs its 320px floor. So the Éditeur STACKS
  // — one pane at a time, picked from a tab bar. Nothing is dropped.
  const [rootRef, stacked] = useElementNarrow(736);
  const [pane, setPane] = useState<'doc' | 'assistant'>('doc');
  // Opening Sources must show it, not leave you on a pane it replaced.
  useEffect(() => { if (sourcesOpen) setPane('assistant'); }, [sourcesOpen]);

  const docPane = (
    // Its own scope: the document header and review toolbar adapt to the WIDTH
    // OF THE DOCUMENT COLUMN, which is wide next to the panel and phone-sized
    // once stacked.
    <SurfaceScope className="relative flex-1 min-w-0 flex flex-col border-r border-zinc-200">
      <DocHeader />
      {artifacts && artifacts.length > 0 ? (
        <MultiDocView artifacts={artifacts} />
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin bg-zinc-50/60">
          <DocMock />
        </div>
      )}
      {reviewing && <ReviewToolbar />}
    </SurfaceScope>
  );

  const assistantPane = (
    <SurfaceScope
      className={
        (stacked ? 'flex-1 min-w-0 ' : 'w-[400px] shrink-0 ') +
        'flex flex-col min-h-0 ' + (sourcesOpen && !stacked ? 'hidden' : '')
      }
    >
      {/* No tabs: the panel IS the full-screen experience folded to panel width
          (see SurfaceScope) — composer + suggestions when empty, then the answer. */}
      {view === 'empty' ? (
        // EmptyState brings its own composer — same one as full screen.
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
          <EmptyState />
        </div>
      ) : (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-2 py-4">
            <Conversation />
          </div>
          <div className="shrink-0 px-3 pb-3">
            <ComposerBar />
          </div>
        </>
      )}
    </SurfaceScope>
  );

  if (stacked) {
    return (
      <div ref={rootRef} className="flex-1 min-h-0 flex flex-col bg-white">
        <PaneTabs pane={pane} setPane={setPane} sourcesOpen={sourcesOpen} />
        {pane === 'doc'
          ? docPane
          : sourcesOpen
            ? <SourcesPanel stacked />
            : assistantPane}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="flex-1 min-h-0 flex bg-white">
      {/* Document (scenery) — single doc, or a tabbed set for multi-doc generation. */}
      {docPane}

      {/* Right column: the Sources panel takes over when open, else the assistant. */}
      {sourcesOpen && <SourcesPanel />}

      {/* Assistant panel — the chatbot, narrow */}
      {assistantPane}
    </div>
  );
}

/* Stacked Éditeur — the one tab bar. Document / Assistant, plus Sources while
   it's open (it replaces the assistant pane, same as wide). */
function PaneTabs({
  pane, setPane, sourcesOpen,
}: {
  pane: 'doc' | 'assistant';
  setPane: (p: 'doc' | 'assistant') => void;
  sourcesOpen: boolean;
}) {
  const tabs: { id: 'doc' | 'assistant'; label: string }[] = [
    { id: 'doc', label: 'Document' },
    { id: 'assistant', label: sourcesOpen ? 'Sources' : 'Assistant' },
  ];
  return (
    <div className="shrink-0 p-2 border-b border-zinc-100 bg-white">
      <div className="flex gap-0.5 p-0.5 rounded-lg bg-zinc-100">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setPane(t.id)}
            className={'flex-1 h-8 rounded-md t-base-medium transition-colors ' +
              (pane === t.id ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900')}
          >
            {t.label}
          </button>
        ))}
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
    // Narrow, the toolbar spans the column and wraps instead of being centred
    // and clipped at both ends — the buttons keep their labels.
    <div className="absolute bottom-4 inset-x-3 z-20 flex flex-wrap items-center justify-center gap-0.5 px-1.5 py-1 rounded-xl bg-white border border-zinc-200 shadow-lg @2xl/surface:inset-x-auto @2xl/surface:bottom-5 @2xl/surface:left-1/2 @2xl/surface:-translate-x-1/2 @2xl/surface:flex-nowrap">
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

function SourcesPanel({ stacked }: { stacked?: boolean }) {
  const data = useChatbot((s) => SCENARIOS[s.comp.scenario].sourcesPanel);
  const refDoc = useChatbot((s) => SCENARIOS[s.comp.scenario].referenceDoc);
  const close = useChatbot((s) => s.closeSourcesPanel);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  const onClose = () => { close(); setVisible('D3', false); };

  return (
    <SurfaceScope className={(stacked ? 'flex-1 min-w-0 ' : 'w-[400px] shrink-0 border-l border-zinc-200 ') + 'flex flex-col min-h-0'}>
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
    </SurfaceScope>
  );
}

function DocHeader() {
  const prim = useChatbot((s) => s.primitives);
  const refDoc = useChatbot((s) => SCENARIOS[s.comp.scenario].referenceDoc);
  const showRefDoc = prim.D2.visible && !!refDoc;
  // Narrow: the header keeps every control but stops pretending it's one row —
  // it wraps, the labels that carry no information collapse to their icon, and
  // the title takes the width it needs. Nothing moves into a "…" the way a
  // hand-made mobile header would.
  return (
    <div className="shrink-0 flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2 px-3 border-b border-zinc-200 bg-white @2xl/surface:flex-nowrap @2xl/surface:h-14 @2xl/surface:py-0 @2xl/surface:px-4">
      <button className="inline-flex items-center gap-1.5 t-base-medium text-zinc-700 hover:text-zinc-900 shrink-0" title="Retour">
        <Icon name="arrow-left" className="size-4" />
        <span className="hidden @2xl/surface:inline">Retour</span>
      </button>
      <span className="hidden @2xl/surface:inline h-5 w-px bg-zinc-200" />
      <button className="inline-flex items-center gap-2 min-w-0 t-base-semibold text-zinc-900">
        <span className="size-2.5 rounded-full bg-indigo-500 shrink-0" />
        <span className="truncate">BAIL COMMERCIAL</span>
        <Icon name="chevron-down" className="size-3.5 text-zinc-500 shrink-0" />
      </button>

      {/* Version selector — plain Éditeur header chrome, not a primitive. */}
      <button className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-zinc-200 t-small-medium text-zinc-600 hover:bg-zinc-50 shrink-0" title="Versions du document">
        v3
        <Icon name="chevron-down" className="size-3 text-zinc-500" />
      </button>

      {/* D2 — reference document badge */}
      {showRefDoc && (
        <span className="inline-flex items-center gap-1.5 h-7 px-2 rounded-md bg-zinc-100 t-small-regular text-zinc-600 max-w-[280px] shrink min-w-0" title={refDoc!.name}>
          <Icon name="file-text" className="size-3.5 text-zinc-500 shrink-0" />
          <span className="truncate">Réf. : {refDoc!.name}</span>
        </span>
      )}

      <div className="ml-auto flex items-center gap-2.5 shrink-0">
        <div className="flex items-center -space-x-1.5">
          <span className="grid place-items-center size-6 rounded-full bg-fuchsia-400 text-white t-micro ring-2 ring-white">SG</span>
          <span className="grid place-items-center size-6 rounded-full bg-emerald-400 text-white t-micro ring-2 ring-white">AT</span>
          <span className="grid place-items-center size-6 rounded-full bg-zinc-200 text-zinc-600 t-micro ring-2 ring-white">+1</span>
        </div>
        <button className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white t-small-medium transition-colors @2xl/surface:px-3" title="Télécharger">
          <Icon name="upload" className="size-3.5 text-inherit" />
          <span className="hidden @2xl/surface:inline">Télécharger</span>
        </button>
      </div>
    </div>
  );
}

/* Abstract "prototyping" body — two-tone hierarchy, no real text: a darker
   heading bar over indented lighter body lines. Mock sits on the white page,
   so plain zinc tones are fine (no dark mode). */
function DocSection({ headingW, bodyWidths }: { headingW: number; bodyWidths: number[] }) {
  return (
    <div className="mb-9">
      <div className="h-2.5 rounded bg-zinc-300 mb-4" style={{ width: `${headingW}%` }} />
      <div className="space-y-2.5 pl-6">
        {bodyWidths.map((w, i) => (
          <div key={i} className="h-2 rounded bg-zinc-200" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

// A few skeleton layouts so switching multi-doc tabs shows a different shape.
const DOC_LAYOUTS: { headingW: number; bodyWidths: number[] }[][] = [
  [{ headingW: 42, bodyWidths: [100, 88] }, { headingW: 28, bodyWidths: [100, 60] }, { headingW: 48, bodyWidths: [100, 96, 70] }, { headingW: 36, bodyWidths: [100, 92, 54] }],
  [{ headingW: 38, bodyWidths: [100, 70] }, { headingW: 46, bodyWidths: [100, 90, 52] }, { headingW: 30, bodyWidths: [100, 84] }],
  [{ headingW: 50, bodyWidths: [100, 95, 66] }, { headingW: 34, bodyWidths: [100, 78] }, { headingW: 44, bodyWidths: [100, 90, 100, 58] }],
];

// Abstract "prototyping" page: centered grey title bar + two-tone sections.
function AbstractDocBody({ layout = 0 }: { layout?: number }) {
  return (
    <>
      <div className="h-3.5 w-1/2 rounded bg-zinc-300 mx-auto mb-12" />
      {DOC_LAYOUTS[layout % DOC_LAYOUTS.length].map((s, i) => (
        <DocSection key={i} headingW={s.headingW} bodyWidths={s.bodyWidths} />
      ))}
    </>
  );
}

function DocMock() {
  return (
    <div className="max-w-2xl mx-auto bg-white border-x border-zinc-100 min-h-full px-12 py-12">
      <AbstractDocBody />
    </div>
  );
}

/* Multi-doc Éditeur — a tab strip of the generated documents (S6); the active
   document's body renders below. */
type Artifact = { title: string; body: { kind: string; text?: string; html?: string }[]; footer: string };

function MultiDocView({ artifacts }: { artifacts: Artifact[] }) {
  const [active, setActive] = useState(0);
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
        {/* Tab names stay real (navigation); the page body is the abstract mock. */}
        <div className="max-w-2xl mx-auto bg-white border-x border-zinc-100 min-h-full px-12 py-12">
          <AbstractDocBody layout={active} />
        </div>
      </div>
    </>
  );
}
