import type { Role } from '../../../lab/types';
import { Icon } from '../../ui';

export function SuggestedFollowups({
  variant,
  role,
  items,
}: {
  variant: string;
  role: Role;
  items: string[];
}) {
  if (role === 'absent' || items.length === 0) return null;

  if (variant === 'list-above' || role === 'secondary') {
    return (
      <div className="t-small-regular text-zinc-500 max-w-md">
        <div className="t-micro text-zinc-400 mb-1.5">Suggestions</div>
        <ul className="space-y-1">
          {items.map((it, i) => (
            <li key={i}>
              <button className="hover:text-zinc-900 underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-900">
                {it}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (variant === 'prompt-buttons') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {items.map((it, i) => (
          <button
            key={i}
            className="px-3 py-2 rounded-md border border-zinc-200 t-small-medium text-zinc-700 hover:border-zinc-400 hover:text-zinc-900 text-left flex items-center gap-2"
          >
            <Icon name="arrow-right" className="size-3 text-zinc-400" />
            {it}
          </button>
        ))}
      </div>
    );
  }

  // chips-below (default)
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it, i) => (
        <button
          key={i}
          className="px-2.5 py-1 rounded-full border border-zinc-200 bg-white t-small-medium text-zinc-700 hover:border-zinc-400"
        >
          {it}
        </button>
      ))}
    </div>
  );
}
