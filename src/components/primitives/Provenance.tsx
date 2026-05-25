import type { Role } from '../../state/types';
import type { Citation, ScenarioBlock } from '../../scenarios/data';

/**
 * Renders body blocks with [[citeKey]] placeholders replaced by .cite-pill anchors.
 * `role` controls whether the citation pills are rendered at all:
 *  - dominant / secondary: pills rendered inline
 *  - absent: placeholders silently stripped
 */
export function ProvenanceBody({
  blocks,
  citations,
  role,
}: {
  blocks: ScenarioBlock[];
  citations: Record<string, Citation>;
  role: Role;
}) {
  return (
    <div className="t-legal-large text-zinc-900 space-y-4">
      {blocks.map((b, i) =>
        b.kind === 'h' ? (
          <h4 key={i} className="t-title-4 text-zinc-900">{b.text}</h4>
        ) : (
          <p
            key={i}
            dangerouslySetInnerHTML={{
              __html: renderHtmlWithCitations(b.html, citations, role),
            }}
          />
        )
      )}
    </div>
  );
}

/**
 * Renders the group headers + lists below the body answer.
 * Only shown when role !== 'absent'.
 */
export function ProvenanceGroups({
  citations,
  role,
}: {
  citations: Record<string, Citation>;
  role: Role;
}) {
  if (role === 'absent') return null;

  const external = Object.values(citations).filter((c) => c.kind === 'external');
  const internal = Object.values(citations).filter((c) => c.kind === 'internal');

  return (
    <div className="space-y-2 mt-4">
      {external.length > 0 && (
        <Group
          glyph="external"
          label="Sources Doctrine"
          count={external.length}
          items={external}
        />
      )}
      {internal.length > 0 && (
        <Group
          glyph="internal"
          label="Sources internes"
          count={internal.length}
          items={internal}
        />
      )}
    </div>
  );
}

function Group({
  glyph,
  label,
  count,
  items,
}: {
  glyph: 'external' | 'internal';
  label: string;
  count: number;
  items: Citation[];
}) {
  return (
    <details className="rounded-md border border-zinc-200 bg-zinc-50 group" open>
      <summary className="flex items-center gap-3 px-4 py-2.5 cursor-pointer list-none">
        <span
          className={
            glyph === 'internal'
              ? 'inline-flex items-center justify-center size-5 rounded border border-zinc-900 bg-zinc-900 text-white'
              : 'inline-flex items-center justify-center size-5 rounded border border-zinc-300 bg-white text-zinc-900'
          }
        >
          <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            {glyph === 'internal' ? (
              <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
            ) : (
              <>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </>
            )}
          </svg>
        </span>
        <span className="t-micro text-zinc-900">{label}</span>
        <span className="ml-auto t-small-regular text-zinc-400 tabular-nums">
          {count} {count > 1 ? 'éléments' : 'élément'}
        </span>
      </summary>
      <ul className="px-4 pb-3 space-y-1.5 t-small-regular text-zinc-600">
        {items.map((c, i) => (
          <li key={i}>· {c.full}</li>
        ))}
      </ul>
    </details>
  );
}

/* ---------- helpers ---------- */

function renderHtmlWithCitations(
  html: string,
  citations: Record<string, Citation>,
  role: Role,
): string {
  return html.replace(/\[\[(\w+)\]\]/g, (_, key) => {
    if (role === 'absent') return '';
    const c = citations[key];
    if (!c) return '';
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
