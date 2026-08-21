import { useChatbot } from '../chatbot/store';
import { useNarrowOverlay } from './SurfaceScope';
import { Button, Icon, Modal } from './ui';

/**
 * Managing your knowledge bases — the surface behind "Gérer" in the sources
 * picker's "Ma bibliothèque" section.
 *
 * In the product this is a page. Here it is a modal on purpose: the pill that
 * opens it lives inside a picker you are halfway through using, and navigating
 * to a page would throw that selection away. Managing a library is a detour from
 * picking sources, not a departure from it — so it opens over the top, exactly
 * as the connectors catalogue already does from the section above.
 */

type Base = { id: string; name: string; docs: number; shared: string; owner?: boolean };

const BASES: Base[] = [
  { id: 'mises',   name: 'Mises en demeure',      docs: 34, shared: 'Vous seul',            owner: true },
  { id: 'baux',    name: 'Baux commerciaux',      docs: 128, shared: 'Cabinet — 12 membres' },
  { id: 'cgv',     name: 'Modèles CGV / CGU',     docs: 21, shared: 'Cabinet — 12 membres' },
  { id: 'memos',   name: 'Mémos',                 docs: 57, shared: 'Vous seul',            owner: true },
  { id: 'fiches',  name: 'Fiches pratiques',      docs: 9,  shared: 'Équipe Social — 4 membres' },
];

export function LibraryManager() {
  const open = useChatbot((s) => s.libraryManagerOpen);
  const setOpen = useChatbot((s) => s.setLibraryManagerOpen);
  const narrow = useNarrowOverlay();
  if (!open) return null;

  const close = () => setOpen(false);
  const totalDocs = BASES.reduce((n, b) => n + b.docs, 0);

  return (
    <Modal
      title="Ma bibliothèque"
      onClose={close}
      width="max-w-[560px]"
      narrow={narrow}
      z="!z-[61]"
      minBody={480}
      footerLeft={
        <span className="t-small-regular text-zinc-500">
          {BASES.length} bases · {totalDocs} documents
        </span>
      }
      footerRight={<Button variant="solid" size="md" onClick={close}>Fermer</Button>}
    >
      <div className="px-5 py-2">
        {/* The one creative action, set apart from the list — same treatment as
            "Ajouter une consigne" in the consignes register. */}
        <div className="pb-2 mb-1 border-b border-zinc-100">
          <Button variant="outline" size="sm">
            <Icon name="plus" className="size-4" />
            Nouvelle base
          </Button>
        </div>

        <ul className="divide-y divide-zinc-100">
          {BASES.map((b) => (
            <li key={b.id} className="group/b flex items-center gap-3 py-2.5">
              <Icon name="database" className="size-4 text-zinc-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="t-base-regular text-zinc-800 truncate">{b.name}</p>
                {/* Who can see it is the fact that matters most in a cabinet —
                    a base shared with twelve people is a different object from
                    a private one, even with the same name. */}
                <p className="t-small-regular text-zinc-400 truncate">
                  {b.docs} documents · {b.shared}
                </p>
              </div>
              {!b.owner && (
                <span className="shrink-0 px-1.5 py-0.5 rounded t-small-medium bg-zinc-100 text-zinc-600">partagée</span>
              )}
              <div className="shrink-0 flex items-center gap-0.5 opacity-0 group-hover/b:opacity-100 focus-within:opacity-100 transition-opacity">
                <button title="Renommer" className="size-7 grid place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900">
                  <Icon name="pen" className="size-3.5" />
                </button>
                <button title="Supprimer" className="size-7 grid place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900">
                  <Icon name="x" className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
