import type { Role } from '../../state/types';
import { Icon } from '../ui';

export function PlanPreamble({ role, html }: { role: Role; html: string }) {
  if (role === 'absent') return null;

  if (role === 'secondary') {
    return (
      <p className="t-small-regular text-zinc-500 italic inline-flex items-center gap-1.5">
        <Icon name="sparkles" className="size-3 text-zinc-400" />
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </p>
    );
  }

  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-md">
      <Icon name="sparkles" className="size-4 text-zinc-500 mt-0.5 shrink-0" />
      <p className="t-base-regular text-zinc-900" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
