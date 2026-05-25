/**
 * v0.4 — Chatbot Sandbox types
 *
 * Settings model: each primitive has a list of design Options (Current + alternatives).
 * For the selected Option, the designer can further tune Variant / State / Location
 * via three nested dropdowns (Ceros-style).
 */

export type ZoneId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J';

export const ZONE_LABELS: Record<ZoneId, string> = {
  A: 'Page chrome',
  B: 'Empty state',
  C: 'Input composer',
  D: 'Conversation',
  E: 'Modes & intent',
  F: 'Matter integration',
  G: 'Handoffs',
  H: 'Continuation',
  I: 'Errors',
  J: 'Conversation management',
};

export type PrimitiveId =
  | 'A1' | 'A2'
  | 'B1' | 'B2'
  | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7' | 'C8' | 'C9'
  | 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6' | 'D7' | 'D8' | 'D9'
  | 'E1' | 'E2'
  | 'F1' | 'F2' | 'F3' | 'F4' | 'F5'
  | 'G1' | 'G2' | 'G3' | 'G4'
  | 'H1' | 'H2'
  | 'I1' | 'I2' | 'I3'
  | 'J1' | 'J2';

export type OptionDef = {
  id: string;                                              // 'current' | '1' | '2' | ...
  name: string;                                            // 'Current' | 'Centered hero' | ...
  variants?: { id: string; name: string }[];
  states?:   { id: string; name: string }[];
  locations?: { id: string; name: string }[];
};

export type PrimitiveDef = {
  id: PrimitiveId;
  code: string;          // 'A1', 'C3', etc.
  name: string;          // 'Page header'
  zone: ZoneId;
  blurb: string;
  options: OptionDef[];  // first option is always 'current'
  defaultOptionId: string; // my "preferred" Option for the canvas default
};

export type PrimitiveSelection = {
  optionId: string;
  variantId?: string;
  stateId?: string;
  locationId?: string;
};

export type ScenarioId = 'research' | 'drafting' | 'doc-legal' | 'doc-summary' | 'internal';

export const SCENARIO_IDS: ScenarioId[] = ['research', 'drafting', 'doc-legal', 'doc-summary', 'internal'];

export type Composition = {
  scenario: ScenarioId;
  primitives: Record<PrimitiveId, PrimitiveSelection>;
  runtime: {
    mockStreaming: boolean;
    mockLatency: boolean;
    injectError: boolean;
  };
};
