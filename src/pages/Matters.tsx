import { PageShell } from '../components/sandbox/PageShell';

type Matter = {
  id: string;
  name: string;
  kind: string;
  docs: number;
  client: string;
  opened: string;
  deadline?: string;
};

const MATTERS: Matter[] = [
  { id: 'leroy',  name: 'Leroy c/ Merlin',       kind: 'Contentieux commercial', docs: 7,  client: 'SARL Leroy',  opened: '14 mars 2026', deadline: '21 j' },
  { id: 'dupuis', name: 'Dupuis — succession',   kind: 'Droit patrimonial',      docs: 12, client: 'Mme Dupuis',  opened: '2 oct. 2025' },
  { id: 'moreau', name: 'Moreau — licenciement', kind: 'Droit du travail',       docs: 4,  client: 'M. Moreau',   opened: '8 mai 2026' },
];

export default function Matters() {
  return (
    <PageShell
      eyebrow="Données de démonstration"
      title="Matters"
      lede="Affaires utilisées par les scénarios. Toutes les références aux documents (contrats, conclusions, emails) pointent ici."
    >
      <ul className="border border-zinc-200 rounded-md divide-y divide-zinc-100">
        {MATTERS.map((m) => (
          <li key={m.id} className="px-5 py-4 grid grid-cols-[40px_1fr_140px_100px] items-center gap-4">
            <span className="inline-flex items-center justify-center size-8 rounded bg-zinc-900 text-white t-small-semibold">
              {m.name[0]}
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-3">
                <span className="t-base-medium text-zinc-900 truncate">{m.name}</span>
                <span className="t-micro text-zinc-500">{m.kind}</span>
              </div>
              <p className="t-small-regular text-zinc-500 mt-0.5">
                {m.client} · ouverte le {m.opened}
              </p>
            </div>
            <div className="t-mono t-small-regular text-zinc-500 tabular-nums">
              {m.docs} documents
            </div>
            <div className="text-right">
              {m.deadline && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-zinc-900 bg-zinc-900 t-small-regular text-white">
                  {m.deadline}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
