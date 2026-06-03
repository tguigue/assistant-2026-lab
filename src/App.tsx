import { useState } from 'react';
import { CompactSettings } from './components/CompactSettings';
import { Chatbot } from './components/Chatbot';
import { ContextPickers } from './components/ContextPickers';
import { ActionPicker } from './components/ActionPicker';
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
          title="Afficher le panneau"
          className="fixed top-3 left-3 z-50 inline-flex items-center justify-center size-9 rounded-lg border border-zinc-200 bg-white shadow-sm text-zinc-600 hover:text-zinc-900 hover:border-zinc-300"
        >
          <Icon name="columns" className="size-4" />
        </button>
      )}
      <main className="flex-1 min-w-0 flex flex-col">
        <Chatbot />
      </main>
      <ContextPickers />
      <ActionPicker />
    </div>
  );
}
