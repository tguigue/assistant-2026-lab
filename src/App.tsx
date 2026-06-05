import { useState } from 'react';
import { CompactSettings } from './components/CompactSettings';
import { Chatbot } from './components/Chatbot';
import { ContextPickers } from './components/ContextPickers';
import { ActionPicker } from './components/ActionPicker';
import { IconButtonV2 } from '@doctrinelegal/design-system/button';

export default function App() {
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <div className="h-screen flex bg-zinc-100">
      {panelOpen ? (
        <CompactSettings onCollapse={() => setPanelOpen(false)} />
      ) : (
        <div className="fixed top-2.5 left-2.5 z-50 rounded-md bg-white border border-zinc-200 shadow-sm">
          <IconButtonV2 iconName="dock_to_left" size="small" onClick={() => setPanelOpen(true)} ariaLabel="Show panel" title="Show panel" />
        </div>
      )}
      <main className="flex-1 min-w-0 flex flex-col">
        <Chatbot />
      </main>
      <ContextPickers />
      <ActionPicker />
    </div>
  );
}
