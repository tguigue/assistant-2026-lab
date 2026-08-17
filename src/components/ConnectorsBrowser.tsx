import { useState } from 'react';
import { useChatbot } from '../chatbot/store';
import { Button, Icon, Separator, cn, modalShell } from './ui';
import { useNarrowOverlay } from './SurfaceScope';
import { Overlay } from './OverlayHost';

/* ----------------------------------------------------------------------
   C15 — Connecteurs. "Parcourir les connecteurs" catalogue modal: search +
   category filter over a grid of app cards (GED, e-mail & agenda, sources
   juridiques, outils). Each card is a self-contained connect/disconnect
   toggle — demo state only, no real auth wired.
   Opened from the Sources panel ("+ Connecteurs") over the canvas, or by
   toggling this primitive visible in design mode (same dual-trigger pattern
   as C14 Import manager).
   ---------------------------------------------------------------------- */

type Category = 'ged' | 'email' | 'juridique' | 'outils';

type Connector = {
  id: string;
  name: string;
  desc: string;
  category: Category;
  /** Real logo asset when we have one. */
  iconSrc?: string;
  /** Sprite glyph, tinted via `color`. */
  icon?: string;
  /** 1–2 letter monogram fallback when neither of the above fits. */
  mono?: string;
  /** Tailwind bg-* class for the icon/monogram tile. */
  color?: string;
  connectedByDefault?: boolean;
};

const CATEGORY_LABEL: Record<Category, string> = {
  ged: 'GED',
  email: 'Email & Agenda',
  juridique: 'Juridique',
  outils: 'Outils',
};

const TABS: { id: 'all' | Category; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'ged', label: CATEGORY_LABEL.ged },
  { id: 'email', label: CATEGORY_LABEL.email },
  { id: 'juridique', label: CATEGORY_LABEL.juridique },
  { id: 'outils', label: CATEGORY_LABEL.outils },
];

const CONNECTORS: Connector[] = [
  // ---- GED ----
  { id: 'sharepoint', name: 'Sharepoint', category: 'ged', iconSrc: '/icons/sharepoint.png', connectedByDefault: true,
    desc: 'Connecter votre Sharepoint pour réutiliser toutes les données dans les différents outils de Doctrine.' },
  { id: 'imanage', name: 'iManage', category: 'ged', mono: 'iM', color: 'bg-blue-600',
    desc: 'Accédez à vos documents iManage pour compléter les sources de l’Assistant.' },
  { id: 'onedrive', name: 'OneDrive', category: 'ged', iconSrc: '/icons/onedrive.png',
    desc: 'Connecter votre OneDrive pour réutiliser vos fichiers dans l’Assistant.' },
  { id: 'gdrive', name: 'Google Drive', category: 'ged', iconSrc: '/icons/drive.png',
    desc: 'Connecter votre Google Drive pour réutiliser vos fichiers dans l’Assistant.' },
  { id: 'egnyte', name: 'Egnyte', category: 'ged', iconSrc: '/icons/egnyte.png',
    desc: 'Connecter votre Egnyte pour réutiliser vos fichiers dans l’Assistant.' },
  { id: 'box', name: 'Box', category: 'ged', icon: 'box', color: 'bg-sky-600',
    desc: 'Connecter votre Box pour réutiliser vos fichiers dans l’Assistant.' },
  { id: 'actaport', name: 'Actaport', category: 'ged', icon: 'actaport', color: 'bg-zinc-700',
    desc: 'Connecter votre Actaport pour réutiliser vos actes dans l’Assistant.' },

  // ---- Email & Agenda ----
  { id: 'outlook', name: 'Outlook', category: 'email', mono: 'O', color: 'bg-blue-700',
    desc: 'Connectez votre compte Outlook pour rechercher et réutiliser le contenu issu de vos emails.' },
  { id: 'gmail', name: 'Gmail', category: 'email', mono: 'G', color: 'bg-red-500',
    desc: 'Connectez votre compte Gmail pour rechercher et réutiliser le contenu issu de vos emails.' },
  { id: 'gcal', name: 'Google Calendar', category: 'email', mono: 'GC', color: 'bg-emerald-600',
    desc: 'Connectez votre agenda Google pour que l’Assistant tienne compte de vos échéances.' },
  { id: 'ocal', name: 'Outlook Calendar', category: 'email', mono: 'OC', color: 'bg-sky-700',
    desc: 'Connectez votre agenda Outlook pour que l’Assistant tienne compte de vos échéances.' },

  // ---- Juridique ----
  { id: 'secib', name: 'Secib', category: 'juridique', mono: 'Se', color: 'bg-orange-600',
    desc: 'Accédez aux données de Secib pour compléter les sources de l’Assistant.' },
  { id: 'datagouv', name: 'Data Gouv', category: 'juridique', mono: 'DG', color: 'bg-indigo-700',
    desc: 'Accédez aux données de DataGouv pour compléter les sources de l’Assistant.' },
  { id: 'lexisnexis', name: 'Lexis Nexis', category: 'juridique', mono: 'LN', color: 'bg-red-600',
    desc: 'Accédez aux données de Lexis Nexis pour compléter les sources de l’Assistant.' },
  { id: 'dalloz', name: 'Dalloz', category: 'juridique', mono: 'Da', color: 'bg-rose-600',
    desc: 'Accédez au fonds documentaire Dalloz pour enrichir les réponses de l’Assistant.' },
  { id: 'lamy', name: 'Lamy', category: 'juridique', mono: 'La', color: 'bg-amber-600',
    desc: 'Accédez au fonds documentaire Lamy pour enrichir les réponses de l’Assistant.' },

  // ---- Outils ----
  { id: 'slack', name: 'Slack', category: 'outils', mono: 'Sl', color: 'bg-violet-600',
    desc: 'Connectez Slack pour retrouver vos échanges d’équipe dans l’Assistant.' },
  { id: 'teams', name: 'Microsoft Teams', category: 'outils', mono: 'T', color: 'bg-indigo-600',
    desc: 'Connectez Teams pour retrouver vos échanges d’équipe dans l’Assistant.' },
  { id: 'notion', name: 'Notion', category: 'outils', mono: 'N', color: 'bg-zinc-900',
    desc: 'Connectez Notion pour réutiliser vos notes et bases dans l’Assistant.' },
  { id: 'salesforce', name: 'Salesforce', category: 'outils', mono: 'Sf', color: 'bg-sky-500',
    desc: 'Connectez Salesforce pour enrichir le contexte client de l’Assistant.' },
];

