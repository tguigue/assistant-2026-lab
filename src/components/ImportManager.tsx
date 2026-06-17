import { useChatbot } from '../chatbot/store';
import { Button, Icon, Separator, cn } from './ui';
import { uploadSet } from '../chatbot/uploadSets';

/* ----------------------------------------------------------------------
   C14 — Import manager. The "Vos documents" modal behind "Afficher tout".
   Same modal shell + design-system components (Button / Separator / Icon)
   as ActionPicker. Reads the SAME uploaded set as the composer bar (C5)
   and the detected Suggested Actions (E3) — one source of truth.
   Opens via "Afficher tout" (filesModalOpen) or by toggling C14 visible.
   ---------------------------------------------------------------------- */

export function ImportManager() {
  const explicitOpen = useChatbot((s) => s.filesModalOpen);
  const setOpen = useChatbot((s) => s.setFilesModalOpen);
  const previewOpen = useChatbot((s) => s.primitives.C14.visible);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  const setId = useChatbot((s) => s.primitives.C5.axisVariants?.set);

  if (!explicitOpen && !previewOpen) return null;

  const def = uploadSet(setId);
  // Close must clear BOTH triggers: the "Afficher tout" flag AND the C14
  // design-mode preview toggle — otherwise, when opened from the panel
  // checkbox, the X/scrim can't dismiss it (visible stays true).
  const close = () => { setOpen(false); if (previewOpen) setVisible('C14', false); };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={close} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[560px] max-w-[94vw] max-h-[80vh] bg-white rounded-2xl shadow-xl border border-zinc-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <h2 className="flex-1 t-h2-semibold text-zinc-900">Vos documents</h2>
          <button onClick={close} className="size-7 grid place-items-center rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900">
            <Icon name="x" className="size-4" />
          </button>
        </div>

        <Separator />

        {/* File list */}
        <ul className="flex-1 min-h-0 overflow-y-auto scrollbar-thin divide-y divide-zinc-100 px-5">
          {def.files.map((f) => (
            <li key={f.name} className="flex items-center gap-3 py-3">
              <Icon name="file-text" className="size-4 shrink-0 text-zinc-400" />
              <div className="flex-1 min-w-0">
                <div className="t-base-medium truncate text-zinc-900">{f.name}</div>
                <div className="mt-0.5 t-small-regular text-zinc-400">{f.format.toUpperCase()} · {f.size}</div>
              </div>
              <button title="Retirer" className="shrink-0 size-7 grid place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
                <Icon name="x" className="size-4" />
              </button>
            </li>
          ))}
        </ul>

        <Separator />

        {/* Footer: add files + count + validate */}
        <div className="flex items-center gap-3 px-5 py-4">
          <Button variant="outline" size="md">
            <Icon name="plus" className="size-4" /> Ajouter
          </Button>
          <span className={cn('flex-1 t-small-regular text-zinc-500')}>
            {def.count} document{def.count > 1 ? 's' : ''}
          </span>
          <Button variant="solid" size="md" onClick={close}>
            Valider
          </Button>
        </div>
      </div>
    </>
  );
}
