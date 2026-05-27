import { useState, useRef } from 'react';
import { useChatbot } from '../chatbot/store';
import { Icon } from './ui';
import { PrimitiveSlot } from './PrimitiveSlot';

/**
 * ComposerBar — reads C1–C8 from primitive variants and adapts the input row.
 */
export function ComposerBar() {
  const prim = useChatbot((s) => s.primitives);

  // Resolve each primitive: variant if visible, else 'hidden'.
  const v = (code: keyof typeof prim) => (prim[code].visible ? prim[code].variant : 'hidden');
  const c2 = v('C2');
  const c5 = v('C5');
  const c7 = v('C7');
  const c6Visible = prim.C6.visible;
  const c6ContentSet = Array.isArray(prim.C6.content) ? prim.C6.content : [];

  return (
    <div className="space-y-2">
      {/* C2 — Mode Selector */}
      <PrimitiveSlot code="C2" block><ModeSelector variant={c2} /></PrimitiveSlot>

      {/* The main composer card (Snapshot + Imported files render inside it) */}
      <InputCard c5={c5} c7={c7} c6Visible={c6Visible} c6ContentSet={c6ContentSet} />
    </div>
  );
}

/* ----------------------------------------------------------------------
   C6 — Context (inline chips only)
   ---------------------------------------------------------------------- */
// Context = the user's own materials. All render as inline context chips.
// (Doctrine's institutional sources — décisions, lois — live behind the Sources pill.)
const CONTEXT_LABELS: Record<string, string> = {
  kb:         'Base de connaissance',
  sharepoint: 'SharePoint',
  matter:     'Leroy c/ Merlin',
  file:       'Conclusions_def.pdf',
};

/* ----------------------------------------------------------------------
   C7 — Snapshot (selected document excerpt, hint-banner style)
   ---------------------------------------------------------------------- */
const SNAPSHOT_EXCERPT =
  "« Le bailleur est tenu, pendant toute la durée du bail, de délivrer un local conforme à la destination contractuelle et d'en assurer la jouissance paisible, conformément aux articles 1719 et suivants du Code civil… »";

function Snapshot() {
  return (
    <div className="mb-2 px-3 py-2 rounded-md border border-zinc-200 bg-white">
      <div className="flex items-center justify-between gap-2">
        <span className="t-small-medium text-zinc-700">Texte sélectionné</span>
        <button className="shrink-0 h-7 px-2.5 rounded-md t-small-medium text-zinc-700 hover:bg-zinc-100">
          Améliorer
        </button>
      </div>
      <p className="mt-1 t-small-regular text-zinc-500 line-clamp-2">{SNAPSHOT_EXCERPT}</p>
    </div>
  );
}

/* ----------------------------------------------------------------------
   C2 — Mode Selector
   ---------------------------------------------------------------------- */
