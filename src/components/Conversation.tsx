import { useState, useEffect } from 'react';
import { useChatbot } from '../chatbot/store';
import { SCENARIOS } from '../chatbot/scenarios';
import type { AnswerBlock, Citation } from '../chatbot/types';
import { Icon, FileCard } from './ui';
import { PrimitiveSlot } from './PrimitiveSlot';
import { ToolCard, ToolIcon, CardFooterButton } from './ToolCard';
import { WatcherInline, WATCHER_SUGGESTIONS, useOpenWatcher } from './WatcherCreation';

/**
 * Conversation — renders the assistant response with rich legal structure.
 * Reads primitive variants from the store; every variant produces a visible change.
 */
export function Conversation() {
  const comp = useChatbot((s) => s.comp);
  const prim = useChatbot((s) => s.primitives);
  const scenario = SCENARIOS[comp.scenario];

  // Each primitive is either visible (its chosen variant) or hidden.
  const v = (code: keyof typeof prim) => (prim[code].visible ? prim[code].variant : 'hidden');
  const a0 = v('A0'), a1 = v('A1'), a2 = v('A2'), a4 = v('A4'), a7 = v('A7'), a8 = v('A8'), a9 = v('A9');
  const d4 = prim.D4.visible; // legal-article check
  const a0Example = prim.A0.axisVariants?.example ?? 'edit';
  // A4 "Tool suggestion" — handoff CTAs; slot = top ("better tool") / bottom ("next step").
  const a4Content = Array.isArray(prim.A4.content) ? prim.A4.content : ['counsel'];
  const a4Slot = prim.A4.axisVariants?.slot ?? 'bottom';
  // Paid-tool entitlement now lives on the A4 primitive itself (its `owned` axis).
  const addonsOwned = prim.A4.axisVariants?.owned === 'owned';
  // A9 "Tool output" — the answer IS a tool output: one doc, several, or a table.
  const a9Content = typeof prim.A9.content === 'string' ? prim.A9.content : 'document';
  const a9Multiple = a9Content === 'documents';
  // Edits review + clause analysis are diff-shaped tool outputs (an edit tool's result).
  const a9IsDiff = a9Content === 'edits' || a9Content === 'clause-analysis';
  // A2 "Answer" — toggles for which elements show + excerpt style.
  const a2Content = Array.isArray(prim.A2.content) ? prim.A2.content : ['excerpt', 'sources', 'docs'];
  const a2Excerpt = prim.A2.axisVariants?.excerpt ?? 'inline-highlight';
  const showExcerpt = a2 !== 'hidden' && a2Content.includes('excerpt');
  const showSources = a2 !== 'hidden' && a2Content.includes('sources');
  const showDocs    = a2 !== 'hidden' && a2Content.includes('docs');
  const a1ContentSet = Array.isArray(prim.A1.content) ? prim.A1.content : [];
  const a1Phase = a1ContentSet.includes('running') ? 'running' : 'done';
  // A7 extras — the optional "Créer une veille" action opens the A10 surface.
  const a7Watcher = Array.isArray(prim.A7.content) && prim.A7.content.includes('veille');
  const openWatcher = useOpenWatcher();

  // All citations always available — primitive variants are pure visual choices.
  // Designers can preview any A3/A5 variant without scenario params blocking it.
  const visibleCitations = scenario.citations;

  // A4 "Tool suggestion" — handoff cards, placed top/bottom by slot.
  const a4Block = a4 !== 'hidden' && a4Content.length > 0 ? (
    <PrimitiveSlot code="A4" block>
      <div className="space-y-2">
        {a4Content.map((c) => <ToolSuggestion key={c} content={c} question={scenario.prompt} owned={addonsOwned} variant={a4} />)}
      </div>
    </PrimitiveSlot>
  ) : null;

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-8 space-y-8">
      {/* User message — all chassis. If the scenario attached a file, show it as a FileCard above the bubble. */}
      <div className="flex justify-end">
        <div className="max-w-[80%] flex flex-col items-end gap-2">
          {scenario.attached && (
            <FileCard name={scenario.attached.name} meta={scenario.attached.meta} className="max-w-[280px]" />
          )}
          <div className="px-4 py-2.5 rounded-2xl rounded-br-md bg-zinc-100 t-large-regular text-zinc-900">
            {scenario.prompt}
          </div>
        </div>
      </div>

      {/* A1 — Reasoning */}
      <PrimitiveSlot code="A1" block>
        <PlanPreamble variant={a1} phase={a1Phase} scenario={comp.scenario} />
      </PrimitiveSlot>

      {/* D4 — Legal-article check (verification cards above the edits review) */}
      {d4 && (
        <PrimitiveSlot code="D4" block>
          <ArticleCheck articles={scenario.sourcesPanel?.articles ?? []} />
        </PrimitiveSlot>
      )}

      {/* A4 Tool suggestion (top slot) — a better tool BEFORE the answer. */}
      {a4Slot === 'top' && a4Block}

      {/* Body — Text answer (A2) + A9 Tool output (the answer as a tool result:
          a generated doc/table, or a diff — edits review / clause analysis). */}
      {a2 !== 'hidden' && (
        <AssistantBody
          showExcerpt={showExcerpt}
          showSources={showSources}
          showDocs={showDocs}
          excerptStyle={a2Excerpt}
          blocks={scenario.answer}
          citations={visibleCitations}
        />
      )}
      {a9 !== 'hidden' && (
        <PrimitiveSlot code="A9" block>
          {a9IsDiff ? (
            <DiffWidget variant={a9Content === 'clause-analysis' ? 'clause-analysis' : 'full'} />
          ) : (
            <ToolCTA
              variant="preview"
              contentSet={[a9Content === 'extract' ? 'extract' : 'document']}
              artifactTitle={scenario.artifact?.title}
              docTitles={
                a9Multiple
                  ? (scenario.artifacts?.map((a) => a.title) ?? MULTI_DOC_TITLES)
                  : (scenario.artifact ? [scenario.artifact.title] : [BAIL_DOC_TITLE])
              }
              previewBlocks={scenario.artifact?.body ?? BAIL_PREVIEW}
            />
          )}
        </PrimitiveSlot>
      )}

      {/* A4 Tool suggestion (bottom slot) — "next step" after the answer. */}
      {a4Slot !== 'top' && a4Block}

      {/* A7 — Answer Actions */}
      <PrimitiveSlot code="A7" block><AnswerActions variant={a7} watcher={a7Watcher} onWatcher={openWatcher} /></PrimitiveSlot>

      {/* A10 — Watcher creation (card / strip forms render in the flow, right
          under the actions bar that opens it; the modal form mounts in Chatbot). */}
      <WatcherInline />

      {/* A8 — Suggested follow-ups */}
      <PrimitiveSlot code="A8" block><Followups variant={a8} items={scenario.followups} /></PrimitiveSlot>

      {/* A0 — Ask user question. One card design; the Example axis picks the
          question (edit / choice / sources). Docks above the composer. */}
      {a0 !== 'hidden' && (
        <div className="sticky bottom-0 -mx-6 -mb-8 px-6 pt-3 pb-0 bg-gradient-to-t from-white via-white to-white/0 z-10">
          <PrimitiveSlot code="A0" block>
            {a0Example === 'edit'       && <AskEdit />}
            {a0Example === 'choice'     && <AskChoice />}
            {a0Example === 'sources'    && <AskSources />}
            {a0Example === 'toolchoice' && <AskToolChoice />}
            {a0Example === 'snippet'    && <AskSnippet />}
            {a0Example === 'veille'     && <AskWatcher />}
          </PrimitiveSlot>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------
   Helpers
   ---------------------------------------------------------------------- */

function escapeHtml(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;' }[c] ?? c));
}
function escapeAttr(s: string) {
  return escapeHtml(s).replace(/"/g, '&quot;');
}

// Citations split by kind:
//   - external (decisions, laws, Doctrine corpus) → A3 Text Citation (pill / bracketed)
//   - internal (uploaded files, matter docs, KB memos) → A6 Number Citation (numbered-footnote / superscript)
// Each variant is independent — designers can switch them on the dashboard separately.
function renderInlineCitations(
  html: string,
  citations: Record<string, Citation>,
  a3On: boolean,
  a6On: boolean,
): string {
  let n = 0;
  return html.replace(/\[\[(\w+)\]\]/g, (_, key) => {
    const c = citations[key];
    if (!c) return '';
    const label = escapeHtml(c.label);
    const title = escapeAttr(c.full);

    // Internal → A6 Document Citation: a plain number marker. Private doc names
    // stay out of the prose (a split-view reveal comes later, not clickable yet).
    if (c.kind === 'internal') {
      if (!a6On) return ''; // document citations toggled off → no marker
      n++;
      return ` <span class="cite-pill cite-pill--internal cite-slot" data-primitive="A2" style="min-width:22px;padding:1px 6px;justify-content:center;font-weight:600;">${n}</span> `;
    }

    // External → public source citation: blue underlined text (chatbot controls the name).
    if (!a3On) return label; // source citations toggled off → plain text, no link
    return `<a class="cite-slot" data-primitive="A2" style="color:#2563eb;text-decoration:underline;text-underline-offset:2px;text-decoration-color:#93c5fd;" title="${title}">${label}</a>`;
  });
}

/* ----------------------------------------------------------------------
   A0 — Ask user question (scope pre-check)
   ---------------------------------------------------------------------- */

type SiloId = 'sharepoint' | 'gdrive' | 'matters' | 'doctrine-kb';

const SILO_META: Record<SiloId, { label: string; icon: string }> = {
  sharepoint:    { label: 'SharePoint',              icon: 'folder' },
  gdrive:        { label: 'Google Drive',            icon: 'folder' },
  matters:       { label: 'Matters',                 icon: 'folder' },
  'doctrine-kb': { label: 'Doctrine Knowledge Base', icon: 'scales' },
};

const SILO_HITS: Record<SiloId, { name: string; meta: string }[]> = {
  sharepoint: [
    { name: 'Procédure RH — Prévention harcèlement v3.docx', meta: 'Espace RH · maj. 12 mars' },
    { name: 'Charte managériale interne 2023.pdf',           meta: 'Espace RH · 2023' },
    { name: 'Compte-rendu CSE 2024-Q1.docx',                 meta: 'Espace CSE · févr. 2024' },
  ],
  gdrive: [
    { name: 'Grille évaluation pratiques à risque.xlsx',     meta: 'Drive partagé RH · 2024' },
    { name: 'Synthèse jurisprudence harcèlement.gdoc',       meta: 'Drive partagé Litiges' },
    { name: 'Reporting incidents 2024.gsheet',               meta: 'Drive partagé RH' },
  ],
  matters: [
    { name: 'Moreau c/ SAS Aurelia',          meta: 'Matter · 2024-018' },
    { name: 'Aurelia — Politique RH 2024',    meta: 'Matter · 2024-037' },
    { name: 'Cabinet — Encadrement managérial', meta: 'Matter · interne' },
  ],
  'doctrine-kb': [
    { name: 'Cass. soc., 10 nov. 2009, n° 07-45.321',        meta: 'Décisions' },
    { name: 'Art. L1152-1 du Code du travail',               meta: 'Codes' },
    { name: 'Cass. soc., 15 mars 2023, n° 21-22.124',        meta: 'Décisions' },
    { name: 'BOI — Harcèlement moral : commentaires',        meta: 'Doctrine fiscale' },
  ],
};

type DocKey = `${SiloId}:${number}`;

// The sources example is static — it always shows the full set of silos, same
// as every other example. (No per-silo toggle on the dashboard.)
const SOURCE_SILOS: SiloId[] = ['sharepoint', 'gdrive', 'matters', 'doctrine-kb'];

function useDocSelection(silos: SiloId[]) {
  const initial: Record<DocKey, boolean> = {};
  silos.forEach((s) => {
    const hits = SILO_HITS[s] ?? [];
    hits.forEach((_, i) => { initial[`${s}:${i}`] = true; });
  });
  const [sel, setSel] = useState<Record<DocKey, boolean>>(initial);
  const toggle = (k: DocKey) => setSel((s) => ({ ...s, [k]: !s[k] }));
  return { sel, toggle };
}

const CLARIFY_QUESTION = 'Quel angle privilégier pour votre réponse ?';
const CLARIFY_OPTIONS: { title: string; desc: string }[] = [
  { title: 'Trois critères cumulatifs',     desc: 'Cadre classique : répétition, dégradation des conditions, atteinte. Pose la grille avant tout exemple.' },
  { title: 'Pratiques managériales risquées', desc: 'Part du terrain : réunions de suivi, points hebdo, micro-management. Plus concret pour un manager.' },
  { title: 'Charge de la preuve',           desc: 'Angle contentieux : éléments à réunir côté salarié, riposte côté employeur. Utile si litige imminent.' },
  { title: 'Plan de prévention',            desc: 'Angle RH : ce que le cabinet doit mettre en place. Préventif plutôt que défensif.' },
];

/* The ONE card design (the examples only change the content): generous padding,
   composer-matching rounded-2xl, pagination header, prominent question,
   numbered options, "Autre" + "Passer" footer. */
function AskCard({ page, question, children, footerLeft, primary }: {
  page: string; question: string; children: React.ReactNode;
  footerLeft?: React.ReactNode; primary?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-lg px-4 pt-3 pb-3">
      <div className="flex items-center justify-between text-zinc-400">
        <div className="flex items-center gap-0.5">
          <button className="size-6 grid place-items-center rounded-md hover:bg-zinc-100 hover:text-zinc-600" title="Question précédente">
            <Icon name="chevron-right" className="size-3.5 rotate-180" />
          </button>
          <span className="t-small-regular px-0.5">{page}</span>
          <button className="size-6 grid place-items-center rounded-md hover:bg-zinc-100 hover:text-zinc-600" title="Question suivante">
            <Icon name="chevron-right" className="size-3.5" />
          </button>
        </div>
        <button className="size-6 grid place-items-center rounded-md hover:bg-zinc-100 hover:text-zinc-600" title="Fermer">
          <Icon name="x" className="size-4" />
        </button>
      </div>

      <p className="mt-1.5 mb-3 t-large-semibold text-zinc-900">{question}</p>

      {/* Small max-height: the options scroll inside a compact region so the card
          never grows tall above the composer. The free-text input + footer below
          stay pinned outside the scroll. */}
      <div className="max-h-[220px] overflow-y-auto scrollbar-thin">
        {children}
      </div>

      {/* Always end with a free-text input — the user can answer something
          else than the proposed options, whatever the example. */}
      <input
        type="text"
        placeholder="Autre — saisissez votre réponse…"
        className="mt-2 w-full h-10 px-3 rounded-xl border border-zinc-200 t-base-regular text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
      />

      <div className="mt-2.5 flex items-center justify-between gap-3">
        {footerLeft ?? <span />}
        <button className="h-9 px-4 rounded-xl border border-zinc-300 t-base-medium text-zinc-800 hover:bg-zinc-50 transition-colors shrink-0">
          {primary ?? 'Passer'}
        </button>
      </div>
    </div>
  );
}

/* A numbered option row — key chip on the left, ↵ hint on the selected row. */
function AskOption({ n, title, desc, selected, onSelect }: {
  n: number; title: string; desc?: string; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={'w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left transition-colors ' + (selected ? 'bg-zinc-100' : 'hover:bg-zinc-50')}
    >
      <span className={'grid place-items-center size-7 rounded-lg t-base-medium shrink-0 ' + (selected ? 'bg-white border border-zinc-200 text-zinc-700' : 'bg-zinc-100 text-zinc-500')}>
        {n}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block t-base-regular text-zinc-800">{title}</span>
        {desc && <span className="block t-small-regular text-zinc-500">{desc}</span>}
      </span>
      {selected && <span className="t-base-regular text-zinc-400 shrink-0">↵</span>}
    </button>
  );
}

/* Example — document edit confirmation (Oui / Non), from the draft surface. */
function AskEdit() {
  const [sel, setSel] = useState(0);
  return (
    <AskCard page="1 sur 1" question="Souhaitez-vous remplacer l’article D.145-19 obsolète ?">
      <div className="space-y-1">
        <AskOption n={1} title="Oui, je veux le modifier" selected={sel === 0} onSelect={() => setSel(0)} />
        <AskOption n={2} title="Non" selected={sel === 1} onSelect={() => setSel(1)} />
      </div>
    </AskCard>
  );
}

/* Example — clarifying multiple-choice before reasoning starts. */
function AskChoice() {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <AskCard page="3 sur 4" question={CLARIFY_QUESTION}>
      <div className="space-y-1">
        {CLARIFY_OPTIONS.map((opt, i) => (
          <AskOption key={opt.title} n={i + 1} title={opt.title} desc={opt.desc} selected={sel === i} onSelect={() => setSel(i)} />
        ))}
      </div>
    </AskCard>
  );
}

/* Example — sources pre-check: validate the documents before launching.
   SAME row idiom as AskOption (chip slot + title + meta) — only the chip holds
   a checkbox, since docs are multi-select. Docs stay GROUPED by silo
   (SharePoint / Drive / Matters / KB): which system a doc comes from is real
   information for the lawyer, not noise. */
function AskSources() {
  const silos = SOURCE_SILOS;
  const { sel, toggle } = useDocSelection(silos);
  const total = silos.reduce((n, s) => n + (SILO_HITS[s]?.length ?? 0), 0);
  const kept = Object.values(sel).filter(Boolean).length;

  return (
    <AskCard
      page="1 sur 1"
      question="Valider les sources avant de lancer ?"
      footerLeft={<span className="t-small-regular text-zinc-500">{kept} / {total} sources retenues</span>}
      primary="Lancer"
    >
      <div className="space-y-2.5">
        {silos.map((s) => {
          const meta = SILO_META[s];
          const hits = SILO_HITS[s] ?? [];
          if (!meta || hits.length === 0) return null;
          return (
            <div key={s}>
              <div className="flex items-center gap-1.5 px-2.5 mb-0.5">
                <span className="t-small-semibold text-zinc-700">{meta.label}</span>
                <span className="t-small-regular text-zinc-400">· {hits.length}</span>
              </div>
              <div className="space-y-0.5">
                {hits.map((h, i) => {
                  const key = `${s}:${i}` as DocKey;
                  const on = sel[key];
                  return (
                    <button
                      key={key}
                      onClick={() => toggle(key)}
                      className="w-full flex items-center gap-3 px-2.5 py-1.5 rounded-xl text-left transition-colors hover:bg-zinc-50"
                    >
                      <span className={'grid place-items-center size-7 rounded-lg shrink-0 ' + (on ? 'bg-zinc-100' : 'bg-zinc-50')}>
                        <input
                          type="checkbox"
                          readOnly
                          checked={on}
                          className="size-3.5 rounded border-zinc-300 accent-zinc-900 pointer-events-none"
                        />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className={'block t-base-regular truncate ' + (on ? 'text-zinc-800' : 'text-zinc-400 line-through')}>{h.name}</span>
                        <span className="block t-small-regular text-zinc-500 truncate">{h.meta}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </AskCard>
  );
}

/* Example — tool choice: the agent is unsure which approach fits, so instead of
   guessing (or silently upselling) it asks, and the OPTIONS ARE TOOLS. Each row
   reuses the same title + rationale as that tool's A4 suggestion (TOOL_SUGGESTIONS),
   so a tool reads identically here and there — one source of truth. Paid tools
   carry their Add-on eyebrow, same as everywhere. */
const TOOLCHOICE_KEYS = ['sources', 'tableau', 'negocier'] as const;
function AskToolChoice() {
  const [sel, setSel] = useState(0);
  return (
    <AskCard page="1 sur 1" question="Comment souhaitez-vous que je traite cette demande ?" primary="Lancer">
      <div className="space-y-1">
        {TOOLCHOICE_KEYS.map((key, i) => {
          const s = TOOL_SUGGESTIONS[key];
          const paid = isPaidTool(s);
          const product = s.product && s.product !== 'chat' ? PRODUCT_LABEL[s.product] : null;
          const selected = sel === i;
          return (
            <button
              key={key}
              onClick={() => setSel(i)}
              className={'w-full flex items-start gap-3 px-2.5 py-2 rounded-xl text-left transition-colors ' + (selected ? 'bg-zinc-100' : 'hover:bg-zinc-50')}
            >
              <span className={'grid place-items-center size-7 rounded-lg shrink-0 mt-px ' + (selected ? 'bg-white border border-zinc-200' : 'bg-zinc-100')}>
                <Icon name={s.icon} className="size-4 text-zinc-500" />
              </span>
              <span className="flex-1 min-w-0">
                {product && (
                  <span className="flex items-center gap-1.5 mb-0.5">
                    <span className="t-small-medium text-zinc-500">{product}</span>
                    {paid && <span className="t-small-medium text-zinc-300">·</span>}
                    {paid && <AddonChip />}
                  </span>
                )}
                <span className="block t-base-regular text-zinc-800">{s.title}</span>
                <span className="block t-small-regular text-zinc-500">{s.reason ?? s.desc}</span>
              </span>
              {selected && <span className="t-base-regular text-zinc-400 shrink-0 mt-1">↵</span>}
            </button>
          );
        })}
      </div>
    </AskCard>
  );
}

/* Example — output preview: the tool has already produced something; the agent
   shows a SNIPPET of it inline and asks before opening the full result. This is
   the "snippet answer, docked in a question" case. Reuses EXTRACT_TOOL so the
   preview matches the real Extract table (title + columns). */
function AskSnippet() {
  const [sel, setSel] = useState(0);
  const cols = EXTRACT_TOOL.columns.slice(0, 3);
  const rows = [
    ['Bail commercial — Local A', 'Commercial', '01/2021'],
    ['Bail commercial — Local B', 'Commercial', '06/2022'],
  ];
  return (
    <AskCard page="1 sur 1" question="J’ai préparé un tableau comparatif — souhaitez-vous l’ouvrir ?">
      {/* Snippet of the tool output, inline in the question. */}
      <div className="mb-2 rounded-xl border border-zinc-200 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50/70 border-b border-zinc-200">
          <Icon name="table" className="size-3.5 text-zinc-400 shrink-0" />
          <span className="t-small-medium text-zinc-700 truncate">{EXTRACT_TOOL.title}</span>
          <span className="t-small-regular text-zinc-400 shrink-0 ml-auto">Aperçu</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full t-small-regular">
            <thead>
              <tr className="text-zinc-400">
                {cols.map((c) => <th key={c} className="text-left font-medium px-3 py-1.5 whitespace-nowrap">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-zinc-100 text-zinc-700">
                  {r.map((cell, j) => <td key={j} className="px-3 py-1.5 whitespace-nowrap truncate max-w-[160px]">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="space-y-1">
        <AskOption n={1} title="Oui, ouvrir dans l’éditeur" selected={sel === 0} onSelect={() => setSel(0)} />
        <AskOption n={2} title="Non, répondre en texte" selected={sel === 1} onSelect={() => setSel(1)} />
      </div>
    </AskCard>
  );
}

/* Example — veille proposal: the agent proposes to follow WHAT IT ACTUALLY
   SEARCHED — the options are the verbatim queries from the reasoning trace,
   plus the cited article. Watchers work on keywords/entities, never themes,
   so the question shows the exact strings a watcher would run. "Toutes" jumps
   to the A10 picker with everything pre-selected. */
function AskWatcher() {
  const [sel, setSel] = useState(0);
  const openWatcher = useOpenWatcher();
  const [q1, q2, art] = WATCHER_SUGGESTIONS;
  return (
    <AskCard page="1 sur 1" question="Souhaitez-vous suivre ces recherches en veille ?" primary="Créer la veille">
      <div className="space-y-1">
        <AskOption
          n={1}
          title={q1.label}
          desc={`Recherche effectuée pour vous répondre · Décisions ${q1.filters?.join(', ')} · hebdomadaire`}
          selected={sel === 0}
          onSelect={() => { setSel(0); openWatcher({ kind: 'requete' }); }}
        />
        <AskOption
          n={2}
          title={q2.label}
          desc={`Recherche complémentaire · Décisions ${q2.filters?.join(', ')} · hebdomadaire`}
          selected={sel === 1}
          onSelect={() => { setSel(1); openWatcher({ kind: 'requete' }); }}
        />
        <AskOption
          n={3}
          title={art.label}
          desc="Cité dans la réponse · évolutions, décisions et commentaires citant l’article"
          selected={sel === 2}
          onSelect={() => { setSel(2); openWatcher({ kind: 'article' }); }}
        />
        <AskOption
          n={4}
          title="Toutes — choisir précisément"
          desc="Ouvre la liste des veilles suggérées, pré-cochées."
          selected={sel === 3}
          onSelect={() => { setSel(3); openWatcher({ picker: true }); }}
        />
        <AskOption n={5} title="Non merci" selected={sel === 4} onSelect={() => setSel(4)} />
      </div>
    </AskCard>
  );
}

/* ----------------------------------------------------------------------
   A1 — Reasoning trace
   ---------------------------------------------------------------------- */

type HitKind = 'search' | 'law' | 'decision' | 'comment' | 'fiscal';

// A reasoning step. Provenance is shown per-document via each hit's `corpus`
// label (the user wants source-by-document, not a step-level tag).
type TraceStep = {
  text: string;
  count: string;
  hits: { kind: HitKind; label: string; corpus: string }[];
};

function HitIcon({ kind, className }: { kind: HitKind; className?: string }) {
  if (kind === 'comment') {
    // € for BOI / fiscal commentaires
    return <Icon name="euro" className={className} />;
  }
  if (kind === 'fiscal') {
    // open book
    return <Icon name="book" className={className} />;
  }
  const map: Record<HitKind, string> = {
    search:   'search',
    law:      'scales',
    decision: 'file-text',
    comment:  'file-text',
    fiscal:   'folder',
  };
  return <Icon name={map[kind]} className={className} />;
}

// Per-scenario reasoning traces. Each step declares its provenance so the
// trace doubles as the "what data fed the answer" view from the EoY table.
const SCENARIO_TRACES: Record<string, TraceStep[]> = {
  // S1 — Legal Research (public sources + internal KB)
  S1: [
    {
      text: "Je cherche d'abord la jurisprudence constante sur les éléments constitutifs du harcèlement moral.",
      count: '42 sources',
      hits: [
        { kind: 'search',   label: '"harcèlement moral" éléments constitutifs répétition',    corpus: 'Décisions' },
        { kind: 'law',      label: "Article L1152-1 du Code du travail",                       corpus: 'Lois et règlements' },
        { kind: 'decision', label: "Cass. soc., 10 nov. 2009, n° 07-45.321",                   corpus: 'Décisions' },
        { kind: 'decision', label: "Cass. soc., 1er juin 2022, n° 21-12.488",                  corpus: 'Décisions' },
      ],
    },
    {
      text: "Je regarde comment les juges qualifient les pratiques managériales (réunions de suivi, points hebdomadaires, micro-management).",
      count: '27 sources',
      hits: [
        { kind: 'search',   label: '"points hebdomadaires" harcèlement managérial',           corpus: 'Décisions' },
        { kind: 'decision', label: "Cass. soc., 15 mars 2023, n° 21-22.124",                   corpus: 'Décisions' },
        { kind: 'decision', label: "CA Paris, 8 févr. 2024, n° 22/04891",                       corpus: 'Décisions' },
      ],
    },
    {
      text: "Je complète avec vos mémos et notes RH sur l'encadrement managérial du cabinet.",
      count: '8 sources',
      hits: [
        { kind: 'fiscal',  label: "Mémo interne « Encadrement managérial — suivi vs. contrôle » (2024)", corpus: 'Knowledge Base' },
        { kind: 'fiscal',  label: "Note RH 2024-03 — grille d'évaluation des pratiques à risque",        corpus: 'Knowledge Base' },
        { kind: 'comment', label: "Charte managériale interne (rév. 2023)",                              corpus: 'Knowledge Base' },
      ],
    },
  ],

  // S2 — Draft from scratch (Doctrine models + internal templates / Clausier)
  S2: [
    {
      text: "J'identifie le type de contrat et les clauses essentielles d'un contrat de prestation d'architecte.",
      count: '12 sources',
      hits: [
        { kind: 'law',      label: "Loi n° 77-2 du 3 janv. 1977 sur l'architecture",          corpus: 'Lois et règlements' },
        { kind: 'search',   label: '"contrat de maîtrise d\'œuvre" clauses obligatoires',     corpus: 'Modèles' },
        { kind: 'decision', label: "Cass. 3e civ., 19 mars 2020, n° 18-22.983",               corpus: 'Décisions' },
      ],
    },
    {
      text: "Je récupère vos modèles internes de contrats de prestation pour aligner le style et les clauses du cabinet.",
      count: '5 sources',
      hits: [
        { kind: 'fiscal', label: "Modèle — Contrat d'architecte v3.docx",                     corpus: 'Knowledge Base' },
        { kind: 'fiscal', label: "Clausier interne — Responsabilité & assurance décennale",   corpus: 'Knowledge Base' },
      ],
    },
    {
      text: "J'assemble un premier brouillon structuré, prêt à être ouvert et édité dans Draft.",
      count: 'Brouillon',
      hits: [
        { kind: 'comment', label: "Clause de résiliation — Modèle A",                          corpus: 'Clausier' },
        { kind: 'comment', label: "Clause pénale — Bail commercial",                           corpus: 'Clausier' },
      ],
    },
  ],

  // S7 — Création de document (drafting a conclusion from scratch in the Éditeur)
  S7: [
    {
      text: "J'identifie la structure attendue d'une conclusion : faits, discussion, dispositif.",
      count: '3 sources',
      hits: [
        { kind: 'fiscal', label: "Trame — Conclusions d'appel.docx",                          corpus: 'Knowledge Base' },
        { kind: 'comment', label: "Conclusion — Modèle structuré",                             corpus: 'Clausier' },
      ],
    },
    {
      text: "Je rédige chaque section directement dans le document.",
      count: 'Rédaction',
      hits: [
        { kind: 'fiscal', label: "Document sans titre",                                        corpus: 'Éditeur' },
      ],
    },
  ],

  // S8 — Correction de document (locate + correct each occurrence of the date)
  S8: [
    {
      text: "Je repère chaque occurrence de la date d'audience dans le document.",
      count: '3 occurrences',
      hits: [
        { kind: 'fiscal', label: "COUR D'APPEL D'ORLÉANS — conclusions",                       corpus: 'Éditeur' },
      ],
    },
    {
      text: "Je propose la correction pour chaque occurrence, à valider une par une.",
      count: '3 changements',
      hits: [
        { kind: 'comment', label: "Date d'audience · Lundi 4 sept. → Mardi 5 sept.",            corpus: 'Éditeur' },
      ],
    },
  ],

  // S3 — Document legal analysis (uploaded doc + Doctrine sources)
  S3: [
    {
      text: "Je lis le document que vous avez importé et j'en extrais les moyens et la demande à étayer.",
      count: '1 source',
      hits: [
        { kind: 'fiscal', label: "Conclusions_def_Moreau.pdf — 42 pages",                      corpus: 'Document importé' },
      ],
    },
    {
      text: "Je recherche des jurisprudences confirmant le rejet de la demande sur ces moyens.",
      count: '34 sources',
      hits: [
        { kind: 'decision', label: "Cass. soc., 27 sept. 2023, n° 22-18.142",                  corpus: 'Décisions' },
        { kind: 'decision', label: "CA Versailles, 14 déc. 2023, n° 22/01987",                 corpus: 'Décisions' },
        { kind: 'law',      label: "Article 1240 du Code civil",                               corpus: 'Lois et règlements' },
      ],
    },
  ],

  // S4 — Multi-document analysis / Extract (matter docs)
  S4: [
    {
      text: "J'identifie les contrats rattachés au dossier Leroy c/ Merlin.",
      count: '6 sources',
      hits: [
        { kind: 'fiscal', label: "Convention d'animation 2024.pdf",                            corpus: 'Matter' },
        { kind: 'fiscal', label: "Avenant n°1 — Convention d'animation.docx",                  corpus: 'Matter' },
        { kind: 'fiscal', label: "Contrat d'agence de distribution.docx",                      corpus: 'Matter' },
      ],
    },
    {
      text: "J'extrais les obligations de chaque contrat pour les comparer.",
      count: '6 sources',
      hits: [
        { kind: 'fiscal', label: "Obligations — Convention d'animation",                       corpus: 'Extraction' },
        { kind: 'fiscal', label: "Obligations — Contrat d'agence",                             corpus: 'Extraction' },
      ],
    },
  ],
};

// Extract the leading integer from a step's count label ("42 résultats" → 42,
// "Brouillon" → 0). Used to total the sources across all reasoning steps.
function parseStepCount(label: string): number {
  const m = label.match(/^\s*(\d[\d\s.]*)/);
  if (!m) return 0;
  return parseInt(m[1].replace(/[\s.]/g, ''), 10) || 0;
}

function AgenticTrace({
  scenario, phase,
}: { scenario: string; phase: string }) {
  const steps = SCENARIO_TRACES[scenario] ?? SCENARIO_TRACES.S1;
  const running = phase === 'running';
  const visibleSteps = running ? steps.slice(0, Math.max(1, steps.length - 1)) : steps;
  // "sources" = the SUM of every step's result count (42 + 27 + 8 = 77),
  // not the number of preview rows shown. Steps whose count isn't numeric
  // (e.g. "Brouillon") contribute 0.
  const sumResults = (list: TraceStep[]) => list.reduce((n, s) => n + parseStepCount(s.count), 0);
  const sourceCount = running ? sumResults(visibleSteps) : sumResults(steps);
  // Collapsed once finished so the final answer is visible; stays open while
  // the trace is actively running.
  const [open, setOpen] = useState(running);
  // Drafting / editing flows call the trace an edit plan ("Stratégie de
  // modification"); research / analysis flows call it the "Raisonnement".
  const DRAFTING = new Set(['S2', 'S5', 'S6', 'S7', 'S8']);
  const noun = DRAFTING.has(scenario) ? 'Stratégie de modification' : 'Raisonnement';

  return (
    <div>
      <ReasoningHeader
        sourceCount={sourceCount}
        duration={running ? null : '1m 23s'}
        open={open}
        onToggle={() => setOpen((v) => !v)}
        noun={noun}
      />
      {open && (
        <ul className="relative pt-1">
          {/* Vertical timeline passing through every bullet, including the state row. */}
          <span aria-hidden className="absolute left-[15px] top-5 bottom-5 w-px bg-zinc-200" />
          {visibleSteps.map((step, i) => (
            <AgenticStep
              key={i}
              step={step}
              // While running, the most recent step is the one being worked on —
              // open it so its sources are visible. When done, all collapsed.
              defaultOpen={running && i === visibleSteps.length - 1}
            />
          ))}
          <StateRow running={running} />
        </ul>
      )}
    </div>
  );
}

/* --- Header: "Raisonnement · N sources · durée" (inline, one register) --- */

function ReasoningHeader({
  sourceCount, duration, open, onToggle, noun = 'Raisonnement',
}: { sourceCount: number; duration: string | null; open: boolean; onToggle: () => void; noun?: string }) {
  const countLabel = `${sourceCount} source${sourceCount > 1 ? 's' : ''}`;
  const meta = duration ? `· ${countLabel} · ${duration}` : `· ${countLabel}`;

  // Chevron sits right after the meta so the disclosure affordance is grouped
  // with the label. Hover tints the whole group to signal it's clickable.
  // One uniform register — no weight/color contrast between the title and the
  // meta. Reads as a single quiet status line ("Raisonnement · N sources · durée").
  return (
    <button onClick={onToggle} className="group inline-flex items-center gap-1.5 py-1 text-left">
      <span className="t-base-regular text-zinc-500 group-hover:text-zinc-700 transition-colors">
        {noun} {meta}
      </span>
      <Icon
        name="chevron-up"
        className={'size-3 text-zinc-400 group-hover:text-zinc-600 transition-all ' + (open ? '' : 'rotate-180')}
      />
    </button>
  );
}

/* --- State row: final timeline entry. Pulsing bullet + "en cours" while
   thinking; steady bullet + "terminé" once done. Same anatomy as a step row
   so it aligns on the timeline. No italic — plain muted text. --- */

function StateRow({ running }: { running: boolean }) {
  return (
    <li className="relative">
      <div className="flex items-start gap-3 px-3 py-2.5">
        <span className="relative z-10 mt-1.5 flex size-1.5 shrink-0 rounded-full ring-4 ring-white">
          {running && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-zinc-900 opacity-75 animate-ping" />
          )}
          <span className={'relative inline-flex size-1.5 rounded-full ' + (running ? 'bg-zinc-900' : 'bg-zinc-400')} />
        </span>
        <span className="t-base-regular text-zinc-800">
          {running ? 'Raisonnement en cours' : 'Raisonnement terminé'}
        </span>
      </div>
    </li>
  );
}

function AgenticStep({ step, defaultOpen }: { step: TraceStep; defaultOpen: boolean; last?: boolean; terminal?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  // Re-sync when the running phase flips a step's default (e.g. the in-progress
  // step opens when Running turns on, collapses when it finishes).
  useEffect(() => { setOpen(defaultOpen); }, [defaultOpen]);
  // "Suivre" bells (A1 content toggle): a search hit IS a valid keyword watcher
  // and a law hit IS a valid entity watcher — one click opens A10 pre-filled.
  const a1Content = useChatbot((s) => s.primitives.A1.content);
  const bells = Array.isArray(a1Content) && a1Content.includes('veille');
  const openWatcher = useOpenWatcher();
  const watchable = (k: HitKind) => k === 'search' || k === 'law';
  return (
    <li className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-zinc-50 text-left"
      >
        <span className="relative z-10 mt-1.5 size-1.5 rounded-full bg-zinc-400 shrink-0 ring-4 ring-white" />
        <span className="flex-1 t-base-regular text-zinc-800">{step.text}</span>
        <span className="t-small-regular text-zinc-400 shrink-0 mt-0.5">{step.count}</span>
        <Icon name="chevron-up" className={'size-3 text-zinc-400 mt-1.5 shrink-0 transition-transform ' + (open ? '' : 'rotate-180')} />
      </button>
      {open && (
        <div className="pl-8 pr-3 pb-3">
          <div className="rounded-md border border-zinc-200 bg-zinc-50/60 max-h-44 overflow-y-auto scrollbar-thin divide-y divide-zinc-100">
            {step.hits.map((h, j) => (
              <div key={j} className="group/hit flex items-center gap-2 px-3 py-1.5">
                <HitIcon kind={h.kind} className="size-3.5 text-zinc-400 shrink-0" />
                <span className="flex-1 t-base-regular text-zinc-800 truncate">{h.label}</span>
                {bells && watchable(h.kind) && (
                  <button
                    onClick={() => openWatcher({ kind: h.kind === 'law' ? 'article' : 'requete' })}
                    className="shrink-0 inline-flex items-center gap-1 h-6 px-1.5 rounded-md t-small-medium text-zinc-400 opacity-0 group-hover/hit:opacity-100 focus-visible:opacity-100 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
                    title={h.kind === 'law' ? 'Suivre cet article' : 'Suivre cette recherche'}
                  >
                    <Icon name="bell" className="size-3" />
                    Suivre
                  </button>
                )}
                <span className="t-small-regular text-zinc-400 shrink-0">{h.corpus}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </li>
  );
}

function PlanPreamble({
  variant, phase, scenario,
}: { variant: string; phase: string; scenario: string }) {
  if (variant === 'hidden') return null;
  return <AgenticTrace scenario={scenario} phase={phase} />;
}

/* ----------------------------------------------------------------------
   Assistant Body (renders blocks; A3 wraps each inline citation)
   ---------------------------------------------------------------------- */
function AssistantBody({
  showExcerpt, showSources, showDocs, excerptStyle, blocks, citations,
}: {
  showExcerpt: boolean;
  showSources: boolean;
  showDocs: boolean;
  excerptStyle: string;
  blocks: AnswerBlock[];
  citations: Record<string, Citation>;
}) {
  const highlightMode = useChatbot((s) => s.highlightMode);
  const hovered       = useChatbot((s) => s.hoveredPrimitive);
  const setHovered    = useChatbot((s) => s.setHoveredPrimitive);

  // Excerpts + citations are all part of the Answer (A2) now; hovering A2
  // highlights them together.
  const citeHover = highlightMode && hovered === 'A2' ? 'A2' : undefined;

  const onMouseOver = (e: React.MouseEvent) => {
    if (!highlightMode) return;
    const el = (e.target as HTMLElement).closest?.('[data-primitive]');
    if (el?.getAttribute('data-primitive') === 'A2') setHovered('A2');
  };
  const onMouseOut = (e: React.MouseEvent) => {
    if (!highlightMode) return;
    const from = (e.target as HTMLElement).closest?.('[data-primitive]');
    const to   = (e.relatedTarget as HTMLElement | null)?.closest?.('[data-primitive]');
    if (from && !to) setHovered(null);
  };

  // Show only enough blocks to illustrate the primitives, then fade out.
  const MAX_BLOCKS = 4;
  const truncated  = blocks.length > MAX_BLOCKS;
  const visible    = truncated ? blocks.slice(0, MAX_BLOCKS) : blocks;

  const nodes = visible.map((b, i) => {
    if (b.kind === 'h') {
      return <h4 key={i} className="t-title-4 text-zinc-900 mt-5">{b.text}</h4>;
    }
    if (b.kind === 'quote') {
      if (!showExcerpt) return null; // excerpts toggled off
      return (
        <PrimitiveSlot key={i} code="A2" block>
          <QuoteBlock variant={excerptStyle} html={b.html} attribution={b.attribution} />
        </PrimitiveSlot>
      );
    }
    return (
      <p
        key={i}
        dangerouslySetInnerHTML={{
          __html: renderInlineCitations(b.html, citations, showSources, showDocs),
        }}
      />
    );
  });

  return (
    <div
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      data-cite-mode={highlightMode ? 'true' : undefined}
      data-cite-hover={citeHover}
      className={
        'relative space-y-4 t-legal-large text-zinc-900 ' +
        ''
      }
    >
      {nodes}
      {truncated && (
        <div className="relative -mt-2">
          <div className="h-12 bg-gradient-to-b from-transparent to-white pointer-events-none -mt-12" />
          <div className="flex items-center justify-center gap-2 t-small-regular text-zinc-400">
            <span className="h-px flex-1 bg-zinc-200" />
            <span>…</span>
            <span className="h-px flex-1 bg-zinc-200" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------
   A2 — Quote style (decision / law extract)
   ---------------------------------------------------------------------- */
function QuoteBlock({ variant, html, attribution }: { variant: string; html: string; attribution?: string }) {
  if (variant === 'inline-highlight') {
    return (
      <p className="t-legal-large text-zinc-900">
        <span
          className="rounded px-1.5 py-0.5 bg-blue-50 text-blue-900 box-decoration-clone"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {attribution && (
          <span className="ml-2 t-small-regular text-zinc-500">— {attribution}</span>
        )}
      </p>
    );
  }

  if (variant === 'card') {
    return (
      <figure className="my-4 relative px-5 py-4 rounded-lg border border-zinc-200 bg-zinc-50/60">
        <span className="absolute top-1 left-2 t-mono text-2xl text-zinc-300 leading-none select-none">“</span>
        <blockquote
          className="t-legal-base text-zinc-800 italic pl-3"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {attribution && (
          <figcaption className="mt-2 pl-3 t-small-regular text-zinc-500 not-italic">— {attribution}</figcaption>
        )}
      </figure>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className="my-3 t-legal-base text-zinc-700 italic">
        <span dangerouslySetInnerHTML={{ __html: html }} />
        {attribution && (
          <span className="ml-2 t-small-regular text-zinc-500 not-italic">— {attribution}</span>
        )}
      </div>
    );
  }

  // blockquote (default)
  return (
    <blockquote className="my-4 pl-4 border-l-2 border-zinc-300 t-legal-base text-zinc-700 italic">
      <span dangerouslySetInnerHTML={{ __html: html }} />
      {attribution && (
        <footer className="mt-1.5 t-small-regular text-zinc-500 not-italic">— {attribution}</footer>
      )}
    </blockquote>
  );
}


/* ----------------------------------------------------------------------
   A4 Tool suggestion — one header bar (muted icon + title + one-line subtitle
   on the left, primary CTA pinned top-right) over a body. A9's body is the
   tool's OUTPUT; A4's body is the tool's INTENT (the columns/questions/clauses
   it will act on). Same skeleton, two tenses. Inert here.
   ---------------------------------------------------------------------- */
// Single primary button for tool cards — the design-system blue primary action
// (matches the ToolSuggestion Figma component: blue CTA, one size).
const TOOL_BTN = 'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md t-base-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/30 focus-visible:ring-offset-1';

/* ToolCard — the ONE shell every tool primitive renders through (A9 output,
   A4 suggestion, A10 veille). Lives in ToolCard.tsx; imported at the top. */

type ToolSuggestionDef = {
  icon: string;
  accent?: string;
  title: string;
  desc: string;
  items?: { label?: string; text: string }[];
  cta: string;
  /** The product a tool belongs to. `chat` = built into the assistant (free);
   *  `counsel` / `litigate` = paid Flow add-ons. Tier is DERIVED from this —
   *  product is the single source of truth, so nothing can be "free counsel". */
  product?: 'chat' | 'counsel' | 'litigate';
  /** Optional footer link at the bottom of the card (Figma: "Voir toutes les
   *  actions", "Télécharger le fichier"). */
  footer?: string;
  /** WHY this tool is suggested — a contextual rationale. Used by the `inline`
   *  and `banner` forms (a sentence + link); falls back to `desc` when absent. */
  reason?: string;
  /** Capability value-props (from the product pages) — the concrete things the
   *  tool does. Shown by the `feature` variant as a short benefit list; distinct
   *  from `items`, which are the contextual inputs a table tool will act on. */
  benefits?: string[];
};
// Tier falls out of the product — no separate flag to keep in sync.
const isPaidTool = (s: ToolSuggestionDef) => s.product === 'counsel' || s.product === 'litigate';

// The Flow product a paid tool belongs to. The suggestion's TITLE is the action
// (e.g. "Contre-arguments"); this names the PRODUCT that action lives in, shown
// as the card's eyebrow so the two never read as competing names. Built-in
// (`chat`) tools have no product line — they get no eyebrow.
const PRODUCT_LABEL: Record<string, string> = {
  counsel: 'Flow Counsel',
  litigate: 'Flow Litigate',
};

// Entitlement label. Locked = an add-on the user hasn't bought (upsell); owned =
// active on their plan. Plain muted words — no badge, no icon, no colour block.
function AddonChip() {
  return <span className="shrink-0 t-small-medium text-zinc-400">Add-on</span>;
}
function ActiveChip() {
  return (
    <span className="shrink-0 t-small-medium text-emerald-600">Actif</span>
  );
}

/* ----------------------------------------------------------------------
   Extract — ONE tool, two moments. The suggestion (A4) proposes the table
   (its columns shown as the fields it will extract); the output (A9) is that
   SAME table, filled. Both read this single source of truth — icon, title,
   columns — so the two cards can never drift apart.
   ---------------------------------------------------------------------- */
const EXTRACT_TOOL = {
  icon: 'table',
  title: 'Commercial lease audit',
  blurb: 'Extract key information from your documents into a table.',
  cta: 'Create table',
  columns: ['Document', 'Type', 'Date', 'Term', 'Rent', 'Indexation'],
};

const TOOL_SUGGESTIONS: Record<string, ToolSuggestionDef> = {
  tableau: {
    icon: 'table', accent: 'violet', product: 'chat',
    title: 'Tableau de décisions',
    desc: 'Créez un tableau IA et scannez le contenu des décisions en 5 secondes.',
    items: [
      { label: 'Colonne 1', text: 'Rupture brutale reconnue par le tribunal ?' },
      { label: 'Colonne 2', text: 'Indemnisation accordée pour la rupture ?' },
      { label: 'Colonne 3', text: 'Délai de préavis respecté ?' },
      { label: 'Colonne 4', text: 'Motifs de la rupture jugés légitimes ?' },
    ],
    cta: 'Créer un tableau',
  },
  // NB: `extract` is intentionally absent — both its suggestion and preview
  // render through <ExtractCard>, which reads EXTRACT_TOOL. One component.
  counsel: {
    icon: 'scales', accent: 'zinc', product: 'counsel',
    title: 'Flow Counsel',
    desc: 'Identifier les risques juridiques, retrouver vos clauses, vérifier les incohérences.',
    items: [
      { text: 'Analyser les risques' },
      { text: 'Vérifier les terminologies' },
      { text: 'Repérer les incohérences' },
    ],
    cta: 'Ouvrir Flow Counsel',
  },
  // Escalation example from the brief: a contract deserves a deeper, paid flow.
  negocier: {
    icon: 'scales', accent: 'zinc', product: 'counsel',
    title: 'Négocier ce contrat',
    reason: 'Ce contrat mérite une analyse clause par clause, orientée selon les intérêts de la partie que vous représentez',
    desc: 'Repérez les clauses manquantes ou déséquilibrées et obtenez des reformulations en votre faveur.',
    benefits: [
      'Identifie les clauses manquantes ou déséquilibrées',
      'Propose des reformulations en faveur de votre partie',
      'S’appuie sur vos précédents et la jurisprudence',
    ],
    items: [
      { text: 'Clause de responsabilité — plafond déséquilibré' },
      { text: 'Clause de résiliation — préavis manquant' },
      { text: 'Propriété intellectuelle — cession trop large' },
    ],
    cta: 'Lancer l’analyse',
  },
  'counter-argument': {
    icon: 'scales', accent: 'zinc', product: 'litigate',
    title: 'Contre-arguments',
    reason: 'Testez la solidité des moyens adverses et répliquez point par point, jurisprudence à l’appui',
    desc: 'Réfutez les écritures adverses avec des contre-arguments fondés sur la jurisprudence.',
    benefits: [
      'Teste la solidité des arguments adverses',
      'Des contre-arguments fondés sur le fonds de jurisprudence le plus exhaustif',
      'De nouveaux angles pour sécuriser votre argumentaire',
    ],
    items: [
      { text: "Sur la recevabilité de l'assignation" },
      { text: 'Sur le statut de consommateur' },
      { text: 'Sur le lien de causalité' },
    ],
    cta: 'Générer les contre-arguments',
  },
  // The veille handoff — watchers run on KEYWORDS/ENTITIES (prod model), so
  // the `items` show the VERBATIM watcher candidates: the queries the agent
  // actually ran (from the reasoning trace) + the cited article. The CTA
  // opens the A10 picker with all of them pre-checked.
  veille: {
    icon: 'bell', accent: 'zinc', product: 'chat',
    title: 'Suivre ce que j’ai cherché pour vous répondre',
    reason: 'J’ai effectué 2 recherches et cité un article — chacun peut devenir une veille, mots-clés inclus',
    desc: 'Les recherches effectuées et l’article cité peuvent devenir des veilles — telles quelles.',
    items: [
      { label: 'Recherche', text: '"harcèlement moral" éléments constitutifs répétition — CASS, CA' },
      { label: 'Recherche', text: '"points hebdomadaires" harcèlement managérial — CASS, CA' },
      { label: 'Article',   text: 'Article L1152-1 du Code du travail — évolutions & citations' },
    ],
    cta: 'Suivre',
  },
  sources: {
    icon: 'database', accent: 'zinc', product: 'chat',
    title: 'Répondre à la question avec vos sources',
    desc: "Utilisez vos bases de connaissance pour répondre à cette question, l'Assistant se sourcera uniquement sur vos documents internes.",
    cta: 'Répondre avec mes sources',
    footer: 'Voir toutes les actions',
  },
  clausier: {
    icon: 'book', accent: 'blue', product: 'chat',
    title: 'Clausier',
    desc: 'Insérez des clauses validées par votre cabinet.',
    items: [
      { text: 'Clause de résiliation — Modèle A' },
      { text: 'Clause de non-concurrence 2024' },
      { text: 'Clause pénale — Bail commercial' },
    ],
    cta: 'Ouvrir le Clausier',
  },
};

// A soft, product-tinted icon tile used across the suggestion variants. Paid
// tools (Flow Counsel / Litigate) read indigo; built-in tools read neutral.
export function ToolSuggestion({ content, question, owned = false, variant = 'card' }: { content: string; question?: string; owned?: boolean; variant?: string }) {
  const openWatcher = useOpenWatcher();
  if (content === 'extract') return <ExtractCard mode="suggestion" showColumns />;
  const s = TOOL_SUGGESTIONS[content] ?? TOOL_SUGGESTIONS.tableau;
  // The veille suggestion is live in the lab: its CTA opens the A10 picker —
  // ALL the watcher candidates detected in the conversation, pre-checked.
  const onCta = content === 'veille' ? () => openWatcher({ picker: true }) : undefined;
  const paid = isPaidTool(s);
  // Only the table-shaped tools show their inputs (the columns/questions they'll
  // act on); knowledge base echoes the live question as its single input row;
  // veille previews the pre-filled setup it will open.
  const showInputs = content === 'tableau' || content === 'sources' || content === 'veille';
  const items = content === 'sources' && question ? [{ text: question }] : s.items;
  // Paid tools carry an entitlement chip: locked → Add-on (upsell), owned → Actif.
  const paidChip = paid ? (owned ? <ActiveChip /> : <AddonChip />) : null;
  // The product line the action belongs to — free (`chat`) tools have none.
  const productLabel = s.product && s.product !== 'chat' ? PRODUCT_LABEL[s.product] : null;
  const rationale = s.reason ?? s.desc;
  // Quiet handoff: a text link, not a filled button. The suggestion is a
  // footnote to the answer, not an ad competing with it.
  const cta = (
    <button onClick={onCta} className="inline-flex items-center gap-1 t-base-medium text-zinc-900 hover:text-zinc-600 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/25">
      {s.cta}
      <Icon name="arrow-right" className="size-3" />
    </button>
  );
  // Neutral eyebrow — the product line, muted. No brand color, no gradient.
  const productEyebrow = productLabel && (
    <div className="flex items-center gap-1.5">
      <span className="t-small-medium text-zinc-500">{productLabel}</span>
      {paidChip && <span className="t-small-medium text-zinc-300">·</span>}
      {paidChip}
    </div>
  );

  // INLINE — reads like the answer's own prose, action as an inline link.
  if (variant === 'inline') {
    return (
      <p className="t-legal-large text-zinc-900 leading-relaxed">
        {rationale}{' — '}
        <button onClick={onCta} className="t-legal-large font-medium text-zinc-900 hover:text-zinc-600 underline underline-offset-2 decoration-zinc-300 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/25">
          {s.cta}<Icon name="arrow-right" className="inline size-3.5 ml-1 align-middle" />
        </button>
        {paidChip && <span className="ml-1.5 align-middle inline-flex">{paidChip}</span>}
      </p>
    );
  }

  // COMPACT — one dense row: icon + title + muted desc + text CTA.
  if (variant === 'compact') {
    return (
      <div className="sg-suggest sg-compact flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-3 py-2">
        <Icon name={s.icon} className="size-4 shrink-0 text-zinc-400" />
        <span className="t-base-medium text-zinc-900 shrink-0">{s.title}</span>
        <span className="sg-desc flex-1 min-w-0 t-base-regular text-zinc-400 truncate">{s.desc}</span>
        {paidChip}
        <span className="shrink-0">{cta}</span>
      </div>
    );
  }

  // BANNER — slim neutral strip: unobtrusive "there's a better tool for this".
  if (variant === 'banner') {
    return (
      <div className="sg-suggest sg-banner flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5">
        <Icon name={s.icon} className="size-4 shrink-0 text-zinc-400" />
        <div className="min-w-0 flex-1">
          {productEyebrow}
          <p className="t-base-regular text-zinc-700 truncate">{rationale}</p>
        </div>
        <div className="sg-actions shrink-0">{cta}</div>
      </div>
    );
  }

  // CARD (default) — the standard handoff: plain icon, muted product eyebrow,
  // title, one-line rationale, quiet link CTA. Table tools list their inputs
  // below in a light form (no heavy checkboxes / edit affordances).
  return (
    <ToolCard
      leading={<Icon name={s.icon} className="size-4 text-zinc-400" />}
      eyebrow={productEyebrow}
      title={s.title}
      subtitle={s.desc}
      actions={cta}
      footer={s.footer ? (
        <CardFooterButton>
          {s.footer}
          <Icon name="arrow-right" className="size-3 ml-1.5 inline align-middle" />
        </CardFooterButton>
      ) : undefined}
    >
      {showInputs && items && (
        <div className="space-y-1.5">
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-2.5 t-base-regular text-zinc-700">
              <Icon name="check" className="size-3.5 text-zinc-400 shrink-0" />
              {it.label && <span className="text-zinc-400 w-[64px] shrink-0">{it.label}</span>}
              <span className="min-w-0 truncate">{it.text}</span>
            </div>
          ))}
        </div>
      )}
    </ToolCard>
  );
}

const TOOL_META: Record<string, { label: string; icon: string; preview: string[] }> = {
  draft:              { label: 'Draft',           icon: 'pen',       preview: ['Termination clause', 'Article 12 — Liability', 'Contractual preamble'] },
  // NB: `extract` is intentionally absent — it short-circuits to <ExtractTable/>,
  // which (like the A4 suggestion) reads EXTRACT_TOOL. One source of truth.
  counsel:            { label: 'Counsel',         icon: 'scales',    preview: ['Litigation strategy', 'Risk: two-year limitation expired', 'Recommendation: settlement'] },
  documents:          { label: 'Documents',       icon: 'file-text', preview: ['Closing_brief_Moreau.pdf', 'Architect_contract_v3.docx', 'Minutes_AGM_2024.pdf'] },
  document:           { label: 'Document creation', icon: 'file-text', preview: [] },
  tableau:            { label: 'Table',           icon: 'list',      preview: ['Column A: Reference', 'Column B: Date', 'Column C: Amount'] },
  clausier:           { label: 'Clause library',  icon: 'list',      preview: ['Termination clause — Template A', 'Non-compete clause — 2024 template', 'Penalty clause — Commercial lease'] },
  'counter-argument': { label: 'Counter-Argument', icon: 'scales',   preview: ['Opposing argument #1 — Limitation period', 'Possible rebuttal — Art. 2224 Civil Code', 'Favorable precedent — Cass. 2nd Civ., 12 Nov. 2024'] },
};

// Tools whose CTA hands off to the Éditeur (doc surface).
const EDITOR_TOOLS = new Set(['draft', 'document', 'documents']);

// Microsoft Word file icon — white page + folded corner + the blue "W" tag.
// The current (2025–present) Microsoft Word logo, traced from the official
// Wikimedia SVG. Gradient ids are shared across instances (identical defs), so
// duplicate ids in the DOM resolve fine.
function WordGlyph({ className = 'size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 35 36" aria-hidden="true" className={'shrink-0 ' + className}>
      <defs>
        <radialGradient id="wA" cx="-619.29" cy="488.84" fx="-619.29" fy="488.84" r="1" gradientTransform="translate(29495.74 9885.89) scale(47.57 -20.15)" gradientUnits="userSpaceOnUse">
          <stop offset=".18" stopColor="#1657f4" /><stop offset=".57" stopColor="#0036c4" />
        </radialGradient>
        <linearGradient id="wB" x1="5" y1="97" x2="27.97" y2="97" gradientTransform="translate(0 116) scale(1 -1)" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#66c0ff" /><stop offset=".26" stopColor="#0094f0" />
        </linearGradient>
        <radialGradient id="wC" cx="-637.72" cy="517.98" fx="-637.72" fy="517.98" r="1" gradientTransform="translate(-40017.96 -12225.34) rotate(133.55) scale(29.36 -72.32)" gradientUnits="userSpaceOnUse">
          <stop offset=".14" stopColor="#d471ff" /><stop offset=".83" stopColor="#509df5" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="wD" cx="-611.76" cy="514.18" fx="-611.76" fy="514.18" r="1" gradientTransform="translate(-52234.57 11411.47) rotate(90) scale(18.62 -101.65)" gradientUnits="userSpaceOnUse">
          <stop offset=".28" stopColor="#4f006f" stopOpacity="0" /><stop offset="1" stopColor="#4f006f" />
        </radialGradient>
        <linearGradient id="wE" x1="5" y1="107.22" x2="35" y2="106.72" gradientTransform="translate(0 116) scale(1 -1)" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9deaff" /><stop offset=".2" stopColor="#3bd5ff" />
        </linearGradient>
        <radialGradient id="wF" cx="-650.27" cy="515.34" fx="-650.27" fy="515.34" r="1" gradientTransform="translate(-26921.47 -31089.42) rotate(166.85) scale(29.49 -70.64)" gradientUnits="userSpaceOnUse">
          <stop offset=".06" stopColor="#e4a7fe" /><stop offset=".54" stopColor="#e4a7fe" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="wG" cx="-600.8" cy="515.58" fx="-600.8" fy="515.58" r="1" gradientTransform="translate(1363.5 17878.99) rotate(45) scale(22.63 -22.63)" gradientUnits="userSpaceOnUse">
          <stop offset=".08" stopColor="#367af2" /><stop offset=".87" stopColor="#001a8f" />
        </radialGradient>
        <radialGradient id="wH" cx="-598.04" cy="557.24" fx="-598.04" fy="557.24" r="1" gradientTransform="translate(-7105.12 6724.6) rotate(90) scale(11.2 -12.77)" gradientUnits="userSpaceOnUse">
          <stop offset=".59" stopColor="#2763e5" stopOpacity="0" /><stop offset=".97" stopColor="#58aafe" />
        </radialGradient>
      </defs>
      <path d="M5,27.09l14-17.09,16,11.11v11.39c0,1.93-1.57,3.5-3.5,3.5H11c-3.31,0-6-2.69-6-6v-2.91Z" fill="url(#wA)" />
      <path d="M5,15.04c0-2.49,2.01-4.5,4.5-4.5h20.39l5.11-2.54v12.5c0,1.93-1.57,3.5-3.5,3.5H11c-3.31,0-6,2.69-6,6v-14.96Z" fill="url(#wB)" />
      <path d="M5,15.04c0-2.49,2.01-4.5,4.5-4.5h20.39l5.11-2.54v12.5c0,1.93-1.57,3.5-3.5,3.5H11c-3.31,0-6,2.69-6,6v-14.96Z" fill="url(#wC)" fillOpacity=".6" />
      <path d="M5,15.04c0-2.49,2.01-4.5,4.5-4.5h20.39l5.11-2.54v12.5c0,1.93-1.57,3.5-3.5,3.5H11c-3.31,0-6,2.69-6,6v-14.96Z" fill="url(#wD)" fillOpacity=".1" />
      <path d="M5,6C5,2.69,7.69,0,11,0h20.5c1.93,0,3.5,1.57,3.5,3.5v5c0,1.93-1.57,3.5-3.5,3.5H11c-3.31,0-6,2.69-6,6V6Z" fill="url(#wE)" />
      <path d="M5,6C5,2.69,7.69,0,11,0h20.5c1.93,0,3.5,1.57,3.5,3.5v5c0,1.93-1.57,3.5-3.5,3.5H11c-3.31,0-6,2.69-6,6V6Z" fill="url(#wF)" fillOpacity=".8" />
      <rect y="17" width="16" height="16" rx="3.25" ry="3.25" fill="url(#wG)" />
      <rect y="17" width="16" height="16" rx="3.25" ry="3.25" fill="url(#wH)" fillOpacity=".65" />
      <path d="M13.49,20.43l-1.97,9.14h-2.35s-1.16-5.48-1.16-5.48l-1.22,5.49h-2.38l-1.89-9.14h1.94l1.17,6.03,1.16-6.03h2.38l1.21,6.03,1.14-6.03h1.97Z" fill="#fff" />
    </svg>
  );
}

// A document row: Word file + download + (inert) "Éditer". Background and
// actions appear on hover only — every row behaves the same. Éditer is
// deactivated — opening the Éditeur is a dead-end in the prototype.
function DocRow({ title }: { title: string }) {
  return (
    <li className="group flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-zinc-50">
      <div className="flex items-center gap-2.5 min-w-0">
        <WordGlyph className="size-5" />
        <span className="t-base-regular text-zinc-800 truncate">{title}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 transition-opacity opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
        <button className={TOOL_BTN}>
          <Icon name="pen" className="size-3" /> Edit
        </button>
      </div>
    </li>
  );
}

// A compact preview of a generated document, fading out at the bottom (Figma §5).
function MiniDocPreview({ blocks }: { blocks: AnswerBlock[] }) {
  return (
    <div className="max-h-56 overflow-hidden px-5 py-4 bg-white [mask-image:linear-gradient(to_bottom,black_65%,transparent)]">
      {blocks.map((b, i) =>
        b.kind === 'h' ? (
          <div key={i} className="t-base-semibold text-zinc-900 mt-3 mb-1 first:mt-0">{b.text}</div>
        ) : (
          <p key={i} className="t-small-regular text-zinc-600 mb-1.5" dangerouslySetInnerHTML={{ __html: b.html ?? '' }} />
        ),
      )}
    </div>
  );
}

/* Extract — a tabular review: rows = documents, columns = the questions asked
   of each. Same card chrome as the document previews. */
const EXTRACT_ROWS = [
  { doc: 'Lease_Shop_Rivoli.pdf',       type: 'Commercial lease',    date: 'Jan 1, 2020',  duree: '9 years', loyer: '€4,200/mo', index: 'ILC' },
  { doc: 'Lease_Offices_Haussmann.pdf', type: 'Professional lease',  date: 'Mar 15, 2021', duree: '6 years', loyer: '€6,800/mo', index: 'ILAT' },
  { doc: 'Lease_Warehouse_Rungis.pdf',  type: 'Commercial lease',    date: 'Jul 1, 2019',  duree: '9 years', loyer: '€2,100/mo', index: 'ICC' },
  { doc: 'Lease_Restaurant_Marais.pdf', type: 'Commercial lease',    date: 'Sep 10, 2022', duree: '9 years', loyer: '€5,500/mo', index: 'ILC' },
  { doc: 'Lease_Pharmacy_Nation.pdf',   type: 'Short-term lease',    date: 'Feb 1, 2024',  duree: '3 years', loyer: '€3,900/mo', index: 'None' },
];
// Extract — ONE component, two moments. Both share the header, subtitle and the
// SAME columns (one source of truth: EXTRACT_TOOL.columns), so they can't drift.
// They differ in what the body shows:
//   • suggestion (A4) — proposes the columns it WILL extract (a checklist of
//     fields), like every other tool suggestion. No filled data yet.
//   • preview (A9) — that same table, now FILLED with the scanned documents.
function ExtractCard({ mode, showColumns = true }: { mode: 'suggestion' | 'preview'; showColumns?: boolean }) {
  const isPreview = mode === 'preview';
  // Preview "generates" briefly before resolving; the suggestion is instant.
  const [loading, setLoading] = useState(isPreview);
  useEffect(() => {
    if (!isPreview) return;
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, [isPreview]);

  return (
    <ToolCard
      leading={<ToolIcon name={EXTRACT_TOOL.icon} />}
      title={EXTRACT_TOOL.title}
      subtitle={EXTRACT_TOOL.blurb}
      actions={
        loading ? (
          <span className="size-4 rounded-full border-2 border-zinc-200 border-t-blue-600 animate-spin shrink-0" />
        ) : (
          <button className={TOOL_BTN}>
            {isPreview ? 'Open table' : EXTRACT_TOOL.cta}
            <Icon name="arrow-right" className="size-3" />
          </button>
        )
      }
      bodyFlush={isPreview}
      footer={isPreview && !loading ? <CardFooterButton>View all 12 documents</CardFooterButton> : undefined}
    >
      {!isPreview ? (
        // Suggestion: the columns it proposes to extract — same row idiom as the
        // other tool suggestions (check square + "Colonne N" label + field).
        // Compact ("Compact" variant) drops the list — header + CTA only.
        showColumns && (
        <div className="-my-1.5">
          {EXTRACT_TOOL.columns.map((c, i) => (
            <div key={c} className="group flex items-center gap-3 py-1.5">
              <span className="size-4 rounded bg-zinc-900 grid place-items-center shrink-0">
                <Icon name="check" className="size-2.5 text-white" />
              </span>
              <span className="t-base-regular text-zinc-400 w-[72px] shrink-0">Colonne {i + 1}</span>
              <span className="flex-1 min-w-0 t-base-regular text-zinc-800 truncate">{c}</span>
              <button title="Modifier" className="shrink-0 size-7 grid place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity">
                <Icon name="pen" className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
        )
      ) : loading ? (
        <div className="p-4 space-y-2.5">
          {[0, 1, 2, 3, 4].map((i) => <span key={i} className="block h-4 rounded shimmer" />)}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-100">
                {EXTRACT_TOOL.columns.map((c) => (
                  <th key={c} className="text-left px-4 py-2 t-small-medium text-zinc-400 uppercase tracking-wide whitespace-nowrap">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EXTRACT_ROWS.map((r) => (
                <tr key={r.doc} className="border-b border-zinc-50 last:border-0">
                  <td className="px-4 py-2.5 t-base-medium text-zinc-900 whitespace-nowrap">{r.doc}</td>
                  <td className="px-4 py-2.5 t-base-regular text-zinc-600">{r.type}</td>
                  <td className="px-4 py-2.5 t-base-regular text-zinc-600 whitespace-nowrap">{r.date}</td>
                  <td className="px-4 py-2.5 t-base-regular text-zinc-600 whitespace-nowrap">{r.duree}</td>
                  <td className="px-4 py-2.5 t-base-regular text-zinc-600 whitespace-nowrap">{r.loyer}</td>
                  <td className="px-4 py-2.5 t-base-regular text-zinc-600 whitespace-nowrap">{r.index}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ToolCard>
  );
}

// Default documents shown in the multi-doc Tools preview (realistic filenames).
const MULTI_DOC_TITLES = [
  'Employment-Contract-Raphael-Moreau.docx',
  'Employment-Contract-Irene-Dalmer.docx',
  'Employment-Contract-Camille-Laurent.docx',
  'Employment-Contract-Lea-Bernard.docx',
  'Employment-Contract-Nathan-Lefebvre.docx',
  'Employment-Contract-Arthur-Chevalier.docx',
];

// Default document shown in the single-doc Tools preview (a realistic legal
// doc, not the conversational answer text).
const BAIL_DOC_TITLE = 'Commercial lease.docx';
const BAIL_PREVIEW: AnswerBlock[] = [
  { kind: 'h', text: 'COMMERCIAL LEASE' },
  { kind: 'h', text: 'IDENTIFICATION OF THE PARTIES' },
  { kind: 'p', html: 'This agreement is entered into between the undersigned:' },
  { kind: 'p', html: 'On the one hand,' },
  { kind: 'p', html: '<strong>1. The Lessor(s)</strong>' },
  { kind: 'p', html: '<mark style="background:#dcfce7;color:inherit;padding:1px 2px;border-radius:2px;">FONCIERE FRANCILIENNE LOCAUX ENTREPRISES (FFLE), a civil company with capital of EUR 1,000, having its registered office at 2 RUE DE BERNE 75008 PARIS, registered under number 444 171 755, represented by its manager Mr. STEPHANE GROS.</mark>' },
  { kind: 'p', html: 'Hereinafter referred to as the <strong>“Lessor”</strong>;' },
  { kind: 'p', html: 'And, on the other hand,' },
  { kind: 'p', html: '<strong>2. The Tenant</strong>' },
  { kind: 'p', html: '_______________, of _________ nationality, born on ___________, residing at _______________;' },
  { kind: 'p', html: 'hereinafter referred to as the <strong>“Tenant”</strong>.' },
  { kind: 'p', html: 'The Lessor and the Tenant being hereinafter referred to, together, as the <strong>“Parties”</strong>.' },
  { kind: 'h', text: 'IT IS FIRST SET OUT AS FOLLOWS:' },
  { kind: 'p', html: 'Hereby, the Lessor grants a commercial lease, in accordance with the provisions of Articles L.145-1 to L.145-60, R.145-1 to R.145-11, R.145-20 to R.145-33 and D.145-12 to D.145-19 of the French Commercial Code, and those not repealed of the amended decree of 30 September 1953 and subsequent texts, to the Tenant who accepts, the premises designated below.' },
];

// Single generated document: a brief "generating" state (filename + spinner),
// then the filename header + Éditer + the document preview.
function SingleDocPreview({ title, previewBlocks }: { title: string; previewBlocks: AnswerBlock[] }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, [title]);

  if (loading) {
    return (
      <ToolCard
        leading={<WordGlyph className="size-5" />}
        title={title}
        subtitle="Word document"
        actions={<span className="size-5 rounded-full border-2 border-zinc-200 border-t-blue-600 animate-spin shrink-0" />}
      />
    );
  }

  return (
    <ToolCard
      leading={<WordGlyph className="size-5" />}
      title={title}
      subtitle="Word document"
      actions={
        <button className={TOOL_BTN}>
          Open in Editor
          <Icon name="arrow-right" className="size-3" />
        </button>
      }
      bodyFlush
      footer={previewBlocks.length > 0 ? <CardFooterButton>Read more</CardFooterButton> : undefined}
    >
      {previewBlocks.length > 0 ? <MiniDocPreview blocks={previewBlocks} /> : undefined}
    </ToolCard>
  );
}

// Several generated documents: a brief "generating" state (shimmer rows), then
// the "Création de documents Word" file list (first row active).
function MultiDocPreview({ docs }: { docs: string[] }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, [docs.length]);

  return (
    <ToolCard
      leading={<ToolIcon name="copy" />}
      title="Word document creation"
      subtitle={`${docs.length} documents`}
      actions={
        loading ? (
          <span className="size-4 rounded-full border-2 border-zinc-200 border-t-blue-600 animate-spin shrink-0" />
        ) : (
          <button className={TOOL_BTN}>
            Open in Editor
            <Icon name="arrow-right" className="size-3" />
          </button>
        )
      }
      bodyFlush
    >
      {loading ? (
        <div className="divide-y divide-zinc-100">
          {docs.map((t) => (
            <div key={t} className="flex items-center justify-between gap-2 px-4 py-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <WordGlyph className="size-5" />
                <span className="t-base-regular text-zinc-800 truncate">{t}</span>
              </div>
              <span className="size-4 rounded-full border-2 border-zinc-200 border-t-blue-600 animate-spin shrink-0" />
            </div>
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {docs.map((title) => (
            <DocRow key={title} title={title} />
          ))}
        </ul>
      )}
    </ToolCard>
  );
}

function ToolCTA({
  variant, contentSet, artifactTitle, docTitles = [], previewBlocks = [],
}: { variant: string; contentSet: string[]; artifactTitle?: string; docTitles?: string[]; previewBlocks?: AnswerBlock[] }) {
  const setSurface = useChatbot((s) => s.setSurface);
  const surface = useChatbot((s) => s.surface);
  if (variant === 'hidden' || contentSet.length === 0) return null;

  // 'card' = header bar only; 'preview' (default) = header + body (list/preview).
  const showBody = variant !== 'card';
  const toDoc = () => setSurface('doc');

  return (
    <div className="space-y-2">
      {contentSet.map((content) => {
        // ── Extract — a tabular review (rows = docs, columns = questions) ──
        if (content === 'extract') return <ExtractCard key={content} mode="preview" />;
        // ── Document creation (Figma §1/§5/§6) — one card, three states ──
        if (content === 'document') {
          const docs = docTitles.length ? docTitles : ['Document'];
          const multiple = docs.length > 1;

          // In the Éditeur, single doc → a quiet status card ("Version actuelle").
          if (surface === 'doc' && !multiple) {
            return (
              <ToolCard
                key={content}
                leading={<ToolIcon name="file-text" />}
                title="Document creation"
                subtitle="Current version"
              />
            );
          }

          // Multiple docs → "Création de documents Word" (generates, then a list).
          if (multiple) return <MultiDocPreview key={content} docs={docs} />;

          // Single doc from the Assistant → generates (spinner) then resolves to
          // a filename header + Éditer + a preview.
          return <SingleDocPreview key={content} title={docs[0]} previewBlocks={showBody ? previewBlocks : []} />;
        }

        // ── Every other tool — the SAME anatomy: title header + CTA + item list ──
        const meta = TOOL_META[content] ?? TOOL_META.draft;
        const isEditor = EDITOR_TOOLS.has(content);
        const title = content === 'draft' && artifactTitle ? artifactTitle : meta.label;
        const hasBody = showBody && meta.preview.length > 0;
        return (
          <ToolCard
            key={content}
            leading={<ToolIcon name={meta.icon} />}
            title={title}
            actions={
              <button onClick={() => { if (isEditor) toDoc(); }} className={TOOL_BTN}>
                {isEditor ? 'Open in Editor' : `Continue in ${meta.label}`}
                <Icon name="arrow-right" className="size-3" />
              </button>
            }
            bodyFlush
          >
            {hasBody ? (
              <ul className="divide-y divide-zinc-100">
                {meta.preview.map((line) => (
                  <li key={line} className="px-4 py-2 t-small-regular text-zinc-600 truncate">{line}</li>
                ))}
              </ul>
            ) : undefined}
          </ToolCard>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------------
   A7 — Answer Actions
   ---------------------------------------------------------------------- */
function AnswerActions({ variant, watcher = false, onWatcher }: { variant: string; watcher?: boolean; onWatcher?: () => void }) {
  if (variant === 'hidden') return null;

  const labelBtn = 'inline-flex items-center gap-1.5 h-8 px-3 rounded-md t-base-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors';
  const iconBtn  = 'inline-flex items-center justify-center size-8 rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors';

  if (variant === 'icons') {
    return (
      <div className="flex items-center gap-1.5 pt-1">
        <button className={iconBtn} title="Copier"><Icon name="copy" className="size-4" /></button>
        <button className={iconBtn} title="Exporter Word"><Icon name="file-text" className="size-4" /></button>
        <button className={iconBtn} title="Exporter PDF"><Icon name="upload" className="size-4" /></button>
        {watcher && <button className={iconBtn} title="Créer une veille" onClick={onWatcher}><Icon name="bell" className="size-4" /></button>}
        <div className="w-px h-5 bg-zinc-200 mx-0.5" />
        <button className={iconBtn} title="Utile"><Icon name="thumb-up" className="size-4" /></button>
        <button className={iconBtn} title="Pas utile"><Icon name="thumb-down" className="size-4" /></button>
      </div>
    );
  }

  // labeled (default)
  return (
    <div className="flex items-center gap-1.5 pt-1">
      <button className={labelBtn}>
        <Icon name="copy" className="size-3.5" />
        Copier
      </button>
      <button className={labelBtn}>
        <Icon name="file-text" className="size-3.5" />
        Word
      </button>
      <button className={labelBtn}>
        <Icon name="upload" className="size-3.5" />
        PDF
      </button>
      {watcher && (
        <button className={labelBtn} onClick={onWatcher}>
          <Icon name="bell" className="size-3.5" />
          Créer une veille
        </button>
      )}
      <div className="w-px h-5 bg-zinc-200 mx-0.5" />
      <button className={iconBtn} title="Utile"><Icon name="thumb-up" className="size-4" /></button>
      <button className={iconBtn} title="Pas utile"><Icon name="thumb-down" className="size-4" /></button>
    </div>
  );
}

/* ----------------------------------------------------------------------
   A8 — Suggested Follow-ups
   ---------------------------------------------------------------------- */
function Followups({ variant, items }: { variant: string; items: string[] }) {
  if (variant === 'hidden' || items.length === 0) return null;

  return (
    <div>
      <div className="t-base-medium text-zinc-900 mb-1">Relances</div>
      <ul className="divide-y divide-zinc-100">
        {items.map((f) => (
          <li key={f}>
            <button className="w-full text-left py-2 t-base-regular text-zinc-700 hover:text-zinc-900 transition-colors">
              {f}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ----------------------------------------------------------------------
   A5 — Diff Widget
   Inline diff card listing the assistant's proposed edits to a document.
   ---------------------------------------------------------------------- */

type DiffSpan = { kind: 'kept' | 'removed' | 'added'; text: string };
type DiffChange = { title: string; spans: DiffSpan[] };

export const DIFF_TOTAL = 3;
const DIFF_TRAITED = 0;


// Figma flow 2 — "Corrige la date de l'audience" → 3 date corrections in the doc.
const DIFF_CHANGES: DiffChange[] = [
  {
    title: 'Date mise à jour',
    spans: [
      { kind: 'kept',    text: 'Audience du ' },
      { kind: 'removed', text: 'Lundi 4 septembre 2023 à 9h30' },
      { kind: 'added',   text: 'Mardi 5 septembre 2023 à 10h' },
    ],
  },
  {
    title: 'Date mise à jour',
    spans: [
      { kind: 'kept',    text: 'Convocation notifiée le ' },
      { kind: 'removed', text: '12 juillet 2023' },
      { kind: 'added',   text: '13 juillet 2023' },
    ],
  },
  {
    title: 'Date mise à jour',
    spans: [
      { kind: 'kept',    text: 'Clôture de l’instruction au ' },
      { kind: 'removed', text: '28 août 2023' },
      { kind: 'added',   text: '29 août 2023' },
    ],
  },
];

function DiffSpans({ spans }: { spans: DiffSpan[] }) {
  return (
    <>
      {spans.map((s, i) => {
        if (s.kind === 'kept')    return <span key={i}>{s.text}</span>;
        if (s.kind === 'removed') return <span key={i} className="bg-red-50 text-red-700 line-through px-0.5 rounded">{s.text}</span>;
        return <span key={i} className="bg-green-50 text-green-800 px-0.5 rounded">{s.text}</span>;
      })}
    </>
  );
}

const CLAUSE_ANALYSIS_CHANGES: DiffChange[] = [
  {
    title: 'Clause 1 — Objet du contrat',
    spans: [
      { kind: 'kept',    text: "Le présent contrat a pour objet la prestation de services " },
      { kind: 'removed', text: "d'architecture" },
      { kind: 'added',   text: "d'architecte (maîtrise d'œuvre complète, mission de base)" },
      { kind: 'kept',    text: ", conformément à la loi MOP." },
    ],
  },
  {
    title: 'Clause 4 — Délais d\'exécution',
    spans: [
      { kind: 'kept',    text: "Les délais sont " },
      { kind: 'removed', text: "indicatifs" },
      { kind: 'added',   text: "contractuels et susceptibles de pénalités en cas de retard imputable à l'architecte" },
      { kind: 'kept',    text: "." },
    ],
  },
  {
    title: 'Clause 7 — Responsabilité',
    spans: [
      { kind: 'kept',    text: "L'architecte est " },
      { kind: 'removed', text: "responsable de plein droit" },
      { kind: 'added',   text: "tenu d'une obligation de moyens renforcée, sa responsabilité décennale s'appliquant aux ouvrages au sens de l'article 1792 C. civ." },
      { kind: 'kept',    text: "." },
    ],
  },
  {
    title: 'Clause 12 — Résiliation',
    spans: [
      { kind: 'kept',    text: "Le contrat peut être résilié " },
      { kind: 'removed', text: "à tout moment" },
      { kind: 'added',   text: "par chaque partie, sous préavis de trois mois et après mise en demeure restée infructueuse" },
      { kind: 'kept',    text: "." },
    ],
  },
  {
    title: 'Clause 14 — Confidentialité',
    spans: [
      { kind: 'kept',    text: "Les parties s'engagent à la confidentialité " },
      { kind: 'removed', text: "pendant la durée du contrat" },
      { kind: 'added',   text: "pendant la durée du contrat et pendant cinq (5) ans après son terme" },
      { kind: 'kept',    text: "." },
    ],
  },
  {
    title: 'Clause 18 — Droit applicable',
    spans: [
      { kind: 'kept',    text: "Le présent contrat est soumis au droit français" },
      { kind: 'added',   text: ". Tout litige relatif à son interprétation ou son exécution relève de la compétence exclusive du Tribunal judiciaire de Paris" },
      { kind: 'kept',    text: "." },
    ],
  },
  {
    title: 'Clause 21 — Assurance',
    spans: [
      { kind: 'kept',    text: "L'architecte justifie d'une assurance " },
      { kind: 'removed', text: "professionnelle" },
      { kind: 'added',   text: "responsabilité civile professionnelle ET responsabilité civile décennale conforme à l'article L.241-1 du Code des assurances" },
      { kind: 'kept',    text: "." },
    ],
  },
];

/* D4 — Legal-article check: status cards for the articles cited in the doc. */
const D4_STATUS: Record<string, { label: string; cls: string }> = {
  'à-jour':   { label: '✅ À jour',  cls: 'text-emerald-700' },
  'obsolète': { label: '⚠ Obsolète', cls: 'text-amber-700' },
  'modifié':  { label: '✎ Modifié',  cls: 'text-blue-700' },
};

function ArticleCheck({ articles }: { articles: { ref: string; status: string; note?: string }[] }) {
  if (articles.length === 0) return null;
  return (
    <div className="rounded-md border border-zinc-200 bg-white overflow-hidden">
      <div className="px-4 py-2.5 border-b border-zinc-100 t-base-semibold text-zinc-900">Vérification des articles</div>
      <ul className="divide-y divide-zinc-100">
        {articles.map((a) => {
          const st = D4_STATUS[a.status] ?? D4_STATUS['à-jour'];
          return (
            <li key={a.ref} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="min-w-0">
                <span className="block t-base-medium text-zinc-900 truncate">{a.ref}</span>
                {a.note && <span className="block t-small-regular text-zinc-500 truncate">{a.note}</span>}
              </span>
              <span className={'shrink-0 t-small-medium ' + st.cls}>{st.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DiffWidget({ variant }: { variant: string }) {
  const [tab, setTab] = useState<'pending' | 'done'>('pending');
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState<Set<number>>(() => new Set([0])); // first change open by default
  const openSourcesPanel = useChatbot((s) => s.openSourcesPanel);
  if (variant === 'hidden') return null;

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  // clause-analysis variant uses a different dataset + header / tab copy
  const isClauseAnalysis = variant === 'clause-analysis';
  const changes      = isClauseAnalysis ? CLAUSE_ANALYSIS_CHANGES : DIFF_CHANGES;
  const total        = isClauseAnalysis ? CLAUSE_ANALYSIS_CHANGES.length : DIFF_TOTAL;
  const treated      = isClauseAnalysis ? 0 : DIFF_TRAITED;
  const headerLabel  = isClauseAnalysis ? `Analyse clause par clause · ${total} clauses` : `${total} changements`;
  const pendingLabel = isClauseAnalysis ? 'À revoir' : 'Non traités';
  const doneLabel    = isClauseAnalysis ? 'Conformes' : 'Traités';
  const applyAllLabel = isClauseAnalysis ? 'Approuver toutes les clauses' : 'Tout appliquer';
  const pendingCount = total - treated;

  return (
    <div className="rounded-md border border-zinc-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100">
        <span className="t-base-semibold text-zinc-900">{headerLabel}</span>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="size-6 inline-flex items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          title={collapsed ? 'Déplier' : 'Replier'}
        >
          <Icon name={collapsed ? 'chevron-down' : 'chevron-up'} className="size-3.5" />
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Tabs + Apply all */}
          <div className="px-4 pt-3 pb-2 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTab('pending')}
                className={
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full t-base-medium transition-colors ' +
                  (tab === 'pending' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-zinc-500 hover:text-zinc-900 border border-transparent')
                }
              >
                {pendingLabel} <span className="text-zinc-400">·</span> {pendingCount}
              </button>
              <button
                onClick={() => setTab('done')}
                className={
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full t-base-medium transition-colors ' +
                  (tab === 'done' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-zinc-500 hover:text-zinc-900 border border-zinc-200')
                }
              >
                {doneLabel} <span className="text-zinc-400">·</span> {treated}
              </button>
            </div>
            <button className="w-full px-4 py-2 border border-blue-500 text-blue-600 rounded-md t-base-medium hover:bg-blue-50">
              {applyAllLabel}
            </button>
          </div>

          {/* Change list */}
          <ul className="divide-y divide-zinc-100 border-t border-zinc-100">
            {changes.map((c, i) => {
              const isOpen = open.has(i);
              return (
                <li key={i}>
                  <button
                    onClick={() => toggle(i)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 text-left"
                  >
                    <span className="inline-flex items-center justify-center size-5 rounded-full bg-zinc-100 t-small-semibold text-zinc-600 shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 t-base-medium text-zinc-900 truncate">{c.title}</span>
                    <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} className="size-3.5 text-zinc-400 shrink-0" />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 pl-12">
                      <p className="t-base-regular text-zinc-800 leading-relaxed">
                        <DiffSpans spans={c.spans} />
                      </p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <button onClick={() => openSourcesPanel(i)} className="inline-flex items-center gap-1.5 px-2 py-1 t-base-medium text-blue-600 rounded hover:bg-blue-50">
                          <Icon name="file-text" className="size-3.5" />
                          Sources
                        </button>
                        <span className="flex-1" />
                        <button className="px-3 py-1 t-base-medium text-blue-600 rounded hover:bg-blue-50">Ignorer</button>
                        <button className="px-3 py-1 t-base-medium text-blue-600 border border-blue-500 rounded hover:bg-blue-50">Appliquer</button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

