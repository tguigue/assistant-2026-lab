import { useLab } from '../lab/store';
import { SCENARIOS } from '../lab/scenarios';

export function TopBar() {
  const scenario = useLab((s) => s.comp.scenario);
  return (
    <header className="h-12 shrink-0 bg-white border-b border-zinc-200 flex items-center justify-between px-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="inline-flex items-center justify-center size-6 rounded bg-zinc-900 text-white t-small-semibold leading-none">D</span>
        <span className="t-base-semibold text-zinc-900">Doctrine</span>
        <span className="text-zinc-300">·</span>
        <span className="t-base-regular text-zinc-500">Chatbot Sandbox</span>
        <span className="text-zinc-300">/</span>
        <span className="t-small-regular text-zinc-500 t-mono">{SCENARIOS[scenario].code}</span>
      </div>
      <div className="flex items-center gap-4">
        <a
          className="t-small-medium text-zinc-500 hover:text-zinc-900 underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-900"
          href="https://github.com/tguigue/assistant-2026-lab"
        >
          GitHub
        </a>
        <span className="t-mono t-small-regular text-zinc-400">v0.3</span>
      </div>
    </header>
  );
}
