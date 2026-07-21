import { useState } from 'react';
import { CompactSettings } from './components/CompactSettings';
import { Chatbot } from './components/Chatbot';
import { ContextPickers } from './components/ContextPickers';
import { ActionPicker } from './components/ActionPicker';
import { ImportManager } from './components/ImportManager';
import { ConnectorsBrowser } from './components/ConnectorsBrowser';
import { Icon } from './components/ui';

export default function App() {
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <div className="h-screen flex bg-zinc-100">
      {panelOpen ? (
        <CompactSettings onCollapse={() => setPanelOpen(false)} />
      ) : (
        <button
          onClick={() => setPanelOpen(true)}
          title="Show panel"
          className="fixed top-2.5 left-2.5 z-50 size-7 grid place-items-center rounded-md bg-white border border-zinc-200 shadow-sm text-zinc-600 hover:text-zinc-900"
        >
          <Icon name="columns" className="size-4" />
        </button>
      )}
      <main className="flex-1 min-w-0 flex flex-col">
        <Chatbot />
      </main>
      {/* ImportManager first so a source picker (ContextPickers) opened from
          inside it paints ABOVE it (same z, later-in-DOM wins). */}
      <ImportManager />
      <ContextPickers />
      <ActionPicker />
      {/* Layers above ContextPickers (higher z-index) so it can open on top
          of the Sources drawer without closing it. */}
      <ConnectorsBrowser />
    </div>
  );
}