function ModeSelector({ variant }: { variant: string }) {
  if (variant === 'hidden') return null;
  const modes = [
    { id: 'search',  label: 'Rechercher', icon: 'search' },
    { id: 'draft',   label: 'Rédiger',    icon: 'pen' },
    { id: 'analyse', label: 'Analyser',   icon: 'file-text' },
    { id: 'extract', label: 'Extraire',   icon: 'list' },
  ];

  if (variant === 'slash') {
    return (
      <div className="px-1 t-mono t-small-regular text-zinc-400">
        /research · /draft · /analyse · /extract
      </div>
    );
  }

  if (variant === 'tabs') {
    return (
      <div className="flex items-center gap-0 border-b border-zinc-200">
        {modes.map((m, i) => (
          <button
            key={m.id}
            className={
              'inline-flex items-center gap-1.5 h-8 px-3 t-small-medium border-b-2 -mb-px ' +
              (i === 0 ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-900')
            }
          >
            <Icon name={m.icon} className="size-3.5" />
            {m.label}
          </button>
        ))}
      </div>
    );
  }

  // pill (default for non-hidden)
  return (
    <div className="inline-flex items-center gap-1 px-1 py-1 rounded-md bg-zinc-50 border border-zinc-200">
      {modes.map((m, i) => (
        <button
          key={m.id}
          className={
            'inline-flex items-center gap-1.5 h-6 px-2.5 rounded t-small-medium ' +
            (i === 0
              ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200'
              : 'text-zinc-600 hover:text-zinc-900')
          }
        >
          <Icon name={m.icon} className="size-3.5" />
          {m.label}
        </button>
      ))}
    </div>
  );
}


/* ----------------------------------------------------------------------
   InputCard — the main composer surface
   ---------------------------------------------------------------------- */
function InputCard({
  c5, c7, c6Visible, c6ContentSet,
}: {
  c5: string; c7: string; c6Visible: boolean; c6ContentSet: string[];
}) {
  const [plusOpen, setPlusOpen] = useState(false);
  const setContextPicker = useChatbot((s) => s.setContextPicker);

  const setActionPickerOpen = useChatbot((s) => s.setActionPickerOpen);

  return (
    <div className="relative">
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm px-4 pt-4 pb-2.5 hover:border-zinc-300 focus-within:border-zinc-900 transition-colors">
        {c7 !== 'hidden' && (
          <PrimitiveSlot code="C7" block><Snapshot /></PrimitiveSlot>
        )}
        {c5 !== 'hidden' && (
          <PrimitiveSlot code="C5" block><ImportedFiles /></PrimitiveSlot>
        )}
        {/* Placeholder rendered as real text so "faire une action" can be a link.
            Shown only while the textarea is empty (peer-placeholder-shown). */}
        <div className="relative pb-3">
          <textarea
            className="peer w-full flex-1 t-large-regular text-zinc-900 placeholder:text-transparent outline-none resize-none bg-transparent leading-snug"
            rows={1}
            placeholder=" "
          />
          <div className="pointer-events-none absolute inset-0 hidden peer-placeholder-shown:block t-large-regular text-zinc-400 leading-snug">
            Poser une question à l'IA, ou{' '}
            <button
              onClick={() => setActionPickerOpen(true)}
              className="pointer-events-auto text-zinc-700 underline underline-offset-2 decoration-zinc-400 hover:decoration-zinc-900 hover:text-zinc-900"
            >
              faire une action
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1.5">
            {/* + button — always present, opens the unified popover */}
            <div className="relative">
              <button
                onClick={() => setPlusOpen((v) => !v)}
                className="inline-flex items-center justify-center size-7 rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                title="Sources et fichiers"
              >
                <Icon name="plus" className="size-4" />
              </button>
              {plusOpen && <PlusPopover onClose={() => setPlusOpen(false)} />}
            </div>

            {/* Sources — Doctrine's institutional corpus (décisions, lois). Opens the drawer. */}
            <button
              onClick={() => setContextPicker('sources')}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 t-small-medium text-zinc-700 rounded-md hover:bg-zinc-100"
            >
              <Icon name="scales" className="size-3.5 text-zinc-500" />
              Sources
            </button>

            {/* C6 — Context chips (your materials), inline */}
            {c6Visible && c6ContentSet.length > 0 && (
              <PrimitiveSlot code="C6">
                <ContextChips selectedIds={c6ContentSet} />
              </PrimitiveSlot>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button className="inline-flex items-center justify-center size-7 rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900" title="Voix">
              <Mic />
            </button>
            {/* Send button — fixed UX, not a primitive */}
            <SendButton />
          </div>
        </div>
      </div>
    </div>
  );
}

function Mic() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

/* ----- C6 Context chips (chip variants: outlined / tonal / ghost) ----- */
const CONTEXT_ICONS: Record<string, string> = {
  doctrine:   'scales',
  kb:         'list',
  sharepoint: 'folder',
  matter:     'folder',
  file:       'file-text',
};

function ContextChips({ selectedIds }: { selectedIds: string[] }) {
  const toggleContent = useChatbot((s) => s.togglePrimitiveContent);
  const [open, setOpen] = useState(false);

  // Each chip's inner content: icon + label (hidden on mobile) + remove ×.
  const chipBody = (id: string) => (
    <>
      <Icon name={CONTEXT_ICONS[id] ?? 'folder'} className="size-3.5 text-zinc-500 shrink-0" />
      <span className="hidden sm:inline truncate">{CONTEXT_LABELS[id] ?? id}</span>
      <button
        onClick={() => toggleContent('C6', id)}
        className="text-zinc-400 hover:text-zinc-700 ml-0.5 leading-none shrink-0"
        title="Retirer"
      >
        ×
      </button>
    </>
  );

  // Single chip → standalone pill. Multiple → one summary chip with a count.
  if (selectedIds.length === 1) {
    return (
      <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-zinc-200 bg-white t-small-regular text-zinc-800">
        {chipBody(selectedIds[0])}
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 h-7 px-2 rounded-md t-small-medium text-blue-600 hover:bg-blue-50"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 shrink-0">
          <circle cx="7" cy="7" r="2.4" /><circle cx="17" cy="7" r="2.4" />
          <circle cx="7" cy="17" r="2.4" /><circle cx="17" cy="17" r="2.4" />
        </svg>
        <span>{selectedIds.length}<span className="hidden sm:inline"> éléments</span></span>
        <Icon name="chevron-down" className={'size-3 transition-transform ' + (open ? 'rotate-180' : '')} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 w-56 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden z-20 py-1">
            {selectedIds.map((id) => (
              <div key={id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-50">
                <Icon name={CONTEXT_ICONS[id] ?? 'folder'} className="size-3.5 text-zinc-500 shrink-0" />
                <span className="flex-1 min-w-0 t-small-regular text-zinc-800 truncate">{CONTEXT_LABELS[id] ?? id}</span>
                <button onClick={() => toggleContent('C6', id)} className="text-zinc-400 hover:text-zinc-700 leading-none shrink-0" title="Retirer">×</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ----- C5 Imported Files ----- */
const IMPORTED_FILES: { name: string; format: string; size: string }[] = [
  { name: 'conclusions-anonymisees.docx',                  format: 'DOCX', size: '142 Ko' },
  { name: 'CONTRAT DE PARTENARIAT RÉMUNÉRÉ — Influenceur.docx', format: 'DOCX', size: '218 Ko' },
];

function ImportedFiles() {
  // cards (only variant) — horizontal carousel, scrolls when the composer narrows
  return (
    <div className="flex gap-2 mb-2 overflow-x-auto scrollbar-hide">
      {IMPORTED_FILES.map((f) => (
        <div
          key={f.name}
          className="relative shrink-0 flex flex-col gap-1.5 w-48 p-2.5 rounded-md border border-zinc-200 bg-white"
        >
          <button
            className="absolute top-1.5 right-1.5 size-5 grid place-items-center rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700"
            title="Retirer"
          >
            <Icon name="x" className="size-3" />
          </button>
          <div className="t-small-regular text-zinc-900 leading-tight pr-5 line-clamp-2">{f.name}</div>
          <span className="self-start inline-flex items-center h-4 px-1.5 rounded-sm bg-zinc-100 t-mono text-[10px] font-semibold text-zinc-600 tracking-wide">
            {f.format}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ----- Send Button (fixed UX, not a primitive) ----- */
function SendButton() {
  return (
    <button className="inline-flex items-center justify-center size-7 rounded-md bg-zinc-900 text-white hover:bg-zinc-800">
      <Icon name="arrow-up" className="size-3.5" />
    </button>
  );
}

/* ----- + popover — add Context (your materials) via the import cascade ----- */

function PlusPopover({ onClose }: { onClose: () => void }) {
  const [cascadeOpen, setCascadeOpen] = useState(false);
  // Keep the submenu open while the mouse crosses the gap toward it.
  const cascadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openCascade = () => { if (cascadeTimer.current) clearTimeout(cascadeTimer.current); setCascadeOpen(true); };
  const closeCascadeSoon = () => { cascadeTimer.current = setTimeout(() => setCascadeOpen(false), 180); };
  const toggleContent = useChatbot((s) => s.togglePrimitiveContent);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  const setContextPicker = useChatbot((s) => s.setContextPicker);
  const content = useChatbot((s) => s.primitives.C6.content);
  const active = Array.isArray(content) ? content : [];

  const openPicker = (p: 'kb' | 'matters' | 'sharepoint') => { setContextPicker(p); onClose(); };
  const addContext = (id: string) => {
    if (!active.includes(id)) toggleContent('C6', id);
    setVisible('C6', true);
    onClose();
  };
  const toggleSource = (id: string) => {
    toggleContent('C6', id);
    if (!active.includes(id)) setVisible('C6', true);
  };

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute bottom-full left-0 mb-2 w-[320px] bg-white border border-zinc-200 rounded-xl shadow-lg overflow-visible z-20">
        {/* Section 1 — browse & pick specific documents */}
        <div className="px-4 pt-3 pb-2 t-small-regular text-zinc-500">Sélectionner des fichiers</div>
        <div
          className="relative"
          onMouseEnter={openCascade}
          onMouseLeave={closeCascadeSoon}
        >
          <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-zinc-50 text-left">
            <Icon name="paperclip" className="size-4 text-zinc-500" />
            <span className="flex-1 t-base-regular text-zinc-700">Importer des fichiers</span>
            <Icon name="chevron-right" className="size-3 text-zinc-400" />
          </button>
          {cascadeOpen && (
            <div className="absolute left-full top-0 ml-1 w-[260px] bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden">
              <CascadeRow icon="folder"    label="Vos Matters"                onClick={() => openPicker('matters')} />
              <CascadeRow icon="list"      label="Vos bases de connaissances" onClick={() => openPicker('kb')} />
              <div className="border-t border-zinc-100" />
              <CascadeRow icon="file-text" label="Votre ordinateur"           onClick={() => addContext('file')} />
              <CascadeRow icon="folder"    label="Sharepoint"                 onClick={() => openPicker('sharepoint')} />
              <CascadeRow icon="folder"    label="Google Drive" muted />
            </div>
          )}
        </div>

        {/* Section 2 — target a whole source */}
        <div className="border-t border-zinc-100" />
        <div className="px-4 pt-3 pb-2 t-small-regular text-zinc-500">Cibler une source</div>
        <SourceToggle name="Sharepoint"           on={active.includes('sharepoint')} onChange={() => toggleSource('sharepoint')} />
        <SourceToggle name="Base de connaissance" on={active.includes('kb')}         onChange={() => toggleSource('kb')} />
      </div>
    </>
  );
}

function CascadeRow({ icon, label, muted, onClick }: { icon: string; label: string; muted?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={muted}
      className={'w-full flex items-center gap-3 px-4 py-2 text-left ' + (muted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-50')}
    >
      <Icon name={icon} className="size-4 text-zinc-500" />
      <span className="flex-1 t-base-regular text-zinc-700">{label}</span>
    </button>
  );
}

function SourceToggle({ name, on, onChange }: { name: string; on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-zinc-50">
      <span className="inline-flex items-center justify-center size-6 rounded bg-zinc-100 text-zinc-700 t-small-semibold">{name[0]}</span>
      <span className="flex-1 t-base-regular text-zinc-700 text-left">{name}</span>
      <span className={'inline-flex w-9 h-5 rounded-full p-0.5 transition-colors ' + (on ? 'bg-blue-600 justify-end' : 'bg-zinc-200 justify-start')}>
        <span className="size-4 rounded-full bg-white" />
      </span>
    </button>
  );
}
