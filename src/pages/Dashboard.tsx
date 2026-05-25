import { Link } from 'react-router-dom';
import { PageShell, PageSection } from '../components/sandbox/PageShell';
import { SCENARIO_LABELS, SCENARIO_IDS } from '../state/types';
import { SCENARIOS } from '../scenarios/data';
import { FLOW_VARIANTS } from '../sandbox/flowVariants';
import { Icon } from '../components/ui';

export default function Dashboard() {
  return (
    <PageShell
      eyebrow="Vue d’ensemble"
      title="Dashboard"
      lede="Les quatre scénarios canoniques en un coup d’œil, plus un échantillon d’événements récents."
    >
      <div className="grid grid-cols-2 gap-3">
        {SCENARIO_IDS.map((id) => {
          const meta = SCENARIO_LABELS[id];
          const variantCount = FLOW_VARIANTS[id].length;
          const scenario = SCENARIOS[id];
          return (
            <Link
              key={id}
              to={`/scenarios/${id}`}
              className="block border border-zinc-200 rounded-md p-5 hover:border-zinc-400 transition-colors"
            >
              <div className="flex items-baseline gap-2 mb-2">
                <span className="t-mono t-small-medium text-zinc-400 tabular-nums">{meta.code}</span>
                <h3 className="t-title-4 text-zinc-900">{meta.name}</h3>
              </div>
              <p className="t-base-regular text-zinc-600 italic mb-4 line-clamp-2 font-legal">« {scenario.prompt} »</p>
              <div className="flex items-center gap-3 t-small-regular text-zinc-500">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="message" className="size-3" />
                  {variantCount} variantes
                </span>
                <span className="text-zinc-300">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="folder" className="size-3" />
                  {Object.keys(scenario.citations).length} sources
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <PageSection eyebrow="Mock" title="Activité récente">
        <ul className="border border-zinc-200 rounded-md divide-y divide-zinc-100">
          {SAMPLE_ACTIVITY.map((row, i) => (
            <li key={i} className="px-4 py-2.5 flex items-center gap-3 t-small-regular">
              <span className="t-mono text-zinc-400 tabular-nums w-16 shrink-0">{row.time}</span>
              <span className={'status-dot ' + (row.status === 'ok' ? 'status-dot--on' : row.status === 'warn' ? 'status-dot--warn' : 'status-dot--off')} />
              <span className="text-zinc-700 flex-1 min-w-0 truncate">{row.label}</span>
              <span className="t-mono text-zinc-400 tabular-nums">{row.meta}</span>
            </li>
          ))}
        </ul>
      </PageSection>
    </PageShell>
  );
}

const SAMPLE_ACTIVITY = [
  { time: '14:23', status: 'ok',   label: 'research · "harcèlement points hebdo"', meta: 'first-run · 312ms' },
  { time: '14:21', status: 'ok',   label: 'draft · contrat architecte v1', meta: 'clausier · 8 art.' },
  { time: '14:18', status: 'warn', label: 'internal · ambiguous match (Leroy)', meta: '2 matters' },
  { time: '14:12', status: 'ok',   label: 'analyse · Conclusions_def.pdf', meta: 'matter:leroy · 7 hits' },
  { time: '14:04', status: 'off',  label: 'session start · jane.doe@doctrine.fr', meta: 'env:local' },
];
