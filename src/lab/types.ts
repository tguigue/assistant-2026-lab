/**
 * Core types for the Chatbot Sandbox.
 * 14 primitives total: 6 Doctrine semantic + 8 chat-UI.
 */

export type DoctrinePrimitiveId =
  | 'intent'      // P1
  | 'sources'     // P2
  | 'provenance'  // P3
  | 'artifact'    // P4
  | 'matter'      // P5
  | 'preamble';   // P6

export type ChatPrimitiveId =
  | 'typing'        // C1
  | 'streamCursor'  // C2
  | 'skeleton'      // C3
  | 'attachment'    // C4
  | 'followups'     // C5
  | 'errorBanner'   // C6
  | 'inlineRetry'   // C7
  | 'oops';         // C8

export type PrimitiveId = DoctrinePrimitiveId | ChatPrimitiveId;

export const DOCTRINE_PRIMITIVES: DoctrinePrimitiveId[] = [
  'intent', 'sources', 'provenance', 'artifact', 'matter', 'preamble',
];

export const CHAT_PRIMITIVES: ChatPrimitiveId[] = [
  'typing', 'streamCursor', 'skeleton', 'attachment', 'followups',
  'errorBanner', 'inlineRetry', 'oops',
];

export const ALL_PRIMITIVES: PrimitiveId[] = [
  ...DOCTRINE_PRIMITIVES,
  ...CHAT_PRIMITIVES,
];

export type Role = 'dominant' | 'secondary' | 'absent';
export const ROLES: Role[] = ['dominant', 'secondary', 'absent'];

export type ScenarioId =
  | 'research'    // S1 — Legal Research (No Documents)
  | 'drafting'    // S2 — Drafting
  | 'doc-legal'   // S3 — Document Legal Analysis
  | 'doc-summary' // S4 — Document Analysis (summary)
  | 'internal';   // S5 — Internal Knowledge

export const SCENARIO_IDS: ScenarioId[] = [
  'research', 'drafting', 'doc-legal', 'doc-summary', 'internal',
];

export type PrimitiveState = {
  enabled: boolean;
  variant: string; // one of the primitive's variants (see primitiveDefs.ts)
  role: Role;
};

export type Composition = {
  scenario: ScenarioId;
  primitives: Record<PrimitiveId, PrimitiveState>;
  runtime: {
    mockStreaming: boolean;
    mockLatency: boolean;
    injectError: boolean;
  };
};
