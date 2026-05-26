import { useState } from 'react';
import { useChatbot } from '../chatbot/store';
import { SCENARIOS } from '../chatbot/scenarios';
import type { AnswerBlock, Citation } from '../chatbot/types';
import { Icon } from './ui';
import { PrimitiveSlot } from './PrimitiveSlot';

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
  const a0 = v('A0'), a1 = v('A1'), a2 = v('A2'), a3 = v('A3'), a4 = v('A4'), a7 = v('A7'), a8 = v('A8');
  const a0Content = Array.isArray(prim.A0.content) ? prim.A0.content : ['sharepoint', 'onedrive', 'gdrive', 'doctrine-kb'];
  const a4Content = Array.isArray(prim.A4.content) ? prim.A4.content : ['draft'];

  // All citations always available — primitive variants are pure visual choices.
  // Designers can preview any A3/A5 variant without scenario params blocking it.
  const visibleCitations = scenario.citations;

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-8 space-y-5">
      {/* User message */}
      <div className="flex justify-end">
        <div className="max-w-[80%] flex flex-col items-end gap-2">
          {scenario.attached && (
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-300 bg-zinc-50 t-small-regular text-zinc-700">
              <Icon name="file-text" className="size-3.5 text-zinc-500" />
              <span className="t-small-medium">{scenario.attached.name}</span>
              <span className="text-zinc-400">· {scenario.attached.meta}</span>
            </span>
          )}
          <div className="px-4 py-2.5 rounded-2xl rounded-br-md bg-zinc-100 t-large-regular text-zinc-900">
            {scenario.prompt}
          </div>
        </div>
      </div>

      {/* A0 — Ask user question (sources pre-check) — top placement except for sticky variant */}
      {a0 !== 'sticky-composer' && (
        <PrimitiveSlot code="A0" block>
          <AskUserQuestion variant={a0} silos={a0Content} />
        </PrimitiveSlot>
      )}

      {/* A1 — Reasoning */}
      <PrimitiveSlot code="A1" block>
        <PlanPreamble variant={a1} />
      </PrimitiveSlot>

      {/* Body — renders blocks; A2 wraps quote blocks, A3 wraps inline citations */}
      <AssistantBody
        citationVariant={a3}
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

      {/* A0 — sticky variant pins to bottom of conversation scroll, above composer */}
      {a0 === 'sticky-composer' && (
        <div className="sticky bottom-0 -mx-6 -mb-8 px-6 pt-3 pb-0 bg-gradient-to-t from-white via-white to-white/0 z-10">
          <PrimitiveSlot code="A0" block>
            <AskStickyComposer silos={a0Content} />
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

function renderInlineCitations(
  html: string,
  citations: Record<string, Citation>,
  variant: string,
): string {
  let n = 0;
  return html.replace(/\[\[(\w+)\]\]/g, (_, key) => {
    const c = citations[key];
    if (!c) return '';
    n++;
    const label = escapeHtml(c.label);
    const title = escapeAttr(c.full);

    if (variant === 'numbered') {
      const cls = c.kind === 'internal' ? 'cite-pill cite-pill--internal cite-slot' : 'cite-pill cite-slot';
      return ` <a class="${cls}" data-primitive="A3" style="min-width:22px;padding:1px 6px;justify-content:center;font-weight:600;" title="${title}">${n}</a> `;
    }
    if (variant === 'bracketed') {
      const color = c.kind === 'internal' ? 'color:#18181b;font-weight:600;' : 'color:#52525b;';
      return ` <span class="t-mono cite-slot" data-primitive="A3" style="font-size:11.5px;${color}" title="${title}">[${label}]</span> `;
    }
    if (variant === 'superscript') {
      const color = c.kind === 'internal' ? 'color:#09090b;' : 'color:#52525b;';
      return `<sup class="t-mono cite-slot" data-primitive="A3" style="font-size:10px;font-weight:600;${color};margin:0 1px;" title="${title}">${n}</sup>`;
    }
    // pill (default)
    const cls = c.kind === 'internal' ? 'cite-pill cite-pill--internal cite-slot' : 'cite-pill cite-slot';
    return ` <a class="${cls}" data-primitive="A3" title="${title}">${label}</a> `;
  });
}

/* ----------------------------------------------------------------------
   A0 — Ask user question (scope pre-check)
   ---------------------------------------------------------------------- */

type SiloId = 'sharepoint' | 'onedrive' | 'gdrive' | 'dropbox' | 'doctrine-kb';

const SILO_META: Record<SiloId, { label: string; icon: string }> = {
  sharepoint:    { label: 'SharePoint',           icon: 'folder' },
  onedrive:      { label: 'OneDrive',             icon: 'folder' },
  gdrive:        { label: 'Google Drive',         icon: 'folder' },
  dropbox:       { label: 'Dropbox',              icon: 'folder' },
  'doctrine-kb': { label: 'Doctrine Knowledge Base', icon: 'scales' },
};

const SILO_HITS: Record<SiloId, { name: string; meta: string }[]> = {
  sharepoint: [
    { name: 'Procédure RH — Prévention harcèlement v3.docx', meta: 'Espace RH · maj. 12 mars' },
    { name: 'Charte managériale interne 2023.pdf',           meta: 'Espace RH · 2023' },
    { name: 'Compte-rendu CSE 2024-Q1.docx',                 meta: 'Espace CSE · févr. 2024' },
  ],
  onedrive: [
    { name: 'Notes_entretiens_Moreau.docx',                  meta: 'Mon OneDrive · 8 avr.' },
    { name: 'Mémo encadrement managérial 2024.pdf',          meta: 'Mon OneDrive · 14 mai' },
  ],
  gdrive: [
    { name: 'Grille évaluation pratiques à risque.xlsx',     meta: 'Drive partagé RH · 2024' },
    { name: 'Synthèse jurisprudence harcèlement.gdoc',       meta: 'Drive partagé Litiges' },
    { name: 'Reporting incidents 2024.gsheet',               meta: 'Drive partagé RH' },
  ],
  dropbox: [
    { name: 'Audit_climat_social_2024.pdf',                  meta: 'Cabinet / Audits' },
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

function AskUserQuestion({ variant, silos }: { variant: string; silos: string[] }) {
  if (variant === 'hidden' || silos.length === 0) return null;

  if (variant === 'silo-tabs') return <AskTabs silos={silos} />;
  if (variant === 'compact-chips') return <AskChips silos={silos} />;
  return <AskGroupedList silos={silos} />;
}

function AskStickyComposer({ silos }: { silos: string[] }) {
  const { sel, toggle } = useDocSelection(silos);
  const total = silos.reduce((n, s) => n + (SILO_HITS[s as SiloId]?.length ?? 0), 0);
  const kept  = Object.values(sel).filter(Boolean).length;

  return (
    <div className="rounded-md border border-zinc-300 bg-white shadow-md overflow-hidden text-[12px]">
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-zinc-200 bg-zinc-50">
        <Icon name="sparkles" className="size-3 text-zinc-500 shrink-0" />
        <p className="flex-1 t-small-medium text-zinc-900 truncate">
          Valider les sources
          <span className="ml-1 t-small-regular text-zinc-500">· {kept}/{total}</span>
        </p>
        <button className="t-small-regular text-zinc-500 hover:text-zinc-900">Tout décocher</button>
      </div>

      <div className="max-h-[28vh] overflow-y-auto scrollbar-thin px-2.5 py-2 space-y-2">
        {silos.map((s) => {
          const meta = SILO_META[s as SiloId];
          const hits = SILO_HITS[s as SiloId] ?? [];
          if (!meta || hits.length === 0) return null;
          return (
            <div key={s}>
              <div className="flex items-center gap-1 mb-1 sticky top-0 bg-white py-0.5 -mt-0.5">
                <Icon name={meta.icon} className="size-3 text-zinc-500" />
                <span className="t-small-semibold text-zinc-900">{meta.label}</span>
                <span className="t-small-regular text-zinc-400">· {hits.length}</span>
              </div>
              <ul className="divide-y divide-zinc-100 rounded border border-zinc-200 bg-zinc-50/40">
                {hits.map((h, i) => {
                  const key = `${s as SiloId}:${i}` as DocKey;
                  const on = sel[key];
                  return (
                    <li key={key}>
                      <label className="flex items-center gap-1.5 px-2 py-1 hover:bg-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggle(key)}
                          className="size-3 rounded border-zinc-300 accent-zinc-900"
                        />
                        <Icon name="file-text" className="size-3 text-zinc-400 shrink-0" />
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
        <button className="px-2 py-0.5 t-small-regular text-zinc-700 rounded border border-zinc-200 bg-white hover:border-zinc-400">
          Annuler
        </button>
        <button className="px-2 py-0.5 t-small-medium text-white rounded bg-zinc-900 hover:bg-zinc-800">
          Lancer
        </button>
      </div>
    </div>
  );
}

function AskHeader({ count }: { count: number }) {
  return (
    <div className="flex items-start gap-2">
      <Icon name="sparkles" className="size-3.5 text-zinc-500 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="t-small-medium text-zinc-900">
          J'ai trouvé <span className="font-semibold">{count} documents</span> potentiellement pertinents. Validez ceux à utiliser avant le raisonnement.
        </p>
      </div>
    </div>
  );
}

function AskGroupedList({ silos }: { silos: string[] }) {
  const { sel, toggle } = useDocSelection(silos);
  const total = silos.reduce((n, s) => n + (SILO_HITS[s as SiloId]?.length ?? 0), 0);

  return (
    <div className="rounded-md border border-zinc-200 bg-white px-4 py-3 space-y-3">
      <AskHeader count={total} />
      <div className="space-y-3">
        {silos.map((s) => {
          const meta = SILO_META[s as SiloId];
          const hits = SILO_HITS[s as SiloId] ?? [];
          if (!meta || hits.length === 0) return null;
          return (
            <div key={s}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon name={meta.icon} className="size-3.5 text-zinc-500" />
                <span className="t-small-semibold text-zinc-900">{meta.label}</span>
                <span className="t-small-regular text-zinc-400">· {hits.length} résultats</span>
              </div>
              <ul className="divide-y divide-zinc-100 rounded-md border border-zinc-200 bg-zinc-50/40">
                {hits.map((h, i) => {
                  const key = `${s as SiloId}:${i}` as DocKey;
                  const on = sel[key];
                  return (
                    <li key={key}>
                      <label className="flex items-center gap-2.5 px-3 py-2 hover:bg-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggle(key)}
                          className="size-3.5 rounded border-zinc-300 accent-zinc-900"
                        />
                        <Icon name="file-text" className="size-3.5 text-zinc-400 shrink-0" />
                        <span className={'flex-1 t-small-regular truncate ' + (on ? 'text-zinc-800' : 'text-zinc-400 line-through')}>{h.name}</span>
                        <span className="t-small-regular text-zinc-400 shrink-0">{h.meta}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-1.5 pt-1">
        <button className="px-2.5 py-1 t-small-medium text-white rounded-md bg-zinc-900 hover:bg-zinc-800">
          Lancer le raisonnement
        </button>
        <button className="px-2.5 py-1 t-small-medium text-zinc-700 rounded-md border border-zinc-200 bg-white hover:border-zinc-400">
          Tout désélectionner
        </button>
      </div>
    </div>
  );
}

function AskTabs({ silos }: { silos: string[] }) {
  const { sel, toggle } = useDocSelection(silos);
  const [active, setActive] = useState<string>(silos[0]);
  const current = (silos.includes(active) ? active : silos[0]) as SiloId;
  const hits = SILO_HITS[current] ?? [];
  const total = silos.reduce((n, s) => n + (SILO_HITS[s as SiloId]?.length ?? 0), 0);

  return (
    <div className="rounded-md border border-zinc-200 bg-white px-4 py-3 space-y-3">
      <AskHeader count={total} />
      <div className="flex flex-wrap gap-1.5 border-b border-zinc-200 -mx-1 px-1">
        {silos.map((s) => {
          const meta = SILO_META[s as SiloId];
          const n = SILO_HITS[s as SiloId]?.length ?? 0;
          const isActive = s === current;
          return (
            <button
              key={s}
              onClick={() => setActive(s)}
              className={
                'px-2.5 py-1.5 -mb-px border-b-2 t-small-medium inline-flex items-center gap-1.5 ' +
                (isActive
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800')
              }
            >
              <Icon name={meta?.icon ?? 'folder'} className="size-3.5" />
              {meta?.label}
              <span className="t-small-regular text-zinc-400">({n})</span>
            </button>
          );
        })}
      </div>
      <ul className="divide-y divide-zinc-100 rounded-md border border-zinc-200 bg-zinc-50/40">
        {hits.map((h, i) => {
          const key = `${current}:${i}` as DocKey;
          const on = sel[key];
          return (
            <li key={key}>
              <label className="flex items-center gap-2.5 px-3 py-2 hover:bg-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(key)}
                  className="size-3.5 rounded border-zinc-300 accent-zinc-900"
                />
                <Icon name="file-text" className="size-3.5 text-zinc-400 shrink-0" />
                <span className={'flex-1 t-small-regular truncate ' + (on ? 'text-zinc-800' : 'text-zinc-400 line-through')}>{h.name}</span>
                <span className="t-small-regular text-zinc-400 shrink-0">{h.meta}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center gap-1.5 pt-1">
        <button className="px-2.5 py-1 t-small-medium text-white rounded-md bg-zinc-900 hover:bg-zinc-800">
          Lancer le raisonnement
        </button>
      </div>
    </div>
  );
}

function AskChips({ silos }: { silos: string[] }) {
  const { sel, toggle } = useDocSelection(silos);
  const total = silos.reduce((n, s) => n + (SILO_HITS[s as SiloId]?.length ?? 0), 0);

  return (
    <div className="rounded-md border border-zinc-200 bg-white px-4 py-3 space-y-2.5">
      <AskHeader count={total} />
      <div className="space-y-2">
        {silos.map((s) => {
          const meta = SILO_META[s as SiloId];
          const hits = SILO_HITS[s as SiloId] ?? [];
          if (!meta || hits.length === 0) return null;
          return (
            <div key={s} className="flex items-start gap-2">
              <div className="shrink-0 w-32 pt-1 inline-flex items-center gap-1.5">
                <Icon name={meta.icon} className="size-3.5 text-zinc-500" />
                <span className="t-small-semibold text-zinc-900">{meta.label}</span>
              </div>
              <div className="flex-1 flex flex-wrap gap-1">
                {hits.map((h, i) => {
                  const key = `${s as SiloId}:${i}` as DocKey;
                  const on = sel[key];
                  return (
                    <button
                      key={key}
                      onClick={() => toggle(key)}
                      title={`${h.name} — ${h.meta}`}
                      className={
                        'inline-flex items-center gap-1 px-2 py-1 rounded-full border t-small-regular max-w-[260px] ' +
                        (on
                          ? 'border-zinc-300 bg-white text-zinc-800 hover:border-zinc-500'
                          : 'border-dashed border-zinc-300 bg-zinc-50 text-zinc-400 line-through')
                      }
                    >
                      <Icon name="file-text" className="size-3 shrink-0" />
                      <span className="truncate">{h.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-1.5 pt-1">
        <button className="px-2.5 py-1 t-small-medium text-white rounded-md bg-zinc-900 hover:bg-zinc-800">
          Lancer le raisonnement
        </button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------
   A1 — Reasoning trace
   ---------------------------------------------------------------------- */

type HitKind = 'search' | 'law' | 'decision' | 'comment' | 'fiscal';
type TraceStep = {
  text: string;
  count: string;
  hits: { kind: HitKind; label: string; corpus: string }[];
};

function HitIcon({ kind, className }: { kind: HitKind; className?: string }) {
  if (kind === 'comment') {
    // € for BOI / fiscal commentaires
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 7a5 5 0 0 0-4-2c-3 0-5 3-5 7s2 7 5 7a5 5 0 0 0 4-2" />
        <line x1="6" y1="10" x2="14" y2="10" />
        <line x1="6" y1="14" x2="13" y2="14" />
      </svg>
    );
  }
  if (kind === 'fiscal') {
    // open book
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2z" />
        <path d="M22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z" />
      </svg>
    );
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

const AGENTIC_STEPS: TraceStep[] = [
  {
    text: "Je cherche d'abord la jurisprudence constante sur les éléments constitutifs du harcèlement moral.",
    count: '42 résultats',
    hits: [
      { kind: 'search',   label: '"harcèlement moral" éléments constitutifs répétition',       corpus: 'Décisions' },
      { kind: 'search',   label: '"agissements répétés" dégradation conditions de travail',    corpus: 'Décisions' },
      { kind: 'law',      label: "Article L1152-1 du Code du travail",                          corpus: 'Lois et règlements' },
      { kind: 'decision', label: "Cass. soc., 10 nov. 2009, n° 07-45.321",                      corpus: 'Décisions' },
      { kind: 'decision', label: "Cass. soc., 1er juin 2022, n° 21-12.488",                     corpus: 'Décisions' },
    ],
  },
  {
    text: "Je regarde maintenant comment les juges qualifient les pratiques managériales (réunions de suivi, points hebdomadaires, micro-management).",
    count: '27 résultats',
    hits: [
      { kind: 'search',   label: '"points hebdomadaires" harcèlement managérial',               corpus: 'Décisions' },
      { kind: 'search',   label: '"micro-management" reproches systématiques réunion',          corpus: 'Décisions' },
      { kind: 'decision', label: "Cass. soc., 15 mars 2023, n° 21-22.124",                      corpus: 'Décisions' },
      { kind: 'decision', label: "CA Paris, 8 févr. 2024, n° 22/04891",                         corpus: 'Décisions' },
      { kind: 'decision', label: "Cass. soc., 27 sept. 2023, n° 22-18.142",                     corpus: 'Décisions' },
      { kind: 'decision', label: "Cass. soc., 13 sept. 2017, n° 16-12.078",                     corpus: 'Décisions' },
    ],
  },
  {
    text: "Je complète avec votre Knowledge Base — mémos et notes RH sur l'encadrement managérial du cabinet.",
    count: '8 résultats',
    hits: [
      { kind: 'fiscal',  label: "Mémo interne « Encadrement managérial — suivi vs. contrôle » (2024)", corpus: 'Knowledge Base' },
      { kind: 'fiscal',  label: "Note RH 2024-03 — grille d'évaluation des pratiques à risque",        corpus: 'Knowledge Base' },
      { kind: 'comment', label: "Charte managériale interne (rév. 2023)",                              corpus: 'Knowledge Base' },
      { kind: 'fiscal',  label: "Procédure RH > Prévention harcèlement > Indicateurs",                 corpus: 'Knowledge Base' },
    ],
  },
];

function AgenticTrace({ defaultOpenFirst }: { defaultOpenFirst: boolean }) {
  return (
    <div className="border border-zinc-200 rounded-md bg-white">
      {AGENTIC_STEPS.map((step, i) => (
        <AgenticStep
          key={i}
          step={step}
          defaultOpen={defaultOpenFirst && i === 0}
          last={i === AGENTIC_STEPS.length - 1}
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
                <span className="flex-1 t-small-regular text-zinc-800 truncate">{h.label}</span>
                <span className="t-small-regular text-zinc-400 shrink-0">{h.corpus}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlanPreamble({ variant }: { variant: string }) {
  if (variant === 'hidden') return null;
  return <AgenticTrace defaultOpenFirst={false} />;
}

/* ----------------------------------------------------------------------
   Assistant Body (renders blocks; A3 wraps each inline citation)
   ---------------------------------------------------------------------- */
function AssistantBody({
  citationVariant, quoteVariant, blocks, citations,
}: {
  citationVariant: string;
  quoteVariant: string;
  blocks: AnswerBlock[];
  citations: Record<string, Citation>;
}) {
  const highlightMode = useChatbot((s) => s.highlightMode);
  const hovered       = useChatbot((s) => s.hoveredPrimitive);
  const setHovered    = useChatbot((s) => s.setHoveredPrimitive);

  const a3Active = highlightMode && hovered === 'A3';
  const a3Mode   = highlightMode;

  const onMouseOver = (e: React.MouseEvent) => {
    if (!highlightMode) return;
    const el = (e.target as HTMLElement).closest?.('[data-primitive="A3"]');
    if (el) setHovered('A3');
  };
  const onMouseOut = (e: React.MouseEvent) => {
    if (!highlightMode) return;
    const from = (e.target as HTMLElement).closest?.('[data-primitive="A3"]');
    const to   = (e.relatedTarget as HTMLElement | null)?.closest?.('[data-primitive="A3"]');
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
          __html: renderInlineCitations(b.html, citations, citationVariant),
        }}
      />
    );
  });

  return (
    <div
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      data-a3-active={a3Active ? 'true' : undefined}
      data-a3-mode={a3Mode ? 'true' : undefined}
      className={
        'relative space-y-3 t-legal-large text-zinc-900 ' +
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
  draft:     { label: 'Draft',     icon: 'pen',       preview: ['Clause de résiliation', 'Article 12 — Responsabilité', 'Préambule contractuel'] },
  extract:   { label: 'Extract',   icon: 'list',      preview: ['Obligation de moyen · Art. 4', 'Délai de préavis · Art. 9', 'Clause pénale · Art. 14'] },
  counsel:   { label: 'Counsel',   icon: 'scales',    preview: ['Stratégie contentieuse', 'Risque : délai biennal expiré', 'Recommandation : transaction'] },
  documents: { label: 'Documents', icon: 'file-text', preview: ['Conclusions_def_Moreau.pdf', 'Contrat_architecte_v3.docx', 'PV_AG_2024.pdf'] },
  tableau:   { label: 'Tableau',   icon: 'list',      preview: ['Colonne A : Référence', 'Colonne B : Date', 'Colonne C : Montant'] },
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
                  <span className="t-small-semibold text-zinc-900">{content === 'draft' && artifactTitle ? artifactTitle : meta.label}</span>
                </div>
                <button className="px-2.5 py-1 t-small-medium text-white rounded-md bg-zinc-900 hover:bg-zinc-800 inline-flex items-center gap-1">
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
              <span className="t-small-medium text-zinc-900">Continuer dans {meta.label}</span>
            </div>
            <button className="px-2.5 py-1 t-small-medium text-white rounded-md bg-zinc-900 hover:bg-zinc-800 inline-flex items-center gap-1">
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

  const labelBtn = 'inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-zinc-200 bg-white t-small-medium text-zinc-700 hover:border-zinc-400 hover:text-zinc-900 transition-colors';
  const iconBtn  = 'inline-flex items-center justify-center size-8 rounded-md border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 transition-colors';

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
    <ul className="mt-1 divide-y divide-zinc-100">
      {items.map((f) => (
        <li key={f}>
          <button className="w-full text-left py-2 t-base-regular text-zinc-700 hover:text-zinc-900 transition-colors">
            {f}
          </button>
        </li>
      ))}
    </ul>
  );
}
