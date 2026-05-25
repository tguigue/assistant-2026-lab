import type { Role } from '../../../lab/types';
import { Icon } from '../../ui';

export function PlanPreamble({
  variant,
  role,
  html,
}: {
  variant: string;
  role: Role;
  html: string;
}) {
  if (role === 'absent') return null;

  if (role === 'secondary' || variant === 'single-line') {
    return (
      <p className="t-small-regular text-zinc-500 italic inline-flex items-baseline gap-1.5">
        <Icon name="sparkles" className="size-3 text-zinc-400" />
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </p>
    );
  }

  if (variant === 'collapsed-summary') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-100 t-small-medium text-zinc-700">
        <Icon name="sparkles" className="size-3 text-zinc-500" />
        Searching · 3 sources · grouped
      </div>
    );
  }

  if (variant === 'streaming-thought') {
    return (
      <div className="space-y-1 t-small-regular text-zinc-600">
        <div className="flex items-center gap-1.5">
          <Icon name="sparkles" className="size-3 text-zinc-400" />
          <span className="t-small-medium text-zinc-700">Plan</span>
        </div>
        <div className="pl-4 border-l border-zinc-200 space-y-0.5 t-mono">
          <div>→ chercher dans Doctrine</div>
          <div>→ chercher dans la KB</div>
          <div>→ rapprocher et trancher</div>
        </div>
      </div>
    );
  }

  // inline-box (default dominant)
  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-md">
      <Icon name="sparkles" className="size-4 text-zinc-500 mt-0.5 shrink-0" />
      <p className="t-base-regular text-zinc-900" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
