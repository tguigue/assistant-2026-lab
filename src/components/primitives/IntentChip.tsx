import type { Role } from '../../state/types';
import { Icon } from '../ui';

export function IntentChip({
  intent,
  role,
}: {
  intent: { icon: string; label: string };
  role: Role;
}) {
  if (role === 'absent') return null;

  if (role === 'secondary') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-dashed border-zinc-300 t-small-regular text-zinc-600">
        <Icon name={intent.icon} className="size-3 text-zinc-500" />
        {intent.label}
      </span>
    );
  }

  // dominant
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-md border border-zinc-900 bg-zinc-900 t-small-medium text-white">
        <Icon name={intent.icon} className="size-3" />
        {intent.label}
        <button className="ml-1 px-1.5 py-0.5 t-small-regular text-zinc-400 hover:text-white">
          changer
        </button>
      </span>
      <span className="t-small-regular text-zinc-400">détecté automatiquement</span>
    </div>
  );
}
