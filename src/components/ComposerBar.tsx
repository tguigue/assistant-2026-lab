import { useState, useRef, useEffect } from 'react';
import { Button, IconButtonV2 } from '@doctrinelegal/design-system/button';
import { Chip } from '@doctrinelegal/design-system/data-display';
import { useChatbot } from '../chatbot/store';
import { Icon, FileCard } from './ui';
import { PrimitiveSlot } from './PrimitiveSlot';

/**
 * ComposerBar — reads C1–C8 from primitive variants and adapts the input row.
 */
export function ComposerBar({ seed, onSend }: { seed?: string; onSend?: () => void } = {}) {
  const prim = useChatbot((s) => s.primitives);
  const viewMode = useChatbot((s) => s.viewMode);

  // Resolve each primitive: variant if visible, else 'hidden'.
  const v = (code: keyof typeof prim) => (prim[code].visible ? prim[code].variant : 'hidden');
  const c2 = v('C2');
  const c2ContentSet = Array.isArray(prim.C2.content) ? prim.C2.content : [];
  const c5 = v('C5');
  const c7 = v('C7');
  const c9 = v('C9');
  const c11 = v('C11');
  const c9ContentSet = Array.isArray(prim.C9.content) ? prim.C9.content : [];
  const c6Visible = prim.C6.visible;
  const c6Variant = prim.C6.variant;
  const c6ContentSet = Array.isArray(prim.C6.content) ? prim.C6.content : [];

  return (
    <div className="space-y-2">
      {/* C9 — Matters banner (pick a matter to scope). Only in the empty composer;
          in the answer the scope already shows in the conversation header. */}
      {viewMode !== 'full' && c9 !== 'hidden' && c9ContentSet.length > 0 && (
        <PrimitiveSlot code="C9" block><MatterChips matterIds={c9ContentSet} /></PrimitiveSlot>
      )}

      {/* The main composer card — Mode (C2) renders inside it */}
      <InputCard c2={c2} c2ContentSet={c2ContentSet} c5={c5} c7={c7} c11={c11} c6Visible={c6Visible} c6Variant={c6Variant} c6ContentSet={c6ContentSet} seed={seed} onSend={onSend} />
    </div>
  );
}

/* ----------------------------------------------------------------------
   C9 — Matters (experimental)
   A banner of matter chips above the composer. Clicking a chip scopes the
   conversation to that matter by setting the C8 Conversation Header variant.
   The active matter (current C8 variant) renders filled.
   ---------------------------------------------------------------------- */
const C9_MATTER_TINTS: Record<string, string> = {
  'leroy-merlin': 'bg-gradient-to-br from-sky-300 to-blue-400',
  moreau:         'bg-gradient-to-br from-emerald-200 to-cyan-300',
  aurelia:        'bg-gradient-to-br from-indigo-300 to-violet-400',
  'acme-corp':    'bg-gradient-to-br from-amber-200 to-orange-300',
  pernod:         'bg-gradient-to-br from-fuchsia-300 to-pink-300',
};
const C9_MATTER_LABELS: Record<string, string> = {
  'leroy-merlin': 'Leroy c/ Merlin',
  moreau:         'Moreau c/ SAS Aurelia',
  aurelia:        'Aurelia — Politique RH',
  'acme-corp':    'Matter ACME Corp',
  pernod:         'Pernod Ricard',
};
const C9_MATTER_META: Record<string, string> = {
  'leroy-merlin': 'Dossier · 2024-009',
  moreau:         'Dossier · 2024-018',
  aurelia:        'Dossier · 2024-037',
  'acme-corp':    'Dossier · ACME',
  pernod:         'Dossier · 2024-022',
};

const C9_VISIBLE_COUNT = 3; // recents shown before "Voir plus"

