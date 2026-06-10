import { useState } from 'react';
import { useChatbot } from '../chatbot/store';
import { Icon } from './ui';

/**
 * C13 — Upgrade modal. FULLY checkbox-composed (no radios): each section is an
 * independent toggle that stacks in the modal, so any cross-combination is
 * reachable. Checkboxes:
 *   sec-usage · sec-plans · sec-topup · sec-contact  (which sections show)
 *   admin       (self-serve vs request-from-admin)
 *   breakdown   (detailed usage split, inside the usage section)
 *   blocking    (limit-hit framing)
 *   request-sent(success state, replaces the body)
 *   open        (show the modal at all)
 * No prices anywhere — credits only. Scoped to the canvas (absolute, not fixed)
 * so the design sidebar stays usable while it's open.
 */

// Usage as % of limit (+ reset), no credits/tokens/price. Mirrors the Claude
// usage panel: several limits, each "X% · réinit. …".
const LIMITS = [
  { label: 'Session',                reset: 'réinit. 3 h', pct: 30 },
  { label: 'Hebdomadaire · tous modèles', reset: 'réinit. 4 j', pct: 10 },
];
const PLANS = [
  { id: 'essentiel',  name: 'Essentiel',  meta: 'Limites standard', current: true },
  { id: 'pro',        name: 'Pro',        meta: 'Limites étendues · effort maximal inclus' },
  { id: 'entreprise', name: 'Entreprise', meta: 'Limites illimitées · support dédié' },
];
const REASONS = ['Dossier urgent', 'Pic d’activité', 'Besoin récurrent'];

const PRIMARY = 'w-full h-9 rounded-md bg-zinc-900 text-white t-base-medium hover:bg-zinc-800 transition-colors';
const SECTION_TITLE = 'mb-2 t-small-semibold text-zinc-900';

