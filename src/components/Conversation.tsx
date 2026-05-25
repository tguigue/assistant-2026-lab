import { useChatbot } from '../chatbot/store';
import { SCENARIOS, MATTER_LEROY } from '../chatbot/scenarios';
import type { AnswerBlock, Citation, Params } from '../chatbot/types';
import { Icon } from './ui';

/**
 * Conversation — reads primitive variants from the store and renders each
 * primitive in the chosen design. Every variant in the rail produces a
 * visible change here.
 */
export function Conversation() {
  const comp = useChatbot((s) => s.comp);
  const prim = useChatbot((s) => s.primitives);
  const scenario = SCENARIOS[comp.scenario];
  const p = comp.params;

  const visibleCitations = filterCitations(scenario.citations, p);

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
          <div className="px-4 py-2.5 rounded-2xl rounded-br-md bg-zinc-900 t-large-regular text-white">
            {scenario.prompt}
          </div>
        </div>
      </div>

      {/* Auto-detect intent chip (semantic only — not in primitives) */}
      {p.mode === 'auto' && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-md border border-zinc-900 bg-zinc-900 t-small-medium text-white">
            <Icon name={scenario.intent.icon} className="size-3" />
            {scenario.intent.label}
            <button className="ml-1 px-1.5 py-0.5 t-small-regular text-zinc-400 hover:text-white">changer</button>
          </span>
          <span className="t-small-regular text-zinc-400">détecté automatiquement</span>
        </div>
      )}

      {/* A1 — Plan Preamble */}
      <PlanPreamble variant={prim.A1} html={scenario.preamble} />

      {/* A7 — Reasoning Trace */}
      <ReasoningTrace variant={prim.A7} />

      {/* A2 + A3 — Assistant Message with inline citations */}
      <AssistantBody
        msgVariant={prim.A2}
        citationVariant={prim.A3}
        blocks={scenario.answer}
        citations={visibleCitations}
      />

      {/* A5 — Citations Panel */}
      <CitationsPanel variant={prim.A5} citations={visibleCitations} />

      {/* A4 — Tool CTA */}
      <ToolCTA variant={prim.A4} tool={p.tool} scenarioId={scenario.id} artifactTitle={scenario.artifact?.title} />

      {/* A6 — Attach to Matter */}
      <AttachToMatter variant={prim.A6} hasMatter={p.matter !== 'none'} />

      {/* A8 — Suggested follow-ups */}
      <Followups variant={prim.A8} items={scenario.followups} />
    </div>
  );
}

/* ----------------------------------------------------------------------
   Helpers
   ---------------------------------------------------------------------- */

function filterCitations(all: Record<string, Citation>, p: Params): Record<string, Citation> {
  const out: Record<string, Citation> = {};
  for (const [k, c] of Object.entries(all)) {
    if (c.source === 'doctrine' && !p.doctrine) continue;
    if (c.source === 'kb' && !p.kb) continue;
    if (c.source === 'clausier' && !p.clausier) continue;
    if (c.source === 'matter' && p.matter === 'none') continue;
    out[k] = c;
  }
  return out;
}

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
      const cls = c.kind === 'internal' ? 'cite-pill cite-pill--internal' : 'cite-pill';
      return ` <a class="${cls}" style="min-width:22px;padding:1px 6px;justify-content:center;font-weight:600;" title="${title}">${n}</a> `;
    }
    if (variant === 'bracketed') {
      const color = c.kind === 'internal' ? 'color:#18181b;font-weight:600;' : 'color:#52525b;';
      return ` <span class="t-mono" style="font-size:11.5px;${color}" title="${title}">[${label}]</span> `;
    }
    if (variant === 'superscript') {
      const color = c.kind === 'internal' ? 'color:#09090b;' : 'color:#52525b;';
      return `<sup class="t-mono" style="font-size:10px;font-weight:600;${color};margin:0 1px;" title="${title}">${n}</sup>`;
    }
    // pill (default)
    const cls = c.kind === 'internal' ? 'cite-pill cite-pill--internal' : 'cite-pill';
    return ` <a class="${cls}" title="${title}">${label}</a> `;
  });
}

/* ----------------------------------------------------------------------
   A1 — Plan Preamble
   ---------------------------------------------------------------------- */
