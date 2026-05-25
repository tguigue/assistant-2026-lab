import { useChatbot } from '../chatbot/store';
import { SCENARIOS, MATTER_LEROY } from '../chatbot/scenarios';
import type { AnswerBlock, Citation, Params } from '../chatbot/types';
import { Icon } from './ui';

/**
 * The conversation panel — the actual chatbot response area.
 * Every visible affordance reacts to the 7 semantic parameters.
 */
export function Conversation() {
  const comp = useChatbot((s) => s.comp);
  const scenario = SCENARIOS[comp.scenario];
  const p = comp.params;

  // Filter citations by enabled source dimensions
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

      {/* Mode signal — intent chip (Auto) or manual mode toggle (Manual) */}
      {p.mode === 'auto' ? (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-md border border-zinc-900 bg-zinc-900 t-small-medium text-white">
            <Icon name={scenario.intent.icon} className="size-3" />
            {scenario.intent.label}
            <button className="ml-1 px-1.5 py-0.5 t-small-regular text-zinc-400 hover:text-white">changer</button>
          </span>
          <span className="t-small-regular text-zinc-400">détecté automatiquement</span>
        </div>
      ) : (
        <ManualModeToggle currentIntent={scenario.intent.label} />
      )}

      {/* Plan preamble (Auto only) */}
      {p.mode === 'auto' && (
        <div className="flex items-start gap-3 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-md">
          <Icon name="sparkles" className="size-4 text-zinc-500 mt-0.5 shrink-0" />
          <p
            className="t-base-regular text-zinc-900"
            dangerouslySetInnerHTML={{ __html: rewritePreamble(scenario.preamble, p) }}
          />
        </div>
      )}

      {/* Assistant answer body with inline citations */}
      <div className="space-y-4">
        {scenario.answer.map((b, i) =>
          b.kind === 'h' ? (
            <h4 key={i} className="t-title-4 text-zinc-900">{b.text}</h4>
          ) : (
            <p
              key={i}
              className="t-legal-large text-zinc-900"
              dangerouslySetInnerHTML={{ __html: renderHtml(b.html, visibleCitations) }}
            />
          ),
        )}
      </div>

      {/* Citations panel grouped */}
      <CitationsPanel citations={visibleCitations} />

      {/* Artifact (Draft) preview — inline card when Tool=draft and scenario has artifact */}
      {p.tool === 'draft' && scenario.artifact && <ArtifactPreview artifact={scenario.artifact} />}

      {/* Extract table preview — for S4 Extract */}
      {p.tool === 'extract' && scenario.id === 'S4' && <ExtractTablePreview />}

      {/* Handoff CTA (when Tool != none) */}
      {p.tool !== 'none' && <HandoffCTA tool={p.tool} />}

      {/* Attach-to-Matter affordance */}
      <AttachAffordance attach={p.attach} hasMatter={p.matter !== 'none'} />

      {/* Suggested follow-ups */}
      <div className="pt-2 flex flex-wrap gap-1.5">
        {scenario.followups.map((f, i) => (
          <button
            key={i}
            className="px-3 py-1.5 rounded-full border border-zinc-200 bg-white t-small-medium text-zinc-700 hover:border-zinc-400"
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------
   Helper renderers
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

function rewritePreamble(html: string, p: Params): string {
  // If certain sources are off, strip their mentions from the preamble for plausibility.
  let out = html;
  if (!p.doctrine) out = out.replace(/<strong>Doctrine<\/strong>[^,]*,?\s*(et\s+)?/g, '');
  if (!p.kb)       out = out.replace(/(et\s+)?(dans\s+)?votre\s+<strong>Knowledge Base<\/strong>[^,.]*[,.]?/g, '');
  if (!p.clausier) out = out.replace(/<strong>3 clauses de votre Clausier<\/strong>\s*\([^)]*\)/g, '<strong>les modèles disponibles</strong>');
  return out;
}

function renderHtml(html: string, citations: Record<string, Citation>): string {
  return html.replace(/\[\[(\w+)\]\]/g, (_, key) => {
    const c = citations[key];
    if (!c) return ''; // citation hidden because its source is off
    const cls = c.kind === 'internal' ? 'cite-pill cite-pill--internal' : 'cite-pill';
    return ` <a class="${cls}" title="${escapeAttr(c.full)}">${escapeHtml(c.label)}</a> `;
  });
}

function escapeHtml(s: string) { return s.replace(/[&<>]/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;' }[c] ?? c)); }
function escapeAttr(s: string) { return escapeHtml(s).replace(/"/g, '&quot;'); }

/* ----------------------------------------------------------------------
   Sub-components
   ---------------------------------------------------------------------- */

function ManualModeToggle({ currentIntent }: { currentIntent: string }) {
  const modes = ['Recherche', 'Rédaction', 'Analyse', 'Connaissance'];
  return (
    <div className="inline-flex rounded-md border border-zinc-200 bg-zinc-50 p-0.5">
      {modes.map((m) => {
        const active = m === currentIntent;
        return (
          <button
            key={m}
            className={
              'h-7 px-3 t-small-medium rounded-[5px] ' +
              (active
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200'
                : 'text-zinc-500 hover:text-zinc-900')
            }
          >
            {m}
          </button>
        );
      })}
    </div>
  );
}

function CitationsPanel({ citations }: { citations: Record<string, Citation> }) {
  const all = Object.values(citations);
  if (all.length === 0) return null;
  const external = all.filter((c) => c.kind === 'external');
  const internal = all.filter((c) => c.kind === 'internal');

  return (
    <div className="space-y-2 mt-4">
      {external.length > 0 && <Group label="Sources Doctrine" kind="external" items={external} />}
      {internal.length > 0 && <Group label="Sources internes" kind="internal" items={internal} />}
    </div>
  );
}

function Group({ label, kind, items }: { label: string; kind: 'external' | 'internal'; items: Citation[] }) {
  return (
    <details open className="rounded-md border border-zinc-200 bg-zinc-50">
      <summary className="flex items-center gap-3 px-4 py-2.5 cursor-pointer list-none">
        <span
          className={
            kind === 'internal'
              ? 'size-2 rounded-full bg-zinc-900'
              : 'size-2 rounded-full bg-zinc-300 border border-zinc-400'
          }
        />
        <span className="t-micro text-zinc-700">{label}</span>
        <span className="ml-auto t-small-regular text-zinc-400 tabular-nums">{items.length}</span>
      </summary>
      <ul className="px-4 pb-3 space-y-1 t-small-regular text-zinc-600">
        {items.map((c, i) => (
          <li key={i}>· {c.full}</li>
        ))}
      </ul>
    </details>
  );
}

function ArtifactPreview({ artifact }: { artifact: { title: string; body: AnswerBlock[]; footer: string } }) {
  return (
    <div className="rounded-lg border border-zinc-200 overflow-hidden">
      <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 t-small-semibold text-zinc-900">
          <Icon name="pen" className="size-3.5" /> Draft · {artifact.title}
        </span>
        <button className="px-2 py-0.5 t-small-medium text-white rounded bg-zinc-900 hover:bg-zinc-800">Ouvrir</button>
      </div>
      <div className="px-4 py-3 max-h-48 overflow-hidden relative t-legal-base text-zinc-700">
        {artifact.body.slice(0, 4).map((b, i) =>
          b.kind === 'h' ? (
            <div key={i} className="t-micro text-zinc-500 mb-1 mt-2 first:mt-0">{b.text}</div>
          ) : (
            <p key={i} className="mb-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: b.html }} />
          ),
        )}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </div>
      <div className="px-4 py-2 border-t border-zinc-200 t-small-regular text-zinc-500 bg-zinc-50">
        {artifact.footer}
      </div>
    </div>
  );
}

function ExtractTablePreview() {
  const obligations = [
    { name: 'Confidentialité',   c1: true, c2: true, c3: true, c4: true, c5: true,  note: '5 à 10 ans' },
    { name: 'Non-concurrence',   c1: true, c2: true, c3: false, c4: true, c5: true,  note: 'France métro.' },
    { name: 'Exclusivité',       c1: true, c2: false,c3: true,  c4: false,c5: true,  note: 'formulations div.' },
    { name: 'Reporting trim.',   c1: true, c2: true, c3: true,  c4: false,c5: true,  note: 'Excel ×2' },
    { name: 'Audit annuel',      c1: true, c2: false,c3: true,  c4: true, c5: false, note: 'préavis 15–60j' },
  ];
  return (
    <div className="rounded-lg border border-zinc-200 overflow-hidden">
      <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 t-small-semibold text-zinc-900">
          <Icon name="list" className="size-3.5" /> Extract · Tableau des obligations
        </span>
        <button className="px-2 py-0.5 t-small-medium text-white rounded bg-zinc-900 hover:bg-zinc-800">Ouvrir</button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-100 t-micro text-zinc-500">
            <th className="text-left py-2 px-3">Obligation</th>
            <th className="py-2 px-2 text-center">C·1</th>
            <th className="py-2 px-2 text-center">C·2</th>
            <th className="py-2 px-2 text-center">C·3</th>
            <th className="py-2 px-2 text-center">C·4</th>
            <th className="py-2 px-2 text-center">C·5</th>
            <th className="py-2 px-3 text-right">Note</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {obligations.map((r) => (
            <tr key={r.name}>
              <td className="py-2 px-3 t-base-medium text-zinc-900">{r.name}</td>
              {(['c1','c2','c3','c4','c5'] as const).map((k) => (
                <td key={k} className="text-center">
                  {r[k] ? <Icon name="check" className="size-3.5 text-zinc-900 inline" /> : <span className="text-zinc-300">—</span>}
                </td>
              ))}
              <td className="py-2 px-3 text-right t-small-regular text-zinc-500">{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HandoffCTA({ tool }: { tool: 'draft' | 'extract' | 'counsel' }) {
  const label = tool === 'draft' ? 'Draft' : tool === 'extract' ? 'Extract' : 'Counsel';
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon name={tool === 'draft' ? 'pen' : tool === 'extract' ? 'list' : 'scales'} className="size-3.5 text-zinc-700" />
        <span className="t-small-medium text-zinc-900">Continuer dans {label}</span>
      </div>
      <button className="px-2.5 py-1 t-small-medium text-white rounded-md bg-zinc-900 hover:bg-zinc-800 inline-flex items-center gap-1">
        Ouvrir <Icon name="arrow-right" className="size-3" />
      </button>
    </div>
  );
}

function AttachAffordance({ attach, hasMatter }: { attach: Params['attach']; hasMatter: boolean }) {
  if (attach === 'off') return null;
  if (!hasMatter) {
    return (
      <button className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-dashed border-zinc-300 t-small-regular text-zinc-500 hover:border-zinc-400 hover:text-zinc-700">
        <Icon name="paperclip" className="size-3" />
        Attacher à une affaire ?
      </button>
    );
  }
  if (attach === 'auto') {
    return (
      <div className="inline-flex items-center gap-1.5 t-small-regular text-zinc-500">
        <Icon name="check" className="size-3 text-zinc-900" />
        Attaché à {MATTER_LEROY.name}
      </div>
    );
  }
  // ask
  return (
    <button className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-dashed border-zinc-300 t-small-regular text-zinc-700 hover:border-zinc-400">
      <Icon name="paperclip" className="size-3" />
      Attacher à {MATTER_LEROY.name} ?
    </button>
  );
}
