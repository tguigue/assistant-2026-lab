import { useState } from 'react';
import { useChatbot } from '../chatbot/store';
import { Icon } from './ui';
import { PrimitiveSlot } from './PrimitiveSlot';

// C6 Context: hint variants render ABOVE the composer; chip variants render
// INLINE inside the InputCard. The two are mutually exclusive.
const HINT_VARIANTS = ['subtle', 'banner', 'pill'];
const isHintVariant = (v: string) => HINT_VARIANTS.includes(v);

/**
 * ComposerBar — reads C1–C8 from primitive variants and adapts the input row.
 */
export function ComposerBar() {
  const prim = useChatbot((s) => s.primitives);

  // Resolve each primitive: variant if visible, else 'hidden'.
  const v = (code: keyof typeof prim) => (prim[code].visible ? prim[code].variant : 'hidden');
  const c2 = v('C2');
  const c5 = v('C5');
  const c6 = v('C6');
  const c6Visible = prim.C6.visible;
  const c6ContentSet = Array.isArray(prim.C6.content) ? prim.C6.content : [];

  // Hint variants (subtle/banner/pill) render above the composer.
  // Chip variants (outlined) render inline inside the InputCard. Mutually exclusive.
  const isHint = c6 !== 'hidden' && isHintVariant(c6);

  return (
    <div className="space-y-2">
      {/* C6 hint variants — above the composer */}
      {isHint && c6Visible && c6ContentSet.length > 0 && (
        <PrimitiveSlot code="C6" block>
          <ContextHint variant={c6} selectedIds={c6ContentSet} />
        </PrimitiveSlot>
      )}

      {/* C2 — Mode Selector */}
      <PrimitiveSlot code="C2" block><ModeSelector variant={c2} /></PrimitiveSlot>

      {/* The main composer card */}
      <InputCard c5={c5} c6Visible={c6Visible} c6Variant={c6} c6ContentSet={c6ContentSet} />
    </div>
  );
}

/* ----------------------------------------------------------------------
   C6 — Context (hint variants: subtle / banner / pill)
   ---------------------------------------------------------------------- */
// Context = the user's own materials. All render as inline context chips.
// (Doctrine's institutional sources — décisions, lois — live behind the Sources pill.)
const CONTEXT_LABELS: Record<string, string> = {
  kb:         'Base de connaissance',
  sharepoint: 'SharePoint',
  matter:     'Leroy c/ Merlin',
  file:       'Conclusions_def.pdf',
};

