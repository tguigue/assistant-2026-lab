export type PrimitiveId =
  | 'intent'
  | 'sources'
  | 'provenance'
  | 'artifact'
  | 'matter'
  | 'preamble';

export const PRIMITIVE_IDS: PrimitiveId[] = [
  'intent',
  'sources',
  'provenance',
  'artifact',
  'matter',
  'preamble',
];

export type Role = 'dominant' | 'secondary' | 'absent';
export const ROLES: Role[] = ['dominant', 'secondary', 'absent'];

export type ScenarioId = 'research' | 'draft' | 'analyse' | 'internal';
export const SCENARIO_IDS: ScenarioId[] = ['research', 'draft', 'analyse', 'internal'];

export type SourceId = 'doctrine' | 'kb' | 'clausier' | 'matter';
export const SOURCE_IDS: SourceId[] = ['doctrine', 'kb', 'clausier', 'matter'];

export type Composition = {
  primitives: Record<PrimitiveId, Role>;
  scenario: ScenarioId;
  sources: Record<SourceId, boolean>;
};

/** Sandbox flyout — top-right Ceros-style panel toggles. */
export type RenderAs = 'admin' | 'enduser' | 'empty' | 'loading';

export type SandboxFlags = {
  mockStreaming: boolean;
  mockLatency: boolean;
  injectError: boolean;
  renderAs: RenderAs;
};

export const PRIMITIVE_LABELS: Record<PrimitiveId, { code: string; name: string; tagline: string }> = {
  intent:     { code: 'P1', name: 'Intent chip',     tagline: 'Détection automatique d’intention.' },
  sources:    { code: 'P2', name: 'Source row',      tagline: 'Périmètre des sources.' },
  provenance: { code: 'P3', name: 'Provenance',      tagline: 'Citations groupées par source.' },
  artifact:   { code: 'P4', name: 'Artifact panel',  tagline: 'Surface secondaire (Draft / Extract).' },
  matter:     { code: 'P5', name: 'Matter scope',    tagline: 'Contexte de l’affaire active.' },
  preamble:   { code: 'P6', name: 'Plan preamble',   tagline: 'Annonce du raisonnement.' },
};

export const SCENARIO_LABELS: Record<ScenarioId, { code: string; name: string }> = {
  research: { code: 'S1', name: 'Recherche juridique' },
  draft:    { code: 'S2', name: 'Rédaction' },
  analyse:  { code: 'S3', name: 'Analyse de document' },
  internal: { code: 'S4', name: 'Connaissance interne' },
};

export const SOURCE_LABELS: Record<SourceId, { name: string; count: string }> = {
  doctrine: { name: 'Doctrine',      count: '12M' },
  kb:       { name: 'Knowledge Base', count: '1 240' },
  clausier: { name: 'Clausier',       count: '86' },
  matter:   { name: 'Leroy c/ Merlin', count: '7' },
};

export const RENDER_AS_LABELS: Record<RenderAs, string> = {
  admin: 'Admin console',
  enduser: 'End user console',
  empty: 'Empty state',
  loading: 'Loading state',
};
