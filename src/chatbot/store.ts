import { create } from 'zustand';
import type { Composition, Params, ScenarioId } from './types';
import { SCENARIO_DEFAULTS, isAtScenarioDefault } from './presets';
import {
  PRIMITIVE_CODES,
  defaultVariantFor,
  type PrimitiveCode,
} from '../dashboard/primitiveDefs';

function initialPrimitives(): Record<PrimitiveCode, string> {
  const out = {} as Record<PrimitiveCode, string>;
  for (const c of PRIMITIVE_CODES) out[c] = defaultVariantFor(c);
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

type Store = {
  comp: Composition;
  primitives: Record<PrimitiveCode, string>;

  setScenario: (id: ScenarioId) => void;
  setParam: <K extends keyof Params>(key: K, value: Params[K]) => void;
  resetToScenarioDefault: () => void;
  showEmptyState: () => void;
  showConversation: () => void;

  setPrimitiveVariant: (code: PrimitiveCode, variantId: string) => void;
  resetAllPrimitives: () => void;
};

export const useChatbot = create<Store>((set) => ({
  comp: initial(),
  primitives: initialPrimitives(),

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

  setPrimitiveVariant: (code, variantId) =>
    set((s) => ({ primitives: { ...s.primitives, [code]: variantId } })),

  resetAllPrimitives: () => set({ primitives: initialPrimitives() }),
}));
