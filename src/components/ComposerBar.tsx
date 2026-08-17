import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useChatbot } from '../chatbot/store';
import { Icon, FileCard } from './ui';
import { PrimitiveSlot } from './PrimitiveSlot';
import { uploadSet } from '../chatbot/uploadSets';
import { useNewBadge, NewBadge, usePlaceholderAd } from './FeaturePromotion';
import { useNarrow } from './SurfaceScope';

/**
 * ComposerBar — reads C1–C8 from primitive variants and adapts the input row.
 */
export function ComposerBar({ seed, onSend }: { seed?: string; onSend?: () => void } = {}) {
  const prim = useChatbot((s) => s.primitives);
  const surface = useChatbot((s) => s.surface);

  // Resolve each primitive: variant if visible, else 'hidden'.
  const v = (code: keyof typeof prim) => (prim[code].visible ? prim[code].variant : 'hidden');
  const c2 = v('C2');
  const c2ContentSet = Array.isArray(prim.C2.content) ? prim.C2.content : [];
  const c5 = v('C5');
  const c7 = v('C7');
  const c12 = v('C12'); // widget: dropdown | meter
  const c12Flags = Array.isArray(prim.C12.content) ? prim.C12.content : [];
  const c12Status = prim.C12.axisVariants?.status ?? 'normal'; // normal | near | reached
  const c6Visible = prim.C6.visible;
  const c6ContentSet = Array.isArray(prim.C6.content) ? prim.C6.content : [];

  return (
    <div className="space-y-2">
      {/* The composer card — matter scope now lives INSIDE it (a folder pill on
          the band below the input), so nothing sits above it. */}
      <InputCard c2={c2} c2ContentSet={c2ContentSet} c5={c5} c7={c7} c12={c12} c12Flags={c12Flags} c12Status={c12Status} c6Visible={c6Visible} c6ContentSet={c6ContentSet} seed={seed} onSend={onSend} />

      {/* Doc panel: the legal AI disclaimer under the composer (the draft experience). */}
      {surface === 'doc' && (
        <p className="px-1 t-small-regular text-zinc-400 leading-snug">
          Le contenu a été généré à l’aide de l’intelligence artificielle. Pensez à vérifier son exactitude.
        </p>
      )}
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

type Mode = { label: string; icon: string };

function ModeSelector({ variant, contentSet }: { variant: string; contentSet: string[] }) {
  // Three modes cost ~350px laid out flat — more than a phone composer has in
  // total. Narrow doesn't DROP the control, it folds it into a popover that
  // holds the exact same control at full size.
  const narrow = useNarrow();
  if (variant === 'hidden') return null;
  const modes = contentSet.map((id) => MODE_META[id]).filter(Boolean);
  if (modes.length === 0) return null;

  return narrow
    ? <ModeFolded variant={variant} modes={modes} />
    : <ModeControl variant={variant} modes={modes} />;
}

/* The control itself — identical on every surface, only its host changes. */
function ModeControl({ variant, modes, stacked }: { variant: string; modes: Mode[]; stacked?: boolean }) {
  // Switch — one labeled on/off switch per selected state, default ON.
  if (variant === 'switch') {
    return (
      <div className={stacked ? 'flex flex-col items-stretch gap-0.5' : 'inline-flex items-center gap-1'}>
        {modes.map((m) => <ModeSwitch key={m.label} label={m.label} stacked={stacked} />)}
      </div>
    );
  }

  // Segmented — the selected states as a pill control.
  return (
    <div className={
      (stacked ? 'flex flex-col items-stretch gap-0.5' : 'inline-flex items-center gap-1') +
      ' px-1 py-1 rounded-md bg-zinc-50 border border-zinc-200'
    }>
      {modes.map((m, i) => (
        <button
          key={m.label}
          className={
            'inline-flex items-center gap-1.5 h-6 px-2.5 rounded t-base-medium ' +
            (stacked ? 'justify-start h-8 ' : '') +
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

/* Narrow host — a single trigger carrying the active mode, opening the real
   control. Nothing is hidden: the popover is the same ModeControl, stacked. */
function ModeFolded({ variant, modes }: { variant: string; modes: Mode[] }) {
  const [open, setOpen] = useState(false);
  const head = modes[0];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Mode"
        className="inline-flex items-center gap-1.5 h-11 px-2.5 rounded-lg t-base-medium text-zinc-700 hover:bg-zinc-100"
      >
        <Icon name={head.icon} className="size-3.5 text-zinc-500" />
        <span className="truncate max-w-[92px]">{head.label}</span>
        {modes.length > 1 && <span className="t-small-regular text-zinc-400 tabular-nums">+{modes.length - 1}</span>}
        <Icon name="chevron-down" className={'size-3 text-zinc-400 transition-transform ' + (open ? 'rotate-180' : '')} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 z-40 min-w-[200px] rounded-xl border border-zinc-200 bg-white shadow-lg p-1.5">
            <div className="px-1.5 pb-1 t-small-regular text-zinc-400">Mode</div>
            <ModeControl variant={variant} modes={modes} stacked />
          </div>
        </>
      )}
    </div>
  );
}


/* The composer's "+" now opens the files modal (ImportManager) directly, and
   Sources / Actions defer to their right-side panels — so the old in-composer
   dropdown/flyout/pick-list helpers live no more. The knowledge-base picks that
   used to hang off "+" now live inside the files modal. */

/* ----------------------------------------------------------------------
   ComposerTools — the footer-left control cluster. THREE plain buttons, each a
   single click to a full surface (no in-composer dropdowns):
     • Attach (📎) — opens the files modal (ImportManager): upload + knowledge base
     • Sources     — opens the right-side Sources panel (drives + Doctrine corpora)
     • Actions     — opens the right-side Actions panel
   ---------------------------------------------------------------------- */
function ComposerTools() {
  const setFilesModalOpen = useChatbot((s) => s.setFilesModalOpen);
  const setActionPickerOpen = useChatbot((s) => s.setActionPickerOpen);
  const setContextPicker = useChatbot((s) => s.setContextPicker);
  // E5 "badges" — a "Nouveau" pill pinned on the advertised control.
  const badgeSources = useNewBadge('sources');
  const badgeActions = useNewBadge('actions');

  return (
    <div className="flex items-center gap-0.5">
      {/* Attach — opens the files modal directly (upload files + add a knowledge base). */}
      <button
        onClick={() => setFilesModalOpen(true)}
        title="Joindre un fichier"
        data-tour="attach"
        className="inline-flex items-center justify-center size-11 rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 @2xl/surface:size-8"
      >
        <Icon name="paperclip" className="size-4" />
      </button>

      {/* Sources — opens the right-side sources panel (your drives + Doctrine
          corpora). Narrow, the LABEL folds away, not the button: a 44px target
          plus a label plus five controls is 326px of content in 272px, and the
          target size is an accessibility floor while the label isn't. Same one
          tap, same destination — which is why every phone AI composer we
          measured (ChatGPT, Gemini, Mistral) ships icon-only here too. */}
      <button
        onClick={() => setContextPicker('sources')}
        data-tour="sources"
        title="Sources"
        aria-label="Sources"
        className={TOOL_BTN}
      >
        <Icon name="book" className="size-5 text-zinc-500 @2xl/surface:size-3.5" />
        <span className="hidden @2xl/surface:inline">Sources</span>
        {badgeSources && <NewBadge />}
      </button>

      {/* Actions — opens the right-side action panel. */}
      <button
        onClick={() => setActionPickerOpen(true)}
        data-tour="actions"
        title="Actions"
        aria-label="Actions"
        className={TOOL_BTN}
      >
        <Icon name="bolt" className="size-5 text-zinc-500 @2xl/surface:size-3.5" />
        <span className="hidden @2xl/surface:inline">Actions</span>
        {badgeActions && <NewBadge />}
      </button>
    </div>
  );
}

// Narrow: a 44px square, icon only. Wide: the labelled pill, exactly as before.
const TOOL_BTN =
  'inline-flex items-center justify-center gap-1.5 size-11 rounded-lg t-base-medium text-zinc-700 hover:bg-zinc-100 ' +
  '@2xl/surface:size-auto @2xl/surface:h-8 @2xl/surface:px-2.5';

/* ----------------------------------------------------------------------
   FolderScope — the matter/folder scope pill that sits on the composer band
   (vision design). Reads C9 (matter list) + C8 (active scope); picking a
   folder scopes the conversation, "Détacher" clears it. Empty composer only.
   ---------------------------------------------------------------------- */
function FolderScope() {
  const viewMode = useChatbot((s) => s.viewMode);
  const c9Visible = useChatbot((s) => s.primitives.C9.visible);
  const matterIds = useChatbot((s) => (Array.isArray(s.primitives.C9.content) ? s.primitives.C9.content : []));
  const active = useChatbot((s) => s.primitives.C8.variant);
  const setVariant = useChatbot((s) => s.setPrimitiveVariant);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  const [open, setOpen] = useState(false);
  // E5 "badges" — a "Nouveau" pill pinned on the folder pill when featured.
  const badgeFolder = useNewBadge('folder');

  if (viewMode === 'full' || !c9Visible || matterIds.length === 0) return null;
  const chosen = active !== 'idle' && matterIds.includes(active);
  const scopeTo = (id: string) => { setVariant('C8', id); setVisible('C8', true); setOpen(false); };
  const detach = () => { setVariant('C8', 'idle'); setOpen(false); };

  return (
    <div className="relative px-1.5 pt-1.5">
      <button
        onClick={() => setOpen((o) => !o)}
        title={chosen ? 'Changer de dossier' : 'Choisir un dossier'}
        data-tour="folder"
        className="inline-flex items-center gap-2 h-11 pl-1 pr-2.5 rounded-full hover:bg-zinc-200/70 transition-colors @2xl/surface:h-8"
      >
        {chosen ? (
          <span className={'size-6 rounded-full shrink-0 ring-1 ring-black/5 ' + (C9_MATTER_TINTS[active] ?? 'bg-zinc-300')} />
        ) : (
          <span className="size-6 rounded-full grid place-items-center bg-white shrink-0"><Icon name="folder" className="size-3.5 text-zinc-500" /></span>
        )}
        <span className={'truncate max-w-[280px] t-base-medium ' + (chosen ? 'text-zinc-900' : 'text-zinc-500')}>
          {chosen ? (C9_MATTER_LABELS[active] ?? active) : 'Choisir un dossier'}
        </span>
        {badgeFolder && <NewBadge />}
        <Icon name="chevron-down" className="size-3.5 text-zinc-400 shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-1.5 top-11 z-40 w-64 rounded-xl border border-zinc-200 bg-white shadow-lg py-1">
            {matterIds.map((id) => (
              <button key={id} onClick={() => scopeTo(id)} className="w-full flex items-center gap-2.5 px-3 h-11 text-left hover:bg-zinc-50 @2xl/surface:h-9">
                <span className={'size-2.5 rounded-full shrink-0 ' + (C9_MATTER_TINTS[id] ?? 'bg-zinc-200')} />
                <span className="flex-1 min-w-0 t-base-medium text-zinc-800 truncate">{C9_MATTER_LABELS[id] ?? id}</span>
                {chosen && id === active && <Icon name="check" className="size-4 text-zinc-900 shrink-0" />}
              </button>
            ))}
            {chosen && (
              <>
                <div className="my-1 h-px bg-zinc-100" />
                <button onClick={detach} className="w-full flex items-center gap-2.5 px-3 h-11 text-left hover:bg-zinc-50 t-base-medium text-zinc-500 @2xl/surface:h-9">
                  <Icon name="x" className="size-4 text-zinc-400" /> Détacher le dossier
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------
   InputCard — the main composer surface
   ---------------------------------------------------------------------- */
function InputCard({
  c2, c2ContentSet, c5, c7, c12, c12Flags, c12Status, c6Visible, c6ContentSet, seed, onSend,
}: {
  c2: string; c2ContentSet: string[]; c5: string; c7: string; c12: string; c12Flags: string[]; c12Status: string; c6Visible: boolean; c6ContentSet: string[];
  seed?: string; onSend?: () => void;
}) {
  const [draft, setDraft] = useState(seed ?? '');
  // Re-seed when the demo loads a different use case (seed changes).
  useEffect(() => { setDraft(seed ?? ''); }, [seed]);

  const narrow = useNarrow();
  // Narrow starts at one line and grows with the draft (capped), like every
  // phone composer worth copying. Two reserved-but-empty lines is a lot of a
  // 390px screen to spend on nothing.
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    if (!narrow) { el.style.height = ''; return; }
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [draft, narrow]);

  // E5 "placeholder" — rotating capability ad shown in place of the placeholder.
  const ad = usePlaceholderAd();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative">
      {/* Vision composer: a tinted band holds the white input card, with the
          folder scope sitting on the band below the input. */}
      <div className="rounded-2xl border border-zinc-200 bg-zinc-100 p-1.5">
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm focus-within:border-zinc-400 transition-colors px-3 pt-2.5 pb-2 @2xl/surface:px-3.5 @2xl/surface:pt-3 @2xl/surface:pb-2.5">
        {c7 !== 'hidden' && (
          <PrimitiveSlot code="C7" block><Snapshot /></PrimitiveSlot>
        )}
        {c5 !== 'hidden' && (
          <PrimitiveSlot code="C5" block><ImportedFiles /></PrimitiveSlot>
        )}
        {/* C6 — the selected context. Narrow it sits ABOVE the input, where
            every phone composer puts what you've attached. */}
        {narrow && c6Visible && c6ContentSet.length > 0 && (
          <div className="mb-2">
            <PrimitiveSlot code="C6"><ContextChips selectedIds={c6ContentSet} /></PrimitiveSlot>
          </div>
        )}

        {narrow ? (
          /* PHONE — one row: "+" · input · send. This is the shape ChatGPT,
             Gemini and Mistral all converged on, and we have no evidence to
             deviate from it. Everything that used to sit on a control row now
             lives in the "+" sheet, labelled, instead of as unlabelled glyphs
             and a scroll rail that hid the overflow behind a fade. */
          <div className="flex items-end gap-2" data-tour="input">
            <div className="relative shrink-0">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                title="Plus"
                aria-label="Plus d’options"
                data-tour="attach"
                className="size-11 grid place-items-center rounded-full text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              >
                <Icon name="plus" className="size-5" />
              </button>
              {menuOpen && (
                <ComposerMenu
                  onClose={() => setMenuOpen(false)}
                  c2={c2} c2ContentSet={c2ContentSet}
                  c12={c12} c12Flags={c12Flags} c12Status={c12Status}
                />
              )}
            </div>
            <div className="relative flex-1 min-w-0 py-2.5">
              <textarea
                ref={taRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full block t-large-regular text-zinc-900 placeholder:text-zinc-400 outline-none resize-none bg-transparent leading-snug"
                rows={1}
                placeholder={ad ? '' : 'Demander à l’Assistant…'}
              />
              {ad && !draft && (
                <div key={ad} className="absolute inset-x-0 top-2.5 t-large-regular text-zinc-400 pointer-events-none detect-rise">
                  {ad}
                </div>
              )}
            </div>
            <SendOrMic hasText={!!draft.trim()} onSend={onSend} />
          </div>
        ) : (
          <>
            <div className="relative pb-3" data-tour="input">
              <textarea
                ref={taRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full flex-1 t-large-regular text-zinc-900 placeholder:text-zinc-400 outline-none resize-none bg-transparent leading-snug"
                rows={2}
                placeholder={ad ? '' : 'Demander à l’Assistant…'}
              />
              {/* E5 "placeholder" — the input itself advertises capabilities. The
                  ad rotates with a soft rise; it replaces the native placeholder
                  and vanishes as soon as the user types. */}
              {ad && !draft && (
                <div key={ad} className="absolute inset-x-0 top-0 t-large-regular text-zinc-400 pointer-events-none detect-rise">
                  {ad}
                </div>
              )}
            </div>

            {/* DESKTOP — the control row, unchanged. */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <ComposerTools />
              {c2 !== 'hidden' && (
                <PrimitiveSlot code="C2"><ModeSelector variant={c2} contentSet={c2ContentSet} /></PrimitiveSlot>
              )}
              {c6Visible && c6ContentSet.length > 0 && (
                <PrimitiveSlot code="C6"><ContextChips selectedIds={c6ContentSet} /></PrimitiveSlot>
              )}
              {c12 !== 'hidden' && (
                <div className="ml-auto">
                  <PrimitiveSlot code="C12">
                    <BudgetControl flags={c12Flags} status={c12Status} />
                  </PrimitiveSlot>
                </div>
              )}
              <SendOrMic hasText={!!draft.trim()} onSend={onSend} />
            </div>
          </>
        )}
      </div>
      {/* Folder scope — sits on the band, below the input (vision design). */}
      <FolderScope />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------
   ComposerMenu — what "+" opens at phone width.

   A plain dropdown anchored to the button, in the same chrome as the folder
   scope, the context chips and the level menu: click-catcher + `absolute
   bottom-full` card, rounded-xl, border-zinc-200, shadow-lg. This is a WEB
   app; a bottom sheet with a grab handle is a native idiom we'd be
   importing for no reason, and it would be the only one in the codebase.
   ---------------------------------------------------------------------- */
function ComposerMenu({
  onClose, c2, c2ContentSet, c12, c12Flags, c12Status,
}: {
  onClose: () => void;
  c2: string; c2ContentSet: string[];
  c12: string; c12Flags: string[]; c12Status: string;
}) {
  const setFilesModalOpen = useChatbot((s) => s.setFilesModalOpen);
  const setActionPickerOpen = useChatbot((s) => s.setActionPickerOpen);
  const setContextPicker = useChatbot((s) => s.setContextPicker);
  const badgeSources = useNewBadge('sources');
  const badgeActions = useNewBadge('actions');

  const go = (fn: () => void) => () => { fn(); onClose(); };
  const modes = c2 !== 'hidden' ? c2ContentSet.map((id) => MODE_META[id]).filter(Boolean) : [];

  // The level has ~10 options with two-line descriptions. Poured into the root
  // menu it buries the three things you actually came here to do, so it gets a
  // SECOND PAGE — the drill-down every menu on every platform uses. Root stays
  // short and shows the current value; the list replaces it, with a way back.
  const [page, setPage] = useState<'root' | 'level'>('root');
  const [level, setLevel] = useState(budgetDefaultId(c12Flags));
  const levelLabel = budgetLabel(level, c12Flags);

  // Flip. The composer sits low in a conversation (open upward) and high in the
  // empty state (open downward), so a fixed direction is wrong half the time.
  const ref = useRef<HTMLDivElement | null>(null);
  const [up, setUp] = useState(true);
  useLayoutEffect(() => {
    const anchor = ref.current?.parentElement;
    if (!anchor || !ref.current) return;
    const r = anchor.getBoundingClientRect();
    const h = ref.current.offsetHeight;
    setUp(window.innerHeight - r.bottom < h + 12 && r.top > h + 12);
  }, [page]);

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      {/* cqw, not %: the anchor is the 44px button, so a percentage would size
          the menu against the button instead of the surface. */}
      <div
        ref={ref}
        className={
          'absolute left-0 z-40 w-64 max-w-[78cqw] max-h-[60vh] overflow-y-auto scrollbar-thin rounded-xl border border-zinc-200 bg-white shadow-lg py-1 ' +
          (up ? 'bottom-full mb-2' : 'top-full mt-2')
        }
      >
        {page === 'level' ? (
          <>
            <button
              onClick={() => setPage('root')}
              className="w-full flex items-center gap-2 px-3 h-11 text-left hover:bg-zinc-50 border-b border-zinc-100"
            >
              <Icon name="arrow-left" className="size-4 text-zinc-500 shrink-0" />
              <span className="t-base-medium text-zinc-800">{budgetTitle(c12Flags)}</span>
            </button>
            <PrimitiveSlot code="C12" block>
              <BudgetControl
                flags={c12Flags} status={c12Status}
                inline value={level} onChange={(id) => { setLevel(id); setPage('root'); }}
              />
            </PrimitiveSlot>
          </>
        ) : (
          <>
            <MenuRow icon="paperclip" label="Joindre un fichier" onClick={go(() => setFilesModalOpen(true))} />
            <MenuRow icon="book" label="Sources" badge={badgeSources} onClick={go(() => setContextPicker('sources'))} />
            <MenuRow icon="bolt" label="Actions" badge={badgeActions} onClick={go(() => setActionPickerOpen(true))} />

            {/* C2 — switches, not a picker: short enough to sit on the root page. */}
            {modes.length > 0 && (
              <div className="mt-1 px-3 py-2 border-t border-zinc-100">
                <div className="mb-1.5 t-small-regular text-zinc-400">Mode</div>
                <PrimitiveSlot code="C2" block>
                  <ModeControl variant={c2} modes={modes} stacked />
                </PrimitiveSlot>
              </div>
            )}

            {/* C12 — one row carrying the current value, opening the list. */}
            {c12 !== 'hidden' && (
              <div className="mt-1 border-t border-zinc-100 pt-1">
                <MenuRow
                  icon="list"
                  label={budgetTitle(c12Flags)}
                  value={levelLabel}
                  chevron
                  onClick={() => setPage('level')}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function MenuRow({
  icon, label, badge, value, chevron, onClick,
}: { icon: string; label: string; badge?: boolean; value?: string; chevron?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 h-11 text-left hover:bg-zinc-50"
    >
      <Icon name={icon} className="size-4 text-zinc-500 shrink-0" />
      <span className="flex-1 min-w-0 t-base-medium text-zinc-800 truncate">{label}</span>
      {badge && <NewBadge />}
      {value && <span className="t-small-regular text-zinc-400 truncate max-w-[88px]">{value}</span>}
      {chevron && <Icon name="chevron-right" className="size-3.5 text-zinc-400 shrink-0" />}
    </button>
  );
}

/* One shared slot for the mic / send affordance. Mic shows while the draft is
   empty, the filled send button once there's text — they crossfade in place so
   the footer never shifts. Both are size-7 to keep the slot stable. One look on
   every surface — the round blue send was a narrow-only fork, not a size fix. */
function SendOrMic({ hasText, onSend }: { hasText: boolean; onSend?: () => void }) {
  return (
    <div className="relative shrink-0 size-11 @2xl/surface:size-7">
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
          'absolute inset-0 inline-flex items-center justify-center rounded-md bg-zinc-900 hover:bg-zinc-800 text-white transition-all duration-150 ' +
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
function ModeSwitch({ label, stacked }: { label: string; stacked?: boolean }) {
  const [on, setOn] = useState(true);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      role="switch"
      aria-checked={on}
      className={'inline-flex items-center gap-2 rounded-md hover:bg-zinc-100 ' + (stacked ? 'h-9 px-2 justify-start' : 'h-7 px-2')}
      title={label}
    >
      <span className={'inline-flex w-8 h-[18px] rounded-full p-0.5 transition-colors ' + (on ? 'bg-blue-600 justify-end' : 'bg-zinc-300 justify-start')}>
        <span className="size-[14px] rounded-full bg-white" />
      </span>
      <span className={'t-base-medium ' + (on ? 'text-zinc-900' : 'text-zinc-600')}>{label}</span>
    </button>
  );
}


/* ====================================================================
   C12 — Token budget / limit. Checkbox-composed (like C13): the ONLY radio is
   the widget (`variant`: dropdown vs meter) because they can't share the slot.
   Every other dimension is an independent checkbox you can combine freely:
     full-list   — 6 options vs 3 effort tiers
     show-cost   — show a cost figure per option (else description-only)
     tokens      — express cost in tokens (else credits)   [needs show-cost]
     show-models — show the underlying model name per option
     near-limit  — soft "bientôt épuisé" warning
     limit-reached — hard lock on the priciest options + warning + upsell
     open        — pin the menu open (preview)
   No prices anywhere — credits or tokens only.
   ==================================================================== */

type BudgetOpt = { id: string; label: string; hint: string; recommended?: boolean; locksOnLimit?: boolean };

// Compact = the simple effort choice. Full = the actual model picker (Figma-style).
const COMPACT: BudgetOpt[] = [
  { id: 'defaut',  label: 'Défaut',  hint: 'Recommandé',               recommended: true },
  { id: 'maximum', label: 'Maximum', hint: 'Effort agentique maximal', locksOnLimit: true },
];
// Défaut + the three top frontier flagships (July 2026). Fable 5 (Mythos-class,
// tops the coding/quality boards) and GPT-5.6 Sol lock when the limit is hit.
const FULL: BudgetOpt[] = [
  { id: 'defaut', label: 'Défaut',          hint: 'Recommandé', recommended: true },
  { id: 'fable',  label: 'Claude Fable 5',  hint: 'Le plus performant', locksOnLimit: true },
  { id: 'gpt',    label: 'GPT-5.6 Sol',     hint: 'Raisonnement + code', locksOnLimit: true },
  { id: 'gemini', label: 'Gemini 3.1 Pro',  hint: 'Recherche, raisonnement' },
];
// The next tier — tucked into an "Autres modèles" sub-menu.
const FULL_MORE: BudgetOpt[] = [
  { id: 'grok',   label: 'Grok 4.5',         hint: 'xAI, dernière génération' },
  { id: 'opus',   label: 'Claude Opus 4.8',  hint: 'Approfondi, fiable' },
  { id: 'sonnet', label: 'Claude Sonnet 5',  hint: 'Équilibré, économique' },
  { id: 'gpt55',  label: 'GPT-5.5',          hint: 'Polyvalent, éprouvé' },
  { id: 'haiku',  label: 'Claude Haiku 4.5', hint: 'Léger, instantané' },
];

// Usage shown as a percentage of the session limit (+ reset time). No credits/
// tokens/price. limit-reached → 100%, near-limit → 88%.
const USAGE = { pct: 30, near: 88, reset: '3 h' };

function OptionMenu({
  title, options, more, activeId, nearLimit, limitReached, onPick,
}: {
  title: string; options: BudgetOpt[]; more?: BudgetOpt[]; activeId: string;
  nearLimit: boolean; limitReached: boolean; onPick: (id: string) => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const narrow = useNarrow();
  const Row = (o: BudgetOpt) => {
    const locked = limitReached && o.locksOnLimit;
    // Two lines: label above, hint below — clearer for a model pick.
    const body = (
      <span className="flex-1 min-w-0">
        <span className="t-base-medium text-zinc-900">{o.label}</span>
        <span className="block t-small-regular text-zinc-500">{o.hint}</span>
      </span>
    );
    if (locked) {
      return (
        <div key={o.id} title="Limite atteinte" className="w-full flex items-start gap-2 px-3 py-2 cursor-not-allowed opacity-50">
          {body}
          <Icon name="alert" className="size-3.5 text-zinc-400 shrink-0 mt-0.5" />
        </div>
      );
    }
    return (
      <button
        key={o.id}
        onClick={() => onPick(o.id)}
        className={'w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-zinc-50 ' + (o.id === activeId ? 'bg-zinc-50' : '')}
      >
        {body}
        {o.id === activeId && <Icon name="check" className="size-4 text-zinc-900 shrink-0 mt-0.5" />}
      </button>
    );
  };
  return (
    <>
      {title && <div className="px-3 pt-1.5 pb-1 t-small-regular text-zinc-400">{title}</div>}
      {options.map(Row)}
      {more && more.length > 0 && (
        // Narrow: "Autres modèles" expands IN PLACE. A right-full flyout would
        // open off-screen at 390px — and it was hover-only, so a touch user
        // could never reach the second tier of models at all.
        <div
          className="relative"
          onMouseEnter={() => !narrow && setMoreOpen(true)}
          onMouseLeave={() => !narrow && setMoreOpen(false)}
        >
          <button
            onClick={() => setMoreOpen((o) => !o)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-zinc-50 text-left"
          >
            <span className="flex-1 t-base-medium text-zinc-700">Autres modèles</span>
            <span className="t-small-regular text-zinc-400 tabular-nums">{more.length}</span>
            <Icon
              name="chevron-right"
              className={'size-3.5 text-zinc-400 transition-transform ' + (narrow && moreOpen ? 'rotate-90' : '')}
            />
          </button>
          {moreOpen && (
            narrow ? (
              <div className="border-t border-zinc-100 mt-1 pt-1">{more.map(Row)}</div>
            ) : (
              <div className="absolute right-full top-0 mr-1 w-[260px] bg-white border border-zinc-200 rounded-xl shadow-lg py-1 z-50">
                {more.map(Row)}
              </div>
            )
          )}
        </div>
      )}
      {nearLimit && !limitReached && (
        <div className="mt-1 px-3 py-2 border-t border-zinc-100">
          <p className="t-small-regular text-amber-700">Budget bientôt épuisé — pensez à réduire l’effort.</p>
        </div>
      )}
      {limitReached && <UpgradeCta />}
    </>
  );
}

// "Augmenter le budget" — opens the C13 upgrade modal (next-step surface).
function UpgradeCta() {
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  const toggleContent = useChatbot((s) => s.togglePrimitiveContent);
  const c13Open = useChatbot((s) => Array.isArray(s.primitives.C13?.content) && s.primitives.C13.content.includes('open'));
  const openUpgrade = () => { setVisible('C13', true); if (!c13Open) toggleContent('C13', 'open'); };
  return (
    <div className="mt-1 px-3 py-2 border-t border-zinc-100">
      <div className="flex items-start gap-1.5">
        <Icon name="alert" className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="t-small-regular text-zinc-600">Budget de tokens épuisé — l’effort maximal est indisponible.</p>
          <button onClick={openUpgrade} className="mt-0.5 t-small-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-700">
            Augmenter le budget
          </button>
        </div>
      </div>
    </div>
  );
}

/* The level's shape depends only on its flags, so the menu can label its row
   without owning the control. One source of truth for both. */
function budgetOptions(flags: string[]) { return flags.includes('full-list') ? FULL : COMPACT; }
export function budgetTitle(flags: string[]) { return flags.includes('full-list') ? 'Modèle' : 'Niveau d’effort'; }
export function budgetDefaultId(flags: string[]) {
  const o = budgetOptions(flags);
  return (o.find((x) => x.recommended) ?? o[0]).id;
}
export function budgetLabel(id: string, flags: string[]) {
  const all = flags.includes('full-list') ? [...FULL, ...FULL_MORE] : COMPACT;
  return (all.find((o) => o.id === id) ?? all[0]).label;
}

function BudgetControl({
  flags, status, inline, value, onChange,
}: {
  flags: string[]; status: string; inline?: boolean;
  value?: string; onChange?: (id: string) => void;
}) {
  const has = (id: string) => flags.includes(id);
  const fullList = has('full-list');
  const showUsage = has('usage-meter');
  const forceOpen = has('open');
  const nearLimit = status === 'near';
  const limitReached = status === 'reached';

  const options = budgetOptions(flags);
  const title = budgetTitle(flags);
  const defaultId = budgetDefaultId(flags);
  // Controlled when the host owns the value (the "+" menu shows it on a row);
  // uncontrolled everywhere else.
  const [selInner, setSelInner] = useState(defaultId);
  const sel = value ?? selInner;
  const setSel = (id: string) => (onChange ? onChange(id) : setSelInner(id));
  useEffect(() => { setSelInner(defaultId); }, [fullList]); // eslint-disable-line react-hooks/exhaustive-deps

  const [open, setOpen] = useState(false);
  const isOpen = open || forceOpen;
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [open]);

  const active = (fullList ? [...FULL, ...FULL_MORE] : options).find((o) => o.id === sel) ?? options[0];
  const activeLocked = limitReached && !!active.locksOnLimit;
  const pick = (id: string) => { setSel(id); setOpen(false); };
  const menu = (
    <OptionMenu title={inline ? '' : title} options={options} more={fullList ? FULL_MORE : undefined} activeId={sel} nearLimit={nearLimit} limitReached={limitReached} onPick={pick} />
  );

  // The trigger is ALWAYS the plain label. "Show usage %" only adds a usage
  // header INSIDE the open menu (not in the footer trigger).
  const warn = limitReached || nearLimit;
  const pct = limitReached ? 100 : nearLimit ? USAGE.near : USAGE.pct;
  const usage = showUsage && (
    <div className="px-3 pt-3 pb-2.5 border-b border-zinc-100">
      <div className="flex items-center justify-between mb-1.5">
        <span className="t-small-regular text-zinc-500">Usage de la session</span>
        <span className={'t-small-medium ' + (warn ? 'text-amber-600' : 'text-zinc-700')}>{pct}% · réinit. {USAGE.reset}</span>
      </div>
      <span className="block relative h-1.5 w-full rounded-full bg-zinc-200 overflow-hidden">
        <span className={'absolute inset-y-0 left-0 rounded-full ' + (warn ? 'bg-amber-500' : 'bg-zinc-700')} style={{ width: pct + '%' }} />
      </span>
    </div>
  );

  // Inline — already inside a menu, so render the options as rows and nothing
  // else. A trigger here would open a popover inside a popover: it lands
  // half-off the parent card and the parent's own scroll clips it.
  if (inline) {
    return <div>{usage}{menu}</div>;
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-1.5 h-11 px-2.5 rounded-lg t-base-medium text-zinc-700 hover:bg-zinc-100 @2xl/surface:h-7 @2xl/surface:rounded-md">
        <span className="truncate max-w-[104px] @2xl/surface:max-w-none">{active.label}</span>
        {activeLocked && <Icon name="alert" className="size-3.5 text-amber-500" />}
        <Icon name="chevron-down" className={'size-3.5 text-zinc-400 transition-transform ' + (isOpen ? 'rotate-180' : '')} />
      </button>
      {isOpen && (
        // cqw = % of the SURFACE width, so the menu can never be wider than the
        // phone it opens in (vw would measure the browser window).
        <div className="absolute bottom-full right-0 mb-2 w-[300px] max-w-[88cqw] bg-white border border-zinc-200 rounded-xl shadow-lg z-30">
          {usage}
          <div className="py-1">{menu}</div>
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
  if (id.startsWith('kb'))           return 'list';
  return 'file-text';
}

function ContextChips({ selectedIds }: { selectedIds: string[] }) {
  const toggleContent = useChatbot((s) => s.togglePrimitiveContent);
  const [open, setOpen] = useState(false);

  // One selected → a ghost-primary (blue) button. Multiple → one summary
  // button with a count. Same blue ghost treatment for both — the normalized
  // "selected source/context" pattern (Louis's question).
  // Single chip: the whole chip is the remove control (Gemini pattern) —
  // the leading icon swaps to a × on hover instead of a permanent ×.
  if (selectedIds.length === 1) {
    const id = selectedIds[0];
    return (
      <button
        onClick={() => toggleContent('C6', id)}
        title="Retirer"
        className="group inline-flex items-center gap-1.5 h-11 px-2.5 rounded-lg t-base-medium text-blue-600 hover:bg-blue-50 transition-colors @2xl/surface:h-7 @2xl/surface:px-2 @2xl/surface:rounded-md"
      >
        <span className="relative size-3.5 shrink-0 grid place-items-center">
          <span className="grid place-items-center group-hover:opacity-0 transition-opacity">
            {id.startsWith('matter')
              ? <MatterAvatar id={id} size="sm" />
              : <Icon name={contextIcon(id)} className="size-3.5 text-blue-500" />}
          </span>
          <Icon name="x" className="absolute size-3.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
        <span className="hidden sm:inline truncate">{CONTEXT_LABELS[id] ?? id}</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 h-11 px-2.5 rounded-lg t-base-medium text-blue-600 hover:bg-blue-50 @2xl/surface:h-7 @2xl/surface:px-2 @2xl/surface:rounded-md"
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

/* ----- C5 Imported Files — reads the shared uploaded set ----- */
const IMPORTED_VISIBLE = 3;  // cards shown before "Afficher tout"
// `!` because FileCard hard-codes w-[210px] and `cn` here is a plain join.
const CARD_W = '!w-[172px] shrink-0 @2xl/surface:!w-auto @2xl/surface:flex-1 @2xl/surface:min-w-0';

function ImportedFiles() {
  const setId = useChatbot((s) => s.primitives.C5.axisVariants?.set);
  const openManager = useChatbot((s) => s.setFilesModalOpen);

  const def = uploadSet(setId);
  const files = def.files;

  // Cards — a one-line row; overflow collapses into "Afficher tout".
  const shown = files.slice(0, IMPORTED_VISIBLE);
  const rest = def.count - shown.length;

  // Narrow: the same three cards ride a scroll rail at a legible fixed width
  // rather than being cut to two — the attachment-strip pattern. Wide: they
  // share the row as before.
  return (
    <div className="flex gap-2 mb-2 pt-1 overflow-x-auto scrollbar-thin -mx-1 px-1 @2xl/surface:overflow-visible @2xl/surface:mx-0 @2xl/surface:px-0">
      {shown.map((f) => (
        <FileCard
          key={f.name}
          name={f.name}
          format={f.format}
          meta={f.size}
          onRemove={() => {}}
          className={CARD_W}
        />
      ))}
      {rest > 0 && (
        <button onClick={() => openManager(true)} className="shrink-0 px-6 grid place-items-center rounded-lg border border-zinc-200 bg-white t-base-semibold text-zinc-800 whitespace-nowrap hover:bg-zinc-50">
          Afficher tout
        </button>
      )}
    </div>
  );
}

/* ----- Matter avatar tints (used by the context chips) ----- */
/* Per-matter color tints. Each matter is its own "object" in the user's mind —
   a colored avatar makes the row feel personal (like a folder cover). */
const MATTER_TINTS: Record<string, string> = {
  'matter-moreau':  'bg-gradient-to-br from-emerald-200 to-cyan-300',
  'matter-aurelia': 'bg-gradient-to-br from-indigo-300 to-violet-400',
  'matter-cabinet': 'bg-gradient-to-br from-amber-200 to-orange-300',
};
const DEFAULT_MATTER_TINT = 'bg-gradient-to-br from-fuchsia-300 to-pink-300';

function MatterAvatar({ id, size = 'md' }: { id: string; size?: 'sm' | 'md' }) {
  const tint = MATTER_TINTS[id] ?? DEFAULT_MATTER_TINT;
  const cls = size === 'sm' ? 'size-2.5' : 'size-3.5';
  return <span className={'inline-block rounded-full shrink-0 ' + cls + ' ' + tint} />;
}

