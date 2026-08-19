import { useChatbot } from '../chatbot/store';
import { useNarrowOverlay } from './SurfaceScope';
import { Button, Icon, Segmented, Separator, Sw, TOOL_BTN, modalShell } from './ui';

/**
 * C18 — Standing instructions ("consignes").
 *
 * Not "souvenirs". A lawyer does not hold souvenirs about their files — the word
 * means keepsakes, and it makes a professional tool sound sentimental. What this
 * primitive actually holds is what a lawyer would call CONSIGNES: the standing
 * instructions you give a collaborator once and expect them to apply from then
 * on. That framing also fixes a modelling error the old wording hid: the three
 * scopes used to hold three different KINDS of thing — a drafting preference, a
 * firm practice, and a FACT about a case — which is why no single noun fitted.
 *
 * A fact about a matter has no business living here at all. If the Assistant
 * "remembers" that the opposing party contests prescription, there are now two
 * versions of the truth: the file, and the Assistant's note about the file. A
 * lawyer would want exactly one. So every entry is now an instruction, and
 * `scope` says who it binds — me, the cabinet, or this dossier alone.
 *
 * `scope` is the primary axis and it IS the ethical wall: a consigne that bound
 * both one client's matter and the whole cabinet is the conflicts problem, which
 * is why it's a radio and each scope states its own cloisonnement.
 */

export type MemScope = 'moi' | 'cabinet' | 'dossier';

export const SCOPE_LABEL: Record<MemScope, string> = {
  moi: 'Moi', cabinet: 'Mon cabinet', dossier: 'Ce dossier',
};

/** Said out loud, per scope. An unstated boundary is not a boundary. */
export const CLOISONNEMENT: Record<MemScope, string> = {
  moi:     'Vous seul. Aucun membre du cabinet n’y a accès.',
  cabinet: 'Tout le cabinet. Rien issu d’un dossier n’y entre.',
  dossier: 'Moreau c/ SAS Aurelia uniquement. Jamais appliquée ailleurs.',
};

/** Every entry is an INSTRUCTION, scoped. None is a fact about a matter. */
type Consigne = { text: string; origin: string; applied?: boolean };

const CONSIGNES: Record<MemScope, Consigne[]> = {
  moi: [
    { text: 'Rédiger les conclusions au présent de l’indicatif.', origin: 'Ajoutée le 12 mai — conversation « Licenciement Moreau »', applied: true },
    { text: 'Citer l’article avant la jurisprudence.',            origin: 'Ajoutée le 3 juin — conversation « Harcèlement — analyse »', applied: true },
    { text: 'Synthèses en trois points maximum.',                 origin: 'Ajoutée le 28 juin — conversation « Note Pernod »' },
  ],
  cabinet: [
    { text: 'Plaider la recevabilité avant le fond.',             origin: 'Ajoutée par Mehdi le 14 avril', applied: true },
    { text: 'Mises en demeure : modèle validé 2026.',             origin: 'Ajoutée par Audrey le 2 mars' },
  ],
  dossier: [
    { text: 'Ne pas invoquer la prescription — écartée en première instance.', origin: 'Ajoutée le 19 juin — dossier Moreau c/ SAS Aurelia' },
  ],
};

function useConsignes() {
  const v = useChatbot((s) => s.primitives.C18);
  const content = Array.isArray(v.content) ? v.content : [];
  return {
    visible: v.visible,
    variant: v.variant,
    scope: (v.axisVariants?.scope ?? 'moi') as MemScope,
    has: (id: string) => content.includes(id),
  };
}

/** How many consignes the current answer actually applied — what the chip counts. */
const appliedCount = () =>
  (Object.values(CONSIGNES).flat() as Consigne[]).filter((c) => c.applied).length;

/**
 * The composer control — and the answer's disclosure. Same button, two tenses.
 *
 * It used to read "3 consignes appliquées" in both, which is wrong in the
 * composer for exactly the reason A13's `before` form was wrong: nothing has
 * been asked yet, so nothing has been applied. Past tense about a future answer.
 *
 * It also read as a status sentence sitting in a row of one-word controls
 * (Sources, Actions), which made it look like a different kind of thing than its
 * neighbours. In the composer it is now a control like them — the noun plus a
 * count of what is in force — and it only becomes the disclosure next to an
 * answer, where "appliquées" is true.
 */
