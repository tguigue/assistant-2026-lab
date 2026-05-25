import { create } from 'zustand';
import type { Composition, Params, ScenarioId } from './types';
import { SCENARIO_DEFAULTS, isAtScenarioDefault } from './presets';
import {
  PRIMITIVE_CODES,
  defaultSelectionFor,
  type PrimitiveCode,
  type PrimitiveSelection,
  PRIMITIVES_BY_CODE,
} from '../dashboard/primitiveDefs';

function initialPrimitives(): Record<PrimitiveCode, PrimitiveSelection> {
  const out = {} as Record<PrimitiveCode, PrimitiveSelection>;
  for (const c of PRIMITIVE_CODES) out[c] = defaultSelectionFor(c);
  return out;
}

function initial(): Composition {
  return {
    scenario: 'S1',
    params: { ...SCENARIO_DEFAULTS.S1 },
    conversationVisible: true,
    modified: false,
  };
}

export type View = 'dashboard';

type Store = {
  comp: Composition;
  primitives: Record<PrimitiveCode, PrimitiveSelection>;
  /** Which primitive sections are expanded in the compact settings rail */
  expanded: Record<PrimitiveCode, boolean>;
  /** Search query for filtering primitives in the rail */
  search: string;

  setScenario: (id: ScenarioId) => void;
  setParam: <K extends keyof Params>(key: K, value: Params[K]) => void;
  resetToScenarioDefault: () => void;
  showEmptyState: () => void;
  showConversation: () => void;

  setPrimitiveOption: (code: PrimitiveCode, optionId: string) => void;
  setPrimitiveDim: (code: PrimitiveCode, dim: 'variantId' | 'stateId' | 'designId' | 'locationId', value: string) => void;
  toggleExpanded: (code: PrimitiveCode) => void;
  expandAll: () => void;
  collapseAll: () => void;
  setSearch: (q: string) => void;
  resetAllPrimitives: () => void;
};

export const useChatbot = create<Store>((set) => ({
  comp: initial(),
  primitives: initialPrimitives(),
  expanded: Object.fromEntries(PRIMITIVE_CODES.map((c) => [c, false])) as Record<PrimitiveCode, boolean>,
  search: '',

  setScenario: (id) =>
    set(() => ({
      comp: {
        scenario: id,
        params: { ...SCENARIO_DEFAULTS[id] },
        conversationVisible: true,
        modified: false,
      },
    })),

  setParam: (key, value) =>
    set((s) => {
      const nextParams = { ...s.comp.params, [key]: value };
      return {
        comp: {
          ...s.comp,
          params: nextParams,
          modified: !isAtScenarioDefault(s.comp.scenario, nextParams),
        },
      };
    }),

  resetToScenarioDefault: () =>
    set((s) => ({
      comp: { ...s.comp, params: { ...SCENARIO_DEFAULTS[s.comp.scenario] }, modified: false },
    })),

  showEmptyState: () => set((s) => ({ comp: { ...s.comp, conversationVisible: false } })),
  showConversation: () => set((s) => ({ comp: { ...s.comp, conversationVisible: true } })),

  setPrimitiveOption: (code, optionId) =>
    set((s) => {
      const def = PRIMITIVES_BY_CODE[code];
      const opt = def.options.find((o) => o.id === optionId) ?? def.options[0];
      return {
        primitives: {
          ...s.primitives,
          [code]: {
            optionId: opt.id,
            variantId: opt.variants?.[0]?.id,
            stateId: opt.states?.[0]?.id,
            designId: opt.designs?.[0]?.id,
            locationId: opt.locations?.[0]?.id,
          },
        },
      };
    }),

  setPrimitiveDim: (code, dim, value) =>
    set((s) => ({
      primitives: {
        ...s.primitives,
        [code]: { ...s.primitives[code], [dim]: value },
      },
    })),

  toggleExpanded: (code) =>
    set((s) => ({ expanded: { ...s.expanded, [code]: !s.expanded[code] } })),

  expandAll: () =>
    set(() => ({
      expanded: Object.fromEntries(PRIMITIVE_CODES.map((c) => [c, true])) as Record<PrimitiveCode, boolean>,
    })),

  collapseAll: () =>
    set(() => ({
      expanded: Object.fromEntries(PRIMITIVE_CODES.map((c) => [c, false])) as Record<PrimitiveCode, boolean>,
    })),

  setSearch: (q) => set({ search: q }),

  resetAllPrimitives: () => set({ primitives: initialPrimitives() }),
}));
