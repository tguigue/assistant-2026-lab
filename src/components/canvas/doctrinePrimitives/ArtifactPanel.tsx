import type { Role } from '../../../lab/types';
import type { AnswerBlock } from '../../../lab/scenarios';
import { Icon } from '../../ui';

/**
 * Returns null if absent OR if there's no artifact content (e.g., scenario without one).
 * The Canvas decides whether to render this inline or in a side pane based on variant.
 */
export function ArtifactPanel({
  variant,
  role,
  title,
  body,
  footer,
  layout, // 'split' (when canvas wraps it on the right) or 'inline'
}: {
  variant: string;
  role: Role;
  title?: string;
  body?: AnswerBlock[];
  footer?: string;
  layout: 'split' | 'inline';
}) {
  if (role === 'absent' || !title || !body) return null;

  // link-out — just a CTA
  if (variant === 'link-out' || role === 'secondary') {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 flex items-center justify-between mt-4">
        <div className="flex items-start gap-3 min-w-0">
          <Icon name="pen" className="size-4 text-zinc-700 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <div className="t-base-medium text-zinc-900 truncate">{title}</div>
            <div className="t-small-regular text-zinc-500">{footer ?? 'Brouillon disponible dans Draft'}</div>
          </div>
        </div>
        <button className="px-3 py-1.5 t-small-medium text-white rounded-md bg-zinc-900 hover:bg-zinc-800 inline-flex items-center gap-1.5 shrink-0">
          Ouvrir dans Draft <Icon name="arrow-right" className="size-3" />
        </button>
      </div>
    );
  }

  const fullPanel = (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-200 bg-zinc-50">
        <span className="inline-flex items-center gap-1.5 t-small-semibold text-zinc-900">
          <Icon name="pen" className="size-3.5" /> Draft
        </span>
        <span className="text-zinc-400">·</span>
        <span className="t-small-regular text-zinc-600 flex-1 truncate">{title}</span>
        <button className="px-2.5 py-1 t-small-medium rounded-md border border-zinc-200 text-zinc-700 hover:border-zinc-400">Affiner</button>
        <button className="px-2.5 py-1 t-small-medium rounded-md bg-zinc-900 text-white hover:bg-zinc-800">Ouvrir</button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin px-7 py-6 t-legal-base text-zinc-900">
        {body.map((b, i) =>
          b.kind === 'h' ? (
            <div key={i} className="t-micro text-zinc-500 mb-1.5 mt-4 first:mt-0">{b.text}</div>
          ) : (
            <p key={i} className="mb-4" dangerouslySetInnerHTML={{ __html: b.html }} />
          )
        )}
      </div>
      {footer && (
        <div className="px-5 py-2.5 border-t border-zinc-200 bg-zinc-50 t-small-regular text-zinc-500">
          {footer}
        </div>
      )}
    </div>
  );

  if (variant === 'modal-overlay') {
    return (
      <div className="fixed inset-0 z-40 bg-zinc-900/30 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-xl border border-zinc-200 max-w-3xl w-full h-[80vh] overflow-hidden">
          {fullPanel}
        </div>
      </div>
    );
  }

  if (variant === 'inline-card' || layout === 'inline') {
    return (
      <div className="rounded-lg border border-zinc-200 overflow-hidden mt-4 max-h-[400px]">
        {fullPanel}
      </div>
    );
  }

  // variant === 'side-pane' and layout === 'split'
  return <div className="border-l border-zinc-200 bg-zinc-50/40 min-h-0 h-full">{fullPanel}</div>;
}
