import { useChatbot } from '../chatbot/store';
import { runOutcome, type UploadSet } from '../chatbot/uploadSets';
import { PrimitiveSlot } from './PrimitiveSlot';
import { CardFooterButton, ToolCard, ToolIcon } from './ToolCard';
import { Icon, ProgressBar, StatusBullet, Sw } from './ui';
import { WRITE_ACTIONS } from './Conversation';

/**
 * A12 — Task progress.
 *
 * The one primitive that represents an agent OUTLIVING the turn. Everything
 * else in the lab assumes prompt → answer → now; a 128-document job doesn't
 * fit that, and until this existed the C5 "Volume (128)" set implied full
 * coverage everywhere downstream with no way to admit otherwise.
 *
 * The honest number is the point: `treated` is deliberately less than the set's
 * count, and `stopped` KEEPS the partials rather than discarding them, because
 * a job that gets 84 of 128 done has produced 84 useful results.
 */

type Status = 'queued' | 'running' | 'paused' | 'input' | 'done' | 'stopped';

const TITLE: Record<Status, string> = {
  queued:  'En file d’attente',
  running: 'Traitement en cours',
  paused:  'Traitement en pause',
  input:   'J’ai besoin de votre réponse',
  done:    'Traitement terminé',
  stopped: 'Traitement interrompu',
};

/* Which statuses have made real progress. `queued` hasn't started, so a bar and
   a partial count would both be lies. */
const STARTED: Record<Status, boolean> = {
  queued: false, running: true, paused: true, input: true, done: true, stopped: true,
};

export function TaskProgress() {
  const v = useChatbot((s) => s.primitives.A12);
  const c5set = useChatbot((s) => s.primitives.C5.axisVariants?.set) as UploadSet | undefined;
  if (!v.visible) return null;

  const status = (v.axisVariants?.status ?? 'running') as Status;
  const content = Array.isArray(v.content) ? v.content : [];
  const has = (id: string) => content.includes(id);

  // Shared with A13 — read + skipped always equals the set's own count, so the
  // two primitives can't report contradictory arithmetic about one upload.
  const { total, read, failed: runFailed } = runOutcome(c5set);
  const started = STARTED[status];
  const treated = status === 'done' ? total : read;
  const failed = status === 'done' ? 0 : runFailed;
  const pct = !started ? 0 : status === 'done' ? 100 : Math.round((treated / total) * 100);
  const body = (
    <TaskBody
      status={status} total={total} treated={treated} failed={failed} pct={pct}
      showPartials={has('partials') && started} showErrors={has('errors') && failed > 0}
      showEta={has('eta') && status === 'running'}
      showNotify={has('notify') && (status === 'running' || status === 'queued')}
      variant={v.variant}
    />
  );

  return <PrimitiveSlot code="A12" block>{body}</PrimitiveSlot>;
}

