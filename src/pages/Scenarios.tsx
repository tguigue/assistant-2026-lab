import { Link, useParams } from 'react-router-dom';
import { PageShell, PageSection } from '../components/sandbox/PageShell';
import { FlowRunner } from '../components/sandbox/FlowRunner';
import { SCENARIO_IDS, SCENARIO_LABELS } from '../state/types';
import type { ScenarioId } from '../state/types';
import { SCENARIOS } from '../scenarios/data';
import { FLOW_VARIANTS } from '../sandbox/flowVariants';
import { Icon } from '../components/ui';

export default function Scenarios() {
  const { id } = useParams<{ id: ScenarioId }>();
  if (id && SCENARIO_IDS.includes(id)) return <ScenarioDetail id={id} />;
  return <ScenarioIndex />;
}

function ScenarioIndex() {
  return (
    <PageShell
      eyebrow="Quatre scénarios canoniques"
      title="Scenarios"
      lede="Les 4 scénarios du document Notion exécutés via le Flow Runner. Chaque scénario propose plusieurs variantes (premier passage, source en conflit, ambiguïté, hors périmètre)."
    >
      <ul className="border border-zinc-200 rounded-md divide-y divide-zinc-100">
        {SCENARIO_IDS.map((sid) => {
          const meta = SCENARIO_LABELS[sid];
          const s = SCENARIOS[sid];
          const variantCount = FLOW_VARIANTS[sid].length;
          return (
            <li key={sid}>
              <Link
                to={`/scenarios/${sid}`}
                className="grid grid-cols-[80px_1fr_180px_24px] gap-4 items-baseline px-5 py-4 hover:bg-zinc-50 transition-colors"
              >
                <span className="t-mono t-small-medium text-zinc-400 tabular-nums">{meta.code}</span>
                <div className="min-w-0">
                  <div className="t-base-medium text-zinc-900">{meta.name}</div>
                  <div className="t-small-regular text-zinc-500 italic font-legal truncate mt-0.5">« {s.prompt} »</div>
                </div>
                <div className="t-mono t-small-regular text-zinc-500 tabular-nums">
                  {variantCount} variantes
                </div>
                <Icon name="arrow-right" className="size-3.5 text-zinc-400" />
              </Link>
            </li>
          );
        })}
      </ul>
    </PageShell>
  );
}

function ScenarioDetail({ id }: { id: ScenarioId }) {
  const meta = SCENARIO_LABELS[id];
  const s = SCENARIOS[id];
  const otherIds = SCENARIO_IDS.filter((x) => x !== id);

  return (
    <PageShell
      eyebrow={`Scénarios · ${meta.code}`}
      title={meta.name}
      lede={undefined}
      actions={
        <Link
          to="/scenarios"
          className="t-small-medium text-zinc-500 hover:text-zinc-900 underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-900"
        >
          ← Tous
        </Link>
      }
    >
      <blockquote className="font-legal text-[18px] leading-[1.75] text-zinc-900 border-l-2 border-zinc-300 pl-4 mb-8">
        « {s.prompt} »
      </blockquote>

      <PageSection eyebrow="Flow Runner" title="Simuler une variante" hint="Sélectionnez une variante et cliquez sur Run. La sortie est scriptée — aucun appel LLM réel.">
        <FlowRunner scenario={id} />
      </PageSection>

      <PageSection eyebrow="Sources mobilisées" title="Citations">
        <ul className="grid grid-cols-1 gap-1.5">
          {Object.entries(s.citations).map(([k, c]) => (
            <li key={k} className="flex items-baseline gap-3 t-small-regular text-zinc-600">
              <span
                className={
                  c.kind === 'internal'
                    ? 'cite-pill cite-pill--internal shrink-0'
                    : 'cite-pill shrink-0'
                }
              >
                {c.label}
              </span>
              <span className="text-zinc-500">{c.full}</span>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection eyebrow="Voir aussi" title="Autres scénarios">
        <ul className="flex flex-wrap gap-3 t-base-regular">
          {otherIds.map((oid) => (
            <li key={oid}>
              <Link
                to={`/scenarios/${oid}`}
                className="text-zinc-900 underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-900"
              >
                {SCENARIO_LABELS[oid].code} · {SCENARIO_LABELS[oid].name}
              </Link>
            </li>
          ))}
        </ul>
      </PageSection>
    </PageShell>
  );
}
