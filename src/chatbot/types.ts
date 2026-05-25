export type ScenarioId = 'S1' | 'S2' | 'S3' | 'S4';
export const SCENARIO_IDS: ScenarioId[] = ['S1', 'S2', 'S3', 'S4'];

export type Mode = 'auto' | 'manual';
export type MatterValue = 'none' | 'leroy';
export type ToolValue = 'none' | 'draft' | 'extract' | 'counsel';
export type AttachValue = 'off' | 'auto' | 'ask';

/** The 7 semantic parameters from the Notion EoY Vision doc. */
export type Params = {
  mode: Mode;
  doctrine: boolean;
  kb: boolean;
  clausier: boolean;
  matter: MatterValue;
  tool: ToolValue;
  attach: AttachValue;
};

export type Composition = {
  scenario: ScenarioId;
  params: Params;
  /** false = empty state visible; true = conversation rendered */
  conversationVisible: boolean;
  /** true if the user manually changed any param from the scenario default */
  modified: boolean;
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
export type AnswerBlock = { kind: 'h'; text: string } | { kind: 'p'; html: string };

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
  /** 3 follow-up suggestions */
  followups: string[];
  /** Optional artifact (Draft preview body for S2) */
  artifact?: {
    title: string;
    body: AnswerBlock[];
    footer: string;
  };
};
