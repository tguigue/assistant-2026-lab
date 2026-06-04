import { useState } from 'react';
import { useChatbot } from '../chatbot/store';
import { SCENARIOS } from '../chatbot/scenarios';
import type { AnswerBlock, Citation } from '../chatbot/types';
import { Icon, FileCard } from './ui';
import { PrimitiveSlot } from './PrimitiveSlot';

/**
 * Conversation — renders the assistant response with rich legal structure.
 * Reads primitive variants from the store; every variant produces a visible change.
 */
export function Conversation() {
  const comp = useChatbot((s) => s.comp);
  const prim = useChatbot((s) => s.primitives);
  const promptOverride = useChatbot((s) => s.promptOverride);
  const scenario = SCENARIOS[comp.scenario];

  // Each primitive is either visible (its chosen variant) or hidden.
  const v = (code: keyof typeof prim) => (prim[code].visible ? prim[code].variant : 'hidden');
  const a0 = v('A0'), a1 = v('A1'), a2 = v('A2'), a3 = v('A3'), a4 = v('A4'), a5 = v('A5'), a6 = v('A6'), a7 = v('A7'), a8 = v('A8');
  const a0Content = Array.isArray(prim.A0.content) ? prim.A0.content : ['sharepoint', 'gdrive', 'matters', 'doctrine-kb'];
  const a4Content = Array.isArray(prim.A4.content) ? prim.A4.content : ['draft'];

  // All citations always available — primitive variants are pure visual choices.
  // Designers can preview any A3/A5 variant without scenario params blocking it.
  const visibleCitations = scenario.citations;

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-8 space-y-8">
      {/* User message — all chassis. If the scenario attached a file, show it as a FileCard above the bubble. */}
      <div className="flex justify-end">
        <div className="max-w-[80%] flex flex-col items-end gap-2">
          {scenario.attached && (
            <FileCard name={scenario.attached.name} meta={scenario.attached.meta} className="max-w-[280px]" />
          )}
          <div className="px-4 py-2.5 rounded-2xl rounded-br-md bg-zinc-100 t-large-regular text-zinc-900">
            {promptOverride ?? scenario.prompt}
          </div>
        </div>
      </div>

      {/* A1 — Reasoning */}
      <PrimitiveSlot code="A1" block>
        <PlanPreamble variant={a1} scenario={comp.scenario} />
      </PrimitiveSlot>

      {/* A5 — Diff Widget */}
      <PrimitiveSlot code="A5" block>
        <DiffWidget variant={a5} />
      </PrimitiveSlot>

      {/* Body — renders blocks; A2 wraps quote blocks; A3 (text) and A6 (number)
          render inline citations based on each citation's kind. */}
      <AssistantBody
        a3Variant={a3}
        a6Variant={a6}
        quoteVariant={a2}
        blocks={scenario.answer}
        citations={visibleCitations}
      />

      {/* A4 — Tools */}
      <PrimitiveSlot code="A4" block>
        <ToolCTA variant={a4} contentSet={a4Content} artifactTitle={scenario.artifact?.title} />
      </PrimitiveSlot>

      {/* A7 — Answer Actions */}
      <PrimitiveSlot code="A7" block><AnswerActions variant={a7} /></PrimitiveSlot>

      {/* A8 — Suggested follow-ups */}
      <PrimitiveSlot code="A8" block><Followups variant={a8} items={scenario.followups} /></PrimitiveSlot>

      {/* A0 — Ask user question (all variants dock above composer) */}
      {a0 !== 'hidden' && (
        <div className="sticky bottom-0 -mx-6 -mb-8 px-6 pt-3 pb-0 bg-gradient-to-t from-white via-white to-white/0 z-10">
          <PrimitiveSlot code="A0" block>
            {a0 === 'sticky-sources' && <AskStickyComposer silos={a0Content} />}
            {a0 === 'sticky-choice'  && <AskStickyChoice />}
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
      if (!a6On) return ''; // primitive off → no marker
      n++;
      return ` <span class="cite-pill cite-pill--internal cite-slot" data-primitive="A6" style="min-width:22px;padding:1px 6px;justify-content:center;font-weight:600;">${n}</span> `;
    }

    // External → A3 Source Citation: blue underlined text (the chatbot controls the name).
    if (!a3On) return label; // primitive off → plain text, no link
    return `<a class="cite-slot" data-primitive="A3" style="color:#2563eb;text-decoration:underline;text-underline-offset:2px;text-decoration-color:#93c5fd;" title="${title}">${label}</a>`;
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

function useDocSelection(silos: string[]) {
  const initial: Record<DocKey, boolean> = {};
  silos.forEach((s) => {
    const hits = SILO_HITS[s as SiloId] ?? [];
    hits.forEach((_, i) => { initial[`${s as SiloId}:${i}`] = true; });
  });
  const [sel, setSel] = useState<Record<DocKey, boolean>>(initial);
  const toggle = (k: DocKey) => setSel((s) => ({ ...s, [k]: !s[k] }));
  return { sel, toggle };
}

const CLARIFY_QUESTION = 'Which angle should the answer LEAD with for your audience?';
const CLARIFY_PROGRESS = '3/4';
const CLARIFY_OPTIONS: { title: string; desc: string }[] = [
  { title: 'Trois critères cumulatifs',     desc: 'Cadre classique : répétition, dégradation des conditions, atteinte. Pose la grille avant tout exemple.' },
  { title: 'Pratiques managériales risquées', desc: 'Part du terrain : réunions de suivi, points hebdo, micro-management. Plus concret pour un manager.' },
  { title: 'Charge de la preuve',           desc: 'Angle contentieux : éléments à réunir côté salarié, riposte côté employeur. Utile si litige imminent.' },
  { title: 'Plan de prévention',            desc: 'Angle RH : ce que le cabinet doit mettre en place. Préventif plutôt que défensif.' },
];

function AskStickyHeader({ title, count }: { title: string; count: string }) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-zinc-200 bg-zinc-50">
      <span className="inline-flex items-center justify-center min-w-[28px] h-4 px-1 rounded bg-amber-100 t-small-semibold text-amber-800">
        {count}
      </span>
      <p className="flex-1 t-small-semibold text-zinc-900 truncate">{title}</p>
      <button className="text-zinc-400 hover:text-zinc-700" title="Fermer">
        <Icon name="x" className="size-3.5" />
      </button>
    </div>
  );
}

