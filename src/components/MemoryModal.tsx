import { useChatbot } from '../chatbot/store';
import { useNarrowOverlay } from './SurfaceScope';
import { Button, Icon, MODAL_MAX_H, Segmented, Separator, Sw, modalShell } from './ui';

/**
 * C18 — Memory ("Ce que l'Assistant sait").
 *
 * `scope` is the primary axis and it is not a filter — it is the ethical wall.
 * For a lawyer, a souvenir that is simultaneously personal and firm-wide IS the
 * conflicts problem, so every souvenir belongs to exactly one scope, and each
 * scope states its own cloisonnement in words rather than leaving the user to
 * infer it. That is why this is a radio and not checkboxes.
 *
 * Two forms because there are two jobs: the chip discloses at the moment of use,
 * the modal manages the register. A chip cannot hold a firm-wide list, and a
 * modal is invisible exactly when disclosure matters.
 */

export type MemScope = 'moi' | 'cabinet' | 'dossier';

export const SCOPE_LABEL: Record<MemScope, string> = {
  moi: 'Moi', cabinet: 'Mon cabinet', dossier: 'Ce dossier',
};

/** Said out loud, per scope. An unstated boundary is not a boundary. */
export const CLOISONNEMENT: Record<MemScope, string> = {
  moi:     'Visible de vous seul.',
  cabinet: 'Partagé avec les membres du cabinet. Aucune information issue d’un dossier n’y entre.',
  dossier: 'Cloisonné au dossier Moreau c/ SAS Aurelia — jamais réutilisé ailleurs.',
};

const SOUVENIRS: Record<MemScope, { text: string; origin: string }[]> = {
  moi: [
    { text: 'Vous rédigez les conclusions au présent de l’indicatif.', origin: 'Retenu le 12 mai — conversation « Licenciement Moreau »' },
    { text: 'Citer l’article avant la jurisprudence.',                  origin: 'Retenu le 3 juin — conversation « Harcèlement — analyse »' },
    { text: 'Vous préférez les synthèses en trois points.',             origin: 'Retenu le 28 juin — conversation « Note Pernod »' },
  ],
  cabinet: [
    { text: 'Le cabinet plaide en priorité sur la recevabilité.',       origin: 'Ajouté par Mehdi le 14 avril' },
    { text: 'Les mises en demeure suivent le modèle validé 2026.',      origin: 'Ajouté par Audrey le 2 mars' },
  ],
  dossier: [
    { text: 'La partie adverse conteste la prescription depuis mars.',  origin: 'Retenu le 19 juin — dossier Moreau c/ SAS Aurelia' },
  ],
};

function useMemory() {
  const v = useChatbot((s) => s.primitives.C18);
  const content = Array.isArray(v.content) ? v.content : [];
  return {
    visible: v.visible,
    variant: v.variant,
    scope: (v.axisVariants?.scope ?? 'moi') as MemScope,
    has: (id: string) => content.includes(id),
  };
}

/** The composer chip — disclosure where it counts. */
export function MemoryChip() {
  const m = useMemory();
  const toggleContent = useChatbot((s) => s.togglePrimitiveContent);
  if (!m.visible || m.variant !== 'chip') return null;
  const n = SOUVENIRS[m.scope].length;
  return (
    <button
      onClick={() => toggleContent('C18', 'open')}
      title="Ce que l’Assistant sait"
      className="tap-44 inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg t-small-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors @2xl/surface:h-8"
    >
      <Icon name="sparkles" className="size-3.5 shrink-0" />
      <span className="tabular-nums">{n}</span>
      <span className="hidden @2xl/surface:inline">souvenir{n > 1 ? 's' : ''} utilisé{n > 1 ? 's' : ''}</span>
    </button>
  );
}

export function MemoryModal() {
  const m = useMemory();
  const setAxis = useChatbot((s) => s.setPrimitiveAxisVariant);
  const toggleContent = useChatbot((s) => s.togglePrimitiveContent);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  const narrow = useNarrowOverlay();

  // `modal` variant shows it directly; `chip` opens it via the preview flag —
  // the same mechanism the budget CTA uses for C13.
  const open = m.visible && (m.variant === 'modal' || m.has('open'));
  if (!open) return null;

  const close = () => {
    if (m.has('open')) toggleContent('C18', 'open');
    if (m.variant === 'modal') setVisible('C18', false);
  };

  const items = SOUVENIRS[m.scope];

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[60]" onClick={close} />
      <div className={modalShell('max-w-[560px]', narrow, '!z-[61]') + ' ' + MODAL_MAX_H}>
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <h2 className="flex-1 t-title-4 text-zinc-900">Ce que l’Assistant sait</h2>
          <button onClick={close} className="size-7 grid place-items-center rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900">
            <Icon name="x" className="size-4" />
          </button>
        </div>

        <div className="px-5 pb-3">
          <Segmented
            value={m.scope}
            onChange={(v) => setAxis('C18', 'scope', v)}
            options={(['moi', 'cabinet', 'dossier'] as MemScope[]).map((id) => ({ value: id, label: SCOPE_LABEL[id] }))}
          />
          {/* The boundary, in words, for the scope you're looking at. */}
          {m.has('wall') && (
            <p className="mt-2 t-small-regular text-zinc-500">{CLOISONNEMENT[m.scope]}</p>
          )}
        </div>

        <Separator />

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-5 py-2">
          {items.length === 0 ? (
            <p className="py-6 text-center t-small-regular text-zinc-500">
              L’Assistant ne retient rien pour l’instant.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {items.map((it) => (
                <li key={it.text} className="py-3">
                  <p className="t-base-regular text-zinc-800">{it.text}</p>
                  {m.has('origin') && (
                    <p className="t-small-regular text-zinc-400 mt-0.5">{it.origin}</p>
                  )}
                  {m.has('forget') && (
                    <div className="flex items-center gap-3 mt-1.5">
                      <button className="t-small-medium text-zinc-500 hover:text-zinc-900 underline decoration-zinc-300">Corriger</button>
                      <button className="t-small-medium text-zinc-500 hover:text-zinc-900 underline decoration-zinc-300">Oublier</button>
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
            <div className="flex items-center gap-2.5 px-5 py-3">
              <Sw checked={false} onChange={() => {}} />
              <span className="t-small-medium text-zinc-700">Ne rien retenir de cette conversation</span>
            </div>
          </>
        )}

        <Separator />
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <button className="t-small-medium text-zinc-500 hover:text-zinc-900">Tout oublier</button>
          <Button variant="solid" size="md" onClick={close}>Fermer</Button>
        </div>
      </div>
    </>
  );
}