function TaskBody({
  status, total, treated, failed, pct,
  showPartials, showErrors, showEta, showNotify, variant,
}: {
  status: Status; total: number; treated: number; failed: number; pct: number;
  showPartials: boolean; showErrors: boolean; showEta: boolean; showNotify: boolean;
  variant: string;
}) {
  const live = status === 'running';
  const warn = status === 'stopped';

  // ── ROW: one timeline entry. Same anatomy as a reasoning step, so a long job
  //    reads as a continuation of the trace rather than a separate widget. ──
  if (variant === 'row') {
    return (
      <div className="relative">
        <span aria-hidden className="absolute left-[15px] top-5 bottom-5 w-px bg-zinc-200" />
        <div className="flex items-start gap-3 px-3 py-2.5">
          <StatusBullet running={live} tone={warn ? 'warn' : 'dark'} />
          <span className="flex-1 min-w-0 t-base-regular text-zinc-800">
            {TITLE[status]}
            {showPartials && (
              <span className="text-zinc-500"> — {treated} sur {total} traités
                {showErrors && ` · ${failed} échecs`}</span>
            )}
          </span>
          {showEta && <span className="t-small-regular text-zinc-400 shrink-0">≈ 4 min</span>}
        </div>
      </div>
    );
  }

  // ── CARD: the full account. ──
  return (
    <ToolCard
      leading={<span className="grid place-items-center size-4"><StatusBullet running={live} tone={warn ? 'warn' : 'dark'} /></span>}
      eyebrow={<span className="t-small-regular text-zinc-500">Traitement par lot</span>}
      title={TITLE[status]}
      subtitle={showPartials ? `${treated} document${treated > 1 ? 's' : ''} sur ${total} traité${treated > 1 ? 's' : ''}${showErrors ? ` · ${failed} échecs` : ''}` : undefined}
      actions={<TaskActions status={status} />}
      footer={status === 'done'
        ? <CardFooterButton>Voir les {treated} documents traités</CardFooterButton>
        : undefined}
    >
      {(showPartials || showErrors || showEta || showNotify || status === 'input' || warn) && (
        <div className="space-y-2.5">
          {showPartials && (
            <div>
              <ProgressBar pct={pct} warn={warn} size="sm" />
              <div className="flex items-center justify-between mt-1">
                <span className="t-small-regular text-zinc-500">{pct} %</span>
                {showEta && <span className="t-small-regular text-zinc-400">≈ 4 min restantes</span>}
              </div>
            </div>
          )}

          {/* Interrupted ≠ lost. Saying so is the difference between a failure and
              a partial success the user can still use. */}
          {warn && (
            <p className="t-small-regular text-amber-700">
              Interrompu à {treated} sur {total} — les résultats déjà obtenus sont conservés.
            </p>
          )}

          {/* The seam with A0: a job that needs an answer mid-flight is what makes
              the docked question appear. Named here so the overlap is designed. */}
          {status === 'input' && (
            <p className="t-small-regular text-zinc-600">
              Deux documents sont dans une langue que je n’ai pas identifiée — voulez-vous
              que je les traite en anglais ? <span className="text-zinc-400">La question est posée sous la conversation.</span>
            </p>
          )}

          {showErrors && (
            <div className="flex items-start gap-2 rounded-md border border-zinc-200 bg-zinc-50/60 px-2.5 py-2">
              <Icon name="alert" className="size-3.5 text-amber-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="t-small-medium text-zinc-700">{failed} documents illisibles</p>
                <p className="t-small-regular text-zinc-500 truncate">Screenshot 2026-06-17 at 09.09.37.png +{failed - 1}</p>
              </div>
              <button className="shrink-0 t-small-medium text-zinc-600 hover:text-zinc-900 underline decoration-zinc-300">
                Réessayer
              </button>
            </div>
          )}

          {/* The whole promise of a background job: you can leave. */}
          {showNotify && <NotifyRow />}

          {/* Where a write action's outcome lands — A0 asked, this reports. */}
          {status === 'done' && (
            <div className="flex items-center gap-2">
              <ToolIcon name="check" />
              <span className="t-small-regular text-zinc-600">{WRITE_ACTIONS[0].receipt}</span>
              <span className="t-small-medium text-zinc-500 underline decoration-zinc-300">voir le document</span>
            </div>
          )}
        </div>
      )}
    </ToolCard>
  );
}

function NotifyRow() {
  const on = true;
  return (
    <div className="flex items-center gap-2.5">
      <Sw checked={on} onChange={() => {}} />
      <span className="min-w-0">
        <span className="block t-small-medium text-zinc-700">Me prévenir quand c’est terminé</span>
        <span className="block t-small-regular text-zinc-500">Vous pouvez fermer la conversation, je continue.</span>
      </span>
    </div>
  );
}

const BTN = 'inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-zinc-300 t-small-medium text-zinc-700 hover:bg-zinc-50 transition-colors';

function TaskActions({ status }: { status: Status }) {
  if (status === 'running') {
    return <button className={BTN}><Icon name="slash" className="size-3.5" />Mettre en pause</button>;
  }
  if (status === 'paused') {
    return <button className={BTN}><Icon name="play" className="size-3.5" />Reprendre</button>;
  }
  if (status === 'stopped') {
    return <button className={BTN}><Icon name="refresh" className="size-3.5" />Relancer</button>;
  }
  return null;
}
