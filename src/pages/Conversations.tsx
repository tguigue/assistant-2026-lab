import { PageShell } from '../components/sandbox/PageShell';
import { SCENARIO_IDS, SCENARIO_LABELS } from '../state/types';
import { SCENARIOS } from '../scenarios/data';
import { Link } from 'react-router-dom';

export default function Conversations() {
  return (
    <PageShell
      eyebrow="Historique"
      title="Conversations"
      lede="Threads de chat correspondant aux quatre scénarios. Chacun renvoie vers la page Scenarios pour rejouer le flow."
    >
      <ul className="space-y-3">
        {SCENARIO_IDS.map((id) => {
          const meta = SCENARIO_LABELS[id];
          const s = SCENARIOS[id];
          return (
            <li key={id} className="border border-zinc-200 rounded-md p-5">
              <div className="flex items-baseline justify-between gap-3 mb-3">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="t-mono t-small-medium text-zinc-400 tabular-nums">{meta.code}</span>
                  <h3 className="t-title-4 text-zinc-900 truncate">{meta.name}</h3>
                </div>
                <Link
                  to={`/scenarios/${id}`}
                  className="t-small-medium text-zinc-500 hover:text-zinc-900 underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-900 shrink-0"
                >
                  Rejouer →
                </Link>
              </div>

              <div className="flex justify-end mb-3">
                <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-md bg-zinc-900 text-white t-base-regular">
                  {s.prompt}
                </div>
              </div>
              <div className="font-legal text-[15px] leading-[1.7] text-zinc-900 italic line-clamp-3">
                « {(s.answer[0] as { kind: 'p'; html: string }).html
                  .replace(/\[\[\w+\]\]/g, '')
                  .replace(/<[^>]+>/g, '')} »
              </div>
            </li>
          );
        })}
      </ul>
    </PageShell>
  );
}
