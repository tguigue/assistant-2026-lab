import type { Role } from '../../state/types';
import type { ScenarioBlock } from '../../scenarios/data';
import { Icon } from '../ui';

export function ArtifactPanel({
  role,
  title,
  body,
  footer,
  layout, // 'split' (right pane) or 'inline' (card inside chat)
}: {
  role: Role;
  title?: string;
  body?: ScenarioBlock[];
  footer?: string;
  layout: 'split' | 'inline';
}) {
  if (role === 'absent' || !title || !body) return null;

  const inner = (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-200 bg-zinc-50">
        <span className="inline-flex items-center gap-1.5 t-small-semibold text-zinc-900">
          <Icon name="pen" className="size-3.5" />
          Draft
        </span>
        <span className="text-zinc-400">·</span>
        <span className="t-small-regular text-zinc-600 flex-1 truncate">{title}</span>
        <button className="px-2.5 py-1 t-small-medium text-zinc-900 rounded-md border border-zinc-200 hover:border-zinc-400">
          Affiner
        </button>
        <button className="px-2.5 py-1 t-small-medium text-white rounded-md bg-zinc-900 hover:bg-zinc-800">
          Ouvrir
        </button>
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

  if (layout === 'split') {
    return <div className="border-l border-zinc-200 bg-zinc-50/40 min-h-0">{inner}</div>;
  }

  // inline as a card
  return (
    <div className="rounded-lg border border-zinc-200 overflow-hidden mt-4">{inner}</div>
  );
}
