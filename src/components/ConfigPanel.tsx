import { useEffect, useRef } from 'react';
import { useChatbot } from '../chatbot/store';
import type { MatterValue, Mode, ToolValue, AttachValue } from '../chatbot/types';

/**
 * Ceros-styled Configuration panel: dark, monospace, dense.
 * 7 semantic parameters from the Notion EoY Vision doc.
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
    <div ref={ref} className="cfg-panel fixed top-14 right-3 z-30">
      <div className="cfg-head">
        <div className="cfg-eyebrow">Sandbox · Configuration</div>
        <div className="cfg-sub">Scénario {comp.scenario} · {comp.conversationVisible ? 'conversation' : 'état vide'}</div>
        {comp.modified && (
          <div className="cfg-modified">
            <span className="cfg-modified-dot" />
            modifié depuis le défaut
          </div>
        )}
        <div className="cfg-toolbar">
          <button onClick={resetDefault}>reset</button>
          {comp.conversationVisible ? (
            <button onClick={showEmpty}>empty state</button>
          ) : (
            <button onClick={showConv}>conversation</button>
          )}
        </div>
      </div>

      <Section num="1" title="Mode" hint="Comment l'Assistant choisit le contexte">
        <Radio<Mode>
          value={p.mode}
          onChange={(v) => setParam('mode', v)}
          options={[
            { value: 'auto',   label: 'Auto',   hint: 'détection automatique · plan preamble visible' },
            { value: 'manual', label: 'Manual', hint: 'mode picker · pas de preamble' },
          ]}
        />
      </Section>

      <Section num="2" title="Doctrine" hint="Jurisprudence, codes, doctrine publiée">
        <Radio<boolean>
          value={p.doctrine}
          onChange={(v) => setParam('doctrine', v)}
          options={[
            { value: true,  label: 'On',  hint: 'citations Cass. soc. visibles' },
            { value: false, label: 'Off', hint: 'source désactivée' },
          ]}
        />
      </Section>

      <Section num="3" title="Knowledge Base" hint="Sharepoint, mémos internes, notes RH">
        <Radio<boolean>
          value={p.kb}
          onChange={(v) => setParam('kb', v)}
          options={[
            { value: true,  label: 'On',  hint: 'mémo « Encadrement managérial » + Note RH visibles' },
            { value: false, label: 'Off', hint: 'sources internes désactivées' },
          ]}
        />
      </Section>

      <Section num="4" title="Clausier" hint="Bibliothèque de clauses types">
        <Radio<boolean>
          value={p.clausier}
          onChange={(v) => setParam('clausier', v)}
          options={[
            { value: true,  label: 'On',  hint: 'clauses du Clausier dans S2' },
            { value: false, label: 'Off', hint: 'fallback sur modèles KB' },
          ]}
        />
      </Section>

      <Section num="5" title="Matter" hint="Avec ou sans contexte d'affaire">
        <Radio<MatterValue>
          value={p.matter}
          onChange={(v) => setParam('matter', v)}
          options={[
            { value: 'none',  label: 'None',              hint: 'pas de bandeau, pas de docs Matter' },
            { value: 'leroy', label: 'Leroy c/ Merlin',   hint: 'bandeau actif · 7 documents · échéance 21 j' },
          ]}
        />
      </Section>

      <Section num="6" title="Tool action" hint="Outil aval déclenché après la réponse">
        <Radio<ToolValue>
          value={p.tool}
          onChange={(v) => setParam('tool', v)}
          options={[
            { value: 'none',    label: 'None',    hint: 'pas de handoff' },
            { value: 'draft',   label: 'Draft',   hint: 'aperçu de brouillon + CTA' },
            { value: 'extract', label: 'Extract', hint: 'tableau croisé + CTA' },
            { value: 'counsel', label: 'Counsel', hint: 'handoff vers Counsel' },
          ]}
        />
      </Section>

      <Section num="7" title="Attach to Matter" hint="Comment la sortie est rattachée">
        <Radio<AttachValue>
          value={p.attach}
          onChange={(v) => setParam('attach', v)}
          options={[
            { value: 'off',  label: 'Off',  hint: 'pas d\'attachement proposé' },
            { value: 'auto', label: 'Auto', hint: 'sortie attachée silencieusement' },
            { value: 'ask',  label: 'Ask',  hint: 'question explicite à l\'utilisateur' },
          ]}
        />
      </Section>

      <div className="cfg-foot">
        Paramètres issus du document Notion « Assistant 2026 EoY Vision ».
      </div>
    </div>
  );
}

function Section({
  num, title, hint, children,
}: {
  num: string; title: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <section className="cfg-section">
      <div className="cfg-section-title">
        <span className="cfg-section-num">{num} ·</span>
        {title}
      </div>
      {hint && <div className="cfg-hint">{hint}</div>}
      {children}
    </section>
  );
}

function Radio<T extends string | boolean>({
  value, onChange, options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string; hint?: string }>;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            onClick={() => onChange(o.value)}
            className={'cfg-option ' + (active ? 'is-active' : '')}
          >
            <span className="cfg-option-radio">
              <span className="cfg-option-dot" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="cfg-option-label">{o.label}</span>
              {o.hint && <span className="cfg-option-hint block">{o.hint}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
