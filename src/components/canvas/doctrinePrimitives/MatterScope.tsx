import type { Role } from '../../../lab/types';
import { Icon } from '../../ui';

export type MatterInfo = {
  name: string;
  subtitle?: string;
  docs?: string[];
};

/** The header band — used by header-banner and pill-near-input variants */
export function MatterHeader({
  variant,
  role,
  matter,
}: {
  variant: string;
  role: Role;
  matter: MatterInfo;
}) {
  if (role === 'absent') return null;
  if (variant === 'workspace-shell') return null; // shell wraps the canvas externally

  if (variant === 'pill-near-input' || role === 'secondary') {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-zinc-200 bg-white t-small-regular text-zinc-700">
        <span className="inline-flex items-center justify-center size-5 rounded bg-zinc-900 text-white t-small-semibold">
          {matter.name[0]}
        </span>
        Affaire&nbsp;: <span className="t-small-medium text-zinc-900">{matter.name}</span>
      </span>
    );
  }

  if (variant === 'per-message-tag') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-dashed border-zinc-300 t-small-regular text-zinc-500">
        <Icon name="paperclip" className="size-3" />
        attaché à {matter.name}
      </span>
    );
  }

  // header-banner (default dominant)
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 bg-zinc-900 text-white">
      <div className="inline-flex items-center gap-3">
        <span className="inline-flex items-center justify-center size-7 rounded bg-white text-zinc-900 t-small-semibold">
          {matter.name[0]}
        </span>
        <div>
          <div className="t-small-regular text-zinc-400">Affaire</div>
          <div className="t-base-semibold tracking-tight">{matter.name}</div>
        </div>
        {matter.subtitle && (
          <span className="ml-3 px-2 py-0.5 rounded bg-white/10 t-micro text-zinc-300">
            {matter.subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * The workspace shell — only applies when variant === 'workspace-shell' AND role === 'dominant'.
 * Wraps the chat with a left documents sidebar.
 */
export function MatterShell({
  variant,
  role,
  matter,
  children,
}: {
  variant: string;
  role: Role;
  matter: MatterInfo;
  children: React.ReactNode;
}) {
  if (role !== 'dominant' || variant !== 'workspace-shell') return <>{children}</>;

  return (
    <div className="grid grid-cols-[220px_minmax(0,1fr)] divide-x divide-zinc-200 h-full min-h-0">
      <aside className="py-4 px-3 bg-zinc-50/60 overflow-y-auto scrollbar-thin">
        <div className="t-micro text-zinc-500 px-2 mb-2">Affaire</div>
        <div className="px-2 mb-4">
          <div className="t-base-semibold text-zinc-900">{matter.name}</div>
          {matter.subtitle && (
            <div className="t-small-regular text-zinc-500 mt-0.5">{matter.subtitle}</div>
          )}
        </div>
        <div className="t-micro text-zinc-500 px-2 mb-2">Documents</div>
        <ul className="space-y-0.5">
          {(matter.docs ?? []).map((doc) => (
            <li
              key={doc}
              className="flex items-center gap-2 px-2 py-1 rounded t-small-regular text-zinc-700 hover:bg-white"
            >
              <Icon name="file-text" className="size-3.5 text-zinc-400" />
              <span className="truncate">{doc}</span>
            </li>
          ))}
        </ul>
      </aside>
      <div className="min-h-0 flex flex-col">{children}</div>
    </div>
  );
}
