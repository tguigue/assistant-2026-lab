import type { Role } from '../../state/types';
import { Icon } from '../ui';

export function MatterScopeHeader({ role }: { role: Role }) {
  if (role === 'absent') return null;
  if (role === 'secondary') {
    // per-message pill (compact)
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-dashed border-zinc-300 t-small-regular text-zinc-500">
        <Icon name="paperclip" className="size-3" />
        attaché à Leroy c/ Merlin
      </span>
    );
  }
  // dominant — full header band
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 bg-zinc-900 text-white">
      <div className="inline-flex items-center gap-3">
        <span className="inline-flex items-center justify-center size-7 rounded bg-white text-zinc-900 t-small-semibold">
          L
        </span>
        <div>
          <div className="t-small-regular text-zinc-400">Affaire</div>
          <div className="t-base-semibold tracking-tight">Leroy c/ Merlin</div>
        </div>
        <span className="ml-3 px-2 py-0.5 rounded bg-white/10 t-micro text-zinc-300">
          Contentieux commercial
        </span>
      </div>
      <div className="t-small-regular text-zinc-400">
        7 documents · 5 contrats · 14 mars 2026
      </div>
    </div>
  );
}

/** The full Matter workspace shell (sidebar with documents + items).
 *  Only rendered when role === 'dominant' AND we're in the Bundle-C-style scenario.
 *  When secondary, omitted (the header above carries the indication).
 */
export function MatterShell({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  if (role !== 'dominant') return <>{children}</>;

  return (
    <div className="grid grid-cols-[220px_minmax(0,1fr)] divide-x divide-zinc-200 h-full min-h-0">
      <aside className="py-4 px-3 bg-zinc-50/40 overflow-y-auto scrollbar-thin">
        <div className="t-micro text-zinc-400 px-2 mb-2">Documents</div>
        <ul className="space-y-0.5 t-small-regular text-zinc-700">
          {['Contrat_001_distribution', 'Contrat_002_franchise', 'Contrat_003_partenariat', 'Contrat_004_exclusif', 'Contrat_005_sous_traitance', 'Conclusions_defendeur', 'Echanges_emails'].map((n) => (
            <li key={n} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white">
              <Icon name="file-text" className="size-3.5 text-zinc-400" />
              <span className="truncate">{n}</span>
            </li>
          ))}
        </ul>
        <div className="t-micro text-zinc-400 px-2 mt-4 mb-2">Items générés</div>
        <ul className="space-y-0.5 t-small-regular text-zinc-700">
          <li className="flex items-center gap-2 px-2 py-1 rounded bg-zinc-900 text-white">
            <Icon name="message" className="size-3.5" />
            Conversation en cours
          </li>
        </ul>
      </aside>
      <div className="min-h-0 overflow-hidden flex flex-col">{children}</div>
    </div>
  );
}
