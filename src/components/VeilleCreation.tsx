import { useState } from 'react';
import { useChatbot } from '../chatbot/store';
import { Icon, MODAL_MAX_H, cn } from './ui';
import { ToolCard } from './ToolCard';
import { PrimitiveSlot } from './PrimitiveSlot';

/**
 * A10 — Veille creation. The surface that turns the search the Assistant just
 * ran into a veille, pre-filled from the conversation. Three forms (variant):
 *   - card  — inline setup card in the flow (ToolCard shell)
 *   - strip — one dense row, the "quelques clics" minimum
 *   - modal — the classic création dialog, over the canvas
 * Status is runtime state: setup (configuring) → created (confirmation).
 * The CTA actually flips the status so the flow can be walked in the lab.
 */

/* Fixture — derived from the S1 search (harcèlement moral / points hebdo). */
const VEILLE = {
  title: 'Harcèlement moral & pratiques managériales',
  origin: 'Pré-remplie depuis votre recherche',
  criteria: ['Harcèlement moral', 'Micro-management', 'Points hebdomadaires', 'Charge de la preuve'],
  sources: ['Cass. soc.', 'Cours d’appel', 'Code du travail — L1152'],
};

const FREQUENCIES = [
  { id: 'realtime', label: 'Temps réel' },
  { id: 'daily',    label: 'Quotidienne' },
  { id: 'weekly',   label: 'Hebdomadaire' },
];
const FREQ_LABEL: Record<string, string> = Object.fromEntries(FREQUENCIES.map((f) => [f.id, f.label]));

/* Store plumbing shared by the three forms. */
function useVeille() {
  const a10 = useChatbot((s) => s.primitives.A10);
  const setAxis = useChatbot((s) => s.setPrimitiveAxisVariant);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  const content = Array.isArray(a10.content) ? a10.content : [];
  return {
    visible: a10.visible,
    variant: a10.variant,
    status: a10.axisVariants?.status ?? 'setup',
    content,
    create: () => setAxis('A10', 'status', 'created'),
    reopen: () => setAxis('A10', 'status', 'setup'),
    close: () => { setVisible('A10', false); setAxis('A10', 'status', 'setup'); },
  };
}

/* Local editable setup state (chips are removable, frequency/canal pickable). */
function useSetupState() {
  const [criteria, setCriteria] = useState(VEILLE.criteria);
  const [freq, setFreq] = useState('weekly');
  const [email, setEmail] = useState(true);
  const [inApp, setInApp] = useState(true);
  const removeCriterion = (c: string) => setCriteria((arr) => arr.filter((x) => x !== c));
  return { criteria, removeCriterion, freq, setFreq, email, setEmail, inApp, setInApp };
}

const CREATE_BTN = 'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md t-base-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/30 focus-visible:ring-offset-1';

/* A labelled setup row — muted label column, content right. */
function SetupRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-[76px] shrink-0 pt-1 t-small-medium text-zinc-500">{label}</span>
      <div className="flex-1 min-w-0 flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

/* Removable criterion chip — whole chip is inert, × on the right removes. */
function CriterionChip({ text, onRemove }: { text: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-0.5 h-7 pl-2.5 pr-1 rounded-full border border-zinc-200 bg-white t-base-regular text-zinc-800">
      {text}
      <button
        onClick={onRemove}
        className="size-5 grid place-items-center rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
        title="Retirer ce critère"
      >
        <Icon name="x" className="size-3" />
      </button>
    </span>
  );
}

/* Read-only source chip (the silos/juridictions the veille will watch). */
function SourceChip({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-zinc-100 t-base-regular text-zinc-700">
      <Icon name="scales" className="size-3 text-zinc-400" />
      {text}
    </span>
  );
}

