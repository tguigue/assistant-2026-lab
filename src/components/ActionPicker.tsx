import { useState } from 'react';
import { useChatbot } from '../chatbot/store';
import { Modal } from './ui';
import { useNarrowOverlay } from './SurfaceScope';

/* ----------------------------------------------------------------------
   Action picker — "Sélectionner une action" RIGHT-SIDE panel, opened from the
   composer's "Actions" button. Same drawer chrome as the Sources panel
   (ContextPickers). Fixed composer chrome (not a primitive).
   ---------------------------------------------------------------------- */

type Owner = 'doctrine' | 'partages' | 'prives';
export type Action = { id: string; title: string; desc: string; owner: Owner; date: string };

export const ACTIONS: Action[] = [
  { id: 'a1', title: 'Anonymiser un contrat',                        desc: 'Anonymiser un contrat en remplaçant toutes les données identifiantes par des placeholders cohérents.', owner: 'doctrine', date: 'Il y a 3 jours' },
  { id: 'a2', title: 'Analyse des clauses relatives au droit de visite', desc: "Écrit contestant la décision du juge d'instruction de classer l'affaire.",                              owner: 'doctrine', date: '17 déc. 2025' },
  { id: 'a3', title: 'Analyse du mécanisme de closing accounts',     desc: 'Acte déclenchant la procédure de divorce devant le juge aux affaires familiales.',                       owner: 'partages', date: '12 févr. 2026' },
  { id: 'a4', title: 'Contrôle terminologique',                      desc: 'Demande de nommer un expert pour éclairer un litige technique.',                                          owner: 'partages', date: '2 déc. 2025' },
  { id: 'a5', title: 'Détection des failles',                        desc: 'Acte déclenchant des poursuites pénales et réclamant réparation du préjudice.',                          owner: 'doctrine', date: 'Il y a 3 jours' },
  { id: 'a6', title: 'Analyse du mécanisme de closing accounts',     desc: 'Acte déclenchant la procédure de divorce devant le juge aux affaires familiales.',                       owner: 'partages', date: '12 févr. 2026' },
  { id: 'a7', title: 'Analyse des clauses relatives au droit de visite', desc: "Écrit contestant la décision du juge d'instruction de classer l'affaire.",                              owner: 'doctrine', date: '17 déc. 2025' },
  { id: 'a8', title: 'Contrôle terminologique',                      desc: 'Demande de nommer un expert pour éclairer un litige technique.',                                          owner: 'prives',   date: '2 déc. 2025' },
];

const TABS: { id: 'all' | Owner; label: string }[] = [
  { id: 'all',       label: 'Tous' },
  { id: 'doctrine',  label: 'Doctrine' },
  { id: 'partages',  label: 'Partagés' },
  { id: 'prives',    label: 'Privés' },
];

const AVATAR_COLOR: Record<string, string> = {
  partages: 'bg-violet-400',
  prives:   'bg-sky-400',
};

export function ActionPicker() {
  const narrow = useNarrowOverlay();
  const open = useChatbot((s) => s.actionPickerOpen);
  const setOpen = useChatbot((s) => s.setActionPickerOpen);
  const [tab, setTab] = useState<'all' | Owner>('all');

  if (!open) return null;

  const countFor = (id: 'all' | Owner) => (id === 'all' ? ACTIONS.length : ACTIONS.filter((a) => a.owner === id).length);
  const visible = tab === 'all' ? ACTIONS : ACTIONS.filter((a) => a.owner === tab);

  return (
    <Modal
      as="drawer"
      title="Sélectionner une action"
      onClose={() => setOpen(false)}
      width="w-[480px]"
      narrow={narrow}
      tabs={{
        value: tab,
        onChange: setTab,
        options: TABS.map((t) => ({ value: t.id, label: t.label, count: countFor(t.id) })),
      }}
    >
      <div className="px-3 py-2">

          <div className="grid grid-cols-1 gap-2">
            {visible.map((a) => (
              <button
                key={a.id}
                onClick={() => setOpen(false)}
                className="text-left flex flex-col gap-2 p-3 rounded-md border border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm transition-all"
              >
                <div className="t-base-semibold text-zinc-900 leading-snug">{a.title}</div>
                <div className="flex-1 t-small-regular text-zinc-500 leading-snug line-clamp-2">{a.desc}</div>
                <div className="flex items-center gap-2 pt-0.5">
                  {a.owner === 'doctrine' ? (
                    <span className="size-4 rounded grid place-items-center bg-emerald-500 text-white text-[9px] font-bold shrink-0">D</span>
                  ) : (
                    <span className={'size-4 rounded-full grid place-items-center text-white text-[9px] font-semibold shrink-0 ' + AVATAR_COLOR[a.owner]}>
                      {a.owner === 'partages' ? 'P' : 'M'}
                    </span>
                  )}
                  <span className="t-small-regular text-zinc-400">{a.date}</span>
                </div>
              </button>
            ))}
          </div>
      </div>
    </Modal>
  );
}