export function UpgradeModal() {
  const c13 = useChatbot((s) => s.primitives.C13);
  const toggleContent = useChatbot((s) => s.togglePrimitiveContent);
  const [creditPack, setCreditPack] = useState('max');
  const [plan, setPlan] = useState('pro');

  const content = Array.isArray(c13?.content) ? c13!.content : [];
  if (!c13?.visible || !content.includes('open')) return null;

  // WHO opened the modal drives what they can do (radio): solo | member | admin.
  //   solo   → self-serve plan upgrade (own account)
  //   member → can't pay; requests more from their workspace admin
  //   admin  → manages seat billing / credits for the team
  const role = c13.axisVariants?.role ?? 'solo';
  // Mutually-exclusive modal status (radio): normal | blocking | sent.
  const status = c13.axisVariants?.status ?? 'normal';
  const blocking = status === 'blocking';
  const requestSent = status === 'sent';
  const close = () => toggleContent('C13', 'open');

  // Usage always anchors the top; the action below is role-specific.
  const blocks: React.ReactNode[] = [
    <UsageSection key="u" blocking={blocking} />,
  ];
  if (role === 'solo')   blocks.push(<PlansSection key="p" plan={plan} setPlan={setPlan} />);
  if (role === 'member') blocks.push(<RequestSection key="r" />);
  if (role === 'admin')  blocks.push(<CreditPacksSection key="c" pack={creditPack} setPack={setCreditPack} />);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div className="relative w-full max-w-[460px] max-h-[88%] flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-zinc-100 shrink-0">
          <h2 className="t-title-4 text-zinc-900">Gérer votre budget</h2>
          <button onClick={close} className="size-7 grid place-items-center rounded-md text-zinc-500 hover:bg-zinc-100" title="Fermer">
            <Icon name="x" className="size-4" />
          </button>
        </div>

        {blocking && !requestSent && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 border-b border-amber-100 shrink-0">
            <Icon name="alert" className="size-4 text-amber-600 shrink-0" />
            <span className="t-small-medium text-amber-800">Limite atteinte — choisissez une option pour continuer.</span>
          </div>
        )}

        <div className="min-h-0 overflow-y-auto scrollbar-thin">
          {requestSent ? (
            <SentState role={role} />
          ) : (
            blocks.map((b, i) => (
              <div key={i} className={'px-5 py-4 ' + (i > 0 ? 'border-t border-zinc-100' : '')}>{b}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function UsageSection({ blocking }: { blocking: boolean }) {
  return (
    <div className="space-y-3.5">
      {LIMITS.map((l, i) => {
        // The session limit (first) is the one that's hit when blocking.
        const pct = blocking && i === 0 ? 100 : l.pct;
        const warn = blocking && i === 0;
        return (
          <div key={l.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="t-small-regular text-zinc-600">{l.label}</span>
              <span className={'t-small-regular ' + (warn ? 'text-amber-600' : 'text-zinc-500')}>{pct}% · {l.reset}</span>
            </div>
            <span className="block relative h-2 w-full rounded-full bg-zinc-200 overflow-hidden">
              <span className={'absolute inset-y-0 left-0 rounded-full ' + (warn ? 'bg-amber-500' : 'bg-zinc-700')} style={{ width: pct + '%' }} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Shared selectable row used by both Upgrade plan and Extra usage so the two
// sections read identically: title (+ optional meta) left, badge + radio right.
// A `current` row is non-selectable and shows an "Actuel" tag instead of a radio.
function SelectRow({ title, meta, badge, selected, current, onSelect }: {
  title: string; meta?: string; badge?: string; selected: boolean; current?: boolean; onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={current}
      onClick={onSelect}
      className={
        'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left transition-colors ' +
        (current ? 'border-zinc-200 bg-zinc-50 cursor-default'
          : selected ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:bg-zinc-50')
      }
    >
      <span className="min-w-0">
        <span className="block t-base-medium text-zinc-900">{title}</span>
        {meta && <span className="block t-small-regular text-zinc-500">{meta}</span>}
      </span>
      <span className="flex items-center gap-2 shrink-0">
        {badge && <span className="t-small-medium text-zinc-500">{badge}</span>}
        {current ? (
          <span className="t-small-medium text-zinc-500">Actuel</span>
        ) : (
          <span className={'size-4 rounded-full border grid place-items-center ' + (selected ? 'border-zinc-900 bg-zinc-900' : 'border-zinc-300')}>
            {selected && <Icon name="check" className="size-2.5 text-white" />}
          </span>
        )}
      </span>
    </button>
  );
}

// THE shared section. Upgrade plan and Extra usage are the exact same design —
// a titled list of selectable rows + one bottom CTA. Only the copy/data differs.
type Option = { id: string; name: string; meta?: string; popular?: boolean; current?: boolean };
function OptionSection({ title, options, selected, setSelected, cta, ctaDisabled }: {
  title: string; options: Option[]; selected: string; setSelected: (id: string) => void;
  cta: string; ctaDisabled?: boolean;
}) {
  return (
    <div>
      <div className={SECTION_TITLE}>{title}</div>
      <div className="space-y-2">
        {options.map((o) => (
          <SelectRow
            key={o.id}
            title={o.name}
            meta={o.meta}
            badge={o.popular ? 'Populaire' : undefined}
            current={o.current}
            selected={selected === o.id}
            onSelect={() => setSelected(o.id)}
          />
        ))}
      </div>
      <button disabled={ctaDisabled} className={PRIMARY + ' mt-3 disabled:opacity-40 disabled:hover:bg-zinc-900'}>
        {cta}
      </button>
    </div>
  );
}

// SOLO — self-serve plan upgrade on their own account.
function PlansSection({ plan, setPlan }: { plan: string; setPlan: (id: string) => void }) {
  const selected = PLANS.find((p) => p.id === plan);
  const canAct = !!selected && !selected.current;
  return (
    <OptionSection
      title="Changer de forfait"
      options={PLANS}
      selected={plan}
      setSelected={setPlan}
      ctaDisabled={!canAct}
      cta={canAct ? `Passer à ${selected!.name}` : 'Forfait actuel'}
    />
  );
}

// MEMBER — no billing power; sends a request to the workspace admin.
function RequestSection() {
  const [reason, setReason] = useState<string | null>(null);
  return (
    <div>
      <div className={SECTION_TITLE}>Demander plus d’usage</div>
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/60">
        <span className="grid place-items-center size-9 rounded-full text-white t-small-semibold shrink-0 bg-indigo-500">MD</span>
        <div className="min-w-0">
          <div className="t-base-medium text-zinc-900 truncate">Marie Dupont</div>
          <div className="t-small-regular text-zinc-500 truncate">Administratrice de l’espace · en ligne</div>
        </div>
      </div>
      <div className="mt-3">
        <div className="t-small-regular text-zinc-500 mb-1.5">Motif</div>
        <div className="flex flex-wrap gap-1.5">
          {REASONS.map((r) => {
            const on = reason === r;
            return (
              <button
                key={r}
                onClick={() => setReason(on ? null : r)}
                className={'px-2.5 py-1 rounded-full border t-small-medium transition-colors ' + (on ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50')}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>
      <textarea
        rows={2}
        placeholder="Ajouter un message (optionnel)…"
        className="mt-3 w-full rounded-md border border-zinc-200 px-3 py-2 t-small-regular text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 resize-none"
      />
      <button className={PRIMARY + ' mt-2'}>Demander à mon administrateur</button>
    </div>
  );
}

// ADMIN — buy more AI capacity for the firm. One simple choice of a named pack,
// framed for lawyers (no credits/tokens). Same OptionSection as the plan upgrade.
const AI_PACKS: Option[] = [
  { id: 'plus', name: 'IA Plus', meta: 'Capacité doublée pour les pics d’activité · 149 €/mois' },
  { id: 'max',  name: 'IA Max',  meta: 'Recherche et rédaction IA sans limite · 290 €/mois', popular: true },
];

function CreditPacksSection({ pack, setPack }: { pack: string; setPack: (id: string) => void }) {
  const selected = AI_PACKS.find((p) => p.id === pack) ?? AI_PACKS[1];
  return (
    <OptionSection
      title="Capacité IA de l’équipe"
      options={AI_PACKS}
      selected={selected.id}
      setSelected={setPack}
      cta={`Activer ${selected.name}`}
    />
  );
}

function SentState({ role }: { role: string }) {
  const isMember = role === 'member';
  return (
    <div className="px-5 py-8 text-center">
      <div className="mx-auto mb-3 size-10 grid place-items-center rounded-full bg-emerald-50">
        <Icon name="check" className="size-5 text-emerald-600" />
      </div>
      <p className="t-base-semibold text-zinc-900">{isMember ? 'Demande envoyée' : 'Confirmé'}</p>
      <p className="mt-1 t-small-regular text-zinc-500">
        {isMember
          ? 'Votre administrateur a été notifié. Vous serez prévenu dès validation.'
          : 'Votre nouvelle capacité est active immédiatement.'}
      </p>
    </div>
  );
}
