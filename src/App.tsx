import { CompactSettings } from './components/CompactSettings';
import { Chatbot } from './components/Chatbot';
import { ContextPickers } from './components/ContextPickers';
import { ActionPicker } from './components/ActionPicker';

export default function App() {
  return (
    <div className="h-screen flex bg-zinc-100">
      <CompactSettings />
      <main className="flex-1 min-w-0 flex flex-col">
        <Chatbot />
      </main>
      <ContextPickers />
      <ActionPicker />
    </div>
  );
}