function MatterChips({ matterIds }: { matterIds: string[] }) {
  const activeMatter = useChatbot((s) => s.primitives.C8.variant);
  const setVariant = useChatbot((s) => s.setPrimitiveVariant);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  const setContextPicker = useChatbot((s) => s.setContextPicker);

  const scopeTo = (id: string) => {
    setVariant('C8', id);
    setVisible('C8', true);
  };
  const detach = () => setVariant('C8', 'idle');

  const isScoped = activeMatter !== 'idle' && matterIds.includes(activeMatter);

  // ── SCOPED: collapse to the single active chip. The WHOLE chip is clickable
  //    to detach — the × is just an affordance hint, not the only target. ──
  if (isScoped) {
    const id = activeMatter;
    return (
      <div className="flex">
        <Chip variant="primary" size="medium" component="button" onClick={detach} title="Détacher du matter">
          <span className={'inline-block rounded-full size-2.5 shrink-0 mr-1.5 align-middle ' + (C9_MATTER_TINTS[id] ?? 'bg-zinc-200')} />
          {C9_MATTER_LABELS[id] ?? id}
          <Icon name="x" className="size-3 ml-1 align-middle" />
        </Chip>
      </div>
    );
  }

  // ── UNSCOPED: pickable chips (recents) + "Voir plus". ──
  const shown = matterIds.slice(0, C9_VISIBLE_COUNT);
  const hasMore = matterIds.length > C9_VISIBLE_COUNT;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {shown.map((id) => (
        <Chip key={id} variant="secondary" size="medium" component="button" onClick={() => scopeTo(id)} title={C9_MATTER_META[id]}>
          <span className={'inline-block rounded-full size-2.5 shrink-0 mr-1.5 align-middle ' + (C9_MATTER_TINTS[id] ?? 'bg-zinc-200')} />
          {C9_MATTER_LABELS[id] ?? id}
        </Chip>
      ))}
      {hasMore && (
        <Chip variant="secondary" size="medium" component="button" onClick={() => setContextPicker('matters')}>
          Voir plus
          <Icon name="chevron-right" className="size-3 ml-1 align-middle" />
        </Chip>
      )}
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
  // Clausier
  clausier:          'Clausier',
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
        <span className="t-base-medium text-zinc-700">Texte sélectionné</span>
        <button className="shrink-0 h-7 px-2.5 rounded-md t-base-medium text-zinc-700 hover:bg-zinc-100">
          Améliorer
        </button>
      </div>
      <p className="mt-1 t-small-regular text-zinc-500 line-clamp-2">{SNAPSHOT_EXCERPT}</p>
    </div>
  );
}

/* ----------------------------------------------------------------------
   C2 — Mode (rendered inside the composer)
   Both variants are driven by the selected states (Rechercher / Éditer / Analyser):
   Switch    → one labeled on/off switch per selected state (default on)
   Segmented → the selected states as a segmented control
   ---------------------------------------------------------------------- */
const MODE_META: Record<string, { label: string; icon: string }> = {
  search:  { label: 'Rechercher', icon: 'search' },
  edit:    { label: 'Éditer',     icon: 'pen' },
  analyse: { label: 'Analyser',   icon: 'file-text' },
};

