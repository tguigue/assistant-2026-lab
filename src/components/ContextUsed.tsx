import { useState } from 'react';
import { useChatbot } from '../chatbot/store';
import { PrimitiveSlot } from './PrimitiveSlot';
import { ToolCard } from './ToolCard';
import { Icon } from './ui';
import { SILO_HITS, SILO_META, type SiloId } from './Conversation';

/**
 * A13 — Context used.
 *
 * The accounting primitive. C6 shows what you ATTACHED; this shows what was
 * actually opened, what was only skimmed, and what was left out.
 *
 * It renders in two moments from ONE component and ONE fixture. That is
 * deliberate: the composer states a promise ("ce qui sera lu") and the answer
 * states a receipt ("ce que j'ai lu"), and if those were two primitives with
 * two fixtures they would eventually disagree — which is the only failure an
 * honesty indicator can actually commit. Same list, two tenses.
 *
 * The list is A0's sources pre-check fixture, so "what I will read" and "what I
 * read" are provably the same set of documents.
 */

const READ_FULLY: SiloId[] = ['sharepoint', 'matters'];
const READ_PARTIALLY: SiloId = 'gdrive';
const EXCLUDED_COUNT = 44;

type Moment = 'before' | 'after';

function useA13() {
  const v = useChatbot((s) => s.primitives.A13);
  const content = Array.isArray(v.content) ? v.content : [];
  return {
    visible: v.visible,
    variant: v.variant,
    moment: (v.axisVariants?.moment ?? 'after') as Moment,
    has: (id: string) => content.includes(id),
  };
}

/** Beside the reasoning trace — the receipt. */
export function ContextUsedInline() {
  const a = useA13();
  if (!a.visible || a.moment !== 'after') return null;
  return <PrimitiveSlot code="A13" block><ContextBody {...a} /></PrimitiveSlot>;
}

/** In the composer — the promise. */
export function ContextUsedComposer() {
  const a = useA13();
  if (!a.visible || a.moment !== 'before') return null;
  return <PrimitiveSlot code="A13" block><ContextBody {...a} /></PrimitiveSlot>;
}

function ContextBody({
  moment, variant, has,
}: { moment: Moment; variant: string; has: (id: string) => boolean }) {
  const [open, setOpen] = useState(false);

  const fullCount = READ_FULLY.reduce((n, s) => n + SILO_HITS[s].length, 0);
  const partCount = SILO_HITS[READ_PARTIALLY].length;
  const docs = fullCount + (has('truncated') ? partCount : 0);

  // The two tenses. Everything below is identical.
  const lead = moment === 'before' ? 'Contexte pris en compte' : 'Contexte utilisé';
  const bits = [
    `${docs} document${docs > 1 ? 's' : ''}`,
    has('sources') ? '2 sources Doctrine' : null,
    has('memory') ? '1 souvenir' : null,
  ].filter(Boolean).join(' · ');

  // ── LINE: a quiet aside in ReasoningHeader's register, so it reads as a note
  //    ABOUT the answer rather than a competing claim inside it. ──
  if (variant === 'line') {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="group inline-flex items-center gap-1.5 py-1 text-left t-base-regular text-zinc-500"
        >
          <span>{lead} : {bits}</span>
          <Icon name="chevron-up" className={'size-3 text-zinc-400 transition-transform ' + (open ? '' : 'rotate-180')} />
        </button>
        {/* The warning belongs on the LINE too, not only in the expanded card —
            an exclusion you have to click to discover isn't a disclosure. */}
        {has('excluded') && (
          <p className="t-small-regular text-amber-700">
            {moment === 'before'
              ? `${EXCLUDED_COUNT} documents ne seront pas lus — hors du dossier sélectionné.`
              : `${EXCLUDED_COUNT} documents n’ont pas été lus — hors du dossier sélectionné.`}
          </p>
        )}
        {open && <div className="mt-1.5"><GroupList moment={moment} has={has} /></div>}
      </div>
    );
  }

  // ── CARD: the full account, grouped by how thoroughly each source was read. ──
  return (
    <ToolCard
      leading={<Icon name="visibility" className="size-4 text-zinc-500" />}
      title={lead}
      subtitle={moment === 'before'
        ? 'Ce qui entrera dans ma réponse, et ce qui n’y entrera pas.'
        : 'Ce qui est entré dans ma réponse, et ce qui n’y est pas.'}
      bodyFlush
    >
      <GroupList moment={moment} has={has} />
    </ToolCard>
  );
}

