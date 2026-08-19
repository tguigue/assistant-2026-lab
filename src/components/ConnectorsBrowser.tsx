import { useState } from 'react';
import { useChatbot } from '../chatbot/store';
import { Button, cn, Icon, Modal } from './ui';
import { useNarrowOverlay } from './SurfaceScope';

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
  // Runtime state of the CONNECTED cards. A catalogue card has no connection to
  // be in a state about, so this never touches the un-connected ones.
  const auth = useChatbot((s) => s.primitives.C15.axisVariants?.auth) ?? 'ok';

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

  // What a live connection looks like when it is not simply "on". `managed` is
  // the only one that also removes the toggle: an admin-installed connector is
  // not yours to disconnect.
  const AUTH_UI: Record<string, { ring: string; note: string; cta?: string; band?: string; spin?: boolean } | undefined> = {
    ok: undefined,
    expired: {
      ring: 'border-amber-300 bg-amber-50/50 hover:border-amber-400',
      note: 'Autorisation expirée', cta: 'Reconnecter',
      band: 'Une autorisation a expiré — l’Assistant ne lit plus cette source.',
    },
    partial: {
      ring: 'border-amber-200 bg-amber-50/30 hover:border-amber-300',
      note: 'Périmètre partiel — 2 sites sur 5', cta: 'Étendre l’accès',
    },
    syncing: {
      ring: 'border-blue-200 bg-blue-50/30 hover:border-blue-300',
      note: 'Synchronisation — 1 240 documents indexés', spin: true,
    },
    managed: {
      ring: 'border-zinc-200 bg-zinc-50 hover:border-zinc-300',
      note: 'Installée par votre administrateur',
    },
  };
  const authUI = AUTH_UI[auth];

  const q = query.trim().toLowerCase();
  const visible = CONNECTORS.filter(
    (c) => (tab === 'all' || c.category === tab) && (!q || c.name.toLowerCase().includes(q)),
  );
  const countConnected = connected.size;

  const CAT_IDS = ['all', 'ged', 'email', 'juridique', 'outils'] as const;

  return (
    <Modal
      title="Parcourir les connecteurs"
      onClose={close}
      width="max-w-[720px]"
      narrow={narrow}
      z="!z-[61]"
      search={{ value: query, onChange: setQuery, placeholder: 'Rechercher un connecteur…' }}
      tabs={{
        value: tab as typeof CAT_IDS[number],
        onChange: (v) => setTab(v as typeof tab),
        options: [
          { value: 'all', label: 'Tous' }, { value: 'ged', label: 'GED' },
          { value: 'email', label: 'Email & Agenda' }, { value: 'juridique', label: 'Juridique' },
          { value: 'outils', label: 'Outils' },
        ],
      }}
      footerLeft={
        <span className="t-small-regular text-zinc-500">
          {countConnected > 0
            ? `${countConnected} connecteur${countConnected > 1 ? 's' : ''} connecté${countConnected > 1 ? 's' : ''}`
              + (auth === 'expired' ? ` · ${countConnected} à reconnecter` : '')
            : 'Aucun connecteur connecté'}
        </span>
      }
      footerRight={<Button variant="solid" size="md" onClick={close}>Fermer</Button>}
    >
      {authUI?.band && countConnected > 0 && (
        <div className="flex items-start gap-2 px-5 py-2.5 bg-amber-50 border-b border-amber-100">
          <Icon name="alert" className="size-4 text-amber-600 shrink-0 mt-0.5" />
          <span className="t-small-medium text-amber-800">{authUI.band}</span>
        </div>
      )}
        <div className="px-5 py-4">
          {visible.length === 0 ? (
            <div className="py-10 text-center t-base-regular text-zinc-400">Aucun connecteur ne correspond à votre recherche.</div>
          ) : (
            // Two columns need ~170px each before the name collides with the
            // add/check badge. Narrow gets one column, same cards.
            <div className={cn('grid gap-3', narrow ? 'grid-cols-1' : 'grid-cols-2')}>
              {visible.map((c) => {
                const isOn = connected.has(c.id);
                // State applies to live connections only.
                const st = isOn ? authUI : undefined;
                return (
                  <button
                    key={c.id}
                    onClick={() => toggle(c.id)}
                    disabled={!!st && auth === 'managed'}
                    className={cn(
                      'group relative flex items-start gap-3 p-4 rounded-xl border text-left transition-all',
                      st ? st.ring
                        : isOn ? 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-300'
                        : 'border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm',
                      st && auth === 'managed' ? 'cursor-default' : '',
                    )}
                  >
                    <ConnectorGlyph c={c} />
                    <div className="flex-1 min-w-0 pr-6">
                      <span className="t-base-semibold text-zinc-900">{c.name}</span>
                      <p className="t-small-regular text-zinc-500 leading-snug mt-0.5 line-clamp-2">{c.desc}</p>
                      {st && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          {st.spin
                            ? <span className="size-3 shrink-0 rounded-full border-2 border-zinc-200 border-t-blue-600 animate-spin" />
                            : <Icon name={auth === 'managed' ? 'check' : 'alert'} className={cn('size-3.5 shrink-0', auth === 'managed' ? 'text-zinc-400' : 'text-amber-600')} />}
                          <span className={cn('t-small-medium', auth === 'managed' ? 'text-zinc-500' : st.spin ? 'text-zinc-600' : 'text-amber-700')}>{st.note}</span>
                          {st.cta && <span className="t-small-medium text-zinc-500 underline decoration-zinc-300">{st.cta}</span>}
                        </div>
                      )}
                    </div>
                    <span
                      className={cn(
                        'absolute top-4 right-4 shrink-0 size-6 rounded-full grid place-items-center border transition-colors',
                        st && auth === 'managed' ? 'bg-zinc-300 border-zinc-300 text-white'
                          : st ? 'bg-amber-500 border-amber-500 text-white'
                          : isOn ? 'bg-emerald-500 border-emerald-500 text-white'
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

    </Modal>
  );
}
