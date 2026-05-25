import { TopBar } from './TopBar';
import { ControlRail } from './ControlRail';
import { ChatbotCanvas } from './canvas/ChatbotCanvas';
import { StatusBar } from './StatusBar';

export function Shell() {
  return (
    <div className="h-screen flex flex-col bg-white">
      <TopBar />
      <div className="flex-1 flex min-h-0">
        <ControlRail />
        <ChatbotCanvas />
      </div>
      <StatusBar />
    </div>
  );
}