function AskStickyChoice() {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="rounded-md border border-zinc-300 bg-white shadow-md overflow-hidden text-[12px]">
      <AskStickyHeader title={CLARIFY_QUESTION} count={CLARIFY_PROGRESS} />

      <ul className="max-h-[28vh] overflow-y-auto scrollbar-thin divide-y divide-zinc-100">
        {CLARIFY_OPTIONS.map((opt, i) => {
          const on = selected === i;
          return (
            <li key={opt.title}>
              <button
                onClick={() => setSelected(i)}
                className={
                  'w-full flex items-center gap-2 px-2.5 py-1 text-left transition-colors ' +
                  (on ? 'bg-zinc-50' : 'hover:bg-zinc-50')
                }
              >
                <span className="flex-1 min-w-0">
                  <span className="block t-small-semibold text-zinc-900 truncate">{opt.title}</span>
                  <span className="block t-small-regular text-zinc-500 truncate">{opt.desc}</span>
                </span>
                <kbd className="shrink-0 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded border border-zinc-200 bg-white t-mono text-[10px] text-zinc-500">
                  {i + 1}
                </kbd>
              </button>
            </li>
          );
        })}
        <li>
          <div className="flex items-center gap-2 px-2.5 py-1">
            <input
              type="text"
              placeholder="Autre — saisir votre réponse"
              className="flex-1 px-1.5 py-0.5 rounded border border-zinc-200 bg-white t-small-regular text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
            />
            <kbd className="shrink-0 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded border border-zinc-200 bg-white t-mono text-[10px] text-zinc-500">
              {CLARIFY_OPTIONS.length + 1}
            </kbd>
          </div>
        </li>
      </ul>

      <div className="flex items-center justify-end gap-1 px-2.5 py-1.5 border-t border-zinc-200 bg-white">
        <button className="px-2 py-0.5 t-small-regular text-zinc-700 rounded hover:bg-zinc-100">Retour</button>
        <button className="px-2 py-0.5 t-small-medium text-white rounded bg-zinc-900 hover:bg-zinc-800">Suivant</button>
      </div>
    </div>
  );
}


