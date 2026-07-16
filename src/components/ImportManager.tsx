import { useState } from 'react';
import { useChatbot } from '../chatbot/store';
import { Button, Icon, Separator, cn, MODAL_MAX_H } from './ui';
import { uploadSet } from '../chatbot/uploadSets';

/* One merged set of "sources" you can add from, inside the upload flow:
   "Votre appareil" (a device upload — always first) + your knowledge base + any
   connected GED. `GED_CATALOG` is every GED that CAN be connected; the ones not
   yet connected live behind "Ajouter une GED". Pick one there and it becomes a
   permanent chip (it leaves the add-list). */
type Source = { id: string; label: string; icon: string };

const KB_SOURCE: Source = { id: 'vos-bdc', label: 'Vos bases de connaissance', icon: 'database' };

const GED_CATALOG: Source[] = [
  { id: 'sharepoint', label: 'SharePoint',   icon: 'cloud' },
  { id: 'onedrive',   label: 'OneDrive',     icon: 'cloud' },
  { id: 'gdrive',     label: 'Google Drive', icon: 'cloud' },
  { id: 'egnyte',     label: 'Egnyte',       icon: 'cloud' },
  { id: 'box',        label: 'Box',          icon: 'cloud' },
];

// The most recent document of each matter — the "better" default: when the
// conversation is scoped to a folder (C8), we suggest that folder's latest doc.
const MATTER_LAST_DOC: Record<string, { name: string; format: string; size: string }> = {
  'leroy-merlin': { name: 'Assignation_Leroy_12_12_2025.pdf', format: 'pdf',  size: '318 Ko' },
  moreau:         { name: 'Conclusions_def_Moreau.pdf',        format: 'pdf',  size: '287 Ko' },
  aurelia:        { name: 'Politique_RH_2024_v3.docx',         format: 'docx', size: '96 Ko' },
  'acme-corp':    { name: 'Contrat_SaaS_ACME.pdf',             format: 'pdf',  size: '412 Ko' },
  pernod:         { name: 'Convention_animation_2024.pdf',     format: 'pdf',  size: '204 Ko' },
};
const MATTER_LABELS: Record<string, string> = {
  'leroy-merlin': 'Leroy c/ Merlin',
  moreau:         'Moreau c/ SAS Aurelia',
  aurelia:        'Aurelia — Politique RH',
  'acme-corp':    'Matter ACME Corp',
  pernod:         'Pernod Ricard',
};

type DocRow = { name: string; format: string; size: string; removable: boolean };

