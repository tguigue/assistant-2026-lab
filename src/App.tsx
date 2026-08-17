import { useEffect, useState } from 'react';
import { CompactSettings } from './components/CompactSettings';
import { Chatbot } from './components/Chatbot';
import { ContextPickers } from './components/ContextPickers';
import { ActionPicker } from './components/ActionPicker';
import { ImportManager } from './components/ImportManager';
import { ConnectorsBrowser } from './components/ConnectorsBrowser';
import { useMediaQuery } from './components/SurfaceScope';
import { Icon } from './components/ui';

export default function App() {
  // Below 768px the 340px panel would leave the canvas ~50px, so it stops being
  // a column and becomes an overlay drawer, closed by default. That's what makes
  // "just resize the window" a real way to preview narrow: the canvas gets the
  // whole window, and the panel is one tap away over it.
  //
  // Between 768 and ~1000 you get the useful middle: panel docked on the left,
  // canvas already narrow enough to render the phone layout beside it.
  const drawer = useMediaQuery('(max-width: 767px)');
  const [panelOpen, setPanelOpen] = useState(true);
  useEffect(() => { setPanelOpen(!drawer); }, [drawer]);

  return (
    <div className="h-screen flex bg-zinc-100">
      {panelOpen ? (
        drawer ? (
          <>
            <div className="fixed inset-0 z-40 bg-zinc-900/20" onClick={() => setPanelOpen(false)} />
            <CompactSettings
              onCollapse={() => setPanelOpen(false)}
              className="fixed inset-y-0 left-0 z-50 max-w-[88%] shadow-xl"
            />
          </>
        ) : (
          <CompactSettings onCollapse={() => setPanelOpen(false)} />
        )
      ) : (
        <button
          onClick={() => setPanelOpen(true)}
          title="Show panel"
          className="fixed top-2.5 left-2.5 z-50 size-11 grid place-items-center rounded-md bg-white border border-zinc-200 shadow-sm text-zinc-600 hover:text-zinc-900 sm:size-9"
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
