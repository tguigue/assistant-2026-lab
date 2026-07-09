export type ScenarioId = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8';
export const SCENARIO_IDS: ScenarioId[] = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'];

/** Which content fixture the canvas renders. Fixed to S1 now that the scenario
 *  switcher is gone — kept as a field so the fixtures stay swappable in code. */
export type Composition = {
  scenario: ScenarioId;
};

export type Citation = {
  /** Pill label, e.g. "Cass. soc. · 10 nov. 2009" */
  label: string;
  /** Full reference shown on hover */
  full: string;
  /** external = Doctrine caselaw, internal = KB / Clausier / Matter */
  kind: 'external' | 'internal';
  /** Which Notion source this came from — used to filter citations per Params */
  source: 'doctrine' | 'kb' | 'clausier' | 'matter';
};

/** An inline `[[citeKey]]` is replaced by the cite-pill for the corresponding citation. */
export type AnswerBlock =
  | { kind: 'h'; text: string }
  | { kind: 'p'; html: string }
  /** Direct caselaw quote — rendered as a styled blockquote */
  | { kind: 'quote'; html: string; attribution?: string };

/** Cross-references shown at the bottom of the answer ("Voir également") */
export type CrossRef = { label: string; full: string };

export type ScenarioFixture = {
  id: ScenarioId;
  code: string;
  title: string;
  intent: { icon: string; label: string };
  /** Real legal prompt from the Notion EoY Vision doc */
  prompt: string;
  /** Optional attached doc (for S3) */
  attached?: { name: string; meta: string };
  /** Plan-preamble text (HTML allowed for <strong> emphasis) */
  preamble: string;
  /** Answer body with [[citeKey]] placeholders */
  answer: AnswerBlock[];
  /** All citations referenced; filtered at render time by Params */
  citations: Record<string, Citation>;
  /** Cross-references — « Voir également » section under the answer */
  crossRefs?: CrossRef[];
  /** Short conclusion / disclaimer line below the answer body */
  conclusion?: string;
  /** 3 follow-up suggestions */
  followups: string[];
  /** Optional artifact (Draft preview body for S2) */
  artifact?: {
    title: string;
    body: AnswerBlock[];
    footer: string;
  };
  /** Multiple generated documents (S6 — multi-doc generation). */
  artifacts?: {
    title: string;
    body: AnswerBlock[];
    footer: string;
  }[];
  /** The reference document this draft/edit is based on (D2 badge + Sources panel header). */
  referenceDoc?: { name: string; meta: string };
  /** Feeds the Sources side panel (D3) + legal-article check (D4). */
  sourcesPanel?: {
    excerpts: { docLabel: string; quote: string }[];
    articles: { ref: string; status: 'à-jour' | 'obsolète' | 'modifié'; note?: string }[];
  };
};