// Footer summary — documents and/or sources attached.
function summary(docCount: number, hasFiles: boolean, sourceCount: number): string {
  const parts: string[] = [];
  if (hasFiles) parts.push(`${docCount} document${docCount > 1 ? 's' : ''}`);
  if (sourceCount > 0) parts.push(`${sourceCount} source${sourceCount > 1 ? 's' : ''}`);
  return parts.length > 0 ? parts.join(' · ') : 'Aucun élément';
}

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

  // The folder (matter) the conversation is scoped to, if any — drives the
  // "last file from the selected folder" suggestion.
  const matter = useChatbot((s) => s.primitives.C8.variant);

  // GEDs currently shown as chips (the rest hide behind "Ajouter une GED").
  const [connected, setConnected] = useState<Set<string>>(new Set(['sharepoint', 'onedrive', 'gdrive']));
  // Sources toggled ON (included as context). Local — lab aligns on form + content.
  const [selected, setSelected] = useState<Set<string>>(new Set(['vos-bdc']));
  const [addOpen, setAddOpen] = useState(false);
  const toggleSelected = (id: string) =>
    setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const addGed = (id: string) => {
    setConnected((prev) => new Set(prev).add(id));
    setSelected((prev) => new Set(prev).add(id));
    setAddOpen(false);
  };

  // Which documents the answer will target (multi-select). Keyed by folder scope
  // so changing the folder re-applies its suggestion (a pick only sticks within
  // the scope it was made in) — no effect-sync needed.
  const [picked, setPicked] = useState<{ scope: string; names: string[] } | null>(null);

  if (!explicitOpen && !previewOpen) return null;

  const def = uploadSet(setId);

  // Build the document list. When a folder is scoped, its latest doc leads the
  // list as the suggestion; otherwise the most recent upload is suggested.
  const folderDoc = matter !== 'idle' ? MATTER_LAST_DOC[matter] : undefined;
  const folderName = matter !== 'idle' ? MATTER_LABELS[matter] : undefined;
  const rows: DocRow[] = [
    ...(folderDoc ? [{ ...folderDoc, removable: false }] : []),
    ...def.files.map((f) => ({ name: f.name, format: f.format, size: f.size, removable: true })),
  ];
  const suggestedName = rows[0]?.name ?? null;
  // Default selection = the suggested doc; a scoped pick overrides it.
  const selectedNames = new Set(
    picked && picked.scope === matter ? picked.names : suggestedName ? [suggestedName] : [],
  );
  const toggleDoc = (name: string) => {
    const base = picked && picked.scope === matter ? picked.names : suggestedName ? [suggestedName] : [];
    const names = base.includes(name) ? base.filter((n) => n !== name) : [...base, name];
    setPicked({ scope: matter, names });
  };

  // The merged source chips: KB first, then every connected GED (catalog order).
  // "Ajouter une GED" offers the ones not yet connected.
  const chipSources: Source[] = [KB_SOURCE, ...GED_CATALOG.filter((g) => connected.has(g.id))];
  const addable = GED_CATALOG.filter((g) => !connected.has(g.id));
  // Close must clear BOTH triggers: the "Afficher tout" flag AND the C14
  // design-mode preview toggle — otherwise, when opened from the panel
  // checkbox, the X/scrim can't dismiss it (visible stays true).
  const close = () => { setOpen(false); if (previewOpen) setVisible('C14', false); };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={close} />
      <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[560px] max-w-[94vw] ${MODAL_MAX_H} bg-white rounded-2xl shadow-xl border border-zinc-200 flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <h2 className="flex-1 t-h2-semibold text-zinc-900">Vos documents</h2>
          <button onClick={close} className="size-7 grid place-items-center rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900">
            <Icon name="x" className="size-4" />
          </button>
        </div>

        <Separator />

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-5 py-4">
          {/* Dropzone — one merged set of sources: drag & drop, "Votre appareil"
              (device), your knowledge base, and connected GEDs, all as chips
              (solid = included). "Ajouter une GED" reveals the ones not yet
              connected; picking one turns it into a permanent chip. Wraps when
              the row runs out of room. */}
          <div className="rounded-xl border-2 border-dashed border-zinc-200 px-5 py-6">
            <div className="flex flex-col items-center text-center gap-2">
              <Icon name="upload" className="size-6 text-zinc-400" />
              <span className="t-base-regular text-zinc-500">Glisser-déposer un document, ou ajouter depuis une source</span>
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
                {/* Device upload — an action (always first), not a toggle. */}
                <Button variant="outline" size="sm"><Icon name="folder" className="size-4 text-zinc-500" /> Votre appareil</Button>
                {/* Connectable sources — toggle to include as context. */}
                {chipSources.map((s) => {
                  const on = selected.has(s.id);
                  return (
                    <Button key={s.id} variant={on ? 'solid' : 'outline'} size="sm" onClick={() => toggleSelected(s.id)}>
                      <Icon name={s.icon} className={cn('size-4', on ? 'text-white' : 'text-zinc-500')} />
                      {s.label}
                      {on && <Icon name="check" className="size-3.5" />}
                    </Button>
                  );
                })}
                {/* Add another GED — picking one makes it a permanent chip above. */}
                {addable.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setAddOpen((o) => !o)} aria-expanded={addOpen}>
                    <Icon name="plus" className="size-4" /> Ajouter une GED
                  </Button>
                )}
              </div>
            </div>

            {addOpen && addable.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50/70 p-2">
                {addable.map((g) => (
                  <Button key={g.id} variant="outline" size="sm" onClick={() => addGed(g.id)}>
                    <Icon name={g.icon} className="size-4 text-zinc-500" /> {g.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Documents — compact single-line rows, MULTI-SELECT (checkboxes). The
              suggested doc (the folder's latest when scoped, else the most recent
              upload) starts checked; tick any others to respond to several. */}
          {rows.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-1.5 mb-1.5 px-1">
                <span className="t-small-medium text-zinc-500">Répondre au document</span>
                {folderName && <span className="t-small-regular text-zinc-400">· dernier de {folderName}</span>}
              </div>
              <ul className="rounded-xl border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
                {rows.map((r) => {
                  const sel = selectedNames.has(r.name);
                  return (
                    <li key={r.name} className={cn('group flex items-center gap-3 pl-3 pr-2', sel && 'bg-zinc-50')}>
                      <button onClick={() => toggleDoc(r.name)} className="flex items-center gap-3 flex-1 min-w-0 py-2.5 text-left">
                        <span className={cn(
                          'size-4 rounded border shrink-0 inline-flex items-center justify-center',
                          sel ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300 bg-white',
                        )}>
                          {sel && <Icon name="check" className="size-2.5 text-white" />}
                        </span>
                        <span className="flex-1 min-w-0 t-base-regular text-zinc-900 truncate">{r.name}</span>
                      </button>
                      <span className="shrink-0 t-mono text-[10px] font-semibold tracking-wide text-zinc-400">{r.format.toUpperCase()}</span>
                      {r.removable ? (
                        <button title="Retirer" className="shrink-0 size-7 grid place-items-center rounded-md text-zinc-300 hover:bg-zinc-100 hover:text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Icon name="x" className="size-4" />
                        </button>
                      ) : (
                        <span className="shrink-0 w-7" />
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

        </div>

        <Separator />

        {/* Footer: count + validate */}
        <div className="flex items-center gap-3 px-5 py-4">
          <span className={cn('flex-1 t-small-regular text-zinc-500')}>
            {summary(def.count, def.files.length > 0, selected.size)}
          </span>
          <Button variant="solid" size="md" onClick={close} disabled={def.files.length === 0 && selected.size === 0}>
            Valider
          </Button>
        </div>
      </div>
    </>
  );
}