function ContextHint({ variant, selectedIds }: { variant: string; selectedIds: string[] }) {
  if (selectedIds.length === 0) return null;
  const label = selectedIds.map((id) => CONTEXT_LABELS[id] ?? id).join(' · ');

  if (variant === 'banner') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-100 t-small-regular text-blue-900">
        <span className="truncate">{label}</span>
        <button className="ml-auto shrink-0 t-small-medium text-blue-900 underline underline-offset-2 hover:text-blue-700">Modifier</button>
      </div>
    );
  }

  if (variant === 'pill') {
    return (
      <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-full border border-zinc-200 bg-zinc-50 t-small-regular text-zinc-700 truncate max-w-full">
        {label}
      </span>
    );
  }

  // subtle (default)
  return (
    <div className="flex items-center gap-2 t-small-regular text-zinc-700 px-1">
      <span className="truncate">{label}</span>
      <button className="shrink-0 t-small-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-700 ml-1">Modifier</button>
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
  c5, c6Visible, c6Variant, c6ContentSet,
}: {
  c5: string; c6Visible: boolean; c6Variant: string; c6ContentSet: string[];
}) {
  const [plusOpen, setPlusOpen] = useState(false);
  const setContextPicker = useChatbot((s) => s.setContextPicker);

  const placeholder = "Poser une question à l'IA, tapez @ pour référencer un document ou faire une action";

  return (
    <div className="relative">
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm px-4 py-3 hover:border-zinc-300 focus-within:border-zinc-900 transition-colors">
        {c5 !== 'hidden' && (
          <PrimitiveSlot code="C5" block><ImportedFiles variant={c5} /></PrimitiveSlot>
        )}
        <textarea
          className="w-full flex-1 t-large-regular text-zinc-900 placeholder:text-zinc-400 outline-none resize-none bg-transparent leading-snug"
          rows={2}
          placeholder={placeholder}
        />

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            {/* + button — always present, opens the unified popover */}
            <div className="relative">
              <button
                onClick={() => setPlusOpen((v) => !v)}
                className="inline-flex items-center justify-center size-7 rounded-md border border-zinc-200 text-zinc-700 hover:border-zinc-400"
                title="Sources et fichiers"
              >
                <Icon name="plus" className="size-4" />
              </button>
              {plusOpen && <PlusPopover onClose={() => setPlusOpen(false)} />}
            </div>

            {/* Sources — Doctrine's institutional corpus (décisions, lois). Opens the drawer. */}
            <button
              onClick={() => setContextPicker('sources')}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 t-small-medium text-zinc-700 rounded-md border border-zinc-200 bg-white hover:border-zinc-400"
            >
              <Icon name="scales" className="size-3.5 text-zinc-500" />
              Sources
            </button>

            {/* C6 — Context chips (your materials): inline for chip variants
                (hint variants render above the composer instead). */}
            {c6Visible && c6ContentSet.length > 0 && !isHintVariant(c6Variant) && (
              <PrimitiveSlot code="C6">
                <ContextChips variant={c6Variant} selectedIds={c6ContentSet} />
              </PrimitiveSlot>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button className="inline-flex items-center justify-center size-7 rounded-md border border-zinc-200 text-zinc-600 hover:border-zinc-400" title="Voix">
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

function ContextChips({ variant, selectedIds }: { variant: string; selectedIds: string[] }) {
  const toggleContent = useChatbot((s) => s.togglePrimitiveContent);
  // hint variants (subtle/banner/pill) all use the outlined chip style when inside InputCard
  const style =
    variant === 'tonal' ? 'border border-transparent bg-zinc-100 text-zinc-800' :
    variant === 'ghost' ? 'border border-transparent bg-transparent text-zinc-700' :
                          'border border-zinc-200 bg-white text-zinc-800'; // outlined / hint fallback
  return (
    <div className="flex items-center gap-1">
      {selectedIds.map((id) => (
        <span key={id} className={'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md t-small-regular ' + style}>
          <Icon name={CONTEXT_ICONS[id] ?? 'folder'} className="size-3.5 text-zinc-500" />
          {CONTEXT_LABELS[id] ?? id}
          <button
            onClick={() => toggleContent('C6', id)}
            className="text-zinc-400 hover:text-zinc-700 ml-0.5 leading-none"
            title="Retirer"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}

/* ----- C5 Imported Files ----- */
const IMPORTED_FILES: { name: string; format: string; size: string }[] = [
  { name: 'conclusions-anonymisees.docx',                  format: 'DOCX', size: '142 Ko' },
  { name: 'CONTRAT DE PARTENARIAT RÉMUNÉRÉ — Influenceur.docx', format: 'DOCX', size: '218 Ko' },
];

function ImportedFiles({ variant }: { variant: string }) {
  if (variant === 'chips') {
    return (
      <div className="flex flex-wrap gap-1.5 mb-2">
        {IMPORTED_FILES.map((f) => (
          <span
            key={f.name}
            className="inline-flex items-center gap-1.5 h-6 pl-1.5 pr-1 rounded-full border border-zinc-200 bg-zinc-50 t-small-regular text-zinc-700 max-w-[200px]"
          >
            <Icon name="paperclip" className="size-3 text-zinc-400 shrink-0" />
            <span className="truncate">{f.name}</span>
            <button className="size-4 grid place-items-center rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 shrink-0">
              <Icon name="x" className="size-2.5" />
            </button>
          </span>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <ul className="mb-2 divide-y divide-zinc-100 border border-zinc-200 rounded-md">
        {IMPORTED_FILES.map((f) => (
          <li key={f.name} className="flex items-center gap-2.5 px-3 py-2">
            <Icon name="file-text" className="size-4 text-zinc-400 shrink-0" />
            <span className="flex-1 t-small-regular text-zinc-800 truncate">{f.name}</span>
            <span className="t-small-regular text-zinc-400 shrink-0">{f.format} · {f.size}</span>
            <button className="size-5 grid place-items-center rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700">
              <Icon name="x" className="size-3" />
            </button>
          </li>
        ))}
      </ul>
    );
  }

  // cards (default)
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {IMPORTED_FILES.map((f) => (
        <div
          key={f.name}
          className="relative flex flex-col gap-1.5 w-48 p-2.5 rounded-md border border-zinc-200 bg-white"
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
          onMouseEnter={() => setCascadeOpen(true)}
          onMouseLeave={() => setCascadeOpen(false)}
        >
          <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-zinc-50 text-left">
            <Icon name="paperclip" className="size-4 text-zinc-500" />
            <span className="flex-1 t-base-regular text-zinc-700">Importer des fichiers</span>
            <Icon name="chevron-right" className="size-3 text-zinc-400" />
          </button>
          {cascadeOpen && (
            <div className="absolute left-full top-0 ml-1 w-[260px] bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden">
              <CascadeRow icon="folder"    label="Vos dossiers"               onClick={() => openPicker('matters')} />
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
