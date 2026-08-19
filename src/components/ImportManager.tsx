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
      footerLeft={
        <span className="t-small-regular text-zinc-500">{summary(def.count, def.files.length > 0)}</span>
      }
      footerRight={
        <Button variant="solid" size="md" onClick={close} disabled={def.files.length === 0}>
          Valider
        </Button>
      }
    >
      <div className="px-3 py-2">
          {/* One thin dashed strip, not a room-sized box. The old dropzone was a
              big empty container with a cluster of eight bordered buttons nested
              inside a second grey box — chrome dominating a dialog whose subject
              is a list of documents. Same anatomy as the sources picker now: a
              section label, then rows. */}
          <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 py-3 mb-1 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 transition-colors">
            <Icon name="upload" className="size-4 shrink-0" />
            <span className="t-base-regular">Glisser-déposer un document, ou parcourir votre appareil</span>
          </button>

          {/* Ajouter depuis — navigational rows (click to browse that source),
              so they carry a chevron and no checkbox. */}
          <div className="flex items-center justify-between gap-2 pl-3 pr-1 pt-4 pb-1.5">
            <span className="t-small-medium text-zinc-500">Ajouter depuis</span>
            {addable.length > 0 && (
              <button
                onClick={() => setAddOpen((v) => !v)}
                className="inline-flex items-center gap-1 h-6 px-2 rounded-full t-small-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              >
                <Icon name="plus" className="size-3" />
                Ajouter une GED
              </button>
            )}
          </div>
          <ul>
            {chipSources.map((src) => (
              <li key={src.id}>
                <button
                  onClick={() => openSource(src.id)}
                  className="w-full flex items-center gap-2.5 pl-3 pr-2 py-2 rounded-md hover:bg-zinc-50 text-left"
                >
                  <SourceIcon source={src} />
                  <span className="flex-1 min-w-0 truncate t-base-regular text-zinc-800">{src.label}</span>
                  <Icon name="chevron-right" className="size-3 text-zinc-400 shrink-0" />
                </button>
              </li>
            ))}
            {/* The not-yet-connected GEDs, revealed in place as more rows —
                no nested container. */}
            {addOpen && addable.map((g) => (
              <li key={g.id}>
                <button
                  onClick={() => addGed(g.id)}
                  className="w-full flex items-center gap-2.5 pl-3 pr-2 py-2 rounded-md hover:bg-zinc-50 text-left"
                >
                  <SourceIcon source={g} />
                  <span className="flex-1 min-w-0 truncate t-base-regular text-zinc-500">{g.label}</span>
                  <Icon name="plus" className="size-3 text-zinc-400 shrink-0" />
                </button>
              </li>
            ))}
          </ul>

          {/* The documents themselves. The footer has always counted these; now
              they are actually listed, which is what makes the body content
              rather than chrome. */}
          {rows.length > 0 && (
            <>
              <div className="flex items-center gap-1.5 pl-3 pr-1 pt-4 pb-1.5">
                <span className="t-small-medium text-zinc-500">Documents</span>
                <span className="t-small-regular text-zinc-400">· {rows.length}</span>
                {folderName && <span className="t-small-regular text-zinc-400 truncate">— dernier de {folderName}</span>}
              </div>
              <ul>
                {rows.map((r) => {
                  const sel = selectedNames.has(r.name);
                  return (
                    <li key={r.name} className="group flex items-center gap-2 pl-3 pr-2 rounded-md hover:bg-zinc-50">
                      <button onClick={() => toggleDoc(r.name)} className="flex items-center gap-2.5 flex-1 min-w-0 py-2 text-left">
                        <span className={cn(
                          'size-4 rounded border shrink-0 inline-flex items-center justify-center',
                          sel ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300 bg-white',
                        )}>
                          {sel && <Icon name="check" className="size-2.5 text-white" />}
                        </span>
                        <Icon name="file-text" className="size-4 text-zinc-400 shrink-0" />
                        <span className="flex-1 min-w-0 truncate t-base-regular text-zinc-800">{r.name}</span>
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
            </>
          )}
      </div>
    </Modal>
  );
}