function PlanPreamble({ variant, html }: { variant: string; html: string }) {
  if (variant === 'hidden') return null;

  if (variant === 'inline') {
    return (
      <p className="t-small-regular text-zinc-500 italic inline-flex items-baseline gap-1.5">
        <Icon name="sparkles" className="size-3 text-zinc-400" />
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </p>
    );
  }

  if (variant === 'thought') {
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

  // box (default)
  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-md">
      <Icon name="sparkles" className="size-4 text-zinc-500 mt-0.5 shrink-0" />
      <p className="t-base-regular text-zinc-900" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

/* ----------------------------------------------------------------------
   A7 — Reasoning Trace
   ---------------------------------------------------------------------- */
function ReasoningTrace({ variant }: { variant: string }) {
  if (variant === 'hidden') return null;

  if (variant === 'condensed') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-100 t-small-medium text-zinc-700">
        <Icon name="search" className="size-3 text-zinc-500" />
        3 étapes · 87 résultats
      </div>
    );
  }

  if (variant === 'timeline') {
    return (
      <div className="border-l-2 border-zinc-200 pl-4 space-y-2 t-small-regular text-zinc-600">
        <div><span className="t-mono text-zinc-400">01</span> Préjudice réparable + compétence juridictionnelle</div>
        <div><span className="t-mono text-zinc-400">02</span> Règles de compétence spécifiques</div>
        <div><span className="t-mono text-zinc-400">03</span> Causes d'exonération</div>
      </div>
    );
  }

  // expanded
  return (
    <details open className="rounded-md border border-zinc-200 bg-zinc-50">
      <summary className="flex items-baseline gap-3 px-4 py-2.5 cursor-pointer list-none">
        <span className="text-zinc-400">✱</span>
        <span className="flex-1 t-small-regular text-zinc-700">
          Recherche sur la notion de préjudice réparable et la compétence juridictionnelle.
        </span>
        <span className="t-small-regular text-zinc-400">43 résultats</span>
      </summary>
      <ul className="px-4 pb-2 border-t border-zinc-200 pt-2">
        {[
          { icon: 'search', text: 'préjudice rupture relations commerciales',     group: 'Décisions' },
          { icon: 'search', text: '"rupture abusive" dommages-intérêts quantum',  group: 'Décisions' },
          { icon: 'scales', text: 'Article L146-4 du Code de commerce',           group: 'Lois et règlements' },
          { icon: 'scales', text: 'Article 1112 du Code civil',                   group: 'Lois et règlements' },
        ].map((r, i) => (
          <li key={i} className="flex items-center gap-2 py-1 t-small-regular text-zinc-700">
            <Icon name={r.icon} className="size-3 text-zinc-400 shrink-0" />
            <span className="flex-1 truncate">{r.text}</span>
            <span className="t-small-regular text-zinc-400 shrink-0">{r.group}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

/* ----------------------------------------------------------------------
   A2 + A3 — Assistant Body
   ---------------------------------------------------------------------- */
function AssistantBody({
  msgVariant, citationVariant, blocks, citations,
}: {
  msgVariant: string;
  citationVariant: string;
  blocks: AnswerBlock[];
  citations: Record<string, Citation>;
}) {
  const bodyHtml = blocks.map((b) =>
    b.kind === 'h'
      ? `<h4 class="t-title-4 text-zinc-900">${escapeHtml(b.text)}</h4>`
      : `<p>${renderInlineCitations(b.html, citations, citationVariant)}</p>`
  ).join('');

  // Body className based on A2 variant
  const inner = (cls: string) => (
    <div className={cls} dangerouslySetInnerHTML={{ __html: bodyHtml }} />
  );

  if (msgVariant === 'sans') {
    return (
      <div className="rounded-md bg-zinc-50 border border-zinc-100 px-4 py-3">
        {inner('space-y-3 t-base-regular text-zinc-900')}
      </div>
    );
  }

  if (msgVariant === 'bubble') {
    return (
      <div className="flex justify-start">
        <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-bl-md bg-zinc-100">
          {inner('space-y-3 t-base-regular text-zinc-900')}
        </div>
      </div>
    );
  }

  // serif (default)
  return inner('space-y-4 t-legal-large text-zinc-900');
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
function ToolCTA({
  variant, tool, scenarioId, artifactTitle,
}: {
  variant: string;
  tool: Params['tool'];
  scenarioId: string;
  artifactTitle?: string;
}) {
  if (variant === 'hidden' || tool === 'none') return null;
  const label = tool === 'draft' ? 'Draft' : tool === 'extract' ? 'Extract' : 'Counsel';
  const icon = tool === 'draft' ? 'pen' : tool === 'extract' ? 'list' : 'scales';

  if (variant === 'link') {
    return (
      <button className="inline-flex items-center gap-1.5 t-base-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-700">
        <Icon name={icon} className="size-3.5" />
        Continuer dans {label} →
      </button>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="rounded-md border border-zinc-200 bg-zinc-900 text-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name={icon} className="size-4" />
          <div>
            <div className="t-small-semibold">Continuer dans {label}</div>
            {artifactTitle && scenarioId === 'S2' && (
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
        <span className="t-small-medium text-zinc-900">Continuer dans {label}</span>
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
function AttachToMatter({ variant, hasMatter }: { variant: string; hasMatter: boolean }) {
  if (variant === 'hidden') return null;

  if (variant === 'attached') {
    return (
      <div className="inline-flex items-center gap-1.5 t-small-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md">
        <Icon name="check" className="size-3.5" />
        Rattaché à {hasMatter ? MATTER_LEROY.name : 'un dossier'}
      </div>
    );
  }

  if (variant === 'toast') {
    return (
      <div className="inline-flex items-center gap-2 t-small-regular text-zinc-700 bg-zinc-900 text-white px-3 py-1.5 rounded-md">
        <Icon name="check" className="size-3.5" />
        Réponse attachée au dossier
      </div>
    );
  }

  // initial
  return (
    <button className="inline-flex items-center gap-1.5 t-small-medium text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-md hover:border-blue-300">
      <Icon name="folder" className="size-3.5" />
      {hasMatter ? `Attacher à ${MATTER_LEROY.name}` : 'Attacher à un dossier'}
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
