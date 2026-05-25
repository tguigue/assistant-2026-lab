import { PageShell } from '../components/sandbox/PageShell';
import { Icon } from '../components/ui';

type Source = {
  id: string;
  name: string;
  kind: 'external' | 'internal';
  count: string;
  latency: string;
  status: 'on' | 'off' | 'warn';
  description: string;
};

const SOURCES: Source[] = [
  { id: 'doctrine', name: 'Doctrine',       kind: 'external', count: '12M docs',  latency: '~300ms', status: 'on',   description: 'Jurisprudence, codes, doctrine publiée. Index principal.' },
  { id: 'kb',       name: 'Knowledge Base', kind: 'internal', count: '1 240 docs', latency: '~80ms',  status: 'on',   description: 'Notes internes du cabinet — mémos, fiches, jurisprudence sauvegardée.' },
  { id: 'clausier', name: 'Clausier',       kind: 'internal', count: '86 clauses', latency: '~40ms',  status: 'warn', description: 'Bibliothèque de clauses types. Configuration en cours.' },
  { id: 'matter',   name: 'Matters',        kind: 'internal', count: '26 affaires', latency: '~120ms', status: 'on',   description: 'Documents de chaque affaire ouverte (contrats, conclusions, échanges).' },
];

export default function Sources() {
  return (
    <PageShell
      eyebrow="Adaptateurs"
      title="Sources"
      lede="Connecteurs vers les corpus interrogeables par l’Assistant. Doctrine est externe ; les trois autres sont internes au cabinet."
    >
      <div className="border border-zinc-200 rounded-md divide-y divide-zinc-100">
        {SOURCES.map((s) => (
          <div key={s.id} className="px-5 py-4 grid grid-cols-[24px_1fr_160px_120px] items-center gap-4">
            <span className={'status-dot ' + (s.status === 'on' ? 'status-dot--on' : s.status === 'warn' ? 'status-dot--warn' : 'status-dot--off')} />
            <div>
              <div className="flex items-baseline gap-2">
                <span className="t-base-medium text-zinc-900">{s.name}</span>
                <span className="t-mono t-small-regular text-zinc-400">
                  {s.kind === 'external' ? 'external' : 'internal'}
                </span>
              </div>
              <p className="t-small-regular text-zinc-500 mt-0.5">{s.description}</p>
            </div>
            <div className="t-mono t-small-regular text-zinc-500 tabular-nums flex items-center gap-1.5">
              <Icon name="folder" className="size-3 text-zinc-400" />
              {s.count}
            </div>
            <div className="t-mono t-small-regular text-zinc-500 tabular-nums text-right">
              {s.latency}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 t-small-regular text-zinc-500">
        <Icon name="alert" className="size-3 mr-1 inline" />
        Les latences affichées sont des valeurs moyennes observées sur les fixtures. Aucun appel réel.
      </div>
    </PageShell>
  );
}
