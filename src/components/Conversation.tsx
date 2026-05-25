import { useState } from 'react';
import { useChatbot } from '../chatbot/store';
import { SCENARIOS, MATTER_LEROY } from '../chatbot/scenarios';
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
  const p = comp.params;

  // Each primitive is either visible (its chosen variant) or hidden.
  const v = (code: keyof typeof prim) => (prim[code].visible ? prim[code].variant : 'hidden');
  const a1 = v('A1'), a2 = v('A2'), a3 = v('A3'), a4 = v('A4'),
        a5 = v('A5'), a6 = v('A6'), a8 = v('A8');
  const a1Content = prim.A1.content ?? 'agentic';
  const a4Content = prim.A4.content ?? 'draft';
  const a6Content = prim.A6.content ?? 'initial';

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

      {/* Auto-detect intent chip */}
      {p.mode === 'auto' && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-md border border-zinc-200 bg-zinc-100 t-small-medium text-zinc-700">
            <Icon name={scenario.intent.icon} className="size-3 text-zinc-500" />
            {scenario.intent.label}
            <button className="ml-1 px-1.5 py-0.5 t-small-regular text-zinc-500 hover:text-zinc-900">changer</button>
          </span>
          <span className="t-small-regular text-zinc-400">détecté automatiquement</span>
        </div>
      )}

      {/* A1 — Reasoning */}
      <PrimitiveSlot code="A1" block>
        <PlanPreamble variant={a1} content={a1Content} html={scenario.preamble} />
      </PrimitiveSlot>

      {/* Body — renders blocks; A2 wraps quote blocks, A3 wraps inline citations */}
      <AssistantBody
        citationVariant={a3}
        quoteVariant={a2}
        blocks={scenario.answer}
        citations={visibleCitations}
      />

      {/* A5 — Citations Panel */}
      <PrimitiveSlot code="A5" block><CitationsPanel variant={a5} citations={visibleCitations} /></PrimitiveSlot>

      {/* A4 — Tool CTA */}
      <PrimitiveSlot code="A4" block>
        <ToolCTA variant={a4} content={a4Content} artifactTitle={scenario.artifact?.title} />
      </PrimitiveSlot>

      {/* A6 — Attach to Matter */}
      <PrimitiveSlot code="A6" block><AttachToMatter variant={a6} content={a6Content} /></PrimitiveSlot>

      {/* A8 — Suggested follow-ups */}
      <PrimitiveSlot code="A8" block><Followups variant={a8} items={scenario.followups} /></PrimitiveSlot>
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
    text: "Je cherche d'abord la jurisprudence constante sur la rupture brutale des relations commerciales.",
    count: '38 résultats',
    hits: [
      { kind: 'search',   label: 'rupture brutale relations commerciales établies',         corpus: 'Décisions' },
      { kind: 'search',   label: '"préavis raisonnable" "ancienneté" relations commerciales', corpus: 'Décisions' },
      { kind: 'law',      label: "Article L442-1 du Code de commerce",                       corpus: 'Lois et règlements' },
    ],
  },
  {
    text: "Je recherche maintenant le détail de l'article 31 du CGI qui liste précisément les charges déductibles des revenus fonciers.",
    count: '24 résultats',
    hits: [
      { kind: 'decision', label: "Conseil d'État, 10ème / 9ème SSR, 28 mars 2014, 350810",                                   corpus: 'Décisions' },
      { kind: 'decision', label: "Conseil d'État, 8ème - 3ème chambres réunies, 24 février 2017, 395983",                    corpus: 'Décisions' },
      { kind: 'decision', label: "Conseil d'Etat, 8 / 7 SSR, du 16 novembre 1979, 12976, mentionné aux tables du recueil Lebon", corpus: 'Décisions' },
      { kind: 'decision', label: "Conseil d'Etat, 9 / 8 SSR, du 18 mars 1987, 43680, mentionné aux tables du recueil Lebon", corpus: 'Décisions' },
      { kind: 'decision', label: "Conseil d'État, 10ème et 9ème sous-sections réunies, 24 juillet 2006, 253350",             corpus: 'Décisions' },
      { kind: 'decision', label: "Conseil d'État, 9ème chambre, 12 juin 2019, 412574",                                       corpus: 'Décisions' },
      { kind: 'decision', label: "Conseil d'État, 3ème - 8ème chambres réunies, 5 octobre 2021, 444036",                     corpus: 'Décisions' },
    ],
  },
  {
    text: 'Je complète la recherche sur les frais de gestion, les provisions pour copropriété et les dépenses supportées pour le locataire.',
    count: '19 résultats',
    hits: [
      { kind: 'comment', label: 'BOI-RFPI-BASE-20-10 § 1',                                       corpus: 'Commentaire' },
      { kind: 'comment', label: 'BOI-RFPI-SPEC-30-20-10 § 30',                                   corpus: 'Commentaire' },
      { kind: 'fiscal',  label: 'Fiscalité des revenus personnels > … > Revenus fonciers',       corpus: 'Le Fiscal' },
      { kind: 'fiscal',  label: 'Fiscalité des revenus personnels > … > Revenus fonciers',       corpus: 'Le Fiscal' },
      { kind: 'fiscal',  label: 'Fiscalité des revenus personnels > … > Revenus fonciers',       corpus: 'Le Fiscal' },
      { kind: 'comment', label: 'BOI-RFPI-BASE-20-30 § 80',                                      corpus: 'Commentaire' },
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

function PlanPreamble({
  variant, content, html,
}: { variant: string; content: string; html: string }) {
  if (variant === 'hidden') return null;

  // Content axis decides what to render. Style decides how.
  if (content === 'agentic') {
    // For agentic: style "collapsed" closes all steps; everything else opens first.
    return <AgenticTrace defaultOpenFirst={variant !== 'collapsed'} />;
  }

  if (variant === 'inline') {
    return (
      <p className="t-small-regular text-zinc-500 italic inline-flex items-baseline gap-1.5">
        <Icon name="sparkles" className="size-3 text-zinc-400" />
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </p>
    );
  }

  if (variant === 'streaming') {
    return (
      <div className="space-y-1 t-small-regular text-zinc-600">
        <div className="flex items-center gap-1.5">
          <Icon name="sparkles" className="size-3 text-zinc-400" />
          <span className="t-small-medium text-zinc-700">Plan</span>
        </div>
        <div className="pl-4 border-l border-zinc-200 space-y-0.5 t-mono">
          <div>→ chercher dans Doctrine</div>
          <div>→ chercher dans la KB</div>
          <div>→ rapprocher et trancher</div>
        </div>
      </div>
    );
  }

  if (variant === 'collapsed') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-100 t-small-medium text-zinc-700">
        <Icon name="sparkles" className="size-3 text-zinc-500" />
        Recherche · 3 sources · groupées
      </div>
    );
  }

  // box (and any other style with preamble content) — gray box default.
  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-md">
      <Icon name="sparkles" className="size-4 text-zinc-500 mt-0.5 shrink-0" />
      <p className="t-base-regular text-zinc-900" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
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
        '[&_h4]:relative [&_h4]:pl-7 [&_h4]:before:absolute [&_h4]:before:left-0 [&_h4]:before:top-0.5 [&_h4]:before:t-mono [&_h4]:before:text-zinc-400 [&_h4]:before:content-["§"]'
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
   A5 — Citations Panel
   ---------------------------------------------------------------------- */
function CitationsPanel({ variant, citations }: { variant: string; citations: Record<string, Citation> }) {
  if (variant === 'hidden') return null;
  const all = Object.values(citations);
  if (all.length === 0) return null;
  const external = all.filter((c) => c.kind === 'external');
  const internal = all.filter((c) => c.kind === 'internal');

  if (variant === 'list') {
    return (
      <div className="mt-4 t-small-regular text-zinc-600 space-y-1">
        <div className="t-micro text-zinc-500 mb-1.5">Sources citées</div>
        {all.map((c) => (
          <div key={c.label} className="flex items-baseline gap-2">
            <span className={'inline-block size-1.5 rounded-full ' + (c.kind === 'internal' ? 'bg-zinc-900' : 'bg-zinc-300 border border-zinc-400')} />
            <span>{c.full}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
        {all.map((c) => (
          <div key={c.label} className="border border-zinc-200 rounded-md p-3 bg-white">
            <div className="t-micro text-zinc-500 mb-1">
              {c.kind === 'internal' ? 'Interne' : 'Doctrine'}
            </div>
            <div className="t-small-medium text-zinc-900">{c.label}</div>
            <div className="t-small-regular text-zinc-500 mt-1">{c.full}</div>
          </div>
        ))}
      </div>
    );
  }

  // accordion (default)
  return (
    <div className="space-y-2 mt-4">
      {external.length > 0 && (
        <details open className="rounded-md border border-zinc-200 bg-zinc-50">
          <summary className="flex items-center gap-3 px-4 py-2.5 cursor-pointer list-none">
            <span className="size-2 rounded-full bg-zinc-300 border border-zinc-400" />
            <span className="t-micro text-zinc-700">Sources Doctrine</span>
            <span className="ml-auto t-small-regular text-zinc-400 tabular-nums">{external.length}</span>
          </summary>
          <ul className="px-4 pb-3 space-y-1 t-small-regular text-zinc-600">
            {external.map((c) => <li key={c.label}>· {c.full}</li>)}
          </ul>
        </details>
      )}
      {internal.length > 0 && (
        <details open className="rounded-md border border-zinc-200 bg-zinc-50">
          <summary className="flex items-center gap-3 px-4 py-2.5 cursor-pointer list-none">
            <span className="size-2 rounded-full bg-zinc-900" />
            <span className="t-micro text-zinc-700">Sources internes</span>
            <span className="ml-auto t-small-regular text-zinc-400 tabular-nums">{internal.length}</span>
          </summary>
          <ul className="px-4 pb-3 space-y-1 t-small-regular text-zinc-600">
            {internal.map((c) => <li key={c.label}>· {c.full}</li>)}
          </ul>
        </details>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------
   A4 — Tool CTA
   ---------------------------------------------------------------------- */
/**
 * A4 has two axes:
 *   variant  — card / link / banner (visual)
 *   content  — draft / extract / counsel (which tool)
 */
function ToolCTA({
  variant, content, artifactTitle,
}: { variant: string; content: string; artifactTitle?: string }) {
  if (variant === 'hidden') return null;

  const tool =
    content === 'extract' ? 'Extract' :
    content === 'counsel' ? 'Counsel' :
    'Draft';
  const icon =
    tool === 'Extract' ? 'list' :
    tool === 'Counsel' ? 'scales' :
    'pen';

  if (variant === 'link') {
    return (
      <button className="inline-flex items-center gap-1.5 t-base-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-700">
        <Icon name={icon} className="size-3.5" />
        Continuer dans {tool} →
      </button>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="rounded-md border border-zinc-200 bg-zinc-900 text-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name={icon} className="size-4" />
          <div>
            <div className="t-small-semibold">Continuer dans {tool}</div>
            {artifactTitle && (
              <div className="t-small-regular text-zinc-400">{artifactTitle}</div>
            )}
          </div>
        </div>
        <button className="px-3 py-1.5 t-small-medium rounded-md bg-white text-zinc-900 hover:bg-zinc-100">
          Ouvrir →
        </button>
      </div>
    );
  }

  // card (default)
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon name={icon} className="size-3.5 text-zinc-700" />
        <span className="t-small-medium text-zinc-900">Continuer dans {tool}</span>
      </div>
      <button className="px-2.5 py-1 t-small-medium text-white rounded-md bg-zinc-900 hover:bg-zinc-800 inline-flex items-center gap-1">
        Ouvrir <Icon name="arrow-right" className="size-3" />
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------------
   A6 — Attach To Matter
   ---------------------------------------------------------------------- */
function AttachToMatter({ variant, content }: { variant: string; content: string }) {
  if (variant === 'hidden') return null;
  const attached = content === 'attached';

  if (variant === 'toast') {
    return (
      <div className="inline-flex items-center gap-2 t-small-regular bg-zinc-900 text-white px-3 py-1.5 rounded-md">
        <Icon name="check" className="size-3.5" />
        {attached ? `Réponse rattachée à ${MATTER_LEROY.name}` : `Attacher cette réponse à ${MATTER_LEROY.name} ?`}
      </div>
    );
  }

  // pill (default surface)
  if (attached) {
    return (
      <div className="inline-flex items-center gap-1.5 t-small-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md">
        <Icon name="check" className="size-3.5" />
        Rattaché à {MATTER_LEROY.name}
      </div>
    );
  }
  return (
    <button className="inline-flex items-center gap-1.5 t-small-medium text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-md hover:border-blue-300">
      <Icon name="folder" className="size-3.5" />
      Attacher à {MATTER_LEROY.name}
    </button>
  );
}

/* ----------------------------------------------------------------------
   A8 — Suggested Follow-ups
   ---------------------------------------------------------------------- */
function Followups({ variant, items }: { variant: string; items: string[] }) {
  if (variant === 'hidden' || items.length === 0) return null;

  if (variant === 'list') {
    return (
      <ol className="space-y-1.5 t-small-regular text-zinc-700 list-decimal pl-5">
        {items.map((f) => (
          <li key={f}>
            <button className="hover:text-zinc-900 underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-900 text-left">
              {f}
            </button>
          </li>
        ))}
      </ol>
    );
  }

  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {items.map((f) => (
          <button key={f} className="px-3 py-2 rounded-md border border-zinc-200 bg-white t-small-medium text-zinc-700 hover:border-zinc-400 text-left">
            {f}
          </button>
        ))}
      </div>
    );
  }

  // chips (default)
  return (
    <div className="pt-2 flex flex-wrap gap-1.5">
      {items.map((f) => (
        <button key={f} className="px-3 py-1.5 rounded-full border border-zinc-200 bg-white t-small-medium text-zinc-700 hover:border-zinc-400">
          {f}
        </button>
      ))}
    </div>
  );
}
