import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from './components/sandbox/Shell';
import GettingStarted from './pages/GettingStarted';
import Dashboard from './pages/Dashboard';
import Primitives from './pages/Primitives';
import Scenarios from './pages/Scenarios';
import Sources from './pages/Sources';
import Matters from './pages/Matters';
import Conversations from './pages/Conversations';
import Activity from './pages/Activity';
import Tools from './pages/Tools';
import Policy from './pages/Policy';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<Navigate to="/getting-started" replace />} />
          <Route path="getting-started" element={<GettingStarted />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="primitives" element={<Primitives />} />
          <Route path="scenarios" element={<Scenarios />} />
          <Route path="scenarios/:id" element={<Scenarios />} />
          <Route path="sources" element={<Sources />} />
          <Route path="matters" element={<Matters />} />
          <Route path="conversations" element={<Conversations />} />
          <Route path="activity" element={<Activity />} />
          <Route path="tools" element={<Tools />} />
          <Route path="policy" element={<Policy />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
