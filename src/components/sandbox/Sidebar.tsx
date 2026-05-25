import { NavLink } from 'react-router-dom';
import { NAV } from '../../sandbox/nav';
import { Icon } from '../ui';

export function Sidebar() {
  return (
    <aside className="w-[240px] shrink-0 bg-zinc-50 border-r border-zinc-200 overflow-y-auto scrollbar-thin">
      <div className="px-4 pt-5 pb-3">
        <div className="t-micro text-zinc-500">Doctrine Assistant</div>
        <div className="t-base-semibold text-zinc-900 mt-0.5">Sandbox</div>
        <div className="t-small-regular text-zinc-400 mt-0.5">tguigue · v0.2</div>
      </div>

      <nav className="py-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              'sidebar-link ' + (isActive ? 'is-active' : '')
            }
          >
            <Icon name={item.icon} className="sidebar-icon" />
            <span className="truncate">{item.label}</span>
            {item.badge && (
              <span className="sidebar-badge">
                {item.badge === 'soon' ? 'soon' : 'mock'}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 mt-2 border-t border-zinc-200">
        <div className="t-micro text-zinc-500 mb-2">Liens</div>
        <ul className="space-y-1 t-small-regular">
          <li>
            <a href="https://github.com/tguigue/assistant-2026-lab" className="text-zinc-600 hover:text-zinc-900 underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-900">
              GitHub repo
            </a>
          </li>
          <li>
            <a href="https://github.com/tguigue/assistant-2026-prototypes" className="text-zinc-600 hover:text-zinc-900 underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-900">
              Prototypes repo
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
}
