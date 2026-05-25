import { useChatbot } from '../chatbot/store';
import { SCENARIOS, MATTER_LEROY } from '../chatbot/scenarios';
import type { AnswerBlock, Citation, CrossRef } from '../chatbot/types';
import { Icon } from './ui';

/**
 * Conversation — renders the assistant response with rich legal structure.
 * Reads primitive variants from the store; every variant produces a visible change.
 */
export function Conversation() {
  const comp = useChatbot((s) => s.comp);
  const prim = useChatbot((s) => s.primitives);
  const scenario = SCENARIOS[comp.scenario];
  const p = comp.params;

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
          <div className="px-4 py-2.5 rounded-2xl rounded-br-md bg-zinc-900 t-large-regular text-white">
            {scenario.prompt}
          </div>
        </div>
      </div>

      {/* Auto-detect intent chip */}
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

      {/* A2 + A3 — Assistant Body with inline citations */}
      <AssistantBody
        structureVariant={prim.A2}
        citationVariant={prim.A3}
        blocks={scenario.answer}
        citations={visibleCitations}
      />

      {/* Conclusion line */}
      {scenario.conclusion && (
        <p className="t-small-regular text-zinc-500 italic border-l-2 border-zinc-200 pl-3">
          {scenario.conclusion}
        </p>
      )}

      {/* A7 — Cross-references */}
      <CrossReferences variant={prim.A7} refs={scenario.crossRefs} />

      {/* A5 — Citations Panel */}
      <CitationsPanel variant={prim.A5} citations={visibleCitations} />

      {/* A4 — Tool CTA (tool encoded in variant) */}
      <ToolCTA variant={prim.A4} artifactTitle={scenario.artifact?.title} />

      {/* A6 — Attach to Matter */}
      <AttachToMatter variant={prim.A6} />

      {/* A8 — Suggested follow-ups */}
      <Followups variant={prim.A8} items={scenario.followups} />
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
   A2 + A3 — Assistant Body (with new structured rendering for blocks)
   ---------------------------------------------------------------------- */
function AssistantBody({
  structureVariant, citationVariant, blocks, citations,
}: {
  structureVariant: string;
  citationVariant: string;
  blocks: AnswerBlock[];
  citations: Record<string, Citation>;
}) {
  // Render each block with appropriate styling
  let sectionIdx = 0;
  const nodes = blocks.map((b, i) => {
    if (b.kind === 'h') {
      sectionIdx += 1;
      if (structureVariant === 'sections') {
        return (
          <h4 key={i} className="t-title-4 text-zinc-900 mt-5">
            {b.text}
          </h4>
        );
      }
      return <h4 key={i} className="t-title-4 text-zinc-900 mt-4">{b.text}</h4>;
    }
    if (b.kind === 'quote') {
      return (
        <blockquote
          key={i}
          className="my-4 pl-4 border-l-2 border-zinc-300 t-legal-base text-zinc-700 italic"
        >
          <span dangerouslySetInnerHTML={{ __html: b.html }} />
          {b.attribution && (
            <footer className="mt-1.5 t-small-regular text-zinc-500 not-italic">
              — {b.attribution}
            </footer>
          )}
        </blockquote>
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

  if (structureVariant === 'sans') {
    return (
      <div className="rounded-md bg-zinc-50 border border-zinc-100 px-5 py-4 space-y-3 t-base-regular text-zinc-900">
        {nodes}
      </div>
    );
  }
  if (structureVariant === 'bubble') {
    return (
      <div className="flex justify-start">
        <div className="max-w-[90%] px-5 py-4 rounded-2xl rounded-bl-md bg-zinc-100 space-y-3 t-base-regular text-zinc-900">
          {nodes}
        </div>
      </div>
    );
  }
  // sections (default) and serif both use legal serif; sections adds visual numbering via :before
  return (
    <div className={'space-y-3 t-legal-large text-zinc-900 ' + (structureVariant === 'sections' ? '[&_h4]:relative [&_h4]:pl-7 [&_h4]:before:absolute [&_h4]:before:left-0 [&_h4]:before:top-0.5 [&_h4]:before:t-mono [&_h4]:before:text-zinc-400 [&_h4]:before:content-["§"]' : '')}>
      {nodes}
    </div>
  );
}

/* ----------------------------------------------------------------------
   A7 — Cross-references (« Voir également »)
   ---------------------------------------------------------------------- */
function CrossReferences({ variant, refs }: { variant: string; refs?: CrossRef[] }) {
  if (variant === 'hidden' || !refs || refs.length === 0) return null;

  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-2 t-small-regular text-zinc-500">
        <Icon name="folder" className="size-3 text-zinc-400" />
        {refs.length} référence{refs.length > 1 ? 's' : ''} liée{refs.length > 1 ? 's' : ''}
        <button className="underline underline-offset-2 hover:text-zinc-900 ml-1">voir</button>
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className="mt-3">
        <div className="t-micro text-zinc-500 mb-2">Voir également</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {refs.map((r) => (
            <div key={r.label} className="border border-zinc-200 rounded-md p-3 bg-white">
              <div className="t-small-medium text-zinc-900 mb-1">{r.label}</div>
              <div className="t-small-regular text-zinc-500">{r.full}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // list (default)
  return (
    <div className="mt-3 rounded-md border border-zinc-200 bg-zinc-50/60 px-4 py-3">
      <div className="t-micro text-zinc-500 mb-2">Voir également</div>
      <ul className="space-y-1.5 t-small-regular text-zinc-700">
        {refs.map((r) => (
          <li key={r.label} className="flex items-baseline gap-2">
            <span className="size-1 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
            <span className="t-small-medium text-zinc-900">{r.label}</span>
            <span className="text-zinc-500">— {r.full}</span>
          </li>
        ))}
      </ul>
    </div>
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
 * A4 variants encode the tool choice (card-draft, card-extract, card-counsel,
 * link-draft, banner-draft). Decoupled from `params.tool` so any variant is
 * previewable regardless of scenario.
 */
function ToolCTA({ variant, artifactTitle }: { variant: string; artifactTitle?: string }) {
  if (variant === 'hidden') return null;

  const tool =
    variant.endsWith('-extract') ? 'Extract' :
    variant.endsWith('-counsel') ? 'Counsel' :
    'Draft';
  const icon =
    tool === 'Extract' ? 'list' :
    tool === 'Counsel' ? 'scales' :
    'pen';

  if (variant.startsWith('link')) {
    return (
      <button className="inline-flex items-center gap-1.5 t-base-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-700">
        <Icon name={icon} className="size-3.5" />
        Continuer dans {tool} →
      </button>
    );
  }

  if (variant.startsWith('banner')) {
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

  // card-* (default family)
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
function AttachToMatter({ variant }: { variant: string }) {
  if (variant === 'hidden') return null;

  if (variant === 'attached') {
    return (
      <div className="inline-flex items-center gap-1.5 t-small-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md">
        <Icon name="check" className="size-3.5" />
        Rattaché à {MATTER_LEROY.name}
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
