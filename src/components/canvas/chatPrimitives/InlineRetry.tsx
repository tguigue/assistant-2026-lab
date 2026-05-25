import type { Role } from '../../../lab/types';
import { Icon } from '../../ui';

export function InlineRetry({ variant, role }: { variant: string; role: Role }) {
  if (role === 'absent') return null;

  if (variant === 'text-link' || role === 'secondary') {
    return (
      <button className="t-small-medium text-zinc-600 hover:text-zinc-900 underline underline-offset-2">
        Réessayer
      </button>
    );
  }

  if (variant === 'auto-retry') {
    return (
      <span className="inline-flex items-center gap-1.5 t-small-regular text-zinc-500">
        <span className="inline-block size-1.5 rounded-full bg-zinc-400 animate-pulse" />
        Nouvelle tentative dans 3 s…
        <button className="underline underline-offset-2 hover:text-zinc-900 ml-1">annuler</button>
      </span>
    );
  }

  // button (default)
  return (
    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 t-small-medium rounded-md border border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400">
      <Icon name="arrow-right" className="size-3.5" />
      Réessayer la requête
    </button>
  );
}
