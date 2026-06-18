import { useState, useRef, useEffect } from 'react';
import { useChatbot } from '../chatbot/store';
import { Icon, FileCard } from './ui';
import { PrimitiveSlot } from './PrimitiveSlot';
import { uploadSet } from '../chatbot/uploadSets';

/**
 * ComposerBar — reads C1–C8 from primitive variants and adapts the input row.
 */
export function ComposerBar({ seed, onSend }: { seed?: string; onSend?: () => void } = {}) {
  const prim = useChatbot((s) => s.primitives);
  const viewMode = useChatbot((s) => s.viewMode);
  const surface = useChatbot((s) => s.surface);

  // Resolve each primitive: variant if visible, else 'hidden'.
  const v = (code: keyof typeof prim) => (prim[code].visible ? prim[code].variant : 'hidden');
  const c2 = v('C2');
  const c2ContentSet = Array.isArray(prim.C2.content) ? prim.C2.content : [];
  const c5 = v('C5');
  const c7 = v('C7');
  const c9 = v('C9');
  const c12 = v('C12'); // widget: dropdown | meter
  const c12Flags = Array.isArray(prim.C12.content) ? prim.C12.content : [];
  const c12Status = prim.C12.axisVariants?.status ?? 'normal'; // normal | near | reached
  const c9ContentSet = Array.isArray(prim.C9.content) ? prim.C9.content : [];
  const c6Visible = prim.C6.visible;
  const c6ContentSet = Array.isArray(prim.C6.content) ? prim.C6.content : [];

  return (
    <div className="space-y-2">
      {/* C9 — Matters banner (pick a matter to scope). Only in the empty composer;
          in the answer the scope already shows in the conversation header. */}
      {viewMode !== 'full' && c9 !== 'hidden' && c9ContentSet.length > 0 && (
        <PrimitiveSlot code="C9" block><MatterChips matterIds={c9ContentSet} /></PrimitiveSlot>
      )}

      {/* The main composer card — Mode (C2) renders inside it */}
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
  const c9variant = useChatbot((s) => s.primitives.C9.variant);
  const setVariant = useChatbot((s) => s.setPrimitiveVariant);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  const setContextPicker = useChatbot((s) => s.setContextPicker);
  const [folderOpen, setFolderOpen] = useState(false);

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
        <button
          onClick={detach}
          title="Détacher du matter"
          className="group inline-flex items-center gap-1.5 h-7 pl-2.5 pr-2 rounded-full border border-zinc-900 bg-zinc-900 text-white t-base-medium hover:bg-zinc-800 transition-colors"
        >
          <span className={'inline-block rounded-full size-2.5 shrink-0 ' + (C9_MATTER_TINTS[id] ?? 'bg-zinc-200')} />
          {C9_MATTER_LABELS[id] ?? id}
          <Icon name="x" className="size-3 ml-0.5 text-white/70 group-hover:text-white" />
        </button>
      </div>
    );
  }

  // ── UNSCOPED: pickable chips (recents). ──
  // "picker" prepends a labeled, clearly-OPTIONAL "Choisir un dossier" entry so
  // the row's purpose (scope to a folder) is obvious; it also replaces "Voir
  // plus" since it opens the full matters picker. "chips" is the bare recents.
  const labeled = c9variant === 'picker';

  // ── CREATE: no folder yet — nudge the user to make one. ──
  if (c9variant === 'create') {
    return (
      <div className="flex items-center gap-2.5">
        <button className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-3 rounded-full border border-dashed border-zinc-300 bg-white t-base-medium text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50 transition-colors">
          <Icon name="plus" className="size-3.5 text-zinc-500" />
          Créer un dossier
        </button>
        <span className="t-small-regular text-zinc-400">Vos dossiers apparaîtront ici</span>
      </div>
    );
  }

  const shown = matterIds.slice(0, C9_VISIBLE_COUNT);
  const hasMore = matterIds.length > C9_VISIBLE_COUNT;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {labeled && (
        <div className="relative">
          <button
            onClick={() => setFolderOpen((o) => !o)}
            title="Limiter la conversation à un dossier (optionnel)"
            className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-2 rounded-full border border-zinc-300 bg-white t-base-medium text-zinc-700 hover:border-zinc-400 transition-colors"
          >
            <Icon name="folder" className="size-3.5 text-zinc-500" />
            Choisir un dossier
            <Icon name="chevron-down" className={'size-3 text-zinc-400 transition-transform ' + (folderOpen ? 'rotate-180' : '')} />
          </button>
          {folderOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setFolderOpen(false)} />
              {/* Pick a FOLDER to scope the conversation — no documents here. */}
              <div className="absolute left-0 top-9 z-40 w-64 max-h-72 overflow-y-auto scrollbar-thin rounded-xl border border-zinc-200 bg-white shadow-lg py-1">
                {matterIds.map((id) => (
                  <button
                    key={id}
                    onClick={() => { scopeTo(id); setFolderOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-50"
                  >
                    <span className={'inline-block rounded-full size-2.5 shrink-0 ' + (C9_MATTER_TINTS[id] ?? 'bg-zinc-200')} />
                    <span className="flex-1 min-w-0 t-base-regular text-zinc-800 truncate">{C9_MATTER_LABELS[id] ?? id}</span>
                  </button>
                ))}
                {/* Create is always available — even with existing folders. */}
                <div className="my-1 h-px bg-zinc-100" />
                <button
                  onClick={() => setFolderOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-50 t-base-medium text-zinc-900"
                >
                  <Icon name="plus" className="size-3.5 text-zinc-500" />
                  Créer un dossier
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {shown.map((id) => (
        <button
          key={id}
          onClick={() => scopeTo(id)}
          title={C9_MATTER_META[id]}
          className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-zinc-200 bg-white t-base-medium text-zinc-700 hover:border-zinc-400 transition-colors"
        >
          <span className={'inline-block rounded-full size-2.5 shrink-0 ' + (C9_MATTER_TINTS[id] ?? 'bg-zinc-200')} />
          {C9_MATTER_LABELS[id] ?? id}
        </button>
      ))}
      {!labeled && hasMore && (
        <button
          onClick={() => setContextPicker('matters')}
          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full border border-zinc-200 bg-white t-base-regular text-zinc-500 hover:border-zinc-400"
        >
          Voir plus
          <Icon name="chevron-right" className="size-3" />
        </button>
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
  c2, c2ContentSet, c5, c7, c12, c12Flags, c12Status, c6Visible, c6ContentSet, seed, onSend,
}: {
  c2: string; c2ContentSet: string[]; c5: string; c7: string; c12: string; c12Flags: string[]; c12Status: string; c6Visible: boolean; c6ContentSet: string[];
  seed?: string; onSend?: () => void;
}) {
  const [draft, setDraft] = useState(seed ?? '');
  // Re-seed when the demo loads a different use case (seed changes).
  useEffect(() => { setDraft(seed ?? ''); }, [seed]);

  const setActionPickerOpen = useChatbot((s) => s.setActionPickerOpen);
  const setFilesModalOpen = useChatbot((s) => s.setFilesModalOpen);
  const setContextPicker = useChatbot((s) => s.setContextPicker);

  // Compact rule — off full-screen (doc panel, mobile) the composer shrinks:
  // Sources / Actions / Mode / levels fold away (reachable via + and the
  // placeholder link), only + and mic/send survive inline.
  const compact = useChatbot((s) => s.surface) !== 'fullscreen';
  // After an answer, the compact composer invites refinement (the draft
  // experience): plain "Affinez…", no actions link.
  const refining = useChatbot((s) => s.viewMode) === 'full';

  return (
    <div className="relative">
      <div className={'rounded-2xl border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 focus-within:border-zinc-900 transition-colors ' + (compact ? 'px-3 pt-3 pb-2' : 'px-4 pt-4 pb-2.5')}>
        {c7 !== 'hidden' && (
          <PrimitiveSlot code="C7" block><Snapshot /></PrimitiveSlot>
        )}
        {c5 !== 'hidden' && (
          <PrimitiveSlot code="C5" block><ImportedFiles /></PrimitiveSlot>
        )}
        {/* Plain placeholder — actions are opened from the Actions CTA(s), not a
            link here (we'd otherwise have three ways to open the same modal).
            EXCEPT in compact mode: the Actions button is folded away, so the
            placeholder carries the "voir les actions" link instead. */}
        <div className={'relative ' + (compact ? 'pb-2' : 'pb-3')}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={'w-full flex-1 text-zinc-900 placeholder:text-zinc-400 outline-none resize-none bg-transparent leading-snug ' + (compact ? 't-base-regular' : 't-large-regular')}
            rows={compact ? 1 : 2}
            placeholder={compact ? (refining ? 'Affinez…' : '') : 'Demander à Doctrine…'}
          />
          {compact && !refining && !draft && (
            <div className="absolute inset-x-0 top-0 t-base-regular text-zinc-400 pointer-events-none">
              Demander à Doctrine ou{' '}
              <button
                onClick={() => setActionPickerOpen(true)}
                className="pointer-events-auto text-blue-600 hover:text-blue-700"
              >
                voir les actions
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1.5">
            {/* + button IS the Context primitive (C6): its presence depends on
                C6 being visible. Picked materials render as chips below. */}
            {c6Visible && (
              <PrimitiveSlot code="C6">
                <button
                  onClick={() => setFilesModalOpen(true)}
                  className="inline-flex items-center justify-center size-7 rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  title="Joindre un fichier"
                >
                  <Icon name="paperclip" className="size-4" />
                </button>
              </PrimitiveSlot>
            )}

            {/* Sources — opens the side panel with all sources (legal, KB, SharePoint). */}
            {!compact && (
              <button
                onClick={() => setContextPicker('sources')}
                className="inline-flex items-center gap-1.5 h-7 px-2.5 t-base-medium text-zinc-700 rounded-md hover:bg-zinc-100"
              >
                <Icon name="account-balance" className="size-3.5 text-zinc-500" />
                Sources
              </button>
            )}

            {/* Actions — opens the action picker (same modal as "Toutes les actions"). */}
            {!compact && (
              <button
                onClick={() => setActionPickerOpen(true)}
                className="inline-flex items-center gap-1.5 h-7 px-2.5 t-base-medium text-zinc-700 rounded-md hover:bg-zinc-100"
              >
                <Icon name="bolt" className="size-3.5 text-zinc-500" />
                Actions
              </button>
            )}

            {/* C2 — Mode (Switch / Segmented), right next to Sources */}
            {!compact && c2 !== 'hidden' && (
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
            {/* C12 — Token budget / limit (progressive ladder rung) */}
            {!compact && c12 !== 'hidden' && (
              <PrimitiveSlot code="C12">
                <BudgetControl flags={c12Flags} status={c12Status} />
              </PrimitiveSlot>
            )}
            {/* One slot: mic when empty, send when the draft has content. */}
            <SendOrMic hasText={!!draft.trim()} onSend={onSend} compact={compact} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* One shared slot for the mic / send affordance. Mic shows while the draft is
   empty, the filled send button once there's text — they crossfade in place so
   the footer never shifts. Both are size-7 to keep the slot stable.
   Compact surfaces use the product's round blue send. */
function SendOrMic({ hasText, onSend, compact }: { hasText: boolean; onSend?: () => void; compact?: boolean }) {
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
          'absolute inset-0 inline-flex items-center justify-center text-white transition-all duration-150 ' +
          (compact ? 'rounded-full bg-blue-600 hover:bg-blue-700 ' : 'rounded-md bg-zinc-900 hover:bg-zinc-800 ') +
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
const FULL: BudgetOpt[] = [
  { id: 'defaut', label: 'Défaut',            hint: 'Recommandé', recommended: true },
  { id: 'sonnet', label: 'Claude Sonnet 4.6', hint: 'Équilibré, efficace' },
  { id: 'opus',   label: 'Claude Opus 4.7',   hint: 'Approfondi, plus lent', locksOnLimit: true },
  { id: 'flash',  label: 'Gemini 3 Flash',    hint: 'Rapide, itératif' },
  { id: 'pro',    label: 'Gemini 3.1 Pro',    hint: 'Profond, créatif', locksOnLimit: true },
  { id: 'gpt',    label: 'GPT-5.5',           hint: 'Polyvalent, rapide' },
];

// Usage shown as a percentage of the session limit (+ reset time). No credits/
// tokens/price. limit-reached → 100%, near-limit → 88%.
const USAGE = { pct: 30, near: 88, reset: '3 h' };

function OptionMenu({
  title, options, activeId, nearLimit, limitReached, onPick,
}: {
  title: string; options: BudgetOpt[]; activeId: string;
  nearLimit: boolean; limitReached: boolean; onPick: (id: string) => void;
}) {
  return (
    <>
      <div className="px-3 pt-1.5 pb-1 t-small-regular text-zinc-400">{title}</div>
      {options.map((o) => {
        const locked = limitReached && o.locksOnLimit;
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
          </button>
        );
      })}
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

function BudgetControl({ flags, status }: { flags: string[]; status: string }) {
  const has = (id: string) => flags.includes(id);
  const fullList = has('full-list');
  const showUsage = has('usage-meter');
  const forceOpen = has('open');
  const nearLimit = status === 'near';
  const limitReached = status === 'reached';

  const options = fullList ? FULL : COMPACT;
  const title = fullList ? 'Modèle' : 'Niveau d’effort';
  const defaultId = (options.find((o) => o.recommended) ?? options[0]).id;
  const [sel, setSel] = useState(defaultId);
  useEffect(() => { setSel(defaultId); }, [fullList]); // eslint-disable-line react-hooks/exhaustive-deps

  const [open, setOpen] = useState(false);
  const isOpen = open || forceOpen;
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [open]);

  const active = options.find((o) => o.id === sel) ?? options[0];
  const activeLocked = limitReached && !!active.locksOnLimit;
  const pick = (id: string) => { setSel(id); setOpen(false); };
  const menu = (
    <OptionMenu title={title} options={options} activeId={sel} nearLimit={nearLimit} limitReached={limitReached} onPick={pick} />
  );

  // The trigger is ALWAYS the plain label. "Show usage %" only adds a usage
  // header INSIDE the open menu (not in the footer trigger).
  const warn = limitReached || nearLimit;
  const pct = limitReached ? 100 : nearLimit ? USAGE.near : USAGE.pct;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md t-base-medium text-zinc-700 hover:bg-zinc-100">
        {active.label}
        {activeLocked && <Icon name="alert" className="size-3.5 text-amber-500" />}
        <Icon name="chevron-down" className={'size-3.5 text-zinc-400 transition-transform ' + (isOpen ? 'rotate-180' : '')} />
      </button>
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-[300px] bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden z-30">
          {showUsage && (
            <div className="px-3 pt-3 pb-2.5 border-b border-zinc-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="t-small-regular text-zinc-500">Usage de la session</span>
                <span className={'t-small-medium ' + (warn ? 'text-amber-600' : 'text-zinc-700')}>{pct}% · réinit. {USAGE.reset}</span>
              </div>
              <span className="block relative h-1.5 w-full rounded-full bg-zinc-200 overflow-hidden">
                <span className={'absolute inset-y-0 left-0 rounded-full ' + (warn ? 'bg-amber-500' : 'bg-zinc-700')} style={{ width: pct + '%' }} />
              </span>
            </div>
          )}
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

  // Each chip's inner content: icon + label (hidden on mobile) + remove ×.
  const chipBody = (id: string) => (
    <>
      {id.startsWith('matter')
        ? <MatterAvatar id={id} size="sm" />
        : <Icon name={contextIcon(id)} className="size-3.5 text-blue-500 shrink-0" />}
      <span className="hidden sm:inline truncate">{CONTEXT_LABELS[id] ?? id}</span>
      <button
        onClick={() => toggleContent('C6', id)}
        className="text-blue-400 hover:text-blue-700 ml-0.5 leading-none shrink-0"
        title="Retirer"
      >
        ×
      </button>
    </>
  );

  // One selected → a ghost-primary (blue) button. Multiple → one summary
  // button with a count. Same blue ghost treatment for both — the normalized
  // "selected source/context" pattern (Louis's question).
  if (selectedIds.length === 1) {
    return (
      <span className="inline-flex items-center gap-1.5 h-7 px-2 rounded-md t-base-medium text-blue-600 hover:bg-blue-50 transition-colors">
        {chipBody(selectedIds[0])}
      </span>
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

/* ----- C5 Imported Files — reads the shared uploaded set ----- */
const IMPORTED_VISIBLE = 2;       // cards shown before "Afficher tout" — doc panel / mobile
const IMPORTED_VISIBLE_FULL = 3;  // full screen

function ImportedFiles() {
  const compact = useChatbot((s) => s.surface) !== 'fullscreen';
  const setId = useChatbot((s) => s.primitives.C5.axisVariants?.set);
  const openManager = useChatbot((s) => s.setFilesModalOpen);

  const def = uploadSet(setId);
  const files = def.files;

  // Cards — a one-line row; overflow collapses into "Afficher tout".
  const cap = compact ? IMPORTED_VISIBLE : IMPORTED_VISIBLE_FULL;
  const shown = files.slice(0, cap);
  const rest = def.count - shown.length;

  return (
    <div className="flex gap-2 mb-2 pt-1">
      {shown.map((f) => (
        <FileCard key={f.name} name={f.name} format={f.format} meta={f.size} onRemove={() => {}} className="flex-1 min-w-0 !w-auto" />
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

