import type { Params, ScenarioId } from './types';

/**
 * Recommended default parameters per scenario, derived from the Notion EoY Vision doc.
 * These are the "primary use case" for each scenario; designer can tweak from there.
 */
export const SCENARIO_DEFAULTS: Record<ScenarioId, Params> = {
  // S1 — Recherche juridique : auto-detect intent, both Doctrine + KB on, no Matter, no Tool
  S1: { mode: 'auto', doctrine: true,  kb: true,  clausier: false, matter: 'none',  tool: 'none',    attach: 'ask'  },
  // S2 — Rédaction : KB + Clausier on, Draft tool, auto-attach
  S2: { mode: 'auto', doctrine: false, kb: true,  clausier: true,  matter: 'none',  tool: 'draft',   attach: 'auto' },
  // S3 — Analyse de document : Doctrine on, doc uploaded locally, no Matter, no Tool
  S3: { mode: 'auto', doctrine: true,  kb: false, clausier: false, matter: 'none',  tool: 'none',    attach: 'ask'  },
  // S4 — Connaissance interne : Matter selected (Leroy), KB on, Extract tool, auto-attach
  S4: { mode: 'auto', doctrine: false, kb: true,  clausier: false, matter: 'leroy', tool: 'extract', attach: 'auto' },
  // S5 — Édition de document : a loaded contract being edited (matter/ref-doc are UC overlays)
  S5: { mode: 'auto', doctrine: true,  kb: false, clausier: false, matter: 'none',  tool: 'none',    attach: 'off'  },
  // S6 — Génération multi-documents : Matter + reference doc, multi-doc output
  S6: { mode: 'auto', doctrine: false, kb: true,  clausier: true,  matter: 'leroy', tool: 'draft',   attach: 'auto' },
  // S7 — Création de document : new doc from scratch in the Éditeur, no matter, no follow-ups
  S7: { mode: 'auto', doctrine: false, kb: false, clausier: false, matter: 'none',  tool: 'draft',   attach: 'off'  },
  // S8 — Correction de document : edit an existing doc → review 3 changes, no matter, no follow-ups
  S8: { mode: 'auto', doctrine: false, kb: false, clausier: false, matter: 'none',  tool: 'none',    attach: 'off'  },
};

export function isAtScenarioDefault(scenario: ScenarioId, params: Params): boolean {
  const d = SCENARIO_DEFAULTS[scenario];
  return (
    d.mode === params.mode &&
    d.doctrine === params.doctrine &&
    d.kb === params.kb &&
    d.clausier === params.clausier &&
    d.matter === params.matter &&
    d.tool === params.tool &&
    d.attach === params.attach
  );
}