function GroupList({ moment, has }: { moment: Moment; has: (id: string) => boolean }) {
  const past = moment === 'after';
  const groups: { label: string; meta?: string; items: { name: string; meta: string }[]; tone?: 'warn' }[] = [];

  groups.push({
    label: past ? 'Lus intégralement' : 'Seront lus intégralement',
    items: READ_FULLY.flatMap((s) => SILO_HITS[s].map((h) => ({ ...h, meta: `${SILO_META[s].label} · ${h.meta}` }))),
  });

  if (has('truncated')) {
    groups.push({
      label: past ? 'Lus partiellement' : 'Seront lus partiellement',
      meta: 'extraits pertinents seulement',
      items: SILO_HITS[READ_PARTIALLY].map((h) => ({ ...h, meta: `${SILO_META[READ_PARTIALLY].label} · ${h.meta}` })),
    });
  }

  return (
    <div className="divide-y divide-zinc-100">
      {groups.map((g) => (
        <section key={g.label} className="px-3 py-2.5">
          <div className="flex items-baseline gap-1.5 mb-1.5">
            <span className="t-small-semibold text-zinc-700">{g.label}</span>
            <span className="t-small-regular text-zinc-400">· {g.items.length}</span>
            {g.meta && <span className="t-small-regular text-zinc-400 truncate">— {g.meta}</span>}
          </div>
          <ul className="space-y-1">
            {g.items.map((it) => (
              <li key={it.name} className="flex items-baseline gap-2 min-w-0">
                <Icon name="file-text" className="size-3.5 text-zinc-400 shrink-0" />
                <span className="t-small-regular text-zinc-700 truncate">{it.name}</span>
                <span className="t-small-regular text-zinc-400 truncate hidden @2xl/surface:inline">{it.meta}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* The half nothing else in the lab could say. */}
      {has('excluded') && (
        <section className="px-3 py-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="t-small-semibold text-amber-700">{past ? 'Non lus' : 'Ne seront pas lus'}</span>
            <span className="t-small-regular text-zinc-400">· {EXCLUDED_COUNT}</span>
          </div>
          <p className="t-small-regular text-zinc-500 mt-0.5">
            Hors du périmètre du dossier Moreau c/ SAS Aurelia.
          </p>
        </section>
      )}

      {has('sources') && (
        <section className="px-3 py-2.5 flex items-baseline gap-2">
          <Icon name="scales" className="size-3.5 text-zinc-400 shrink-0" />
          <span className="t-small-regular text-zinc-700">Sources Doctrine — Décisions, Codes</span>
          <span className="t-small-regular text-zinc-400 ml-auto shrink-0">77 résultats consultés</span>
        </section>
      )}

      {/* Memory is context too — and the one kind a user can't see by looking at
          their own files. Links to where it can be corrected. */}
      {has('memory') && <MemoryRow />}
    </div>
  );
}

function MemoryRow() {
  const toggleContent = useChatbot((s) => s.togglePrimitiveContent);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  return (
    <section className="px-3 py-2.5 flex items-baseline gap-2">
      <Icon name="sparkles" className="size-3.5 text-zinc-400 shrink-0" />
      <span className="min-w-0 t-small-regular text-zinc-700 truncate">
        1 souvenir — « Citer l’article avant la jurisprudence. »
      </span>
      {/* Memory is context too, and the one kind you can't audit by looking at
          your own files — so the row links to where it can be corrected. */}
      <button
        onClick={() => { setVisible('C18', true); toggleContent('C18', 'open'); }}
        className="ml-auto shrink-0 t-small-medium text-zinc-500 hover:text-zinc-900 underline decoration-zinc-300"
      >
        Gérer
      </button>
    </section>
  );
}
