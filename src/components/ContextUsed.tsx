import { useChatbot } from '../chatbot/store';
import { runOutcome, type UploadSet } from '../chatbot/uploadSets';
import { PrimitiveSlot } from './PrimitiveSlot';
import { ToolCard } from './ToolCard';
import { Icon } from './ui';

/**
 * A13 — Context skipped.
 *
 * The negative space, and only the negative space: what the agent did NOT read,
 * and why.
 *
 * It used to try to be a full accounting ("context used"), which failed twice
 * over. First it duplicated the A1 trace, which already lists everything that
 * WAS looked at — so as a sibling block it read as a restatement, and as an
 * expansion it restated the trace's own step hits one level down. Second it
 * carried a `before` form in the composer, claiming to predict what would be
 * read; an agent cannot know that before there is a question, and what IS
 * knowable pre-question (what's in scope) is already C6's and C9's job.
 *
 * What survives is the half nothing else in the lab can say. A trace only ever
 * lists what happened; the documents that never got opened leave no trace at
 * all, which is exactly why they need a primitive.
 *
 * Every number is derived from the C5 uploaded set via `runOutcome`, shared with
 * A12 — so "read" plus "skipped" always equals the set's own count instead of
 * two hardcoded constants that agreed by luck.
 */

/**
 * A reason must ALWAYS render when its box is ticked. Coupling a reason's
 * EXISTENCE to C5 and C8 meant a designer had to go configure two other
 * primitives before Coverage showed anything, which makes the toggle
 * unjudgeable — the same phantom-control problem as a row that draws nothing.
 * So only the numbers couple: they derive from the upload when there is one,
 * and fall back to the dossier as their population when there isn't.
 */
const FALLBACK = { volume: 18, unreadable: 3 };
const OUT_OF_SCOPE = 12;
const TRUNCATED = 3;

type Reason = { id: string; count: number; label: string; why: string };

function useSkipped() {
  const v = useChatbot((s) => s.primitives.A13);
  const c5set = useChatbot((s) => s.primitives.C5.axisVariants?.set) as UploadSet | undefined;
  const c5On = useChatbot((s) => s.primitives.C5.visible);
  const matter = useChatbot((s) => s.primitives.C8.variant);
  const content = Array.isArray(v.content) ? v.content : [];
  const has = (id: string) => content.includes(id);

  const run = runOutcome(c5set);
  const scoped = matter !== 'idle';
  // Does the imported set genuinely exceed one run? Only then do volume and
  // unreadable read their numbers from it; otherwise the DOSSIER is the
  // population, which is a different set from the upload — so "18 documents du
  // dossier non lus" never contradicts A12 saying "5 sur 5" about five imports.
  const overflow = c5On && run.skipped > 0;
  const hasFailures = c5On && run.failed > 0;

  const reasons: Reason[] = [];
  if (has('volume')) {
    const count = overflow ? run.skipped : FALLBACK.volume;
    reasons.push({
      id: 'volume',
      count,
      label: `${count} documents non lus`,
      why: overflow
        ? `${run.read} sur ${run.total} traités — au-delà, il faut relancer.`
        : 'Au-delà de ce qu’un seul traitement peut couvrir.',
    });
  }
  if (has('unreadable')) {
    const count = hasFailures ? run.failed : FALLBACK.unreadable;
    reasons.push({
      id: 'unreadable',
      count,
      label: `${count} documents illisibles`,
      why: 'Format non exploitable (captures d’écran, scans sans texte).',
    });
  }
  if (has('scope')) {
    reasons.push({
      id: 'scope',
      count: OUT_OF_SCOPE,
      label: `${OUT_OF_SCOPE} documents écartés`,
      why: scoped
        ? 'Hors du dossier sélectionné — jamais lus tant qu’il est actif.'
        : 'Hors du périmètre autorisé pour cette conversation.',
    });
  }
  if (has('truncated')) {
    reasons.push({
      id: 'truncated',
      count: TRUNCATED,
      label: `${TRUNCATED} documents lus partiellement`,
      why: 'Seuls les extraits pertinents sont entrés dans la réponse.',
    });
  }

  return {
    visible: v.visible,
    variant: v.variant,
    reasons,
    total: reasons.reduce((n, r) => n + r.count, 0),
  };
}

/** The tally, for the A1 trace to fold into its own header. */
export function useSkippedTally() {
  const s = useSkipped();
  return { on: s.visible, total: s.total, reasons: s.reasons, variant: s.variant };
}

/** The reason rows, rendered inside the trace's expansion. */
export function SkippedReasons() {
  const { reasons } = useSkipped();
  if (reasons.length === 0) return null;
  return (
    <ul className="divide-y divide-zinc-100">
      {reasons.map((r) => (
        <li key={r.id} className="px-3 py-2">
          <p className="t-small-medium text-zinc-800">{r.label}</p>
          {/* The WHY is the whole point — a count with no reason is not a
              disclosure, it's a number. */}
          <p className="t-small-regular text-zinc-500">{r.why}</p>
        </li>
      ))}
    </ul>
  );
}

/**
 * Standalone card — the form used when A1 is hidden, so there is no trace to
 * fold into, and the alternative form a designer can compare against the row.
 */
export function ContextSkippedCard() {
  const s = useSkipped();
  if (!s.visible) return null;
  return (
    <PrimitiveSlot code="A13" block>
      <ToolCard
        leading={<Icon name={s.total > 0 ? 'alert' : 'check'} className={'size-4 ' + (s.total > 0 ? 'text-amber-600' : 'text-zinc-500')} />}
        title={s.total > 0 ? `${s.total} documents ne sont pas entrés dans la réponse` : 'Tout a été lu'}
        subtitle={s.total > 0 ? 'Ce que je n’ai pas lu, et pourquoi.' : 'Aucun document écarté pour cette réponse.'}
        bodyFlush={s.total > 0}
      >
        {s.total > 0 && <SkippedReasons />}
      </ToolCard>
    </PrimitiveSlot>
  );
}
