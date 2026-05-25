import type { Role } from '../../../lab/types';
import { Icon } from '../../ui';

export function IntentChip({
  variant,
  role,
  intent,
}: {
  variant: string;
  role: Role;
  intent: { icon: string; label: string };
}) {
  if (role === 'absent') return null;

  if (role === 'secondary') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-zinc-200 t-small-regular text-zinc-600">
        <Icon name={intent.icon} className="size-3 text-zinc-500" />
        {intent.label}
      </span>
    );
  }

  // dominant
  switch (variant) {
    case 'detecting':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-200 bg-white t-small-regular text-zinc-500">
          <span className="size-1.5 rounded-full bg-zinc-400 animate-pulse" />
          Détection de l’intention…
        </span>
      );
    case 'low-confidence':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-dashed border-zinc-400 bg-white t-small-medium text-zinc-700">
          <Icon name="alert" className="size-3 text-zinc-500" />
          {intent.label}&nbsp;?
          <span className="t-small-regular text-zinc-400">confirmer</span>
        </span>
      );
    case 'manual':
      return (
        <span className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-md border border-zinc-200 bg-white t-small-medium text-zinc-900">
          <Icon name="pen" className="size-3 text-zinc-700" />
          {intent.label}
          <span className="ml-1 t-small-regular text-zinc-400">manuel</span>
        </span>
      );
    case 'confident':
    default:
      return (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-md border border-zinc-900 bg-zinc-900 t-small-medium text-white">
            <Icon name={intent.icon} className="size-3" />
            {intent.label}
            <button className="ml-1 px-1.5 py-0.5 t-small-regular text-zinc-400 hover:text-white">
              changer
            </button>
          </span>
          <span className="t-small-regular text-zinc-400">détecté</span>
        </div>
      );
  }
}
