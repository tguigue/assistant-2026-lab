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
  const c6Variant = prim.C6.visible ? prim.C6.variant : 'hidden';
  const c6ContentSet = Array.isArray(prim.C6.content) ? prim.C6.content : [];

  return (
    <div className="space-y-2">
      {/* C2 — Mode Selector */}
      <PrimitiveSlot code="C2" block><ModeSelector variant={c2} /></PrimitiveSlot>

      {/* C6 — Standing scope panel (variant D) docks above the composer */}
      {c6Variant === 'standing-panel' && (
        <PrimitiveSlot code="C6" block>
          <StandingScopePanel selectedIds={c6ContentSet} />
        </PrimitiveSlot>
      )}

      {/* The main composer card (Snapshot + Imported files render inside it) */}
      <InputCard c5={c5} c7={c7} c6Visible={c6Visible} c6Variant={c6Variant} c6ContentSet={c6ContentSet} />
    </div>
  );
}

/* ----------------------------------------------------------------------
   C6 — Context (inline chips only)
   ---------------------------------------------------------------------- */
// Context = the user's own materials. All render as inline context chips.
// (Doctrine's institutional sources — décisions, lois — live behind the Sources pill.)
// Canonical short labels for any chip id that can land in the composer.
// Includes the dashboard STATE set + the popover "recents" so picks from
// the cascade get clean labels instead of falling back to raw ids.
const CONTEXT_LABELS: Record<string, string> = {
  sharepoint:        'SharePoint',
  file:              'Conclusions_def.pdf',
  // Matters
  'matter-moreau':   'Moreau c/ SAS Aurelia',
  'matter-aurelia':  'Aurelia — Politique RH 2024',
  'matter-cabinet':  'Cabinet — Encadrement managérial',
  // Bases de connaissances
  'kb-mises':        'KB · Mises en demeure',
  'kb-mises-demeure':'KB · Mises en demeure',
  'kb-baux':         'KB · Baux commerciaux',
  'kb-cgv':          'KB · Modèles CGV / CGU',
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
  c5, c7, c6Visible, c6Variant, c6ContentSet,
}: {
  c5: string; c7: string; c6Visible: boolean; c6Variant: string; c6ContentSet: string[];
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
              {plusOpen && (c6Variant === 'mission-control'
                ? <MissionControlPopover onClose={() => setPlusOpen(false)} />
                : <PlusPopover onClose={() => setPlusOpen(false)} />)}
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
// Resolve an icon from a chip id. Prefix-based so any 'matter-*' or 'kb-*'
// recent picked in the popover gets the right icon.
function contextIcon(id: string): string {
  if (id === 'sharepoint')           return 'folder';
  if (id === 'file')                 return 'file-text';
  if (id.startsWith('matter'))       return 'folder';
  if (id.startsWith('kb'))           return 'list';
  return 'folder';
}

function ContextChips({ selectedIds }: { selectedIds: string[] }) {
  const toggleContent = useChatbot((s) => s.togglePrimitiveContent);
  const [open, setOpen] = useState(false);

  // Each chip's inner content: icon + label (hidden on mobile) + remove ×.
  const chipBody = (id: string) => (
    <>
      {id.startsWith('matter')
        ? <MatterAvatar id={id} size="sm" />
        : <Icon name={contextIcon(id)} className="size-3.5 text-zinc-500 shrink-0" />}
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
                {id.startsWith('matter')
                  ? <MatterAvatar id={id} size="sm" />
                  : <Icon name={contextIcon(id)} className="size-3.5 text-zinc-500 shrink-0" />}
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
      <div className="absolute bottom-full left-0 mb-2 w-[320px] bg-white border border-zinc-200 rounded-xl shadow-lg overflow-visible z-20 py-1.5">
        {/* Importer (file pick) — top action, no section header */}
        <div
          className="relative"
          onMouseEnter={openCascade}
          onMouseLeave={closeCascadeSoon}
        >
          <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-zinc-50 text-left">
            <Icon name="paperclip" className="size-4 text-zinc-500" />
            <span className="flex-1 t-base-regular text-zinc-700">Importer</span>
            <Icon name="chevron-right" className="size-3 text-zinc-400" />
          </button>
          {cascadeOpen && (
            <div className="absolute left-full top-0 ml-1 w-[260px] bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden">
              <CascadeRow icon="folder"    label="Matters"                    onClick={() => openPicker('matters')} />
              <CascadeRow icon="list"      label="Bases de connaissances"     onClick={() => openPicker('kb')} />
              <div className="border-t border-zinc-100" />
              <CascadeRow icon="file-text" label="Votre ordinateur"           onClick={() => addContext('file')} />
              <CascadeRow icon="folder"    label="Sharepoint"                 onClick={() => openPicker('sharepoint')} />
            </div>
          )}
        </div>

        {/* Whole-source targets — divider only, no header */}
        <div className="my-1.5 border-t border-zinc-100" />
        <SourceWithRecents
          name="Matters"
          recents={RECENT_MATTERS}
          onPickRecent={(id) => addContext(id)}
          onSeeAll={() => openPicker('matters')}
        />
        <SourceWithRecents
          name="Bases de connaissances"
          recents={RECENT_KBS}
          onPickRecent={(id) => addContext(id)}
          onSeeAll={() => openPicker('kb')}
        />
        <SourceToggle name="Sharepoint"            on={active.includes('sharepoint')} onChange={() => toggleSource('sharepoint')} />
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

/* ----- Recents data for the "Cibler une source" dropdowns ----- */
/* Per-matter color tints. Each matter is its own "object" in the user's mind —
   a colored avatar makes the row feel personal (like a folder cover). */
const MATTER_TINTS: Record<string, string> = {
  'matter-moreau':  'bg-gradient-to-br from-emerald-200 to-cyan-300',
  'matter-aurelia': 'bg-gradient-to-br from-indigo-300 to-violet-400',
  'matter-cabinet': 'bg-gradient-to-br from-amber-200 to-orange-300',
};
const DEFAULT_MATTER_TINT = 'bg-gradient-to-br from-fuchsia-300 to-pink-300';

const RECENT_MATTERS: { id: string; label: string; meta: string }[] = [
  { id: 'matter-moreau',  label: 'Moreau c/ SAS Aurelia',          meta: 'Dossier · 2024-018 · ouvert hier' },
  { id: 'matter-aurelia', label: 'Aurelia — Politique RH 2024',    meta: 'Dossier · 2024-037 · 3 jours' },
  { id: 'matter-cabinet', label: 'Cabinet — Encadrement managérial', meta: 'Dossier · interne · semaine dernière' },
];
const RECENT_KBS: { id: string; label: string; meta: string }[] = [
  { id: 'kb-mises-demeure', label: 'Base de mises en demeure',      meta: '14 documents · ouverte hier' },
  { id: 'kb-baux',          label: 'Base de baux commerciaux',      meta: '32 documents · 2 jours' },
  { id: 'kb-cgv',           label: 'Modèles CGV / CGU',             meta: '8 documents · semaine dernière' },
];

function MatterAvatar({ id, size = 'md' }: { id: string; size?: 'sm' | 'md' }) {
  const tint = MATTER_TINTS[id] ?? DEFAULT_MATTER_TINT;
  const cls = size === 'sm' ? 'size-2.5' : 'size-3.5';
  return <span className={'inline-block rounded-full shrink-0 ' + cls + ' ' + tint} />;
}

function SourceWithRecents({
  name, recents, onPickRecent, onSeeAll,
}: {
  name: string;
  recents: { id: string; label: string; meta: string }[];
  onPickRecent: (id: string) => void;
  onSeeAll: () => void;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openNow = () => { if (timer.current) clearTimeout(timer.current); setOpen(true); };
  const closeSoon = () => { timer.current = setTimeout(() => setOpen(false), 180); };

  return (
    <div className="relative" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-zinc-50 text-left">
        <span className="inline-flex items-center justify-center size-6 rounded bg-zinc-100 text-zinc-700 t-small-semibold">{name[0]}</span>
        <span className="flex-1 t-base-regular text-zinc-700">{name}</span>
      </button>
      {open && (
        <div className="absolute left-full top-0 ml-1 w-[300px] bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden z-30">
          <div className="px-4 pt-3 pb-1 t-small-regular text-zinc-500">Récemment consultés</div>
          {recents.map((r) => (
            <button
              key={r.id}
              onClick={() => onPickRecent(r.id)}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-zinc-50 text-left"
            >
              {r.id.startsWith('matter')
                ? <MatterAvatar id={r.id} />
                : <Icon name="list" className="size-4 text-zinc-500 shrink-0" />}
              <span className="flex-1 min-w-0">
                <span className="block t-base-regular text-zinc-700 truncate">{r.label}</span>
                <span className="block t-small-regular text-zinc-400 truncate">{r.meta}</span>
              </span>
            </button>
          ))}
          <div className="border-t border-zinc-100" />
          <button
            onClick={onSeeAll}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-zinc-50 text-left"
          >
            <Icon name="chevron-right" className="size-4 text-zinc-500 shrink-0" />
            <span className="flex-1 t-base-regular text-zinc-700">Voir tout</span>
          </button>
        </div>
      )}
    </div>
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

/* ======================================================================
   C6 Variant B — Mission Control popover (2-pane)
   Left rail = categories. Right pane = items + "Configurer…" footer.
   ====================================================================== */

type Cat = 'import' | 'matters' | 'kbs' | 'instructions' | 'sources' | 'sharepoint';

const INSTRUCTIONS: { id: string; label: string; meta: string }[] = [
  { id: 'instr-anon',  label: 'Anonymiser un document',     meta: 'Équipe · maj. 12 mars' },
  { id: 'instr-cgv',   label: 'Revoir des CGV',             meta: 'Équipe · 4 avr.' },
  { id: 'instr-mise',  label: 'Rédiger une mise en demeure', meta: 'Personnel · 8 avr.' },
];

const EXTERNAL_SOURCES: { id: string; label: string; meta: string }[] = [
  { id: 'src-juris',  label: 'Juridictions', meta: "Cour de cassation, Conseil d'État…" },
  { id: 'src-codes',  label: 'Codes',        meta: 'Civil, Travail, Commerce…' },
  { id: 'src-entr',   label: 'Entreprises',  meta: 'Registre, KBIS, comptes annuels' },
  { id: 'src-fisc',   label: 'LeFiscal',     meta: 'Doctrine fiscale & BOI' },
];

const CATS: { id: Cat; label: string; icon: string; configure?: string }[] = [
  { id: 'import',       label: 'Importer',           icon: 'paperclip' },
  { id: 'matters',      label: 'Matters',            icon: 'folder' },
  { id: 'kbs',          label: 'Bases',              icon: 'list',     configure: 'Configurer une nouvelle base' },
  { id: 'instructions', label: 'Instructions',       icon: 'pen',      configure: 'Configurer une nouvelle instruction' },
  { id: 'sources',      label: 'Sources externes',   icon: 'scales' },
  { id: 'sharepoint',   label: 'SharePoint',         icon: 'folder',   configure: 'Configurer une autre connexion' },
];

function MissionControlPopover({ onClose }: { onClose: () => void }) {
  const [cat, setCat] = useState<Cat>('matters');
  const toggleContent = useChatbot((s) => s.togglePrimitiveContent);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  const setContextPicker = useChatbot((s) => s.setContextPicker);
  const content = useChatbot((s) => s.primitives.C6.content);
  const active = Array.isArray(content) ? content : [];

  const add = (id: string) => {
    if (!active.includes(id)) toggleContent('C6', id);
    setVisible('C6', true);
    onClose();
  };
  const toggle = (id: string) => {
    toggleContent('C6', id);
    if (!active.includes(id)) setVisible('C6', true);
  };

  const meta = CATS.find((c) => c.id === cat)!;

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute bottom-full left-0 mb-2 w-[560px] h-[360px] bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden z-20 flex">
        {/* Left rail */}
        <nav className="w-[180px] shrink-0 border-r border-zinc-100 bg-zinc-50/60 py-1.5">
          {CATS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={
                'w-full flex items-center gap-2 px-3 py-1.5 text-left ' +
                (cat === c.id ? 'bg-white text-zinc-900 border-l-2 border-zinc-900 -ml-px pl-[10px]' : 'text-zinc-600 hover:bg-white')
              }
            >
              <Icon name={c.icon} className="size-3.5 text-zinc-500 shrink-0" />
              <span className="t-small-medium truncate">{c.label}</span>
            </button>
          ))}
        </nav>

        {/* Right pane */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="px-4 pt-3 pb-2 t-small-semibold text-zinc-900 border-b border-zinc-100">{meta.label}</div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {cat === 'import'       && <MCImport onPick={add} onOpenPicker={(p) => { setContextPicker(p); onClose(); }} />}
            {cat === 'matters'      && <MCList items={RECENT_MATTERS} onPick={add} renderIcon={(it) => <MatterAvatar id={it.id} size="sm" />} />}
            {cat === 'kbs'          && <MCList items={RECENT_KBS}     onPick={add} renderIcon={() => <Icon name="list" className="size-3.5 text-zinc-500" />} />}
            {cat === 'instructions' && <MCList items={INSTRUCTIONS}   onPick={add} renderIcon={() => <Icon name="pen"  className="size-3.5 text-zinc-500" />} />}
            {cat === 'sources'      && <MCList items={EXTERNAL_SOURCES} onPick={add} renderIcon={() => <Icon name="scales" className="size-3.5 text-zinc-500" />} />}
            {cat === 'sharepoint'   && (
              <div className="p-3">
                <button onClick={() => toggle('sharepoint')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-zinc-50 text-left">
                  <span className="inline-flex items-center justify-center size-6 rounded bg-zinc-100 text-zinc-700 t-small-semibold">S</span>
                  <span className="flex-1 t-small-medium text-zinc-800">SharePoint — toute la source</span>
                  <span className={'inline-flex w-9 h-5 rounded-full p-0.5 transition-colors ' + (active.includes('sharepoint') ? 'bg-blue-600 justify-end' : 'bg-zinc-200 justify-start')}>
                    <span className="size-4 rounded-full bg-white" />
                  </span>
                </button>
              </div>
            )}
          </div>
          {meta.configure && (
            <button className="px-4 py-2 text-left t-small-regular text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border-t border-zinc-100">
              + {meta.configure}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function MCImport({ onPick, onOpenPicker }: { onPick: (id: string) => void; onOpenPicker: (p: 'matters' | 'kb' | 'sharepoint') => void }) {
  return (
    <div className="py-1">
      <MCRow icon="file-text" label="Depuis votre ordinateur" onClick={() => onPick('file')} />
      <MCRow icon="folder"    label="Depuis un Matter"        onClick={() => onOpenPicker('matters')} />
      <MCRow icon="list"      label="Depuis une Base"         onClick={() => onOpenPicker('kb')} />
      <MCRow icon="folder"    label="Depuis SharePoint"       onClick={() => onOpenPicker('sharepoint')} />
    </div>
  );
}

function MCRow({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-zinc-50 text-left">
      <Icon name={icon} className="size-3.5 text-zinc-500 shrink-0" />
      <span className="t-small-medium text-zinc-800">{label}</span>
    </button>
  );
}

function MCList({ items, onPick, renderIcon }: {
  items: { id: string; label: string; meta: string }[];
  onPick: (id: string) => void;
  renderIcon: (it: { id: string }) => React.ReactNode;
}) {
  return (
    <div className="py-1">
      {items.map((it) => (
        <button key={it.id} onClick={() => onPick(it.id)} className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-zinc-50 text-left">
          <span className="shrink-0 inline-flex items-center justify-center">{renderIcon(it)}</span>
          <span className="flex-1 min-w-0">
            <span className="block t-small-medium text-zinc-800 truncate">{it.label}</span>
            <span className="block t-small-regular text-zinc-400 truncate">{it.meta}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

/* ======================================================================
   C6 Variant D — Standing scope panel
   Dock above the composer. Shows the conversation's standing scope and
   the available groups, both collapsible. Persistent, not popover.
   ====================================================================== */

function StandingScopePanel({ selectedIds }: { selectedIds: string[] }) {
  const toggleContent = useChatbot((s) => s.togglePrimitiveContent);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  const toggle = (id: string) => {
    toggleContent('C6', id);
    if (!selectedIds.includes(id)) setVisible('C6', true);
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 pt-2 pb-2">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon name="sparkles" className="size-3 text-zinc-500" />
        <span className="t-small-semibold text-zinc-800">Contexte de la conversation</span>
        <span className="t-small-regular text-zinc-400">· {selectedIds.length}</span>
      </div>

      {/* Currently in scope */}
      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedIds.map((id) => (
            <span key={id} className="inline-flex items-center gap-1 h-6 px-2 rounded-md border border-zinc-200 bg-zinc-50 t-small-regular text-zinc-700">
              {id.startsWith('matter') ? <MatterAvatar id={id} size="sm" /> : <Icon name={contextIcon(id)} className="size-3 text-zinc-500" />}
              <span className="truncate max-w-[180px]">{CONTEXT_LABELS[id] ?? id}</span>
              <button onClick={() => toggle(id)} className="text-zinc-400 hover:text-zinc-700 leading-none" title="Retirer">×</button>
            </span>
          ))}
        </div>
      ) : (
        <p className="t-small-regular text-zinc-400 mb-2">Aucun élément en contexte. Cochez ci-dessous pour étendre la portée du raisonnement.</p>
      )}

      <StandingGroup title="Mes ressources" defaultOpen>
        <StandingCheck id="matter-moreau"    label="Matter — Moreau c/ SAS Aurelia" selectedIds={selectedIds} onToggle={toggle} avatar />
        <StandingCheck id="kb-mises"         label="Base — Mises en demeure"        selectedIds={selectedIds} onToggle={toggle} />
        <StandingCheck id="instr-anon"       label="Instruction — Anonymiser"       selectedIds={selectedIds} onToggle={toggle} />
        <StandingCheck id="sharepoint"       label="SharePoint (toute la source)"   selectedIds={selectedIds} onToggle={toggle} />
      </StandingGroup>

      <StandingGroup title="Sources externes">
        <StandingCheck id="src-juris" label="Juridictions" selectedIds={selectedIds} onToggle={toggle} />
        <StandingCheck id="src-codes" label="Codes"        selectedIds={selectedIds} onToggle={toggle} />
        <StandingCheck id="src-entr"  label="Entreprises"  selectedIds={selectedIds} onToggle={toggle} />
        <StandingCheck id="src-fisc"  label="LeFiscal"     selectedIds={selectedIds} onToggle={toggle} />
      </StandingGroup>
    </div>
  );
}

function StandingGroup({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="mt-1">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-1.5 px-1 py-1 rounded hover:bg-zinc-50 text-left">
        <Icon name="chevron-right" className={'size-3 text-zinc-400 transition-transform ' + (open ? 'rotate-90' : '')} />
        <span className="t-small-medium text-zinc-700">{title}</span>
      </button>
      {open && <div className="pl-4 space-y-0.5">{children}</div>}
    </div>
  );
}

function StandingCheck({ id, label, selectedIds, onToggle, avatar }: {
  id: string; label: string; selectedIds: string[]; onToggle: (id: string) => void; avatar?: boolean;
}) {
  const on = selectedIds.includes(id);
  return (
    <label className="flex items-center gap-2 px-1 py-1 rounded hover:bg-zinc-50 cursor-pointer">
      <input type="checkbox" checked={on} onChange={() => onToggle(id)} className="size-3.5 rounded border-zinc-300 accent-zinc-900" />
      {avatar && <MatterAvatar id={id} size="sm" />}
      <span className="t-small-regular text-zinc-800">{label}</span>
    </label>
  );
}