function ConnectorGlyph({ c }: { c: Connector }) {
  if (c.iconSrc) {
    return (
      <span className="size-10 rounded-xl border border-zinc-100 bg-white grid place-items-center shrink-0 overflow-hidden">
        <img src={c.iconSrc} alt="" className="size-6 object-contain" />
      </span>
    );
  }
  if (c.icon) {
    return (
      <span className={cn('size-10 rounded-xl grid place-items-center shrink-0 text-white', c.color)}>
        <Icon name={c.icon} className="size-5" />
      </span>
    );
  }
  return (
    <span className={cn('size-10 rounded-xl grid place-items-center shrink-0 text-white t-base-semibold', c.color)}>
      {c.mono}
    </span>
  );
}

export function ConnectorsBrowser() {
  const narrow = useNarrowOverlay();
  const explicitOpen = useChatbot((s) => s.connectorsBrowserOpen);
  const setOpen = useChatbot((s) => s.setConnectorsBrowserOpen);
  const previewOpen = useChatbot((s) => s.primitives.C15.visible);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);

  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | Category>('all');
  const [connected, setConnected] = useState<Set<string>>(
    () => new Set(CONNECTORS.filter((c) => c.connectedByDefault).map((c) => c.id)),
  );

  if (!explicitOpen && !previewOpen) return null;

  const close = () => { setOpen(false); if (previewOpen) setVisible('C15', false); };
  const toggle = (id: string) =>
    setConnected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const q = query.trim().toLowerCase();
  const visible = CONNECTORS.filter(
    (c) => (tab === 'all' || c.category === tab) && (!q || c.name.toLowerCase().includes(q)),
  );
  const countConnected = connected.size;

  return (
    <Overlay>
      <div className="fixed inset-0 bg-black/30 z-[60]" onClick={close} />
      <div className={modalShell('max-w-[720px]', narrow, '!z-[61]')}>
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <h2 className="flex-1 t-h2-semibold text-zinc-900">Parcourir les connecteurs</h2>
          <button onClick={close} className="size-7 grid place-items-center rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900">
            <Icon name="x" className="size-4" />
          </button>
        </div>

        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50 focus-within:border-zinc-400 transition-colors">
            <Icon name="search" className="size-4 text-zinc-400 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un connecteur…"
              className="flex-1 bg-transparent outline-none t-base-regular text-zinc-800 placeholder:text-zinc-400"
            />
          </div>
        </div>

        <div className="px-5 pb-3 flex items-center gap-1.5 flex-wrap">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'h-8 px-3 rounded-full border t-base-medium transition-colors',
                  active ? 'bg-zinc-900 border-zinc-900 text-white' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400',
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <Separator />

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-5 py-4">
          {visible.length === 0 ? (
            <div className="py-10 text-center t-base-regular text-zinc-400">Aucun connecteur ne correspond à votre recherche.</div>
          ) : (
            // Two columns need ~170px each before the name collides with the
            // add/check badge. Narrow gets one column, same cards.
            <div className={cn('grid gap-3', narrow ? 'grid-cols-1' : 'grid-cols-2')}>
              {visible.map((c) => {
                const isOn = connected.has(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggle(c.id)}
                    className={cn(
                      'group relative flex items-start gap-3 p-4 rounded-xl border text-left transition-all',
                      isOn ? 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-300' : 'border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm',
                    )}
                  >
                    <ConnectorGlyph c={c} />
                    <div className="flex-1 min-w-0 pr-6">
                      <span className="t-base-semibold text-zinc-900">{c.name}</span>
                      <p className="t-small-regular text-zinc-500 leading-snug mt-0.5 line-clamp-2">{c.desc}</p>
                    </div>
                    <span
                      className={cn(
                        'absolute top-4 right-4 shrink-0 size-6 rounded-full grid place-items-center border transition-colors',
                        isOn
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-zinc-300 text-zinc-400 group-hover:border-zinc-400 group-hover:text-zinc-600',
                      )}
                    >
                      <Icon name={isOn ? 'check' : 'plus'} className="size-3.5" />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-zinc-100 bg-zinc-50/60">
          <span className="t-small-regular text-zinc-500">
            {countConnected > 0
              ? `${countConnected} connecteur${countConnected > 1 ? 's' : ''} connecté${countConnected > 1 ? 's' : ''}`
              : 'Aucun connecteur connecté'}
          </span>
          <Button variant="solid" size="md" onClick={close}>Fermer</Button>
        </div>
      </div>
    </Overlay>
  );
}
