import { create } from 'zustand';
import type { Composition, Params, ScenarioId } from './types';
import { SCENARIO_DEFAULTS, isAtScenarioDefault } from './presets';

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
  /** UI state: is the floating ConfigPanel open? */
  configOpen: boolean;

  setScenario: (id: ScenarioId) => void;
  setParam: <K extends keyof Params>(key: K, value: Params[K]) => void;
  resetToScenarioDefault: () => void;
  showEmptyState: () => void;
  showConversation: () => void;
  toggleConfigPanel: () => void;
  closeConfigPanel: () => void;
};

export const useChatbot = create<Store>((set) => ({
  comp: initial(),
  configOpen: false,

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

  toggleConfigPanel: () => set((s) => ({ configOpen: !s.configOpen })),
  closeConfigPanel: () => set({ configOpen: false }),
}));
