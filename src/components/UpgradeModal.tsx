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
const PACKS = [
  { id: 'day',   name: '1 jour',   meta: 'Capacité doublée pendant 24 h' },
  { id: 'week',  name: '1 semaine', meta: 'Capacité doublée pendant 7 jours', popular: true },
  { id: 'month', name: '1 mois',   meta: 'Capacité doublée pendant 30 jours' },
];

const PRIMARY = 'w-full h-9 rounded-md bg-zinc-900 text-white t-base-medium hover:bg-zinc-800 transition-colors';
const SECTION_TITLE = 'mb-2 t-small-semibold text-zinc-900';

export function UpgradeModal() {
  const c13 = useChatbot((s) => s.primitives.C13);
  const toggleContent = useChatbot((s) => s.togglePrimitiveContent);
  const [pack, setPack] = useState('week');
  const [creditPack, setCreditPack] = useState('25k');
  const [plan, setPlan] = useState('pro');

  const content = Array.isArray(c13?.content) ? c13!.content : [];
  if (!c13?.visible || !content.includes('open')) return null;

  const has = (id: string) => content.includes(id);
  const isAdmin = has('admin');
  // One curated layout at a time (radio): usage | upgrade | request.
  const layout = c13.axisVariants?.layout ?? 'upgrade';
  // Mutually-exclusive modal status (radio): normal | blocking | sent.
  const status = c13.axisVariants?.status ?? 'normal';
  const blocking = status === 'blocking';
  const requestSent = status === 'sent';
  const anySection = true; // every layout shows at least the usage block
  const close = () => toggleContent('C13', 'open');

  // Each layout is a complete, designed modal — usage always anchors the top.
  const blocks: React.ReactNode[] = [
    <UsageSection key="u" blocking={blocking} />,
  ];
  if (layout === 'plan') blocks.push(<PlansSection key="p" isAdmin={isAdmin} plan={plan} setPlan={setPlan} />);
  if (layout === 'extra') {
    // Admins manage seat credits; members top up their own quota.
    blocks.push(
      isAdmin
        ? <CreditPacksSection key="t" isAdmin={isAdmin} pack={creditPack} setPack={setCreditPack} />
        : <TopupSection key="t" isAdmin={isAdmin} pack={pack} setPack={setPack} />
    );
  }

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
            <span className="t-small-medium text-amber-800">Limite atteinte — ajoutez des crédits pour continuer.</span>
          </div>
        )}

        <div className="min-h-0 overflow-y-auto scrollbar-thin">
          {requestSent ? (
            <SentState isAdmin={isAdmin} />
          ) : !anySection ? (
            <p className="px-5 py-8 text-center t-small-regular text-zinc-400">
              Activez une section dans le panneau (Consommation, Forfaits, Acheter, Contacter).
            </p>
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

function PlansSection({ isAdmin, plan, setPlan }: { isAdmin: boolean; plan: string; setPlan: (id: string) => void }) {
  const selected = PLANS.find((p) => p.id === plan);
  const canAct = !!selected && !selected.current;
  return (
    <OptionSection
      title="Changer de forfait"
      options={PLANS}
      selected={plan}
      setSelected={setPlan}
      ctaDisabled={!canAct}
      cta={canAct ? (isAdmin ? `Passer à ${selected!.name}` : `Demander ${selected!.name}`) : 'Forfait actuel'}
    />
  );
}

function TopupSection({ isAdmin, pack, setPack }: { isAdmin: boolean; pack: string; setPack: (id: string) => void }) {
  return (
    <OptionSection
      title="Usage supplémentaire"
      options={PACKS}
      selected={pack}
      setSelected={setPack}
      cta={isAdmin ? 'Activer' : 'Demander l’activation'}
    />
  );
}

// Exploration: the admin billing direction (inspired by the reference's
// "Add monthly credits" modal). Credits + prices live here, in the admin/
// billing context — not in the composer. Behind the off-by-default toggle.
const CREDIT_PACKS = [
  { id: '20k', credits: '20 000 crédits', price: '187,20 €/mois' },
  { id: '25k', credits: '25 000 crédits', price: '234,00 €/mois', popular: true },
  { id: '30k', credits: '30 000 crédits', price: '280,80 €/mois' },
];

function CreditPacksSection({ isAdmin, pack, setPack }: { isAdmin: boolean; pack: string; setPack: (id: string) => void }) {
  return (
    <div>
      <div className={SECTION_TITLE}>Ajouter des crédits mensuels</div>
      <p className="mb-3 t-small-regular text-zinc-500">
        Les membres à court de crédits de siège pourront utiliser ces crédits. Ils se réinitialisent chaque mois jusqu’au renouvellement.
      </p>
      <div className="t-micro text-zinc-400 mb-1.5">Tarifs de lancement</div>
      <div className="grid grid-cols-3 gap-2">
        {CREDIT_PACKS.map((p) => {
          const on = pack === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPack(p.id)}
              className={'relative px-2 py-2.5 rounded-xl border text-center transition-colors ' + (on ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:bg-zinc-50')}
            >
              <span className="block t-small-semibold text-zinc-900">{p.credits}</span>
              <span className="block t-small-regular text-zinc-500">{p.price}</span>
              {p.popular && <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-1.5 rounded-full bg-zinc-900 text-white t-micro">Populaire</span>}
            </button>
          );
        })}
      </div>
      <p className="mt-2.5 t-small-regular text-zinc-500">À partir du 10 juil., les crédits seront facturés 585,00 €/mois.</p>
      <button className="mt-2 w-full h-8 rounded-md border border-zinc-200 t-small-medium text-zinc-700 hover:bg-zinc-50">Plus d’options</button>
      <div className="mt-2.5 flex items-start gap-1.5">
        <Icon name="refresh" className="size-3.5 text-zinc-400 shrink-0 mt-0.5" />
        <p className="t-small-regular text-zinc-500">
          Plus de flexibilité ? <button className="t-small-medium text-zinc-900 underline underline-offset-2">Paiement à l’usage</button>.
        </p>
      </div>
      <button className={PRIMARY + ' mt-3'}>{isAdmin ? 'Vérifier et confirmer' : 'Demander à l’administrateur'}</button>
    </div>
  );
}

function SentState({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="px-5 py-8 text-center">
      <div className="mx-auto mb-3 size-10 grid place-items-center rounded-full bg-emerald-50">
        <Icon name="check" className="size-5 text-emerald-600" />
      </div>
      <p className="t-base-semibold text-zinc-900">Demande envoyée</p>
      <p className="mt-1 t-small-regular text-zinc-500">
        {isAdmin
          ? 'Notre équipe vous recontacte sous 24 h.'
          : 'Votre administrateur a été notifié. Vous serez prévenu dès validation.'}
      </p>
    </div>
  );
}
