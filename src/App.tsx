import { ScenarioTabs } from './components/ScenarioTabs';
import { Chatbot } from './components/Chatbot';
import { ConfigPanel } from './components/ConfigPanel';

export default function App() {
  return (
    <div className="h-screen flex flex-col bg-white">
      <ScenarioTabs />
      <Chatbot />
      <ConfigPanel />
    </div>
  );
}
