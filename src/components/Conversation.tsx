import { useState, useEffect } from 'react';
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
  const a0 = v('A0'), a1 = v('A1'), a2 = v('A2'), a4 = v('A4'), a5 = v('A5'), a7 = v('A7'), a8 = v('A8'), a9 = v('A9');
  const d4 = prim.D4.visible; // legal-article check
  const a0Content = Array.isArray(prim.A0.content) ? prim.A0.content : ['sharepoint', 'gdrive', 'matters', 'doctrine-kb'];
  const a0Example = prim.A0.axisVariants?.example ?? 'edit';
  const a4Content = Array.isArray(prim.A4.content) ? prim.A4.content : ['counsel'];
  // A2 "Answer" — toggles for which elements show + excerpt style.
  const a2Content = Array.isArray(prim.A2.content) ? prim.A2.content : ['excerpt', 'sources', 'docs'];
  const a2Excerpt = prim.A2.axisVariants?.excerpt ?? 'inline-highlight';
  const showExcerpt = a2 !== 'hidden' && a2Content.includes('excerpt');
  const showSources = a2 !== 'hidden' && a2Content.includes('sources');
  const showDocs    = a2 !== 'hidden' && a2Content.includes('docs');
  // A9 "Tools preview" — the answer IS a tool output: one document, several
  // documents, or an Extract table (single radio choice).
  const a9Content = typeof prim.A9.content === 'string' ? prim.A9.content : 'document';
  const a9Multiple = a9Content === 'documents';
  const a1ContentSet = Array.isArray(prim.A1.content) ? prim.A1.content : [];
  const a1Phase = a1ContentSet.includes('running') ? 'running' : 'done';

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
        <PlanPreamble variant={a1} phase={a1Phase} scenario={comp.scenario} />
      </PrimitiveSlot>

      {/* D4 — Legal-article check (verification cards above the edits review) */}
      {d4 && (
        <PrimitiveSlot code="D4" block>
          <ArticleCheck articles={scenario.sourcesPanel?.articles ?? []} />
        </PrimitiveSlot>
      )}

      {/* A5 — Diff Widget */}
      <PrimitiveSlot code="A5" block>
        <DiffWidget variant={a5} />
      </PrimitiveSlot>

      {/* Body — Text answer (A2) and Tools preview (A9) are INDEPENDENT: each
          shows/hides by its own checkbox. In the real product they wouldn't
          appear together; the lab just lets you toggle either. */}
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
        </PrimitiveSlot>
      )}

      {/* A4 — Tools */}
      <PrimitiveSlot code="A4" block>
        <ToolCTA
          variant={a4}
          contentSet={a4Content}
          artifactTitle={scenario.artifact?.title}
          docTitles={
            scenario.artifacts?.map((a) => a.title) ??
            (scenario.artifact ? [scenario.artifact.title] : [])
          }
          previewBlocks={scenario.artifact?.body ?? []}
        />
      </PrimitiveSlot>

      {/* A7 — Answer Actions */}
      <PrimitiveSlot code="A7" block><AnswerActions variant={a7} /></PrimitiveSlot>

      {/* A8 — Suggested follow-ups */}
      <PrimitiveSlot code="A8" block><Followups variant={a8} items={scenario.followups} /></PrimitiveSlot>

      {/* A0 — Ask user question. One card design; the Example axis picks the
          question (edit / choice / sources). Docks above the composer. */}
      {a0 !== 'hidden' && (
        <div className="sticky bottom-0 -mx-6 -mb-8 px-6 pt-3 pb-0 bg-gradient-to-t from-white via-white to-white/0 z-10">
          <PrimitiveSlot code="A0" block>
            {a0Example === 'edit'    && <AskEdit />}
            {a0Example === 'choice'  && <AskChoice />}
            {a0Example === 'sources' && <AskSources silos={a0Content} />}
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

      {children}

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
      <div className="space-y-1 max-h-[34vh] overflow-y-auto scrollbar-thin">
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
function AskSources({ silos }: { silos: string[] }) {
  const { sel, toggle } = useDocSelection(silos);
  const total = silos.reduce((n, s) => n + (SILO_HITS[s as SiloId]?.length ?? 0), 0);
  const kept = Object.values(sel).filter(Boolean).length;

  return (
    <AskCard
      page="1 sur 1"
      question="Valider les sources avant de lancer ?"
      footerLeft={<span className="t-small-regular text-zinc-500">{kept} / {total} sources retenues</span>}
      primary="Lancer"
    >
      <div className="space-y-2.5 max-h-[34vh] overflow-y-auto scrollbar-thin">
        {silos.map((s) => {
          const meta = SILO_META[s as SiloId];
          const hits = SILO_HITS[s as SiloId] ?? [];
          if (!meta || hits.length === 0) return null;
          return (
            <div key={s}>
              <div className="flex items-center gap-1.5 px-2.5 mb-0.5">
                <span className="t-small-semibold text-zinc-700">{meta.label}</span>
                <span className="t-small-regular text-zinc-400">· {hits.length}</span>
              </div>
              <div className="space-y-0.5">
                {hits.map((h, i) => {
                  const key = `${s as SiloId}:${i}` as DocKey;
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
              <div key={j} className="flex items-center gap-2 px-3 py-1.5">
                <HitIcon kind={h.kind} className="size-3.5 text-zinc-400 shrink-0" />
                <span className="flex-1 t-base-regular text-zinc-800 truncate">{h.label}</span>
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
   A4 — Tools
   ---------------------------------------------------------------------- */
const TOOL_META: Record<string, { label: string; icon: string; preview: string[] }> = {
  draft:              { label: 'Draft',           icon: 'pen',       preview: ['Termination clause', 'Article 12 — Liability', 'Contractual preamble'] },
  extract:            { label: 'Extract',         icon: 'list',      preview: ['Best-efforts obligation · Art. 4', 'Notice period · Art. 9', 'Penalty clause · Art. 14'] },
  counsel:            { label: 'Counsel',         icon: 'scales',    preview: ['Litigation strategy', 'Risk: two-year limitation expired', 'Recommendation: settlement'] },
  documents:          { label: 'Documents',       icon: 'file-text', preview: ['Closing_brief_Moreau.pdf', 'Architect_contract_v3.docx', 'Minutes_AGM_2024.pdf'] },
  document:           { label: 'Document creation', icon: 'file-text', preview: [] },
  tableau:            { label: 'Table',           icon: 'list',      preview: ['Column A: Reference', 'Column B: Date', 'Column C: Amount'] },
  clausier:           { label: 'Clause library',  icon: 'list',      preview: ['Termination clause — Template A', 'Non-compete clause — 2024 template', 'Penalty clause — Commercial lease'] },
  'counter-argument': { label: 'Counter-Argument', icon: 'scales',   preview: ['Opposing argument #1 — Limitation period', 'Possible rebuttal — Art. 2224 Civil Code', 'Favorable precedent — Cass. 2nd Civ., 12 Nov. 2024'] },
};

// Tools whose CTA hands off to the Éditeur (doc surface).
const EDITOR_TOOLS = new Set(['draft', 'document', 'documents']);

// Word file tile — the blue "W" badge from the design.
// Microsoft Word file icon (blue document + white "W").
function WordGlyph({ className = 'size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={'shrink-0 ' + className}>
      <path d="M14 2H6.5A1.5 1.5 0 0 0 5 3.5v17A1.5 1.5 0 0 0 6.5 22h11a1.5 1.5 0 0 0 1.5-1.5V7z" fill="#2B579A" />
      <path d="M14 2v3.5A1.5 1.5 0 0 0 15.5 7H19z" fill="#41A5EE" />
      <path d="M7.6 11 L9 17 L10.6 12.2 L12.2 17 L13.6 11" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// A document row: Word file + download + (inert) "Éditer". Actions show on the
// active row and on hover. Éditer is deactivated — opening the Éditeur is a
// dead-end in the prototype (no easy way back to the answer).
function DocRow({ title, active }: { title: string; active?: boolean }) {
  return (
    <li className={'group flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-zinc-50 ' + (active ? 'bg-zinc-50' : '')}>
      <div className="flex items-center gap-2.5 min-w-0">
        <WordGlyph />
        <span className="t-base-regular text-zinc-800 truncate">{title}</span>
      </div>
      <div className={'flex items-center gap-1.5 shrink-0 transition-opacity ' + (active ? '' : 'opacity-0 group-hover:opacity-100')}>
        <button title="Télécharger" className="size-7 grid place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
          <Icon name="upload" className="size-3.5" />
        </button>
        <button className="px-2.5 py-1 t-base-medium text-white rounded-md bg-blue-600 hover:bg-blue-700 inline-flex items-center gap-1">
          <Icon name="pen" className="size-3" /> Éditer
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
  { doc: 'Bail_Boutique_Rivoli.pdf',    type: 'Bail commercial',    date: '1 janv. 2020',  duree: '9 ans', loyer: '4 200 €/mois', index: 'ILC' },
  { doc: 'Bail_Bureaux_Haussmann.pdf',  type: 'Bail professionnel', date: '15 mars 2021',  duree: '6 ans', loyer: '6 800 €/mois', index: 'ILAT' },
  { doc: 'Bail_Entrepot_Rungis.pdf',    type: 'Bail commercial',    date: '1 juil. 2019',  duree: '9 ans', loyer: '2 100 €/mois', index: 'ICC' },
  { doc: 'Bail_Restaurant_Marais.pdf',  type: 'Bail commercial',    date: '10 sept. 2022', duree: '9 ans', loyer: '5 500 €/mois', index: 'ILC' },
  { doc: 'Bail_Pharmacie_Nation.pdf',   type: 'Bail dérogatoire',   date: '1 fév. 2024',   duree: '3 ans', loyer: '3 900 €/mois', index: 'Non prévue' },
];
const EXTRACT_COLS = ['Document', 'Type', 'Date', 'Durée', 'Loyer', 'Indexation'];

function ExtractTable() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="rounded-md border border-zinc-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-zinc-100">
        <span className="t-base-semibold text-zinc-900 truncate">Audit baux commerciaux</span>
        {loading ? (
          <span className="size-4 rounded-full border-2 border-zinc-200 border-t-blue-600 animate-spin shrink-0" />
        ) : (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-1.5 py-0.5 rounded t-small-medium bg-emerald-50 text-emerald-700">7 Haute</span>
            <span className="px-1.5 py-0.5 rounded t-small-medium bg-amber-50 text-amber-700">3 Moyenne</span>
            <span className="px-1.5 py-0.5 rounded t-small-medium bg-red-50 text-red-700">2 À vérifier</span>
          </div>
        )}
      </div>
      {loading ? (
        <div className="p-4 space-y-2.5">
          {[0, 1, 2, 3, 4].map((i) => <span key={i} className="block h-4 rounded shimmer" />)}
        </div>
      ) : (
      <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-100">
              {EXTRACT_COLS.map((c) => (
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
      <button className="w-full py-2.5 t-base-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 border-t border-zinc-100">
        Voir les 12 documents
      </button>
      </>
      )}
    </div>
  );
}

// Default documents shown in the multi-doc Tools preview (realistic filenames).
const MULTI_DOC_TITLES = [
  'CDI-Raphael-Moreau.docx',
  'CDI-Irene-Dalmer.docx',
  'CDI-Camille-Laurent.docx',
  'CDI-Lea-Bernard.docx',
  'CDI-Nathan-Lefebvre.docx',
  'CDI-Arthur-Chevalier.docx',
];

// Default document shown in the single-doc Tools preview (a realistic legal
// doc, not the conversational answer text).
const BAIL_DOC_TITLE = 'Bail commercial.docx';
const BAIL_PREVIEW: AnswerBlock[] = [
  { kind: 'h', text: 'BAIL COMMERCIAL' },
  { kind: 'h', text: 'DESIGNATION DES PARTIES' },
  { kind: 'p', html: 'Le présent contrat est conclu entre les soussignés :' },
  { kind: 'p', html: "D'une part," },
  { kind: 'p', html: '<strong>1. Le(s) Bailleur(s)</strong>' },
  { kind: 'p', html: '<mark style="background:#dcfce7;color:inherit;padding:1px 2px;border-radius:2px;">FONCIERE FRANCILIENNE LOCAUX ENTREPRISES (FFLE), société civile au capital de 1000 EUR, dont le siège social est situé au 2 RUE DE BERNE 75008 PARIS, immatriculée sous le numéro 444 171 755, représentée par son gérant M. STEPHANE GROS.</mark>' },
  { kind: 'p', html: 'Désigné(s) ci-après, le <strong>« Bailleur »</strong> ;' },
  { kind: 'p', html: "Et, d'autre part," },
  { kind: 'p', html: '<strong>2. Le Preneur</strong>' },
  { kind: 'p', html: '_______________, de nationalité _________, né(e) le ___________, demeurant _______________ ;' },
  { kind: 'p', html: 'désigné(s) ci-après le <strong>« Preneur »</strong>.' },
  { kind: 'p', html: 'Le Bailleur et le Preneur étant ci-après désignés, ensemble, les <strong>« Parties »</strong>.' },
  { kind: 'h', text: 'IL EST PREALABLEMENT EXPOSE CE QUI SUIT :' },
  { kind: 'p', html: 'Par les présentes, le Bailleur donne à bail commercial, conformément aux dispositions des articles L.145-1 à L.145-60, R.145-1 à R.145-11, R. 145-20 à R.145-33 et D.145-12 à D.145-19 du Code de Commerce, à celles non abrogées du décret du 30 septembre 1953 modifié et des textes subséquents, au Preneur qui accepte, les locaux ci-après désignés.' },
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
      <div className="rounded-md border border-zinc-200 bg-white px-4 py-3 flex items-center gap-2.5">
        <WordGlyph />
        <span className="flex-1 min-w-0 t-base-semibold text-zinc-900 truncate">{title}</span>
        <span className="size-5 rounded-full border-2 border-zinc-200 border-t-blue-600 animate-spin shrink-0" />
      </div>
    );
  }

  return (
    <div className="rounded-md border border-zinc-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-zinc-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <WordGlyph />
          <span className="t-base-semibold text-zinc-900 truncate">{title}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button title="Télécharger" className="size-7 grid place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
            <Icon name="upload" className="size-3.5" />
          </button>
          <button className="px-2.5 py-1 t-base-medium text-white rounded-md bg-blue-600 hover:bg-blue-700 inline-flex items-center gap-1">
            <Icon name="pen" className="size-3" /> Éditer
          </button>
        </div>
      </div>
      {previewBlocks.length > 0 && (
        <>
          <MiniDocPreview blocks={previewBlocks} />
          <button className="w-full py-2.5 t-base-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 border-t border-zinc-100">
            Lire la suite
          </button>
        </>
      )}
    </div>
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
    <div className="rounded-md border border-zinc-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100">
        <span className="t-base-semibold text-zinc-900">Création de documents Word</span>
        {loading ? (
          <span className="size-4 rounded-full border-2 border-zinc-200 border-t-blue-600 animate-spin shrink-0" />
        ) : (
          <button title="Tout télécharger" className="size-6 grid place-items-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
            <Icon name="upload" className="size-3.5" />
          </button>
        )}
      </div>
      {loading ? (
        <div className="divide-y divide-zinc-100">
          {docs.map((t) => (
            <div key={t} className="flex items-center justify-between gap-2 px-4 py-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <WordGlyph />
                <span className="t-base-regular text-zinc-800 truncate">{t}</span>
              </div>
              <span className="size-4 rounded-full border-2 border-zinc-200 border-t-blue-600 animate-spin shrink-0" />
            </div>
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {docs.map((title, i) => (
            <DocRow key={title} title={title} active={i === 0} />
          ))}
        </ul>
      )}
    </div>
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
        if (content === 'extract') return <ExtractTable key={content} />;
        // ── Document creation (Figma §1/§5/§6) — one card, three states ──
        if (content === 'document') {
          const docs = docTitles.length ? docTitles : ['Document'];
          const multiple = docs.length > 1;

          // In the Éditeur, single doc → a quiet status card ("Version actuelle").
          if (surface === 'doc' && !multiple) {
            return (
              <div key={content} className="rounded-md border border-zinc-200 bg-white px-3 py-2.5 flex items-center gap-2.5">
                <span className="size-7 grid place-items-center rounded-md bg-zinc-100 text-zinc-600 shrink-0">
                  <Icon name="file-text" className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <div className="t-base-medium text-zinc-900 truncate">Création de document</div>
                  <div className="t-small-regular text-zinc-500">Version actuelle</div>
                </div>
              </div>
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
        return (
          <div key={content} className="rounded-md border border-zinc-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-zinc-100">
              <div className="flex items-center gap-2 min-w-0">
                <Icon name={meta.icon} className="size-3.5 text-zinc-500 shrink-0" />
                <span className="t-base-semibold text-zinc-900 truncate">{title}</span>
              </div>
              <button
                onClick={() => { if (isEditor) toDoc(); }}
                className="shrink-0 px-2.5 py-1 t-base-medium text-white rounded-md bg-zinc-900 hover:bg-zinc-800 inline-flex items-center gap-1"
              >
                {isEditor ? 'Ouvrir dans l’Éditeur' : `Continuer dans ${meta.label}`}
                <Icon name="arrow-right" className="size-3" />
              </button>
            </div>
            {showBody && meta.preview.length > 0 && (
              <ul className="divide-y divide-zinc-100">
                {meta.preview.map((line) => (
                  <li key={line} className="px-4 py-2 t-small-regular text-zinc-600 truncate">{line}</li>
                ))}
              </ul>
            )}
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

