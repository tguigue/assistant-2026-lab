import { CompactSettings } from './components/CompactSettings';
import { Chatbot } from './components/Chatbot';
import { SourcesPanel } from './components/SourcesPanel';

export default function App() {
  return (
    <div className="h-screen flex bg-zinc-100">
      <CompactSettings />
      <main className="flex-1 min-w-0 flex flex-col">
        <Chatbot />
      </main>
      <SourcesPanel />
    </div>
  );
}
