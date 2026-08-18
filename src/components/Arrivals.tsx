import { useState } from 'react';
import { useChatbot } from '../chatbot/store';
import { PrimitiveSlot } from './PrimitiveSlot';
import { ToolCard } from './ToolCard';
import { Icon } from './ui';
import { WATCHER_SUGGESTIONS, useOpenWatcher } from './WatcherCreation';

/**
 * E7 — Arrivals.
 *
 * The half of the trigger loop the lab was missing: A10 could CREATE watchers,
 * and nothing they produced had anywhere to land.
 *
 * The load-bearing decision is where it does NOT go. An unprompted assistant
 * bubble in the thread would forge a turn the user never took — in a legal
 * record that is not a cosmetic problem, so an arrival never enters the
 * conversation. It sits in the composer moment, addressed TO the user, and
 * three properties keep it unmistakable for a reply:
 *
 *   1. no reasoning trace and no citations (a reply always has one or both)
 *   2. it names its trigger, with a date — "vous suivez … depuis le 12 mai"
 *   3. it always offers a way out (dismiss, and mettre en pause)
 *
 * The origin lines read WATCHER_SUGGESTIONS / WATCHER_EVENTS, the same fixtures
 * A10 writes, so an arrival can't cite a veille that was never created.
 */

type Source = 'veille' | 'echeance' | 'document';

const [Q1] = WATCHER_SUGGESTIONS;

const ARRIVALS: Record<Source, {
  icon: string; headline: string; origin: string; prompt: string; detail?: string; count: number;
}> = {
  veille: {
    icon: 'bell',
    headline: 'Votre veille a trouvé 3 nouvelles décisions',
    // Verbatim from the watcher fixture — never a paraphrase of it.
    origin: `Vous suivez « ${Q1.label} » depuis le 12 mai.`,
    prompt: 'Résumer ce que ça change pour Moreau c/ SAS Aurelia',
    count: 3,
  },
  echeance: {
    icon: 'alert',
    headline: 'Échéance dans 3 jours — conclusions à déposer le 20 août',
    origin: 'Dossier Moreau c/ SAS Aurelia · échéance saisie le 4 juillet.',
    prompt: 'Préparer le dépôt',
    count: 1,
  },
  document: {
    icon: 'file-text',
    headline: 'Un document est arrivé dans Leroy c/ Merlin',
    origin: 'Déposé par Audrey · il y a 2 heures.',
    detail: 'Avenant n°2 — Convention d’animation.docx',
    prompt: 'Comparer avec l’avenant n°1',
    count: 1,
  },
};

function useArrivals() {
  const v = useChatbot((s) => s.primitives.E7);
  const content = Array.isArray(v.content) ? v.content : [];
  return {
    visible: v.visible,
    variant: v.variant,
    source: (v.axisVariants?.source ?? 'veille') as Source,
    has: (id: string) => content.includes(id),
  };
}

/** Strip form — above the composer. */
export function ArrivalsAbove() {
  const a = useArrivals();
  const [gone, setGone] = useState(false);
  if (!a.visible || a.variant !== 'strip' || gone) return null;
  const d = ARRIVALS[a.source];

  return (
    <PrimitiveSlot code="E7" block>
      <div className="sg-suggest flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-3 py-2">
        <Icon name={d.icon} className="size-4 text-zinc-500 shrink-0" />
        <div className="min-w-0 flex-1">
          <span className="block t-small-medium text-zinc-800 truncate">{d.headline}</span>
          {a.has('origin') && (
            <span className="block t-small-regular text-zinc-500 truncate">{d.origin}</span>
          )}
        </div>
        {a.has('count') && d.count > 1 && (
          <span className="shrink-0 t-small-medium text-zinc-500">{d.count} nouveautés</span>
        )}
        <button className="shrink-0 t-small-medium text-zinc-700 hover:text-zinc-900 underline decoration-zinc-300">
          Voir
        </button>
        {/* The way out is never optional. */}
        <button
          onClick={() => setGone(true)}
          title="Ne plus afficher"
          className="shrink-0 size-6 grid place-items-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
        >
          <Icon name="x" className="size-3.5" />
        </button>
      </div>
    </PrimitiveSlot>
  );
}

/** Cards form — below the composer, where E6 Activity also lives. */
export function ArrivalsBelow() {
  const a = useArrivals();
  const openWatcher = useOpenWatcher();
  const setVariant = useChatbot((s) => s.setPrimitiveVariant);
  const [gone, setGone] = useState(false);
  if (!a.visible || a.variant !== 'cards' || gone) return null;
  const d = ARRIVALS[a.source];

  return (
    <PrimitiveSlot code="E7" block>
      <div className="w-full">
        <div className="flex items-baseline gap-1.5 mb-2 px-0.5">
          <span className="t-small-medium text-zinc-400">Depuis votre dernière visite</span>
          {a.has('count') && d.count > 1 && (
            <span className="t-small-regular text-zinc-400">· {d.count} nouveautés</span>
          )}
        </div>
        <ToolCard
          leading={<Icon name={d.icon} className="size-4 text-zinc-500" />}
          eyebrow={a.has('origin') ? <span className="t-small-regular text-zinc-500">{d.origin}</span> : undefined}
          title={d.headline}
          subtitle={d.detail}
          actions={
            <button
              onClick={() => setGone(true)}
              title="Ne plus afficher"
              className="size-7 grid place-items-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            >
              <Icon name="x" className="size-3.5" />
            </button>
          }
        >
          {(a.has('prompt') || a.has('mute')) && (
            <div className="flex flex-wrap items-center gap-2">
              {a.has('prompt') && (
                <button className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-zinc-300 t-small-medium text-zinc-700 hover:bg-zinc-50">
                  <Icon name="arrow-right" className="size-3.5" />
                  {d.prompt}
                </button>
              )}
              {a.has('mute') && a.source === 'veille' && (
                <button
                  onClick={() => { openWatcher(); setVariant('A10', 'registry'); }}
                  className="t-small-medium text-zinc-500 hover:text-zinc-900 underline decoration-zinc-300"
                >
                  Mettre en pause cette veille
                </button>
              )}
            </div>
          )}
        </ToolCard>
      </div>
    </PrimitiveSlot>
  );
}
