import { useState } from 'react';
import { useChatbot } from '../chatbot/store';
import { Icon } from './ui';

/**
 * ComposerBar — reads C1–C8 from primitive variants and adapts the input row.
 */
export function ComposerBar() {
  const prim = useChatbot((s) => s.primitives);
  const params = useChatbot((s) => s.comp.params);

  return (
    <div className="space-y-2">
      {/* C7 — Inferred Scope Hint (above input) */}
      <InferredScopeHint variant={prim.C7} />

      {/* C2 — Mode Selector (above input) */}
      <ModeSelector variant={prim.C2} />

      {/* C5 — File Attach drag-drop variant lives above input */}
      {prim.C5 === 'drag-drop' && <DragDropZone />}

      {/* The main composer card */}
      <InputCard
        c1={prim.C1}
        c3={prim.C3}
        c4={prim.C4}
        c5={prim.C5}
        c6={prim.C6}
        c8={prim.C8}
        params={params}
      />

      {/* C3 chips variant — chips below the composer */}
      {prim.C3 === 'chips' && <SourceChipsBelow params={params} />}
    </div>
  );
}

/* ----------------------------------------------------------------------
   C7 — Inferred Scope Hint
   ---------------------------------------------------------------------- */
function InferredScopeHint({ variant }: { variant: string }) {
  if (variant === 'hidden') return null;
  const data = {
    'doctrine-memo': { intent: 'Recherche juridique', sources: 'Doctrine, Vos mémos internes' },
    'doctrine-only': { intent: 'Recherche juridique', sources: 'Doctrine' },
    'kb-only':       { intent: 'Recherche juridique', sources: 'Vos mémos internes' },
    'matter':        { intent: 'Connaissance interne', sources: 'Affaire Leroy c/ Merlin · 7 docs' },
  }[variant];
  if (!data) return null;

  return (
    <div className="flex items-center gap-2 t-small-regular text-zinc-700 px-1">
      <span className="t-small-medium text-zinc-900">{data.intent}</span>
      <span className="text-zinc-400">·</span>
      <span>{data.sources}</span>
      <button className="t-small-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-900 ml-1">
        Modifier
      </button>
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
   C5 — File Attach (drag-drop variant only — others live inside InputCard)
   ---------------------------------------------------------------------- */
function DragDropZone() {
  return (
    <div className="border-2 border-dashed border-zinc-300 rounded-md px-4 py-4 text-center bg-zinc-50/50">
      <Icon name="upload" className="size-5 text-zinc-400 mx-auto mb-1.5" />
      <div className="t-small-medium text-zinc-700">Glissez-déposez un document</div>
      <div className="t-small-regular text-zinc-500 mt-0.5">PDF, DOCX · 50 Mo max</div>
    </div>
  );
}

/* ----------------------------------------------------------------------
   C3 chips variant — visible below composer
   ---------------------------------------------------------------------- */
function SourceChipsBelow({ params }: { params: { doctrine: boolean; kb: boolean; clausier: boolean; matter: string } }) {
  const chips: { id: string; label: string }[] = [];
  if (params.doctrine) chips.push({ id: 'doctrine', label: 'Doctrine' });
  if (params.kb)       chips.push({ id: 'kb',       label: 'Sharepoint' });
  if (params.clausier) chips.push({ id: 'clausier', label: 'Clausier' });
  if (params.matter !== 'none') chips.push({ id: 'matter', label: 'Leroy c/ Merlin' });
  return (
    <div className="flex flex-wrap items-center gap-1.5 px-1">
      <span className="t-micro text-zinc-500 mr-1">Sources actives</span>
      {chips.map((c) => (
        <span key={c.id} className="inline-flex items-center gap-1 px-2 h-6 rounded-md bg-zinc-900 text-white t-small-medium">
          <Icon name="check" className="size-3" />
          {c.label}
        </span>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------------
   InputCard — the main composer surface
   ---------------------------------------------------------------------- */
function InputCard({
  c1, c3, c4, c5, c6, c8, params,
}: {
  c1: string; c3: string; c4: string; c5: string; c6: string; c8: string;
  params: { doctrine: boolean; kb: boolean; clausier: boolean; matter: string };
}) {
  const [open, setOpen] = useState(false);

  // C1 — input field shape
  const rows = c1 === 'single' ? 1 : c1 === 'multiline-3' ? 3 : c1 === 'search-bar' ? 1 : 2;
  const placeholder =
    c1 === 'search-bar' ? 'Rechercher dans Doctrine…' :
    "Poser une question à l'IA, tapez @ pour référencer un document ou faire une action";
  const cardClass = c1 === 'search-bar'
    ? 'rounded-full border border-zinc-200 bg-white px-5 py-2 hover:border-zinc-300 focus-within:border-zinc-900 transition-colors'
    : 'rounded-2xl border border-zinc-200 bg-white shadow-sm px-4 py-3 hover:border-zinc-300 focus-within:border-zinc-900 transition-colors';

  return (
    <div className={'relative ' + (c1 === 'search-bar' ? '' : '')}>
      {open && <SourcesDropdown onClose={() => setOpen(false)} />}

      <div className={cardClass}>
        <textarea
          className="w-full t-large-regular text-zinc-900 placeholder:text-zinc-400 outline-none resize-none bg-transparent leading-snug"
          rows={rows}
          placeholder={placeholder}
        />

        {c1 !== 'search-bar' && (
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5">
              {/* C5 — File Attach (+ button variants) */}
              <FileAttachButton variant={c5} onTogglePopover={() => setOpen((v) => !v)} />

              {/* C4 — Source Picker Tree (Sources button) */}
              <SourcesButton variant={c4} onClick={() => setOpen((v) => !v)} />

              {/* C3 — Source Toggle (chips-in-composer variant) */}
              {c3 === 'in-dropdown' && <SourceChipInline params={params} c6={c6} />}
              {c3 === 'rail' && (
                <span className="t-small-regular text-zinc-400 italic ml-1">via le rail</span>
              )}

              {/* C6 — Matter / File Chip (always show if non-hidden) */}
              {c3 !== 'in-dropdown' && <MatterFileChip variant={c6} />}
            </div>
            <div className="flex items-center gap-1">
              <button className="inline-flex items-center justify-center size-7 rounded border border-zinc-200 text-zinc-600 hover:border-zinc-400" title="Voix">
                <Mic />
              </button>
              {/* C8 — Send Button */}
              <SendButton variant={c8} />
            </div>
          </div>
        )}

        {c1 === 'search-bar' && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <SendButton variant={c8} />
          </div>
        )}
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

/* ----- C5 File Attach button ----- */
function FileAttachButton({ variant, onTogglePopover }: { variant: string; onTogglePopover: () => void }) {
  if (variant === 'hidden') return null;
  if (variant === 'sidebar') {
    return (
      <button className="inline-flex items-center gap-1 h-7 px-2 t-small-medium text-zinc-600 hover:text-zinc-900">
        <Icon name="paperclip" className="size-3.5" />
        Joindre
      </button>
    );
  }
  if (variant === 'drag-drop') return null; // rendered above the composer
  // plus-popover (default)
  return (
    <button
      onClick={onTogglePopover}
      className="inline-flex items-center justify-center size-7 rounded border border-zinc-200 text-zinc-700 hover:border-zinc-400"
      title="Ajouter une source ou un fichier"
    >
      <Icon name="plus" className="size-4" />
    </button>
  );
}

/* ----- C4 Source Picker Tree (Sources button) ----- */
function SourcesButton({ variant, onClick }: { variant: string; onClick: () => void }) {
  if (variant === 'hidden') return null;

  const label =
    variant === 'search' ? '🔍 Sources' :
    variant === 'flat'   ? 'Sources (liste plate)' :
    'Sources';

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 h-7 px-2 t-small-medium text-zinc-700 hover:bg-zinc-50 rounded"
    >
      <Icon name="scales" className="size-3.5 text-zinc-500" />
      {label}
    </button>
  );
}

/* ----- C6 Matter / File Chip ----- */
function MatterFileChip({ variant }: { variant: string }) {
  if (variant === 'hidden') return null;
  const data: Record<string, { icon: string; label: string }> = {
    dossier:    { icon: 'folder',    label: 'Leroy c/ Merlin' },
    fichier:    { icon: 'file-text', label: 'Conclusions_def.pdf' },
    base:       { icon: 'list',      label: 'Base RH 2024' },
    sharepoint: { icon: 'folder',    label: 'Sharepoint · Contrats' },
  };
  const d = data[variant];
  if (!d) return null;
  return (
    <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-md border border-zinc-200 bg-white t-small-regular text-zinc-800">
      <Icon name={d.icon} className="size-3 text-zinc-500" />
      {d.label}
      <button className="text-zinc-400 hover:text-zinc-700 ml-0.5">×</button>
    </span>
  );
}

/* ----- C3 source chip inline (only when in-dropdown variant — to keep one visible) ----- */
function SourceChipInline({ c6 }: { params: { doctrine: boolean; kb: boolean; clausier: boolean; matter: string }; c6: string }) {
  return <MatterFileChip variant={c6} />;
}

/* ----- C8 Send Button ----- */
function SendButton({ variant }: { variant: string }) {
  if (variant === 'labeled') {
    return (
      <button className="px-3 h-7 rounded bg-zinc-900 text-white t-small-medium hover:bg-zinc-800">
        Envoyer
      </button>
    );
  }
  if (variant === 'filled') {
    return (
      <button className="inline-flex items-center justify-center size-7 rounded bg-zinc-900 text-white hover:bg-zinc-800">
        <Icon name="arrow-up" className="size-3.5" />
      </button>
    );
  }
  // outlined (default)
  return (
    <button className="inline-flex items-center justify-center size-7 rounded border border-zinc-200 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900">
      <Icon name="arrow-up" className="size-3.5" />
    </button>
  );
}

/* ----- Sources dropdown ----- */
function SourcesDropdown({ onClose }: { onClose: () => void }) {
  const params = useChatbot((s) => s.comp.params);
  const setParam = useChatbot((s) => s.setParam);

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute bottom-full left-0 mb-2 w-[320px] bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden z-20">
        <div className="px-4 pt-3 pb-2 t-small-regular text-zinc-500">Sélectionner des fichiers</div>
        <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-zinc-50 text-left">
          <Icon name="paperclip" className="size-4 text-zinc-500" />
          <span className="flex-1 t-base-regular text-zinc-700">Importer des fichiers</span>
          <Icon name="chevron-right" className="size-3 text-zinc-400" />
        </button>
        <div className="border-t border-zinc-100" />
        <div className="px-4 pt-3 pb-2 t-small-regular text-zinc-500">Cibler une source</div>
        <SourceToggleRow name="Sharepoint"           on={params.kb}       onChange={() => setParam('kb', !params.kb)} />
        <SourceToggleRow name="Base de connaissance" on={params.clausier} onChange={() => setParam('clausier', !params.clausier)} />
        <SourceToggleRow name="Doctrine"             on={params.doctrine} onChange={() => setParam('doctrine', !params.doctrine)} />
      </div>
    </>
  );
}

function SourceToggleRow({ name, on, onChange }: { name: string; on: boolean; onChange: () => void }) {
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
