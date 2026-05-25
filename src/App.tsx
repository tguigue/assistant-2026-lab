import { useChatbot } from './chatbot/store';
import { ViewToggle } from './components/ViewToggle';
import { ScenarioTabs } from './components/ScenarioTabs';
import { Chatbot } from './components/Chatbot';
import { ConfigPanel } from './components/ConfigPanel';
import { PrimitiveCatalog } from './components/catalog/PrimitiveCatalog';

export default function App() {
  const view = useChatbot((s) => s.view);

  return (
    <div className="h-screen flex flex-col bg-white">
      <ViewToggle />
      {view === 'catalog' ? (
        <PrimitiveCatalog />
      ) : (
        <>
          <ScenarioTabs />
          <Chatbot />
          <ConfigPanel />
        </>
      )}
    </div>
  );
}
