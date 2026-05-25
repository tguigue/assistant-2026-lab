import { useEffect, useRef } from 'react';
import { useChatbot } from '../chatbot/store';
import type { MatterValue, Mode, ToolValue, AttachValue } from '../chatbot/types';

/**
 * The floating configuration panel.
 * Exposes the 7 semantic parameters from the Notion EoY Vision doc.
 * Each parameter changes the chatbot's BEHAVIOR, not its visual variant.
 */
export function ConfigPanel() {
  const open = useChatbot((s) => s.configOpen);
  const close = useChatbot((s) => s.closeConfigPanel);
  const comp = useChatbot((s) => s.comp);
  const setParam = useChatbot((s) => s.setParam);
  const resetDefault = useChatbot((s) => s.resetToScenarioDefault);
  const showEmpty = useChatbot((s) => s.showEmptyState);
  const showConv = useChatbot((s) => s.showConversation);

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, close]);

  if (!open) return null;

  const p = comp.params;
  return (
    <div
      ref={ref}
      className="fixed top-14 right-3 z-30 w-[320px] max-h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin bg-white border border-zinc-200 rounded-lg shadow-xl"
    >
      <div className="px-4 py-3 border-b border-zinc-200">
        <div className="t-micro text-zinc-500 mb-0.5">Configuration · Scénario {comp.scenario}</div>
        <div className="flex items-center gap-1.5">
          <button onClick={resetDefault} className="flex-1 px-2 py-1 t-small-medium text-zinc-600 border border-zinc-200 rounded hover:border-zinc-400 hover:text-zinc-900">
            Réinitialiser
          </button>
          {comp.conversationVisible ? (
            <button onClick={showEmpty} className="flex-1 px-2 py-1 t-small-medium text-zinc-600 border border-zinc-200 rounded hover:border-zinc-400 hover:text-zinc-900">
              Voir état vide
            </button>
          ) : (
            <button onClick={showConv} className="flex-1 px-2 py-1 t-small-medium text-zinc-600 border border-zinc-200 rounded hover:border-zinc-400 hover:text-zinc-900">
              Lancer conversation
            </button>
          )}
        </div>
      </div>

      {/* 1. Mode */}
      <Section title="1 · Mode de détection" hint="Comment l'Assistant choisit le contexte.">
        <RadioGroup<Mode>
          value={p.mode}
          onChange={(v) => setParam('mode', v)}
          options={[
            { value: 'auto',   label: 'Auto',   hint: "Le système détecte l'intention et choisit les sources" },
            { value: 'manual', label: 'Manuel', hint: "L'utilisateur sélectionne le mode et les sources" },
          ]}
        />
      </Section>

      {/* 2-4. Source toggles */}
      <Section title="2 · Doctrine" hint="Jurisprudence, codes, doctrine publiée.">
        <Toggle on={p.doctrine} onChange={() => setParam('doctrine', !p.doctrine)} label={p.doctrine ? 'Activé' : 'Désactivé'} />
      </Section>
      <Section title="3 · Knowledge Base" hint="Sharepoint, mémos, notes internes.">
        <Toggle on={p.kb} onChange={() => setParam('kb', !p.kb)} label={p.kb ? 'Activée' : 'Désactivée'} />
      </Section>
      <Section title="4 · Clausier" hint="Bibliothèque de clauses types du cabinet.">
        <Toggle on={p.clausier} onChange={() => setParam('clausier', !p.clausier)} label={p.clausier ? 'Activé' : 'Désactivé'} />
      </Section>

      {/* 5. Matter */}
      <Section title="5 · Affaire active" hint="Avec ou sans contexte d'affaire (Matter).">
        <RadioGroup<MatterValue>
          value={p.matter}
          onChange={(v) => setParam('matter', v)}
          options={[
            { value: 'none',  label: 'Aucune' },
            { value: 'leroy', label: 'Leroy c/ Merlin' },
          ]}
        />
      </Section>

      {/* 6. Tool */}
      <Section title="6 · Action / Outil" hint="Outil aval déclenché après la réponse.">
        <RadioGroup<ToolValue>
          value={p.tool}
          onChange={(v) => setParam('tool', v)}
          options={[
            { value: 'none',    label: 'Aucun' },
            { value: 'draft',   label: 'Draft' },
            { value: 'extract', label: 'Extract' },
            { value: 'counsel', label: 'Counsel' },
          ]}
        />
      </Section>

      {/* 7. Attach to Matter */}
      <Section title="7 · Attachement à l'affaire" hint="Comment la sortie est rattachée au Matter.">
        <RadioGroup<AttachValue>
          value={p.attach}
          onChange={(v) => setParam('attach', v)}
          options={[
            { value: 'off',  label: 'Désactivé' },
            { value: 'auto', label: 'Automatique' },
            { value: 'ask',  label: "Demander à l'utilisateur" },
          ]}
        />
      </Section>

      <div className="px-4 py-3 border-t border-zinc-100 t-small-regular text-zinc-500 italic">
        Ces paramètres reflètent les dimensions du document Notion « Assistant 2026 EoY Vision ».
      </div>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="px-4 py-3 border-b border-zinc-100 last:border-b-0">
      <div className="t-small-semibold text-zinc-900">{title}</div>
      {hint && <p className="t-small-regular text-zinc-500 mt-0.5 mb-2.5">{hint}</p>}
      {children}
    </section>
  );
}

function RadioGroup<T extends string>({
  value, onChange, options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string; hint?: string }>;
}) {
  return (
    <div className="space-y-1.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="w-full flex items-start gap-2.5 px-2 py-1.5 rounded hover:bg-zinc-50 text-left"
          >
            <span
              className={
                'inline-flex items-center justify-center size-4 rounded-full border mt-0.5 shrink-0 ' +
                (active ? 'border-zinc-900' : 'border-zinc-300')
              }
            >
              {active && <span className="size-2 rounded-full bg-zinc-900" />}
            </span>
            <div className="flex-1 min-w-0">
              <div className={'t-small-medium ' + (active ? 'text-zinc-900' : 'text-zinc-600')}>{o.label}</div>
              {o.hint && <div className="t-small-regular text-zinc-500 mt-0.5">{o.hint}</div>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button onClick={onChange} className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-zinc-50">
      <span className={'t-small-medium ' + (on ? 'text-zinc-900' : 'text-zinc-500')}>{label}</span>
      <span
        className={
          'inline-flex w-9 h-5 rounded-full p-0.5 transition-all ' +
          (on ? 'bg-zinc-900 justify-end' : 'bg-zinc-200 justify-start')
        }
      >
        <span className="size-4 rounded-full bg-white" />
      </span>
    </button>
  );
}
