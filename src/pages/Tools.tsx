import { PageShell } from '../components/sandbox/PageShell';
import { Icon } from '../components/ui';

type Tool = {
  id: string;
  name: string;
  blurb: string;
  status: 'connected' | 'mock' | 'soon';
};

const TOOLS: Tool[] = [
  { id: 'draft',   name: 'Draft',   blurb: 'Rédaction collaborative. Reçoit les artifacts générés par l’Assistant.', status: 'mock' },
  { id: 'extract', name: 'Extract', blurb: 'Tables croisées d’obligations, comparaison de clauses, exports CSV.', status: 'mock' },
  { id: 'counsel', name: 'Counsel', blurb: 'Génération de conclusions à partir d’une analyse de jurisprudence.', status: 'soon' },
];

const STATUS_LABEL: Record<Tool['status'], string> = {
  connected: 'CONNECTED',
  mock: 'MOCK',
  soon: 'SOON',
};

export default function Tools() {
  return (
    <PageShell
      eyebrow="Connecteurs"
      title="Tools"
      lede="Outils Doctrine mobilisables par l’Assistant. Aucun lien réel dans la sandbox — chaque outil est représenté par un endpoint mock."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {TOOLS.map((t) => (
          <div key={t.id} className="border border-zinc-200 rounded-md p-5 flex flex-col gap-3 min-h-[160px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="pen" className="size-4 text-zinc-700" />
                <h3 className="t-title-4 text-zinc-900">{t.name}</h3>
              </div>
              <span className="sidebar-badge">{STATUS_LABEL[t.status]}</span>
            </div>
            <p className="t-small-regular text-zinc-600 flex-1">{t.blurb}</p>
            <div className="t-mono t-small-regular text-zinc-400">
              POST /api/tools/{t.id}/handoff
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