function ModeSelector({ variant, contentSet }: { variant: string; contentSet: string[] }) {
  if (variant === 'hidden') return null;
  const modes = contentSet.map((id) => MODE_META[id]).filter(Boolean);
  if (modes.length === 0) return null;

  // Switch — one labeled on/off switch per selected state, default ON.
  if (variant === 'switch') {
    return (
      <div className="inline-flex items-center gap-1">
        {modes.map((m) => <ModeSwitch key={m.label} label={m.label} />)}
      </div>
    );
  }

  // Segmented — the selected states as a pill control.
  return (
    <div className="inline-flex items-center gap-1 px-1 py-1 rounded-md bg-zinc-50 border border-zinc-200">
      {modes.map((m, i) => (
        <button
          key={m.label}
          className={
            'inline-flex items-center gap-1.5 h-6 px-2.5 rounded t-base-medium ' +
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
  c2, c2ContentSet, c5, c7, c11, c6Visible, c6Variant, c6ContentSet, seed, onSend,
}: {
  c2: string; c2ContentSet: string[]; c5: string; c7: string; c11: string; c6Visible: boolean; c6Variant: string; c6ContentSet: string[];
  seed?: string; onSend?: () => void;
}) {
  const [plusOpen, setPlusOpen] = useState(false);
  const [draft, setDraft] = useState(seed ?? '');
  // Re-seed when the demo loads a different use case (seed changes).
  useEffect(() => { setDraft(seed ?? ''); }, [seed]);
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
        {/* Plain placeholder — actions are opened from the Actions CTA(s), not a
            link here (we'd otherwise have three ways to open the same modal). */}
        <div className="pb-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full flex-1 t-large-regular text-zinc-900 placeholder:text-zinc-400 outline-none resize-none bg-transparent leading-snug"
            rows={2}
            placeholder="Demander à Doctrine…"
          />
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1.5">
            {/* + button IS the Context primitive (C6): its presence depends on
                C6 being visible. Picked materials render as chips below. */}
            {c6Visible && (
              <PrimitiveSlot code="C6">
                <div className="relative">
                  <IconButtonV2
                    iconName="add"
                    size="small"
                    onClick={() => setPlusOpen((v) => !v)}
                    ariaLabel="Ajouter du contexte"
                    title="Ajouter du contexte"
                  />
                  {plusOpen && <PlusPopover onClose={() => setPlusOpen(false)} hintMode={c6Variant} />}
                </div>
              </PrimitiveSlot>
            )}

            {/* Sources — Doctrine's institutional corpus (décisions, lois). Opens the drawer. */}
            <Button variant="ghost" size="small" onClick={() => setContextPicker('sources')}>
              <Icon name="account-balance" className="size-3.5 mr-1.5" />
              Sources
            </Button>

            {/* Actions — opens the action picker (same modal as "Toutes les actions"). */}
            <Button variant="ghost" size="small" onClick={() => setActionPickerOpen(true)}>
              <Icon name="bolt" className="size-3.5 mr-1.5" />
              Actions
            </Button>

            {/* C2 — Mode (Switch / Segmented), right next to Sources */}
            {c2 !== 'hidden' && (
              <PrimitiveSlot code="C2"><ModeSelector variant={c2} contentSet={c2ContentSet} /></PrimitiveSlot>
            )}

            {/* C6 — Context chips (your materials), inline */}
            {c6Visible && c6ContentSet.length > 0 && (
              <PrimitiveSlot code="C6">
                <ContextChips selectedIds={c6ContentSet} />
              </PrimitiveSlot>
            )}

          </div>
          <div className="flex items-center gap-1">
            {/* C11 — Reasoning level dropdown */}
            {c11 !== 'hidden' && (
              <PrimitiveSlot code="C11"><ReasoningLevel variant={c11} /></PrimitiveSlot>
            )}
            {/* One slot: mic when empty, send when the draft has content. */}
            <SendOrMic hasText={!!draft.trim()} onSend={onSend} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* One shared slot for the mic / send affordance. Mic shows while the draft is
   empty, the filled send button once there's text — they crossfade in place so
   the footer never shifts. Both are size-7 to keep the slot stable. */
function SendOrMic({ hasText, onSend }: { hasText: boolean; onSend?: () => void }) {
  return (
    <div className="relative size-7">
      <button
        type="button"
        title="Dicter"
        className={
          'absolute inset-0 inline-flex items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all duration-150 ' +
          (hasText ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100')
        }
      >
        <Icon name="mic" className="size-4" />
      </button>
      <button
        type="button"
        title="Envoyer"
        onClick={onSend}
        className={
          'absolute inset-0 inline-flex items-center justify-center rounded-md bg-zinc-900 text-white hover:bg-zinc-800 transition-all duration-150 ' +
          (hasText ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none')
        }
      >
        <Icon name="arrow-up" className="size-3.5" />
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------------
   Mode switch — one labeled on/off toggle for a selected mode (C2 "switch"
   variant). Subtle active state: fills blue + label darkens when ON. Default ON.
   ---------------------------------------------------------------------- */
function ModeSwitch({ label }: { label: string }) {
  const [on, setOn] = useState(true);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      role="switch"
      aria-checked={on}
      className="inline-flex items-center gap-2 h-7 px-2 rounded-md hover:bg-zinc-100"
      title={label}
    >
      <span className={'inline-flex w-8 h-[18px] rounded-full p-0.5 transition-colors ' + (on ? 'bg-blue-600 justify-end' : 'bg-zinc-300 justify-start')}>
        <span className="size-[14px] rounded-full bg-white" />
      </span>
      <span className={'t-base-medium ' + (on ? 'text-zinc-900' : 'text-zinc-600')}>{label}</span>
    </button>
  );
}

/* ----------------------------------------------------------------------
   C11 — Reasoning level (composer footer, right)
   Dropdown: Raisonnement avancé (Beta) / Détaillé / Concis. The active
   level is the primitive variant; picking one updates it.
   ---------------------------------------------------------------------- */
const REASONING_LEVELS: { id: string; label: string; desc: string; beta?: boolean }[] = [
  { id: 'avance',   label: 'Raisonnement avancé', desc: 'Raisonnement approfondi étape par étape', beta: true },
  { id: 'detaille', label: 'Détaillé',            desc: 'Analyse détaillée et structurée' },
  { id: 'concis',   label: 'Concis',              desc: "L'essentiel dans une réponse courte" },
];

function ReasoningLevel({ variant }: { variant: string }) {
  const [open, setOpen] = useState(false);
  const setPrimitiveVariant = useChatbot((s) => s.setPrimitiveVariant);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [open]);

  const active = REASONING_LEVELS.find((l) => l.id === variant) ?? REASONING_LEVELS[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md t-base-medium text-zinc-700 hover:bg-zinc-100"
      >
        {active.label}
        <Icon name="chevron-down" className={'size-3.5 text-zinc-400 transition-transform ' + (open ? 'rotate-180' : '')} />
      </button>
      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-[280px] bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden z-30 py-1">
          {REASONING_LEVELS.map((l) => (
            <button
              key={l.id}
              onClick={() => { setPrimitiveVariant('C11', l.id); setOpen(false); }}
              className={'w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-zinc-50 ' + (l.id === variant ? 'bg-zinc-50' : '')}
            >
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-1.5">
                  <span className="t-base-medium text-zinc-900">{l.label}</span>
                  {l.beta && <span className="t-small-regular text-zinc-400">· Beta</span>}
                </span>
                <span className="block t-small-regular text-zinc-500">{l.desc}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----- C6 Context chips (chip variants: outlined / tonal / ghost) ----- */
// Resolve an icon from a chip id. Prefix-based so any 'matter-*' or 'kb-*'
// recent picked in the popover gets the right icon.
// Note: matters are never resolved here — the chip renderer branches on
// id.startsWith('matter') and uses MatterAvatar directly (no folder icons
// for matters anywhere in the app).
function contextIcon(id: string): string {
  if (id === 'sharepoint')           return 'folder';
  if (id === 'file')                 return 'file-text';
  if (id === 'clausier')             return 'scales';
  if (id.startsWith('kb'))           return 'list';
  return 'file-text';
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
      <Chip variant="secondary" size="medium">
        <span className="inline-flex items-center gap-1.5 align-middle">{chipBody(selectedIds[0])}</span>
      </Chip>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 h-7 px-2 rounded-md t-base-medium text-blue-600 hover:bg-blue-50"
      >
        <Icon name="apps" className="size-4 shrink-0" />
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
                <span className="flex-1 min-w-0 t-base-regular text-zinc-800 truncate">{CONTEXT_LABELS[id] ?? id}</span>
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
  // Plain straight FileCards. Same FileCard component used by U2 (attached file
  // in the user message) — one consistent visual identity.
  return (
    <div className="flex flex-wrap gap-2 mb-2 pt-1">
      {IMPORTED_FILES.map((f) => (
        <FileCard
          key={f.name}
          name={f.name}
          format={f.format}
          meta={f.size}
          onRemove={() => {}}
          className="max-w-[260px]"
        />
      ))}
    </div>
  );
}

/* ----- + popover — add Context (your materials) via the import cascade ----- */

// Generous, source-specific explanations. Shown either on the first-level menu
// rows (hints-menu) or inside the second dropdown (hints-submenu), never both.
const SOURCE_HINTS = {
  importer: "Joindre un PDF, un DOCX ou un courrier à cette conversation pour que Doctrine puisse l'analyser ou y répondre.",
  matters:  "Un Matter regroupe toutes les pièces d'un dossier client. En le sélectionnant, Doctrine raisonne sur ses documents, ses parties et son historique propre — utile pour une réponse contextualisée à l'affaire en cours.",
  bases:    "Vos bases de connaissances rassemblent vos modèles, mémos et précédents internes. Doctrine s'y appuie pour produire une réponse alignée sur les pratiques et le style de votre cabinet.",
  clausier: "Le Clausier est votre bibliothèque de clauses validées par l'équipe. Idéal pour rédiger un nouveau contrat à partir de formulations éprouvées plutôt que de repartir de zéro.",
  sharepoint: "Doctrine ira identifier, dans tout votre SharePoint, les documents les plus pertinents pour étayer sa réponse — sans que vous ayez à les retrouver vous-même.",
};

function PlusPopover({ onClose, hintMode = 'plain' }: { onClose: () => void; hintMode?: string }) {
  const menuHint = hintMode === 'hints-menu';        // descriptions on first-level rows
  const submenuHint = hintMode === 'hints-submenu';  // generous text inside the second dropdown
  const [cascadeOpen, setCascadeOpen] = useState(false);
  // Keep the submenu open while the mouse crosses the gap toward it.
  const cascadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openCascade = () => { if (cascadeTimer.current) clearTimeout(cascadeTimer.current); setCascadeOpen(true); };
  const closeCascadeSoon = () => { if (cascadeTimer.current) clearTimeout(cascadeTimer.current); setCascadeOpen(false); };
  const toggleContent = useChatbot((s) => s.togglePrimitiveContent);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  const setContextPicker = useChatbot((s) => s.setContextPicker);
  const content = useChatbot((s) => s.primitives.C6.content);
  const active = Array.isArray(content) ? content : [];

  const openPicker = (p: 'kb' | 'matters' | 'sharepoint' | 'clausier') => { setContextPicker(p); onClose(); };
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
      <div className="absolute bottom-full left-0 mb-2 w-[320px] bg-white border border-zinc-200 rounded-xl shadow-lg overflow-visible z-20 py-1">
        {/* Importer (file pick) — top action, no section header */}
        <div
          className="relative"
          onMouseEnter={openCascade}
          onMouseLeave={closeCascadeSoon}
        >
          <button className="w-full flex items-start gap-3 px-4 py-2 hover:bg-zinc-50 text-left">
            <span className="inline-flex items-center justify-center size-6 shrink-0 mt-0.5">
              <Icon name="paperclip" className="size-4 text-zinc-500" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block t-base-regular text-zinc-700">Importer</span>
              {menuHint && (
                <span className="block t-small-regular text-zinc-500 leading-snug mt-0.5">
                  {SOURCE_HINTS.importer}
                </span>
              )}
            </span>
            <Icon name="chevron-right" className="size-3 text-zinc-400 shrink-0 mt-1.5" />
          </button>
          {cascadeOpen && (
            <div className="absolute left-full top-0 w-[260px] bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden py-1">
              <CascadeRow icon="file-text" label="Depuis votre ordinateur" onClick={() => addContext('file')} />
              <CascadeRow letter="M"       label="Depuis un Matter"        onClick={() => openPicker('matters')} />
              <CascadeRow letter="B"       label="Depuis une Base"         onClick={() => openPicker('kb')} />
              <CascadeRow letter="S"       label="Depuis SharePoint"       onClick={() => openPicker('sharepoint')} />
              <div className="border-t border-zinc-100" />
              <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-zinc-50 text-left">
                <Icon name="plus" className="size-3.5 text-zinc-500 shrink-0" />
                <span className="flex-1 t-base-regular text-zinc-700">Configurer une autre connexion</span>
              </button>
            </div>
          )}
        </div>

        <SourceWithRecents
          name="Matters"
          description={menuHint ? SOURCE_HINTS.matters : undefined}
          submenuHint={submenuHint ? SOURCE_HINTS.matters : undefined}
          recents={RECENT_MATTERS}
          onPickRecent={(id) => addContext(id)}
          onSeeAll={() => openPicker('matters')}
          configureLabel="Nouveau matter"
        />
        <SourceWithRecents
          name="Bases de connaissances"
          description={menuHint ? SOURCE_HINTS.bases : undefined}
          submenuHint={submenuHint ? SOURCE_HINTS.bases : undefined}
          recents={RECENT_KBS}
          onPickRecent={(id) => addContext(id)}
          onSeeAll={() => openPicker('kb')}
          configureLabel="Configurer une nouvelle base"
        />
        <SourceWithRecents
          name="Clausier"
          description={menuHint ? SOURCE_HINTS.clausier : undefined}
          submenuHint={submenuHint ? SOURCE_HINTS.clausier : undefined}
          recents={RECENT_CLAUSIER}
          onPickRecent={(id) => addContext(id)}
          onSeeAll={() => openPicker('clausier')}
          configureLabel="Nouveau modèle de clause"
        />
        <SourceToggle
          name="Sharepoint"
          description={menuHint ? SOURCE_HINTS.sharepoint : undefined}
          on={active.includes('sharepoint')}
          onChange={() => toggleSource('sharepoint')}
        />
      </div>
    </>
  );
}

function CascadeRow({ icon, letter, label, muted, onClick }: { icon?: string; letter?: string; label: string; muted?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={muted}
      className={'w-full flex items-center gap-3 px-4 py-2 text-left ' + (muted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-50')}
    >
      {letter ? (
        <span className="inline-flex items-center justify-center size-5 rounded bg-zinc-100 text-zinc-700 t-small-semibold shrink-0">{letter}</span>
      ) : (
        <Icon name={icon ?? 'folder'} className="size-4 text-zinc-500" />
      )}
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
  { id: 'matter-moreau',  label: 'Moreau c/ SAS Aurelia',          meta: 'Matter · 2024-018 · ouvert hier' },
  { id: 'matter-aurelia', label: 'Aurelia — Politique RH 2024',    meta: 'Matter · 2024-037 · 3 jours' },
  { id: 'matter-cabinet', label: 'Cabinet — Encadrement managérial', meta: 'Matter · interne · semaine dernière' },
];
const RECENT_KBS: { id: string; label: string; meta: string }[] = [
  { id: 'kb-mises-demeure', label: 'Base de mises en demeure',      meta: '14 documents · ouverte hier' },
  { id: 'kb-baux',          label: 'Base de baux commerciaux',      meta: '32 documents · 2 jours' },
  { id: 'kb-cgv',           label: 'Modèles CGV / CGU',             meta: '8 documents · semaine dernière' },
];
const RECENT_CLAUSIER: { id: string; label: string; meta: string }[] = [
  { id: 'clausier-bail',      label: 'Bail commercial — Modèle 2024',          meta: '11 clauses · maj. hier' },
  { id: 'clausier-cdi-cadre', label: 'CDI cadre dirigeant',                    meta: '8 clauses · 3 jours' },
  { id: 'clausier-pacte-sas', label: "Pacte d'associés SAS",                   meta: '14 clauses · semaine dernière' },
];

function MatterAvatar({ id, size = 'md' }: { id: string; size?: 'sm' | 'md' }) {
  const tint = MATTER_TINTS[id] ?? DEFAULT_MATTER_TINT;
  const cls = size === 'sm' ? 'size-2.5' : 'size-3.5';
  return <span className={'inline-block rounded-full shrink-0 ' + cls + ' ' + tint} />;
}

function SourceWithRecents({
  name, description, submenuHint, recents, onPickRecent, onSeeAll, configureLabel,
}: {
  name: string;
  /** Muted helper line under the row title (hints-menu variant). */
  description?: string;
  /** Generous explanation shown ONLY inside the second dropdown (hints-submenu variant). */
  submenuHint?: string;
  recents: { id: string; label: string; meta: string }[];
  onPickRecent: (id: string) => void;
  onSeeAll: () => void;
  /** Optional secondary CTA — e.g. "Configurer une nouvelle base" (from stakeholder brief). */
  configureLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openNow = () => { if (timer.current) clearTimeout(timer.current); setOpen(true); };
  const closeSoon = () => { if (timer.current) clearTimeout(timer.current); setOpen(false); };

  return (
    <div className="relative" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <button className="w-full flex items-start gap-3 px-4 py-2 hover:bg-zinc-50 text-left">
        <span className="inline-flex items-center justify-center size-6 rounded bg-zinc-100 text-zinc-700 t-small-semibold shrink-0 mt-0.5">{name[0]}</span>
        <span className="flex-1 min-w-0">
          <span className="block t-base-regular text-zinc-700">{name}</span>
          {description && <span className="block t-small-regular text-zinc-500 leading-snug mt-0.5">{description}</span>}
        </span>
        <Icon name="chevron-right" className="size-3 text-zinc-400 shrink-0 mt-1.5" />
      </button>
      {open && (
        <div className="absolute left-full top-0 w-[320px] bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden z-30 py-1">
          {submenuHint && (
            <div className="px-4 pt-2.5 pb-2 border-b border-zinc-100">
              <span className="block t-small-semibold text-zinc-800 mb-1">{name}</span>
              <span className="block t-small-regular text-zinc-500 leading-relaxed">{submenuHint}</span>
            </div>
          )}
          {recents.map((r) => (
            <button
              key={r.id}
              onClick={() => onPickRecent(r.id)}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-zinc-50 text-left"
            >
              {r.id.startsWith('matter')
                ? <MatterAvatar id={r.id} />
                : <Icon name="file-text" className="size-4 text-zinc-500 shrink-0" />}
              <span className="flex-1 min-w-0 t-base-regular text-zinc-700 truncate">{r.label}</span>
            </button>
          ))}
          <div className="border-t border-zinc-100" />
          <button
            onClick={onSeeAll}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-zinc-50 text-left"
          >
            <Icon name="search" className="size-3.5 text-zinc-500 shrink-0" />
            <span className="flex-1 t-base-regular text-zinc-700">Rechercher</span>
          </button>
          {configureLabel && (
            <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-zinc-50 text-left">
              <Icon name="plus" className="size-3.5 text-zinc-500 shrink-0" />
              <span className="flex-1 t-base-regular text-zinc-700">{configureLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SourceToggle({ name, description, on, onChange }: { name: string; description?: string; on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="w-full flex items-start gap-3 px-4 py-2 hover:bg-zinc-50">
      <span className="inline-flex items-center justify-center size-6 rounded bg-zinc-100 text-zinc-700 t-small-semibold shrink-0 mt-0.5">{name[0]}</span>
      <span className="flex-1 min-w-0 text-left">
        <span className="block t-base-regular text-zinc-700">{name}</span>
        {description && <span className="block t-small-regular text-zinc-500 leading-snug mt-0.5">{description}</span>}
      </span>
      <span className={'inline-flex w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 mt-0.5 ' + (on ? 'bg-blue-600 justify-end' : 'bg-zinc-200 justify-start')}>
        <span className="size-4 rounded-full bg-white" />
      </span>
    </button>
  );
}
