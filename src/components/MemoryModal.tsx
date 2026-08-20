import { useState } from 'react';
import { useChatbot } from '../chatbot/store';
import { useNarrowOverlay } from './SurfaceScope';
import { Button, Icon, Modal, Sw, TOOL_BTN } from './ui';

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
type Consigne = { text: string; origin: string; applied?: boolean; mine?: boolean };

const CONSIGNES: Record<MemScope, Consigne[]> = {
  moi: [
    { text: 'Rédiger les conclusions au présent de l’indicatif.', origin: 'Ajoutée le 12 mai — conversation « Licenciement Moreau »', applied: true },
    { text: 'Citer l’article avant la jurisprudence.',            origin: 'Ajoutée le 3 juin — conversation « Harcèlement — analyse »', applied: true },
    { text: 'Synthèses en trois points maximum.',                 origin: 'Ajoutée le 28 juin — conversation « Note Pernod »' },
    { text: 'Ne jamais citer une décision non publiée.',           origin: 'Écrite par vous', mine: true },
  ],
  cabinet: [
    { text: 'Plaider la recevabilité avant le fond.',             origin: 'Ajoutée par Mehdi le 14 avril', applied: true },
    { text: 'Mises en demeure : modèle validé 2026.',             origin: 'Ajoutée par Audrey le 2 mars' },
  ],
  dossier: [
    { text: 'Ne pas invoquer la prescription — écartée en première instance.', origin: 'Ajoutée le 19 juin — dossier Moreau c/ SAS Aurelia' },
    { text: 'Client employeur mid-cap — rester prudent sur le risque réputationnel.', origin: 'Écrite par vous', mine: true },
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
  // The register could only ever be READ. Every consigne arrived one way — the
  // agent proposing one through A0 — so a lawyer could delete a rule but never
  // write one. This is the other half, and it is deliberately not a freeform
  // "system prompt": a prose block has no scope, and an unscoped instruction
  // applies on a matter where it should not, which is the conflicts problem this
  // primitive exists to prevent. A consigne you write is scoped like any other.
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState('');
  // "appliquée" is a claim about an answer, so it can only be made next to one.
  // The chip already respects this; the register it opens did not.
  const answered = useChatbot((s) => s.viewMode) === 'full';
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
    <Modal
      title="Consignes de l’Assistant"
      onClose={close}
      width="max-w-[560px]"
      narrow={narrow}
      z="!z-[61]"
      tabs={{
        value: m.scope,
        onChange: (v) => setAxis('C18', 'scope', v),
        options: (['moi', 'cabinet', 'dossier'] as MemScope[]).map((id) => ({
          value: id, label: SCOPE_LABEL[id], count: CONSIGNES[id].length,
        })),
      }}
      footerLeft={<Button variant="ghost" size="md">Tout retirer</Button>}
      footerRight={<Button variant="solid" size="md" onClick={close}>Fermer</Button>}
    >
      {m.has('wall') && (
        <p className="px-5 pt-3 t-small-regular text-zinc-500">{CLOISONNEMENT[m.scope]}</p>
      )}
      <div className="px-5 py-2">
        {/* Write your own, into the scope you are looking at. */}
        {drafting ? (
          <div className="mb-2 rounded-lg border border-zinc-300 p-2">
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              placeholder="Ex. : ne jamais citer une décision non publiée."
              className="w-full bg-transparent outline-none resize-none t-base-regular text-zinc-800 placeholder:text-zinc-400"
            />
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="t-small-regular text-zinc-400">
                S’appliquera à « {SCOPE_LABEL[m.scope]} »
              </span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => { setDrafting(false); setDraft(''); }}>Annuler</Button>
                <Button variant="solid" size="sm" disabled={!draft.trim()} onClick={() => { setDrafting(false); setDraft(''); }}>
                  Ajouter
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setDrafting(true)}
            className="w-full flex items-center gap-2 py-2 t-base-regular text-zinc-500 hover:text-zinc-900"
          >
            <Icon name="plus" className="size-4 shrink-0" />
            Ajouter une consigne
          </button>
        )}

          {items.length === 0 ? (
            <p className="py-6 text-center t-small-regular text-zinc-500">
              Aucune consigne à ce niveau.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {items.map((it) => (
                <li key={it.text} className="group/c py-3">
                  <div className="flex items-start gap-2">
                    <p className="flex-1 t-base-regular text-zinc-800">{it.text}</p>
                    {/* Which ones actually shaped this answer, so the chip's
                        number is traceable rather than asserted. */}
                    {/* Who wrote it: trusting a rule depends on knowing whether
                        you set it or the Assistant inferred it. */}
                    {it.mine && (
                      <span className="shrink-0 mt-0.5 px-1.5 py-0.5 rounded t-small-medium bg-blue-50 text-blue-700">
                        vous
                      </span>
                    )}
                    {it.applied && answered && (
                      <span className="shrink-0 mt-0.5 px-1.5 py-0.5 rounded t-small-medium bg-zinc-100 text-zinc-600">
                        appliquée
                      </span>
                    )}
                  </div>
                  {m.has('origin') && (
                    <p className="t-small-regular text-zinc-400 mt-0.5">{it.origin}</p>
                  )}
                  {m.has('forget') && (
                    <div className="flex items-center gap-1.5 mt-1.5 -ml-2 opacity-0 group-hover/c:opacity-100 focus-within:opacity-100 transition-opacity">
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
        <label className="flex items-center gap-2.5 px-5 py-3 border-t border-zinc-100 cursor-pointer">
          <Sw checked={false} onChange={() => {}} />
          <span className="t-small-medium text-zinc-700">Ne créer aucune consigne dans cette conversation</span>
        </label>
      )}
    </Modal>
  );
}
