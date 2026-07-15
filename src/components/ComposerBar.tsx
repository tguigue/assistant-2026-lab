import { useState, useRef, useEffect } from 'react';
import { useChatbot } from '../chatbot/store';
import { Icon, FileCard } from './ui';
import { PrimitiveSlot } from './PrimitiveSlot';
import { uploadSet } from '../chatbot/uploadSets';
import { ACTIONS } from './ActionPicker';

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
   PlusMenu — the single "+" entry point (vision design). One button opens a
   dropdown: Ajouter un fichier · Ajouter une base de connaissance (▸) ·
   Sources (▸) · Action. The two "▸" rows open a flyout of toggles. Replaces
   the old paperclip + Sources + Actions button cluster.
   ---------------------------------------------------------------------- */
function PlusSwitch({ on }: { on: boolean }) {
  return (
    <span className={'inline-flex w-8 h-[18px] rounded-full p-0.5 shrink-0 transition-colors ' + (on ? 'bg-blue-600 justify-end' : 'bg-zinc-300 justify-start')}>
      <span className="size-[14px] rounded-full bg-white" />
    </span>
  );
}

function ToggleRow({ label, on, onToggle, chevron, onEnter }: { label: string; on: boolean; onToggle: () => void; chevron?: boolean; onEnter?: () => void }) {
  return (
    <button onClick={onToggle} onMouseEnter={onEnter} className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-zinc-50">
      <PlusSwitch on={on} />
      <span className="flex-1 min-w-0 t-base-regular text-zinc-900 truncate">{label}</span>
      {chevron && <Icon name="chevron-right" className="size-3.5 text-zinc-400 shrink-0" />}
    </button>
  );
}

// A flyout panel to the right of a "+" menu row. `clip` (default) hides
// overflow for clean rounded corners; a flyout that itself hosts a nested
// flyout must set clip={false}, otherwise the child gets clipped away.
function Flyout({ children, clip = true }: { children: React.ReactNode; clip?: boolean }) {
  return (
    <div className={'absolute left-full top-0 ml-1 w-72 rounded-xl border border-zinc-200 bg-white shadow-lg py-1 z-50 ' + (clip ? 'overflow-hidden' : '')}>
      {children}
    </div>
  );
}

