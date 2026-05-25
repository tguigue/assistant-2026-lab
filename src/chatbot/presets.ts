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
