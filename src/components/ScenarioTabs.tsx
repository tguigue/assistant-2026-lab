import { useChatbot } from '../chatbot/store';
import { SCENARIOS } from '../chatbot/scenarios';
import { SCENARIO_IDS, type ScenarioId } from '../chatbot/types';
import { Icon } from './ui';

export function ScenarioTabs() {
  const scenario = useChatbot((s) => s.comp.scenario);
  const setScenario = useChatbot((s) => s.setScenario);
  const modified = useChatbot((s) => s.comp.modified);
  const configOpen = useChatbot((s) => s.configOpen);
  const toggleConfigPanel = useChatbot((s) => s.toggleConfigPanel);

  return (
    <header className="h-12 shrink-0 border-b border-zinc-200 bg-white flex items-stretch">
      {/* Left: brand */}
      <div className="flex items-center gap-2 px-4 border-r border-zinc-100">
        <span className="inline-flex items-center justify-center size-6 rounded bg-zinc-900 text-white t-small-semibold leading-none">D</span>
        <span className="t-small-semibold text-zinc-900">Assistant</span>
      </div>

      {/* Tabs */}
      <nav className="flex items-stretch" role="tablist">
        {SCENARIO_IDS.map((id) => {
          const active = scenario === id;
          const s = SCENARIOS[id];
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => setScenario(id as ScenarioId)}
              className={
                'h-full px-4 inline-flex items-center gap-2 border-b-2 -mb-px transition-colors ' +
                (active
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900')
              }
            >
              <span className="t-mono t-small-medium text-zinc-400 tabular-nums">{s.code}</span>
              <span className="t-small-medium">{s.title}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: config button + modified indicator */}
      <div className="ml-auto flex items-center gap-3 px-3">
        {modified && (
          <span className="t-mono t-small-regular text-amber-700">
            <span className="inline-block size-1.5 rounded-full bg-amber-600 mr-1.5 align-middle" />
            modifié
          </span>
        )}
        <button
          onClick={toggleConfigPanel}
          className={
            'inline-flex items-center gap-1.5 h-7 px-2 rounded-md border t-small-medium transition-colors ' +
            (configOpen
              ? 'border-zinc-900 bg-zinc-900 text-white'
              : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400')
          }
          aria-pressed={configOpen}
          title="Open / close the configuration panel"
        >
          <Icon name="plus" className="size-3 -rotate-45" />
          Configuration
        </button>
      </div>
    </header>
  );
}