export function MemoryChip() {
  const m = useConsignes();
  const toggleContent = useChatbot((s) => s.togglePrimitiveContent);
  const viewMode = useChatbot((s) => s.viewMode);
  if (!m.visible || m.variant !== 'chip') return null;

  const answered = viewMode === 'full';
  const n = answered ? appliedCount() : Object.values(CONSIGNES).flat().length;

  return (
    <button
      onClick={() => toggleContent('C18', 'open')}
      title={answered ? 'Consignes appliquées à cette réponse' : 'Consignes en vigueur'}
      aria-label="Consignes"
      className={TOOL_BTN}
    >
      <Icon name="list" className="size-5 text-zinc-500 @2xl/surface:size-3.5" />
      {answered ? (
        // Next to an answer the full phrase is doing real work — it is the
        // disclosure that these three shaped what you are reading.
        <span className="hidden @2xl/surface:inline">
          <span className="tabular-nums">{n}</span> consigne{n > 1 ? 's' : ''} appliquée{n > 1 ? 's' : ''}
        </span>
      ) : (
        // In the composer it is just a control, so it reads like its neighbours:
        // the noun, and how many are in force.
        <span className="hidden @2xl/surface:inline">
          Consignes <span className="tabular-nums text-zinc-400">{n}</span>
        </span>
      )}
    </button>
  );
}

export function MemoryModal() {
  const m = useConsignes();
  const setAxis = useChatbot((s) => s.setPrimitiveAxisVariant);
  const toggleContent = useChatbot((s) => s.togglePrimitiveContent);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  const narrow = useNarrowOverlay();

  const open = m.visible && (m.variant === 'modal' || m.has('open'));
  if (!open) return null;

  const close = () => {
    if (m.has('open')) toggleContent('C18', 'open');
    if (m.variant === 'modal') setVisible('C18', false);
  };

  const items = CONSIGNES[m.scope];

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[60]" onClick={close} />
      {/* modalShell already carries MODAL_MAX_H — don't append it again. */}
      <div className={modalShell('max-w-[560px]', narrow, '!z-[61]')}>
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <h2 className="flex-1 t-title-4 text-zinc-900">Consignes de l’Assistant</h2>
          <Button variant="ghost" size="sm" onClick={close} aria-label="Fermer">
            <Icon name="x" className="size-4" />
          </Button>
        </div>

        <div className="px-5 pb-3">
          {/* Counts live on the segments themselves — the kit renders them, so no
              caller has to bake "Moi (3)" into a label string. */}
          <Segmented
            value={m.scope}
            onChange={(v) => setAxis('C18', 'scope', v)}
            options={(['moi', 'cabinet', 'dossier'] as MemScope[]).map((id) => ({
              value: id, label: SCOPE_LABEL[id], count: CONSIGNES[id].length,
            }))}
          />
          {m.has('wall') && (
            <p className="mt-2 t-small-regular text-zinc-500">{CLOISONNEMENT[m.scope]}</p>
          )}
        </div>

        <Separator />

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-5 py-2">
          {items.length === 0 ? (
            <p className="py-6 text-center t-small-regular text-zinc-500">
              Aucune consigne à ce niveau.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {items.map((it) => (
                <li key={it.text} className="py-3">
                  <div className="flex items-start gap-2">
                    <p className="flex-1 t-base-regular text-zinc-800">{it.text}</p>
                    {/* Which ones actually shaped this answer, so the chip's
                        number is traceable rather than asserted. */}
                    {it.applied && (
                      <span className="shrink-0 mt-0.5 px-1.5 py-0.5 rounded t-small-medium bg-zinc-100 text-zinc-600">
                        appliquée
                      </span>
                    )}
                  </div>
                  {m.has('origin') && (
                    <p className="t-small-regular text-zinc-400 mt-0.5">{it.origin}</p>
                  )}
                  {m.has('forget') && (
                    <div className="flex items-center gap-1.5 mt-1.5 -ml-2">
                      <Button variant="ghost" size="sm">Modifier</Button>
                      <Button variant="ghost" size="sm">Retirer</Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {m.has('pause') && (
          <>
            <Separator />
            <label className="flex items-center gap-2.5 px-5 py-3 cursor-pointer">
              <Sw checked={false} onChange={() => {}} />
              <span className="t-small-medium text-zinc-700">Ne créer aucune consigne dans cette conversation</span>
            </label>
          </>
        )}

        <Separator />
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <Button variant="ghost" size="md">Tout retirer</Button>
          <Button variant="solid" size="md" onClick={close}>Fermer</Button>
        </div>
      </div>
    </>
  );
}