function useToggleSet(initial: string[]) {
  const [on, setOn] = useState<Set<string>>(new Set(initial));
  const toggle = (id: string) => setOn((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  return { has: (id: string) => on.has(id), toggle };
}
type ToggleSet = ReturnType<typeof useToggleSet>;

/* ----------------------------------------------------------------------
   Second-level pick lists — the flyout that opens when you hover a "▸" row
   inside the "+" menu (Juridictions / Codes / Clausier / Vos bases de
   connaissance). Each shows the common few inline; the boxed "+" footer opens
   a modal listing them all.
   ---------------------------------------------------------------------- */
type PickItem = { id: string; label: string };
type PickCat = 'bases' | 'juri' | 'codes' | 'clausier';

const JURIDICTIONS: PickItem[] = [
  { id: 'cass',   label: 'Cour de cassation' },
  { id: 'ce',     label: "Conseil d'État" },
  { id: 'ca',     label: "Cours d'appel" },
  { id: 'caa',    label: "Cours administratives d'appel" },
  { id: 'tj',     label: 'Tribunaux judiciaires / TGI' },
  { id: 'tcom',   label: 'Tribunaux de commerce / TAE' },
  { id: 'ta',     label: 'Tribunaux administratifs' },
  { id: 'cc',     label: 'Conseil constitutionnel' },
  { id: 'cjue',   label: "Cour de justice de l'UE (CJUE)" },
  { id: 'cedh',   label: 'Cour EDH (CEDH)' },
  { id: 'cph',    label: "Conseils de prud'hommes" },
  { id: 'comptes',label: 'Cour des comptes' },
];

const CODES_ALL: PickItem[] = [
  { id: 'civil',  label: 'Code civil' },
  { id: 'com',    label: 'Code de commerce' },
  { id: 'trav',   label: 'Code du travail' },
  { id: 'penal',  label: 'Code pénal' },
  { id: 'cpc',    label: 'Code de procédure civile' },
  { id: 'cpp',    label: 'Code de procédure pénale' },
  { id: 'conso',  label: 'Code de la consommation' },
  { id: 'cgi',    label: 'Code général des impôts' },
  { id: 'ccp',    label: 'Code de la commande publique' },
  { id: 'cpi',    label: 'Code de la propriété intellectuelle' },
  { id: 'cja',    label: 'Code de justice administrative' },
  { id: 'cmf',    label: 'Code monétaire et financier' },
];

const CLAUSIER_ALL: PickItem[] = [
  { id: 'confid',   label: 'Clauses de confidentialité' },
  { id: 'noncomp',  label: 'Clauses de non-concurrence' },
  { id: 'respons',  label: 'Clauses limitatives de responsabilité' },
  { id: 'resil',    label: 'Clauses de résiliation' },
  { id: 'forcemaj', label: 'Clauses de force majeure' },
  { id: 'pi',       label: 'Clauses de propriété intellectuelle' },
  { id: 'litiges',  label: 'Clauses de règlement des litiges' },
  { id: 'penale',   label: 'Clauses pénales' },
];

const BASES_ALL: PickItem[] = [
  { id: 'memos',      label: 'Mémos' },
  { id: 'prejudice',  label: 'Préjudice corporel' },
  { id: 'conclusions',label: 'Jeux de conclusions' },
  { id: 'modeles',    label: 'Modèles de contrats' },
  { id: 'fiches',     label: 'Fiches pratiques' },
  { id: 'notes',      label: 'Notes internes' },
];

// The flyout that hangs off a "▸" row: the first few as toggles, then a boxed
// "+" footer (a deliberately bigger plus) that opens the full-list modal.
function PickFlyout({
  all, set, moreLabel, onMore,
}: { all: PickItem[]; set: ToggleSet; moreLabel: string; onMore: () => void }) {
  const shown = all.slice(0, 5);
  const rest = all.length - shown.length;
  return (
    <Flyout>
      {shown.map((it) => (
        <ToggleRow key={it.id} label={it.label} on={set.has(it.id)} onToggle={() => set.toggle(it.id)} />
      ))}
      <div className="my-1 h-px bg-zinc-100" />
      <button onClick={onMore} className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-zinc-50">
        <span className="inline-flex items-center justify-center size-6 rounded-md border border-zinc-300 text-zinc-700 shrink-0">
          <Icon name="plus" className="size-5" />
        </span>
        <span className="flex-1 min-w-0 t-base-medium text-zinc-900 truncate">{moreLabel}</span>
        {rest > 0 && <span className="t-small-regular text-zinc-400 tabular-nums shrink-0">{rest}</span>}
      </button>
    </Flyout>
  );
}

// The "voir tout" modal — the full list with a search + checkbox rows. Shares
// its selection set with the flyout, so picks made either place stay in sync.
function PickModal({
  title, items, set, onClose,
}: { title: string; items: PickItem[]; set: ToggleSet; onClose: () => void }) {
  const [q, setQ] = useState('');
  const filtered = items.filter((it) => it.label.toLowerCase().includes(q.toLowerCase()));
  const count = items.filter((it) => set.has(it.id)).length;
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[60]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[560px] max-w-[92vw] max-h-[80vh] bg-white rounded-2xl shadow-xl border border-zinc-200 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100">
          <h2 className="flex-1 t-h2-semibold text-zinc-900">{title}</h2>
          <button onClick={onClose} className="size-7 grid place-items-center rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900">
            <Icon name="x" className="size-4" />
          </button>
        </div>
        <div className="px-5 pt-3 pb-1">
          <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50">
            <Icon name="search" className="size-4 text-zinc-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher…"
              className="flex-1 bg-transparent outline-none t-base-regular text-zinc-800 placeholder:text-zinc-400"
            />
          </div>
        </div>
        <ul className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2">
          {filtered.map((it) => {
            const on = set.has(it.id);
            return (
              <li key={it.id}>
                <button onClick={() => set.toggle(it.id)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-zinc-50">
                  <span className={
                    'size-4 rounded border shrink-0 inline-flex items-center justify-center ' +
                    (on ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300 bg-white')
                  }>
                    {on && <Icon name="check" className="size-2.5 text-white" />}
                  </span>
                  <span className="flex-1 min-w-0 t-base-regular text-zinc-900 truncate">{it.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-zinc-100 bg-white">
          <span className="t-small-regular text-zinc-500">
            {count > 0 ? `${count} sélectionné${count > 1 ? 's' : ''}` : 'Aucun élément sélectionné'}
          </span>
          <button onClick={onClose} className="h-9 px-4 rounded-lg t-base-medium text-white bg-zinc-900 hover:bg-zinc-800">
            Appliquer
          </button>
        </div>
      </div>
    </>
  );
}

function PlusMenu() {
  const setFilesModalOpen = useChatbot((s) => s.setFilesModalOpen);
  const setActionPickerOpen = useChatbot((s) => s.setActionPickerOpen);
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<null | 'kb' | 'sources' | 'actions'>(null);
  const [sub2, setSub2] = useState<null | PickCat>(null);
  const [modal, setModal] = useState<null | PickCat>(null);
  const ref = useRef<HTMLDivElement>(null);
  const kb = useToggleSet(['vos-bdc', 'sharepoint', 'onedrive']);
  const sources = useToggleSet(['jurisprudences', 'codes', 'fiscal', 'clausier']);

  // Second-level selections. Kept here so the flyout and its "voir tout" modal
  // share one set. Clausier is selected by default (per product intent).
  const bases = useToggleSet([]);
  const juri = useToggleSet([]);
  const codes = useToggleSet([]);
  const clausier = useToggleSet(CLAUSIER_ALL.map((i) => i.id));
  const PICKS: Record<PickCat, { title: string; all: PickItem[]; set: ToggleSet }> = {
    bases:    { title: 'Vos bases de connaissance', all: BASES_ALL,    set: bases },
    juri:     { title: 'Juridictions',              all: JURIDICTIONS, set: juri },
    codes:    { title: 'Codes',                     all: CODES_ALL,    set: codes },
    clausier: { title: 'Clausier',                  all: CLAUSIER_ALL, set: clausier },
  };

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) { setOpen(false); setSub(null); setSub2(null); } };
    window.addEventListener('mousedown', h);
    return () => window.removeEventListener('mousedown', h);
  }, [open]);

  const close = () => { setOpen(false); setSub(null); setSub2(null); };
  const openModal = (c: PickCat) => { setModal(c); close(); };

  const MenuItem = ({ icon, label, chevron, onClick, hover }: { icon: string; label: string; chevron?: boolean; onClick?: () => void; hover?: () => void }) => (
    <button
      onClick={onClick}
      onMouseEnter={hover}
      className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-zinc-50"
    >
      <Icon name={icon} className="size-4 text-zinc-500 shrink-0" />
      <span className="flex-1 min-w-0 t-base-regular text-zinc-900 truncate">{label}</span>
      {chevron && <Icon name="chevron-right" className="size-3.5 text-zinc-400 shrink-0" />}
    </button>
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Ajouter"
        aria-expanded={open}
        className="inline-flex items-center justify-center size-7 rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      >
        <Icon name="plus" className="size-4" />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-64 rounded-xl border border-zinc-200 bg-white shadow-lg py-1 z-40">
          <MenuItem icon="paperclip" label="Ajouter un fichier" onClick={() => { setFilesModalOpen(true); close(); }} hover={() => { setSub(null); setSub2(null); }} />
          <div className="relative" onMouseEnter={() => { setSub('kb'); setSub2(null); }}>
            <MenuItem icon="database" label="Ajouter une base de connaissance" chevron />
            {sub === 'kb' && (
              <Flyout clip={false}>
                <p onMouseEnter={() => setSub2(null)} className="px-3 pt-1.5 pb-2 t-small-regular text-zinc-500 leading-snug">
                  Sélectionnez votre GED et l’assistant identifiera les documents pertinents.{' '}
                  <span className="text-blue-600">En savoir plus</span>
                </p>
                <div className="relative" onMouseEnter={() => setSub2('bases')}>
                  <ToggleRow label="Vos Bases de connaissance" on={kb.has('vos-bdc')} onToggle={() => kb.toggle('vos-bdc')} chevron />
                  {sub2 === 'bases' && <PickFlyout all={PICKS.bases.all} set={PICKS.bases.set} moreLabel="Voir toutes les bases" onMore={() => openModal('bases')} />}
                </div>
                <ToggleRow label="SharePoint" on={kb.has('sharepoint')} onToggle={() => kb.toggle('sharepoint')} onEnter={() => setSub2(null)} />
                <ToggleRow label="OneDrive" on={kb.has('onedrive')} onToggle={() => kb.toggle('onedrive')} onEnter={() => setSub2(null)} />
                <button onMouseEnter={() => setSub2(null)} className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-zinc-50 t-base-medium text-zinc-900">
                  <Icon name="plus" className="size-4 text-zinc-500 shrink-0" />
                  Ajouter une GED
                </button>
              </Flyout>
            )}
          </div>
          <div className="relative" onMouseEnter={() => { setSub('sources'); setSub2(null); }}>
            <MenuItem icon="account-balance" label="Sources" chevron />
            {sub === 'sources' && (
              <Flyout clip={false}>
                <div className="relative" onMouseEnter={() => setSub2('juri')}>
                  <ToggleRow label="Jurisprudences" on={sources.has('jurisprudences')} onToggle={() => sources.toggle('jurisprudences')} chevron />
                  {sub2 === 'juri' && <PickFlyout all={PICKS.juri.all} set={PICKS.juri.set} moreLabel="Voir toutes les juridictions" onMore={() => openModal('juri')} />}
                </div>
                <div className="relative" onMouseEnter={() => setSub2('codes')}>
                  <ToggleRow label="Codes" on={sources.has('codes')} onToggle={() => sources.toggle('codes')} chevron />
                  {sub2 === 'codes' && <PickFlyout all={PICKS.codes.all} set={PICKS.codes.set} moreLabel="Voir tous les codes" onMore={() => openModal('codes')} />}
                </div>
                <ToggleRow label="Le Fiscal" on={sources.has('fiscal')} onToggle={() => sources.toggle('fiscal')} onEnter={() => setSub2(null)} />
                <div className="relative" onMouseEnter={() => setSub2('clausier')}>
                  <ToggleRow label="Clausier" on={sources.has('clausier')} onToggle={() => sources.toggle('clausier')} chevron />
                  {sub2 === 'clausier' && <PickFlyout all={PICKS.clausier.all} set={PICKS.clausier.set} moreLabel="Voir tout le clausier" onMore={() => openModal('clausier')} />}
                </div>
              </Flyout>
            )}
          </div>
          <div className="relative" onMouseEnter={() => { setSub('actions'); setSub2(null); }}>
            <MenuItem icon="bolt" label="Action" chevron />
            {sub === 'actions' && (
              <Flyout>
                {ACTIONS.slice(0, 5).map((a) => (
                  <button key={a.id} onClick={close} className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-zinc-50">
                    <Icon name="bolt" className="size-4 text-zinc-400 shrink-0" />
                    <span className="flex-1 min-w-0 t-base-regular text-zinc-900 truncate">{a.title}</span>
                  </button>
                ))}
                <div className="my-1 h-px bg-zinc-100" />
                <button onClick={() => { setActionPickerOpen(true); close(); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-zinc-50 t-base-medium text-zinc-700">
                  <Icon name="more-horiz" className="size-4 text-zinc-500 shrink-0" />
                  Voir toutes les actions
                </button>
              </Flyout>
            )}
          </div>
        </div>
      )}
      {modal && (
        <PickModal title={PICKS[modal].title} items={PICKS[modal].all} set={PICKS[modal].set} onClose={() => setModal(null)} />
      )}
    </div>
  );
}

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

  if (viewMode === 'full' || !c9Visible || matterIds.length === 0) return null;
  const chosen = active !== 'idle' && matterIds.includes(active);
  const scopeTo = (id: string) => { setVariant('C8', id); setVisible('C8', true); setOpen(false); };
  const detach = () => { setVariant('C8', 'idle'); setOpen(false); };

  return (
    <div className="relative px-1.5 pt-1.5">
      <button
        onClick={() => setOpen((o) => !o)}
        title={chosen ? 'Changer de dossier' : 'Choisir un dossier'}
        className="inline-flex items-center gap-2 h-8 pl-1 pr-2.5 rounded-full hover:bg-zinc-200/70 transition-colors"
      >
        {chosen ? (
          <span className={'size-6 rounded-full shrink-0 ring-1 ring-black/5 ' + (C9_MATTER_TINTS[active] ?? 'bg-zinc-300')} />
        ) : (
          <span className="size-6 rounded-full grid place-items-center bg-white shrink-0"><Icon name="folder" className="size-3.5 text-zinc-500" /></span>
        )}
        <span className={'truncate max-w-[280px] t-base-medium ' + (chosen ? 'text-zinc-900' : 'text-zinc-500')}>
          {chosen ? (C9_MATTER_LABELS[active] ?? active) : 'Choisir un dossier'}
        </span>
        <Icon name="chevron-down" className="size-3.5 text-zinc-400 shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-1.5 top-11 z-40 w-64 rounded-xl border border-zinc-200 bg-white shadow-lg py-1">
            {matterIds.map((id) => (
              <button key={id} onClick={() => scopeTo(id)} className="w-full flex items-center gap-2.5 px-3 h-9 text-left hover:bg-zinc-50">
                <span className={'size-2.5 rounded-full shrink-0 ' + (C9_MATTER_TINTS[id] ?? 'bg-zinc-200')} />
                <span className="flex-1 min-w-0 t-base-medium text-zinc-800 truncate">{C9_MATTER_LABELS[id] ?? id}</span>
                {chosen && id === active && <Icon name="check" className="size-4 text-zinc-900 shrink-0" />}
              </button>
            ))}
            {chosen && (
              <>
                <div className="my-1 h-px bg-zinc-100" />
                <button onClick={detach} className="w-full flex items-center gap-2.5 px-3 h-9 text-left hover:bg-zinc-50 t-base-medium text-zinc-500">
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

  const setActionPickerOpen = useChatbot((s) => s.setActionPickerOpen);

  // Compact rule — off full-screen (doc panel, mobile) the composer shrinks:
  // Sources / Actions / Mode / levels fold away (reachable via + and the
  // placeholder link), only + and mic/send survive inline.
  const compact = useChatbot((s) => s.surface) !== 'fullscreen';
  // After an answer, the compact composer invites refinement (the draft
  // experience): plain "Affinez…", no actions link.
  const refining = useChatbot((s) => s.viewMode) === 'full';

  return (
    <div className="relative">
      {/* Vision composer: a tinted band holds the white input card, with the
          folder scope sitting on the band below the input. */}
      <div className="rounded-2xl border border-zinc-200 bg-zinc-100 p-1.5">
      <div className={'rounded-xl border border-zinc-200 bg-white shadow-sm focus-within:border-zinc-400 transition-colors ' + (compact ? 'px-3 pt-2.5 pb-2' : 'px-3.5 pt-3 pb-2.5')}>
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
            placeholder={compact ? (refining ? 'Affinez…' : '') : 'Demander à l’Assistant…'}
          />
          {compact && !refining && !draft && (
            <div className="absolute inset-x-0 top-0 t-base-regular text-zinc-400 pointer-events-none">
              Demander à l’Assistant ou{' '}
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
            {/* One "+" entry point (vision design): file · knowledge base ·
                sources · action, all under a single dropdown. */}
            <PlusMenu />

            {/* C2 — Mode (Switch / Segmented), right next to the + menu */}
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
      {/* Folder scope — sits on the band, below the input (vision design). */}
      <FolderScope />
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
      </button>
    );
  };
  return (
    <>
      <div className="px-3 pt-1.5 pb-1 t-small-regular text-zinc-400">{title}</div>
      {options.map(Row)}
      {more && more.length > 0 && (
        <div className="relative" onMouseEnter={() => setMoreOpen(true)} onMouseLeave={() => setMoreOpen(false)}>
          <div className="w-full flex items-center gap-2 px-3 py-2 hover:bg-zinc-50 cursor-default">
            <span className="flex-1 t-base-medium text-zinc-700">Autres modèles</span>
            <span className="t-small-regular text-zinc-400 tabular-nums">{more.length}</span>
            <Icon name="chevron-right" className="size-3.5 text-zinc-400" />
          </div>
          {moreOpen && (
            <div className="absolute right-full top-0 mr-1 w-[260px] bg-white border border-zinc-200 rounded-xl shadow-lg py-1 z-50">
              {more.map(Row)}
            </div>
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

  const active = (fullList ? [...FULL, ...FULL_MORE] : options).find((o) => o.id === sel) ?? options[0];
  const activeLocked = limitReached && !!active.locksOnLimit;
  const pick = (id: string) => { setSel(id); setOpen(false); };
  const menu = (
    <OptionMenu title={title} options={options} more={fullList ? FULL_MORE : undefined} activeId={sel} nearLimit={nearLimit} limitReached={limitReached} onPick={pick} />
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
        <div className="absolute bottom-full right-0 mb-2 w-[300px] bg-white border border-zinc-200 rounded-xl shadow-lg z-30">
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

