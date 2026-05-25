import { useLocation } from 'react-router-dom';
import { useSandbox } from '../../state/store';
import { findNavByPath } from '../../sandbox/nav';

export function TopBar() {
  const { pathname } = useLocation();
  const current = findNavByPath(pathname);
  const toggleFlyout = useSandbox((s) => s.toggleFlyout);

  return (
    <header className="h-12 shrink-0 bg-white border-b border-zinc-200 flex items-center justify-between px-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="inline-flex items-center justify-center size-6 rounded bg-zinc-900 text-white t-small-semibold leading-none">D</span>
        <span className="t-base-semibold text-zinc-900">Doctrine Assistant · Sandbox</span>
        {current && (
          <>
            <span className="text-zinc-300">/</span>
            <span className="t-base-regular text-zinc-500 truncate">{current.label}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-5">
        <a className="t-small-medium text-zinc-500 hover:text-zinc-900 underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-900" href="#">
          Slack
        </a>
        <a className="t-small-medium text-zinc-500 hover:text-zinc-900 underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-900" href="#">
          Docs
        </a>
        <a
          className="t-small-medium text-zinc-500 hover:text-zinc-900 underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-900"
          href="https://github.com/tguigue/assistant-2026-lab"
        >
          GitHub
        </a>
        <button
          onClick={toggleFlyout}
          className="inline-flex items-center justify-center size-7 rounded-md border border-zinc-200 bg-white hover:border-zinc-400 transition-colors"
          aria-label="Sandbox toggles"
          title="Sandbox toggles"
        >
          <span className="t-small-semibold text-zinc-900">JD</span>
        </button>
      </div>
    </header>
  );
}
