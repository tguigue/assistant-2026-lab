import type { Role } from '../../../lab/types';
import type { AnswerBlock, Citation } from '../../../lab/scenarios';

/** Replaces [[citeKey]] placeholders inside answer html. */
export function ProvenanceBody({
  blocks,
  citations,
  variant,
  role,
}: {
  blocks: AnswerBlock[];
  citations: Record<string, Citation>;
  variant: string;
  role: Role;
}) {
  return (
    <div className="space-y-4">
      {blocks.map((b, i) =>
        b.kind === 'h' ? (
          <h4 key={i} className="t-title-4 text-zinc-900">{b.text}</h4>
        ) : (
          <p
            key={i}
            className="t-legal-large text-zinc-900"
            dangerouslySetInnerHTML={{
              __html: renderHtmlWithCitations(b.html, citations, variant, role),
            }}
          />
        )
      )}
    </div>
  );
}

export function ProvenanceGroups({
  citations,
  variant,
  role,
}: {
  citations: Record<string, Citation>;
  variant: string;
  role: Role;
}) {
  if (role === 'absent') return null;
  if (variant === 'numbered-footnotes' || variant === 'inline-pills') return null; // no group block

  const all = Object.values(citations);
  if (all.length === 0) return null;
  const external = all.filter((c) => c.kind === 'external');
  const internal = all.filter((c) => c.kind === 'internal');

  if (variant === 'expanded-cards') {
    return (
      <div className="grid grid-cols-2 gap-2 mt-5">
        {all.map((c, i) => (
          <div key={i} className="border border-zinc-200 rounded-md p-3 bg-white">
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

  // grouped-below
  return (
    <div className="space-y-2 mt-5">
      {external.length > 0 && <Group label="Sources Doctrine" items={external} kind="external" />}
      {internal.length > 0 && <Group label="Sources internes" items={internal} kind="internal" />}
    </div>
  );
}

function Group({
  label,
  items,
  kind,
}: {
  label: string;
  items: Citation[];
  kind: 'external' | 'internal';
}) {
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
        <span className="ml-auto t-small-regular text-zinc-400 tabular-nums">
          {items.length}
        </span>
      </summary>
      <ul className="px-4 pb-3 space-y-1 t-small-regular text-zinc-600">
        {items.map((c, i) => (
          <li key={i}>· {c.full}</li>
        ))}
      </ul>
    </details>
  );
}

function renderHtmlWithCitations(
  html: string,
  citations: Record<string, Citation>,
  variant: string,
  role: Role,
): string {
  let n = 0;
  return html.replace(/\[\[(\w+)\]\]/g, (_, key) => {
    if (role === 'absent') return '';
    const c = citations[key];
    if (!c) return '';
    n++;
    if (variant === 'numbered-footnotes') {
      const cls = c.kind === 'internal' ? 'cite-pill cite-pill--internal' : 'cite-pill';
      return ` <a class="${cls}" style="min-width:22px;padding:1px 6px;justify-content:center;font-weight:600;" title="${escapeAttr(c.full)}">${n}</a> `;
    }
    // inline-pills or grouped-below — show the label
    const cls = c.kind === 'internal' ? 'cite-pill cite-pill--internal' : 'cite-pill';
    return ` <a class="${cls}" title="${escapeAttr(c.full)}">${escapeHtml(c.label)}</a> `;
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch] ?? ch));
}
function escapeAttr(s: string) {
  return escapeHtml(s).replace(/"/g, '&quot;');
}
