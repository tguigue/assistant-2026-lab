import { useState } from 'react';
import { useComposition } from '../state/store';
import { PRIMITIVE_IDS, PRIMITIVE_LABELS } from '../state/types';
import { Tabs } from './ui';

type Tab = 'config' | 'inspector';

export function InspectorPanel() {
  const [tab, setTab] = useState<Tab>('config');
  const { composition } = useComposition();

  const json = JSON.stringify(
    {
      preset: composition.preset,
      scenario: composition.scenario,
      primitives: composition.primitives,
      sources: composition.sources,
    },
    null,
    2,
  );

  return (
    <aside className="overflow-hidden bg-white border-l border-zinc-200 flex flex-col min-h-0">
      <div className="px-4 pt-3">
        <div className="t-micro text-zinc-500 mb-3">Inspector</div>
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'config', label: 'Config' },
            { value: 'inspector', label: 'Primitives' },
          ]}
        />
      </div>

      {tab === 'config' && (
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="t-micro text-zinc-500">composition.json</span>
            <button
              className="t-small-medium text-zinc-500 hover:text-zinc-900"
              onClick={() => navigator.clipboard?.writeText(json)}
              title="Copier"
            >
              copier
            </button>
          </div>
          <pre className="t-mono text-[11.5px] leading-[1.55] text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-md p-3 whitespace-pre-wrap">
            {json}
          </pre>
        </div>
      )}

      {tab === 'inspector' && (
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-4">
          <div className="t-micro text-zinc-500 mb-3">Statut par primitive</div>
          <ul className="space-y-1.5">
            {PRIMITIVE_IDS.map((id) => {
              const meta = PRIMITIVE_LABELS[id];
              const role = composition.primitives[id];
              return (
                <li key={id} className="flex items-baseline gap-3 py-1.5 border-b border-zinc-100">
                  <span className="t-mono t-small-medium text-zinc-500 tabular-nums w-6 shrink-0">{meta.code}</span>
                  <span className="t-base-medium text-zinc-900 flex-1 min-w-0 truncate">{meta.name}</span>
                  <RoleBadge role={role} />
                </li>
              );
            })}
          </ul>

          <div className="t-micro text-zinc-500 mt-6 mb-2">Sources actives</div>
          <ul className="space-y-1 t-small-regular text-zinc-700">
            {Object.entries(composition.sources).map(([k, on]) => (
              <li key={k} className="flex items-center gap-2">
                <span
                  className={
                    on
                      ? 'inline-block size-1.5 rounded-full bg-zinc-900'
                      : 'inline-block size-1.5 rounded-full bg-zinc-300'
                  }
                />
                <span className={on ? 'text-zinc-900' : 'text-zinc-400'}>{k}</span>
              </li>
            ))}
          </ul>

          <div className="t-micro text-zinc-500 mt-6 mb-2">Diagnostic</div>
          <Diagnostic />
        </div>
      )}
    </aside>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    dominant: 'bg-zinc-900 text-white',
    secondary: 'bg-zinc-200 text-zinc-700',
    absent: 'bg-transparent text-zinc-400 border border-dashed border-zinc-300',
  };
  return (
    <span className={'t-small-medium px-1.5 py-0.5 rounded ' + styles[role]}>
      {role}
    </span>
  );
}

function Diagnostic() {
  const { composition: c } = useComposition();
  const p = c.primitives;
  const notes: string[] = [];

  if (p.intent === 'absent' && p.preamble === 'absent') {
    notes.push('Sans intent chip ni preamble, l’utilisateur ne sait pas ce que l’Assistant va faire avant la réponse.');
  }
  if (p.artifact === 'dominant' && c.scenario !== 'draft') {
    notes.push('Le scénario actuel n’a pas d’artifact à afficher — le panneau split sera vide.');
  }
  if (p.matter === 'dominant' && p.sources === 'dominant') {
    notes.push('Matter dominant + source row dominant : densité visuelle importante en haut de l’écran.');
  }
  if (p.provenance === 'absent') {
    notes.push('Sans provenance, les citations seront supprimées — réponses moins traçables.');
  }
  const activeSources = Object.values(c.sources).filter(Boolean).length;
  if (activeSources === 0) {
    notes.push('Aucune source active : l’Assistant n’aura rien à interroger.');
  }

  if (notes.length === 0) {
    return <p className="t-small-regular text-zinc-400 italic">Aucune incohérence détectée.</p>;
  }

  return (
    <ul className="space-y-1.5 t-small-regular text-zinc-700">
      {notes.map((n, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="inline-block size-1 rounded-full bg-zinc-900 mt-2 shrink-0" />
          <span>{n}</span>
        </li>
      ))}
    </ul>
  );
}
