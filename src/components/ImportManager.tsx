import { useState } from 'react';
import { useChatbot } from '../chatbot/store';
import { Button, cn, Icon, Modal } from './ui';
import { uploadSet } from '../chatbot/uploadSets';
import { useNarrowOverlay } from './SurfaceScope';

/* One merged set of "sources" you can add from, inside the upload flow:
   "Votre appareil" (a device upload — always first) + your knowledge base + any
   connected GED. `GED_CATALOG` is every GED that CAN be connected; the ones not
   yet connected live behind "Ajouter une GED". Pick one there and it becomes a
   permanent chip (it leaves the add-list). */
// `icon` names a sprite symbol (public/icons.svg#i-<icon>); `iconSrc` points to a
// standalone image (a provider's real logo) and takes precedence when set.
type Source = { id: string; label: string; icon?: string; iconSrc?: string };

const KB_SOURCE: Source = { id: 'vos-bdc', label: 'Votre Bibliothèque', icon: 'database' };

const GED_CATALOG: Source[] = [
  { id: 'sharepoint', label: 'SharePoint',   iconSrc: '/icons/sharepoint.png' },
  { id: 'onedrive',   label: 'OneDrive',     iconSrc: '/icons/onedrive.png' },
  { id: 'gdrive',     label: 'Google Drive', iconSrc: '/icons/drive.png' },
  { id: 'egnyte',     label: 'Egnyte',       iconSrc: '/icons/egnyte.png' },
  { id: 'box',        label: 'Box',          icon: 'box' },
  { id: 'actaport',   label: 'Actaport',     icon: 'actaport' },
];

// A source's icon: its real logo image when given, else a sprite symbol.
function SourceIcon({ source }: { source: Source }) {
  return source.iconSrc
    ? <img src={source.iconSrc} alt="" className="size-4 object-contain" />
    : <Icon name={source.icon!} className="size-4 text-zinc-500" />;
}

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

// Footer summary — documents attached.
function summary(docCount: number, hasFiles: boolean): string {
  return hasFiles ? `${docCount} document${docCount > 1 ? 's' : ''}` : 'Aucun document';
}

/* ----------------------------------------------------------------------
   C14 — Import manager. The "Vos documents" modal behind "Afficher tout".
   Same modal shell + design-system components (Button / Separator / Icon)
   as ActionPicker. Reads the SAME uploaded set as the composer bar (C5)
   and the detected Suggested Actions (E3) — one source of truth.
   Opens via "Afficher tout" (filesModalOpen) or by toggling C14 visible.
   ---------------------------------------------------------------------- */

export function ImportManager() {
  const narrow = useNarrowOverlay();
  const explicitOpen = useChatbot((s) => s.filesModalOpen);
  const setOpen = useChatbot((s) => s.setFilesModalOpen);
  const previewOpen = useChatbot((s) => s.primitives.C14.visible);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  const setId = useChatbot((s) => s.primitives.C5.axisVariants?.set);

  // The folder (matter) the conversation is scoped to, if any — drives the
  // "last file from the selected folder" suggestion.
  const matter = useChatbot((s) => s.primitives.C8.variant);

  const setContextPicker = useChatbot((s) => s.setContextPicker);

  // GEDs currently shown as source buttons — none by default, all of them hide
  // behind "Ajouter une GED" until picked.
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  // Adding a GED makes it a permanent source button (it leaves the add-list).
  const addGed = (id: string) => { setConnected((prev) => new Set(prev).add(id)); setAddOpen(false); };
  // Each source button opens that source's document picker (browse & pick).
  // Only the two the lab actually has browsers for are wired; the others are
  // entry points (device dialog / connector browser) not built here.
  const openSource = (id: string) => {
    if (id === 'vos-bdc') setContextPicker('kb');
    else if (id === 'sharepoint') setContextPicker('sharepoint');
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
    <Modal
      title="Vos documents"
      onClose={close}
      width="max-w-[560px]"
      narrow={narrow}
      // Opts in explicitly: it has no tabs, so it gets no min-height by default,
      // and at 305px it sat noticeably smaller than the sibling pickers. It is a
      // minimum, not a fixed height — the document list still grows it to the cap.
      minBody={480}
      footerLeft={
        <span className="t-small-regular text-zinc-500">{summary(def.count, def.files.length > 0)}</span>
      }
      footerRight={
        <Button variant="solid" size="md" onClick={close} disabled={def.files.length === 0}>
          Valider
        </Button>
      }
    >
      <div className="px-5 py-4">
          {/* Dropzone — drag & drop, or pick from a source. Each source button is
              a PICKER entry point: click it to browse that source and pick
              documents (they land in the list below). "Ajouter une GED" reveals
              the sources not yet connected; picking one makes it a permanent
              source button. Wraps when the row runs out of room. */}
          <div className="rounded-xl border-2 border-dashed border-zinc-200 px-5 py-6">
            <div className="flex flex-col items-center text-center gap-2">
              <Icon name="upload" className="size-6 text-zinc-400" />
              <span className="t-base-regular text-zinc-500">Glisser-déposer un document, ou ajouter depuis une source</span>
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
                {/* Device upload — opens the OS file dialog. */}
                <Button variant="outline" size="sm"><Icon name="folder" className="size-4 text-zinc-500" /> Votre appareil</Button>
                {/* Each source opens its document browser (picker). */}
                {chipSources.map((s) => (
                  <Button key={s.id} variant="outline" size="sm" onClick={() => openSource(s.id)}>
                    <SourceIcon source={s} />
                    {s.label}
                  </Button>
                ))}
                {/* Add another GED — picking one makes it a permanent source button.
                    Hidden once the choices are open (they replace it below). */}
                {addable.length > 0 && !addOpen && (
                  <Button variant="ghost" size="sm" onClick={() => setAddOpen(true)} aria-expanded={addOpen}>
                    <Icon name="plus" className="size-4" /> Ajouter une GED
                  </Button>
                )}
              </div>
            </div>

            {addOpen && addable.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50/70 p-2">
                {addable.map((g) => (
                  <Button key={g.id} variant="outline" size="sm" onClick={() => addGed(g.id)}>
                    <SourceIcon source={g} /> {g.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Documents — compact single-line rows, MULTI-SELECT (checkboxes). Only
              shown once a matter (Dossier) is scoped — otherwise there's no
              "latest doc" to suggest and the list stays hidden. The suggested doc
              (the folder's latest) starts checked; tick any others to respond to
              several. */}
          {matter !== 'idle' && rows.length > 0 && (
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
    </Modal>
  );
}
