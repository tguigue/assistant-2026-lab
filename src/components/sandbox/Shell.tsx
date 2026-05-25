import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { SandboxFlyout } from './SandboxFlyout';

export function Shell() {
  return (
    <div className="relative h-screen flex flex-col bg-white">
      <TopBar />
      <div className="flex-1 flex min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto scrollbar-thin bg-white">
          <Outlet />
        </main>
      </div>
      <SandboxFlyout />
    </div>
  );
}