/* Frequency pill group — VARIANT semantics (one at a time). */
function FreqPills({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5" role="radiogroup">
      {FREQUENCIES.map((f) => {
        const active = f.id === value;
        return (
          <button
            key={f.id}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(f.id)}
            className={cn(
              'h-6 px-2.5 rounded-md t-base-medium transition-colors',
              active ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-zinc-900',
            )}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

/* Channel checkbox — STATE semantics (multi-select). */
function ChannelCheck({ checked, onToggle, label, meta }: { checked: boolean; onToggle: () => void; label: string; meta?: string }) {
  return (
    <button onClick={onToggle} className="inline-flex items-center gap-2 h-7 px-1 rounded-md hover:bg-zinc-50 text-left">
      <input type="checkbox" readOnly checked={checked} className="size-3.5 rounded border-zinc-300 accent-zinc-900 pointer-events-none" />
      <span className="t-base-regular text-zinc-800">{label}</span>
      {meta && <span className="t-small-regular text-zinc-400">{meta}</span>}
    </button>
  );
}

/* The setup blocks — shared verbatim by the card and the modal forms. */
function SetupBlocks({ s, content }: { s: ReturnType<typeof useSetupState>; content: string[] }) {
  return (
    <div className="space-y-3">
      {content.includes('criteres') && (
        <SetupRow label="Critères">
          {s.criteria.map((c) => <CriterionChip key={c} text={c} onRemove={() => s.removeCriterion(c)} />)}
          <button className="inline-flex items-center gap-1 h-7 px-2 rounded-full border border-dashed border-zinc-300 t-base-regular text-zinc-500 hover:border-zinc-400 hover:text-zinc-700">
            <Icon name="plus" className="size-3" />
            Ajouter
          </button>
        </SetupRow>
      )}
      {content.includes('sources') && (
        <SetupRow label="Sources">
          {VEILLE.sources.map((src) => <SourceChip key={src} text={src} />)}
        </SetupRow>
      )}
      {content.includes('frequence') && (
        <SetupRow label="Fréquence">
          <FreqPills value={s.freq} onChange={s.setFreq} />
        </SetupRow>
      )}
      {content.includes('canal') && (
        <SetupRow label="Canal">
          <ChannelCheck checked={s.email} onToggle={() => s.setEmail(!s.email)} label="E-mail" meta="thomas@doctrine.fr" />
          <ChannelCheck checked={s.inApp} onToggle={() => s.setInApp(!s.inApp)} label="Notification Doctrine" />
        </SetupRow>
      )}
    </div>
  );
}

/* ------------------------- CARD (inline, setup) ------------------------- */
function VeilleCardSetup() {
  const v = useVeille();
  const s = useSetupState();
  return (
    <ToolCard
      leading={<Icon name="bell" className="size-4 text-zinc-400" />}
      eyebrow={<span className="t-small-medium text-zinc-500">Veille · {VEILLE.origin}</span>}
      title={VEILLE.title}
      subtitle="Soyez alerté des nouvelles décisions et évolutions législatives correspondant à cette recherche."
      actions={
        <button onClick={v.close} className="size-7 grid place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" title="Fermer">
          <Icon name="x" className="size-4" />
        </button>
      }
    >
      <SetupBlocks s={s} content={v.content} />
      <div className="mt-3.5 pt-3 border-t border-zinc-100 flex items-center justify-between gap-3">
        <span className="t-small-regular text-zinc-400">Modifiable à tout moment depuis « Mes veilles »</span>
        <button onClick={v.create} className={CREATE_BTN}>
          <Icon name="bell" className="size-3.5" />
          Créer la veille
        </button>
      </div>
    </ToolCard>
  );
}

/* ------------------------ CARD (inline, created) ------------------------ */
function VeilleCardCreated() {
  const v = useVeille();
  return (
    <ToolCard
      leading={
        <span className="grid place-items-center size-5 rounded-full bg-emerald-100">
          <Icon name="check" className="size-3 text-emerald-600" />
        </span>
      }
      title="Veille créée"
      subtitle={<>{VEILLE.title} · Alerte hebdomadaire par e-mail</>}
      actions={
        <>
          <button onClick={v.reopen} className="inline-flex items-center gap-1 h-7 px-2 rounded-md t-base-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900">
            Modifier
          </button>
          <button className="inline-flex items-center gap-1 t-base-medium text-zinc-900 hover:text-zinc-600 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/25">
            Voir mes veilles
            <Icon name="arrow-right" className="size-3" />
          </button>
        </>
      }
    />
  );
}

/* --------------------------- STRIP (one row) ---------------------------- */
function VeilleStrip() {
  const v = useVeille();
  const s = useSetupState();
  // The strip keeps the "quelques clics" promise: everything defaulted, one
  // visible frequency control (click = cycle), one primary CTA.
  const cycleFreq = () => {
    const i = FREQUENCIES.findIndex((f) => f.id === s.freq);
    s.setFreq(FREQUENCIES[(i + 1) % FREQUENCIES.length].id);
  };

  if (v.status === 'created') {
    return (
      <div className="sg-suggest flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-3 py-2">
        <span className="grid place-items-center size-5 rounded-full bg-emerald-100 shrink-0">
          <Icon name="check" className="size-3 text-emerald-600" />
        </span>
        <span className="t-base-medium text-zinc-900 shrink-0">Veille créée</span>
        <span className="flex-1 min-w-0 t-base-regular text-zinc-400 truncate">
          {VEILLE.title} · {FREQ_LABEL[s.freq]}
        </span>
        <button onClick={v.reopen} className="shrink-0 t-base-medium text-zinc-500 hover:text-zinc-900">Modifier</button>
        <button className="shrink-0 inline-flex items-center gap-1 t-base-medium text-zinc-900 hover:text-zinc-600">
          Voir mes veilles
          <Icon name="arrow-right" className="size-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="sg-suggest flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-3 py-2">
      <Icon name="bell" className="size-4 shrink-0 text-zinc-400" />
      <span className="t-base-medium text-zinc-900 shrink-0">Veille sur cette recherche</span>
      <span className="flex-1 min-w-0 t-base-regular text-zinc-400 truncate">{VEILLE.title}</span>
      <button
        onClick={cycleFreq}
        className="shrink-0 inline-flex items-center gap-1 h-7 px-2 rounded-md border border-zinc-200 t-base-medium text-zinc-700 hover:border-zinc-400"
        title="Changer la fréquence"
      >
        {FREQ_LABEL[s.freq]}
        <Icon name="chevron-down" className="size-3 text-zinc-400" />
      </button>
      <button onClick={v.create} className={CREATE_BTN + ' shrink-0'}>Créer la veille</button>
      <button onClick={v.close} className="shrink-0 size-6 grid place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" title="Fermer">
        <Icon name="x" className="size-3.5" />
      </button>
    </div>
  );
}

/* --------------------------- INLINE MOUNT ------------------------------- */
/** Card + strip forms, mounted in the conversation flow (Conversation.tsx). */
export function VeilleInline() {
  const v = useVeille();
  if (!v.visible || v.variant === 'modal') return null;
  return (
    <PrimitiveSlot code="A10" block>
      {v.variant === 'strip'
        ? <VeilleStrip />
        : v.status === 'created' ? <VeilleCardCreated /> : <VeilleCardSetup />}
    </PrimitiveSlot>
  );
}

/* ------------------------------ MODAL ----------------------------------- */
/** The classic "Créer une veille" dialog, mounted over the canvas (Chatbot.tsx). */
export function VeilleModal() {
  const v = useVeille();
  const s = useSetupState();
  if (!v.visible || v.variant !== 'modal') return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={v.close} />
      <div className={`relative w-full max-w-[520px] ${MODAL_MAX_H} flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden`}>
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-2">
            <Icon name="bell" className="size-4 text-zinc-500" />
            <h2 className="t-title-4 text-zinc-900">Créer une veille</h2>
          </div>
          <button onClick={v.close} className="size-7 grid place-items-center rounded-md text-zinc-500 hover:bg-zinc-100" title="Fermer">
            <Icon name="x" className="size-4" />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto scrollbar-thin">
          {v.status === 'created' ? (
            <div className="px-5 py-8 flex flex-col items-center text-center gap-3">
              <span className="grid place-items-center size-10 rounded-full bg-emerald-100">
                <Icon name="check" className="size-5 text-emerald-600" />
              </span>
              <div>
                <p className="t-base-semibold text-zinc-900">Veille créée</p>
                <p className="t-small-regular text-zinc-500 mt-1">{VEILLE.title} · {FREQ_LABEL[s.freq]}</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <button onClick={v.reopen} className="h-8 px-3 rounded-md border border-zinc-200 t-base-medium text-zinc-700 hover:border-zinc-400">Modifier</button>
                <button onClick={v.close} className={CREATE_BTN}>Voir mes veilles</button>
              </div>
            </div>
          ) : (
            <div className="px-5 py-4 space-y-4">
              <div>
                <p className="t-small-medium text-zinc-500 mb-1">{VEILLE.origin}</p>
                <p className="t-base-semibold text-zinc-900">{VEILLE.title}</p>
              </div>
              <SetupBlocks s={s} content={v.content} />
            </div>
          )}
        </div>

        {v.status !== 'created' && (
          <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between gap-3 shrink-0">
            <span className="t-small-regular text-zinc-400">Modifiable à tout moment depuis « Mes veilles »</span>
            <button onClick={v.create} className={CREATE_BTN}>
              <Icon name="bell" className="size-3.5" />
              Créer la veille
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