function AskStickyComposer({ silos }: { silos: string[] }) {
  const { sel, toggle } = useDocSelection(silos);
  const total = silos.reduce((n, s) => n + (SILO_HITS[s as SiloId]?.length ?? 0), 0);
  const kept  = Object.values(sel).filter(Boolean).length;

  return (
    <div className="rounded-md border border-zinc-300 bg-white shadow-md overflow-hidden text-[12px]">
      <AskStickyHeader title="Valider les sources" count={`${kept}/${total}`} />

      <div className="max-h-[28vh] overflow-y-auto scrollbar-thin">
        {silos.map((s) => {
          const meta = SILO_META[s as SiloId];
          const hits = SILO_HITS[s as SiloId] ?? [];
          if (!meta || hits.length === 0) return null;
          return (
            <div key={s}>
              <div className="flex items-center gap-1 px-2.5 py-1 bg-zinc-50 border-b border-zinc-200">
                <Icon name={meta.icon} className="size-3 text-zinc-500" />
                <span className="t-small-semibold text-zinc-900">{meta.label}</span>
                <span className="t-small-regular text-zinc-400">· {hits.length}</span>
              </div>
              <ul className="divide-y divide-zinc-100">
                {hits.map((h, i) => {
                  const key = `${s as SiloId}:${i}` as DocKey;
                  const on = sel[key];
                  return (
                    <li key={key}>
                      <label className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-zinc-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggle(key)}
                          className="size-3 rounded border-zinc-300 accent-zinc-900"
                        />
                        <Icon name={s === 'matters' ? 'folder' : 'file-text'} className="size-3 text-zinc-400 shrink-0" />
                        <span className={'flex-1 t-small-regular truncate ' + (on ? 'text-zinc-800' : 'text-zinc-400 line-through')}>{h.name}</span>
                        <span className="t-small-regular text-zinc-400 shrink-0 hidden sm:inline">{h.meta}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-1 px-2.5 py-1.5 border-t border-zinc-200 bg-white">
        <button className="px-2 py-0.5 t-small-regular text-zinc-700 rounded hover:bg-zinc-100">
          Annuler
        </button>
        <button className="px-2 py-0.5 t-small-medium text-white rounded bg-zinc-900 hover:bg-zinc-800">
          Lancer
        </button>
      </div>
    </div>
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
      count: '42 résultats',
      hits: [
        { kind: 'search',   label: '"harcèlement moral" éléments constitutifs répétition',    corpus: 'Décisions' },
        { kind: 'law',      label: "Article L1152-1 du Code du travail",                       corpus: 'Lois et règlements' },
        { kind: 'decision', label: "Cass. soc., 10 nov. 2009, n° 07-45.321",                   corpus: 'Décisions' },
        { kind: 'decision', label: "Cass. soc., 1er juin 2022, n° 21-12.488",                  corpus: 'Décisions' },
      ],
    },
    {
      text: "Je regarde comment les juges qualifient les pratiques managériales (réunions de suivi, points hebdomadaires, micro-management).",
      count: '27 résultats',
      hits: [
        { kind: 'search',   label: '"points hebdomadaires" harcèlement managérial',           corpus: 'Décisions' },
        { kind: 'decision', label: "Cass. soc., 15 mars 2023, n° 21-22.124",                   corpus: 'Décisions' },
        { kind: 'decision', label: "CA Paris, 8 févr. 2024, n° 22/04891",                       corpus: 'Décisions' },
      ],
    },
    {
      text: "Je complète avec vos mémos et notes RH sur l'encadrement managérial du cabinet.",
      count: '8 résultats',
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
      count: '12 résultats',
      hits: [
        { kind: 'law',      label: "Loi n° 77-2 du 3 janv. 1977 sur l'architecture",          corpus: 'Lois et règlements' },
        { kind: 'search',   label: '"contrat de maîtrise d\'œuvre" clauses obligatoires',     corpus: 'Modèles' },
        { kind: 'decision', label: "Cass. 3e civ., 19 mars 2020, n° 18-22.983",               corpus: 'Décisions' },
      ],
    },
    {
      text: "Je récupère vos modèles internes de contrats de prestation pour aligner le style et les clauses du cabinet.",
      count: '5 résultats',
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

  // S3 — Document legal analysis (uploaded doc + Doctrine sources)
  S3: [
    {
      text: "Je lis le document que vous avez importé et j'en extrais les moyens et la demande à étayer.",
      count: '1 document',
      hits: [
        { kind: 'fiscal', label: "Conclusions_def_Moreau.pdf — 42 pages",                      corpus: 'Document importé' },
      ],
    },
    {
      text: "Je recherche des jurisprudences confirmant le rejet de la demande sur ces moyens.",
      count: '34 résultats',
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
      count: '6 documents',
      hits: [
        { kind: 'fiscal', label: "Convention d'animation 2024.pdf",                            corpus: 'Matter' },
        { kind: 'fiscal', label: "Avenant n°1 — Convention d'animation.docx",                  corpus: 'Matter' },
        { kind: 'fiscal', label: "Contrat d'agence de distribution.docx",                      corpus: 'Matter' },
      ],
    },
    {
      text: "J'extrais les obligations de chaque contrat pour les comparer.",
      count: '6 documents',
      hits: [
        { kind: 'fiscal', label: "Obligations — Convention d'animation",                       corpus: 'Extraction' },
        { kind: 'fiscal', label: "Obligations — Contrat d'agence",                             corpus: 'Extraction' },
      ],
    },
  ],
};

function AgenticTrace({ defaultOpenFirst, scenario }: { defaultOpenFirst: boolean; scenario: string }) {
  const steps = SCENARIO_TRACES[scenario] ?? SCENARIO_TRACES.S1;
  return (
    <div className="border border-zinc-200 rounded-md bg-white">
      {steps.map((step, i) => (
        <AgenticStep
          key={i}
          step={step}
          defaultOpen={defaultOpenFirst && i === 0}
          last={i === steps.length - 1}
        />
      ))}
    </div>
  );
}

function AgenticStep({ step, defaultOpen, last }: { step: TraceStep; defaultOpen: boolean; last: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={last ? '' : 'border-b border-zinc-100'}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-zinc-50 text-left"
      >
        <span className="mt-1.5 size-1.5 rounded-full bg-zinc-400 shrink-0" />
        <span className="flex-1 t-base-regular text-zinc-800">{step.text}</span>
        <span className="t-small-regular text-zinc-400 shrink-0 mt-0.5">{step.count}</span>
        <Icon name="chevron-right" className={'size-3 text-zinc-400 mt-1.5 shrink-0 transition-transform ' + (open ? 'rotate-90' : '')} />
      </button>
      {open && (
        <div className="pl-8 pr-3 pb-3">
          <div className="rounded-md border border-zinc-200 bg-zinc-50/60 max-h-44 overflow-y-auto scrollbar-thin divide-y divide-zinc-100">
            {step.hits.map((h, j) => (
              <div key={j} className="flex items-center gap-2 px-3 py-1.5">
                <HitIcon kind={h.kind} className="size-3.5 text-zinc-400 shrink-0" />
                <span className="flex-1 t-base-regular text-zinc-800 truncate">{h.label}</span>
                <span className="t-small-regular text-zinc-400 shrink-0">{h.corpus}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlanPreamble({ variant, scenario }: { variant: string; scenario: string }) {
  if (variant === 'hidden') return null;
  return <AgenticTrace defaultOpenFirst={false} scenario={scenario} />;
}

/* ----------------------------------------------------------------------
   Assistant Body (renders blocks; A3 wraps each inline citation)
   ---------------------------------------------------------------------- */
function AssistantBody({
  a3Variant, a6Variant, quoteVariant, blocks, citations,
}: {
  a3Variant: string;
  a6Variant: string;
  quoteVariant: string;
  blocks: AnswerBlock[];
  citations: Record<string, Citation>;
}) {
  const highlightMode = useChatbot((s) => s.highlightMode);
  const hovered       = useChatbot((s) => s.hoveredPrimitive);
  const setHovered    = useChatbot((s) => s.setHoveredPrimitive);

  // A3 (Source citation) and A6 (Document citation) highlight INDEPENDENTLY.
  // mode on → both kinds show the dashed "highlightable" outline; on hover only
  // the hovered primitive's own slots get the solid amber outline.
  const citeHover = highlightMode && (hovered === 'A3' || hovered === 'A6') ? hovered : undefined;

  const onMouseOver = (e: React.MouseEvent) => {
    if (!highlightMode) return;
    const el = (e.target as HTMLElement).closest?.('[data-primitive]');
    if (!el) return;
    const code = el.getAttribute('data-primitive');
    if (code === 'A3' || code === 'A6') setHovered(code as 'A3' | 'A6');
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
      return (
        <PrimitiveSlot key={i} code="A2" block>
          <QuoteBlock variant={quoteVariant} html={b.html} attribution={b.attribution} />
        </PrimitiveSlot>
      );
    }
    return (
      <p
        key={i}
        dangerouslySetInnerHTML={{
          __html: renderInlineCitations(b.html, citations, a3Variant !== 'hidden', a6Variant !== 'hidden'),
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
   A4 — Tools
   ---------------------------------------------------------------------- */
const TOOL_META: Record<string, { label: string; icon: string; preview: string[] }> = {
  draft:              { label: 'Draft',           icon: 'pen',       preview: ['Clause de résiliation', 'Article 12 — Responsabilité', 'Préambule contractuel'] },
  extract:            { label: 'Extract',         icon: 'list',      preview: ['Obligation de moyen · Art. 4', 'Délai de préavis · Art. 9', 'Clause pénale · Art. 14'] },
  counsel:            { label: 'Counsel',         icon: 'scales',    preview: ['Stratégie contentieuse', 'Risque : délai biennal expiré', 'Recommandation : transaction'] },
  documents:          { label: 'Documents',       icon: 'file-text', preview: ['Conclusions_def_Moreau.pdf', 'Contrat_architecte_v3.docx', 'PV_AG_2024.pdf'] },
  tableau:            { label: 'Tableau',         icon: 'list',      preview: ['Colonne A : Référence', 'Colonne B : Date', 'Colonne C : Montant'] },
  clausier:           { label: 'Clausier',        icon: 'list',      preview: ['Clause de résiliation — Modèle A', 'Clause de non-concurrence — Modèle 2024', 'Clause pénale — Bail commercial'] },
  'counter-argument': { label: 'Counter-Argument', icon: 'scales',   preview: ['Argument adverse #1 — Délai de prescription', 'Réfutation possible — Art. 2224 C. civ.', 'Précédent favorable — Cass. 2e civ., 12 nov. 2024'] },
};

function ToolCTA({
  variant, contentSet, artifactTitle,
}: { variant: string; contentSet: string[]; artifactTitle?: string }) {
  if (variant === 'hidden' || contentSet.length === 0) return null;

  if (variant === 'preview') {
    return (
      <div className="space-y-2">
        {contentSet.map((content) => {
          const meta = TOOL_META[content] ?? TOOL_META.draft;
          return (
            <div key={content} className="rounded-md border border-zinc-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 bg-zinc-50">
                <div className="flex items-center gap-2">
                  <Icon name={meta.icon} className="size-3.5 text-zinc-500" />
                  <span className="t-base-semibold text-zinc-900">{content === 'draft' && artifactTitle ? artifactTitle : meta.label}</span>
                </div>
                <button className="px-2.5 py-1 t-base-medium text-white rounded-md bg-zinc-900 hover:bg-zinc-800 inline-flex items-center gap-1">
                  Ouvrir <Icon name="arrow-right" className="size-3" />
                </button>
              </div>
              <ul className="divide-y divide-zinc-100">
                {meta.preview.map((line) => (
                  <li key={line} className="px-4 py-2 t-small-regular text-zinc-600 truncate">{line}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    );
  }

  // card (default)
  return (
    <div className="space-y-2">
      {contentSet.map((content) => {
        const meta = TOOL_META[content] ?? TOOL_META.draft;
        return (
          <div key={content} className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name={meta.icon} className="size-3.5 text-zinc-700" />
              <span className="t-base-medium text-zinc-900">Continuer dans {meta.label}</span>
            </div>
            <button className="px-2.5 py-1 t-base-medium text-white rounded-md bg-zinc-900 hover:bg-zinc-800 inline-flex items-center gap-1">
              Ouvrir <Icon name="arrow-right" className="size-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------------
   A7 — Answer Actions
   ---------------------------------------------------------------------- */
function AnswerActions({ variant }: { variant: string }) {
  if (variant === 'hidden') return null;

  const labelBtn = 'inline-flex items-center gap-1.5 h-8 px-3 rounded-md t-base-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors';
  const iconBtn  = 'inline-flex items-center justify-center size-8 rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors';

  if (variant === 'icons') {
    return (
      <div className="flex items-center gap-1.5 pt-1">
        <button className={iconBtn} title="Copier"><Icon name="copy" className="size-4" /></button>
        <button className={iconBtn} title="Exporter Word"><Icon name="file-text" className="size-4" /></button>
        <button className={iconBtn} title="Exporter PDF"><Icon name="upload" className="size-4" /></button>
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
      <div className="t-micro text-zinc-500 mb-1">Relances</div>
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

const DIFF_TOTAL = 186;
const DIFF_TRAITED = 1;

const DIFF_CHANGES: DiffChange[] = [
  {
    title: 'Clarification de la demande initiale',
    spans: [
      { kind: 'kept',    text: 'Je ' },
      { kind: 'removed', text: 'cherche' },
      { kind: 'kept',    text: ' ' },
      { kind: 'added',   text: 'recherche' },
      { kind: 'kept',    text: ' des décisions pénales ' },
      { kind: 'removed', text: 'qui ont considéré' },
      { kind: 'kept',    text: ' ' },
      { kind: 'added',   text: 'ayant jugé' },
      { kind: 'kept',    text: ' que le fait qu' },
      { kind: 'removed', text: "'" },
      { kind: 'added',   text: "' " },
      { kind: 'kept',    text: "une personne ait présenté des signes de démence de type Alzheimer ne permet pas" },
      { kind: 'removed', text: ' ' },
      { kind: 'added',   text: ', à lui seul, ' },
      { kind: 'kept',    text: "de considérer qu" },
      { kind: 'removed', text: "'elle était" },
      { kind: 'added',   text: "'elle se trouvait" },
      { kind: 'kept',    text: ' dans un état de vulnérabilité plusieurs années ' },
      { kind: 'removed', text: 'avant' },
      { kind: 'added',   text: 'auparavant' },
      { kind: 'kept',    text: '.' },
    ],
  },
  {
    title: "Formulation plus précise de l'analyse de la demande",
    spans: [
      { kind: 'kept',    text: 'J’ai analysé votre demande ' },
      { kind: 'removed', text: 'concernant' },
      { kind: 'kept',    text: ' ' },
      { kind: 'added',   text: 'relative à' },
      { kind: 'kept',    text: ' la caractérisation pénale de l’état de vulnérabilité au regard de signes de démence de type Alzheimer et identifié les critères de recherche suivants :' },
    ],
  },
  {
    title: "Harmonisation de l'intitulé de la question juridique",
    spans: [
      { kind: 'kept', text: "Des décisions pénales retiennent-elles que la présence de signes évocateurs d’une démence de type Alzheimer ne suffit pas, à elle seule, à établir que la victime se trouvait déjà en état de vulnérabilité plusieurs années avant les faits (ou avant l’acte litigieux), faute d’éléments médicaux " },
      { kind: 'removed', text: '/' },
      { kind: 'kept',    text: ' ' },
      { kind: 'added',   text: 'ou' },
      { kind: 'kept',    text: ' chronologiques suffisamment probants sur cette période antérieure ?' },
    ],
  },
  {
    title: 'Précision de la formulation sur le cadre pénal',
    spans: [
      { kind: 'kept',    text: 'Le cadre ' },
      { kind: 'removed', text: 'légal' },
      { kind: 'added',   text: 'pénal' },
      { kind: 'kept',    text: ' applicable est celui de l’article 223-15-2 du Code pénal.' },
    ],
  },
  {
    title: 'Clarification de la portée des éléments médicaux',
    spans: [
      { kind: 'kept',    text: 'Les éléments médicaux ' },
      { kind: 'removed', text: 'devront prouver' },
      { kind: 'added',   text: 'doivent établir' },
      { kind: 'kept',    text: ' l’état de vulnérabilité au moment des faits.' },
    ],
  },
  {
    title: 'Clarification de la temporalité de la vulnérabilité',
    spans: [
      { kind: 'kept',    text: "L’état doit exister " },
      { kind: 'removed', text: 'au temps' },
      { kind: 'added',   text: 'au moment précis' },
      { kind: 'kept',    text: ' des faits reprochés.' },
    ],
  },
  {
    title: 'Reformulation pour une meilleure fluidité',
    spans: [
      { kind: 'kept',    text: 'En conséquence, ' },
      { kind: 'removed', text: 'il est nécessaire de' },
      { kind: 'added',   text: 'il convient de' },
      { kind: 'kept',    text: ' rapporter la preuve de l’état de vulnérabilité contemporain des faits.' },
    ],
  },
  {
    title: 'Allègement stylistique',
    spans: [
      { kind: 'kept',    text: "Cette analyse permet d’identifier les " },
      { kind: 'removed', text: 'différents éléments' },
      { kind: 'added',   text: 'éléments-clés' },
      { kind: 'kept',    text: ' à rechercher.' },
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

function DiffWidget({ variant }: { variant: string }) {
  const [tab, setTab] = useState<'pending' | 'done'>('pending');
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState<Set<number>>(() => new Set([0])); // first change open by default
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
                      <div className="mt-2 flex items-center justify-end gap-1.5">
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

