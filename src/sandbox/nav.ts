/**
 * Sidebar definition for the Doctrine Assistant Sandbox.
 * Order matches the Ceros-style density: a mix of content-heavy sections
 * and lighter / placeholder ones, all under one categorical nav.
 */

export type NavItem = {
  to: string;
  icon: string; // lucide id inside icons.svg (no `i-` prefix)
  label: string;
  /** Optional badge or status pill displayed on the right. */
  badge?: 'soon' | 'mock';
};

export const NAV: NavItem[] = [
  { to: '/getting-started', icon: 'sparkles',  label: 'Getting Started' },
  { to: '/dashboard',       icon: 'list',      label: 'Dashboard' },
  { to: '/primitives',      icon: 'list',      label: 'Primitives' },
  { to: '/scenarios',       icon: 'message',   label: 'Scenarios' },
  { to: '/sources',         icon: 'folder',    label: 'Sources' },
  { to: '/matters',         icon: 'file-text', label: 'Matters' },
  { to: '/conversations',   icon: 'message',   label: 'Conversations' },
  { to: '/activity',        icon: 'search',    label: 'Activity', badge: 'mock' },
  { to: '/tools',           icon: 'pen',       label: 'Tools',    badge: 'mock' },
  { to: '/policy',          icon: 'scales',    label: 'Policy',   badge: 'soon' },
  { to: '/settings',        icon: 'plus',      label: 'Settings' },
];

export function findNavByPath(pathname: string): NavItem | undefined {
  return NAV.find((n) => pathname === n.to || pathname.startsWith(n.to + '/'));
}
