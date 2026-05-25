import { ControlsPanel } from './ControlsPanel';
import { LivePreview } from './LivePreview';
import { InspectorPanel } from './InspectorPanel';
import { StatusBar } from './StatusBar';

export function Shell() {
  return (
    <div className="h-screen flex flex-col bg-zinc-50">
      {/* App header */}
      <header className="h-12 border-b border-zinc-200 bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="size-6 rounded bg-zinc-900 inline-flex items-center justify-center">
            <span className="text-white t-small-semibold leading-none">D</span>
          </div>
          <div className="t-base-semibold text-zinc-900">Assistant 2026 — Lab</div>
          <span className="t-micro text-zinc-400">composition dashboard</span>
        </div>
        <div className="t-small-regular text-zinc-400">
          <a href="https://github.com/tguigue/assistant-2026-lab" className="hover:text-zinc-900 transition-colors">
            tguigue/assistant-2026-lab
          </a>
        </div>
      </header>

      {/* 3-pane body */}
      <div className="flex-1 grid grid-shell min-h-0">
        <ControlsPanel />
        <LivePreview />
        <InspectorPanel />
      </div>

      <StatusBar />
    </div>
  );
}
