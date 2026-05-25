import { create } from 'zustand';
import type { Composition, Params, ScenarioId } from './types';
import { SCENARIO_DEFAULTS, isAtScenarioDefault } from './presets';
import {
  PRIMITIVE_CODES,
  defaultVariantFor,
  defaultVisibleFor,
  defaultContentFor,
  type PrimitiveCode,
} from '../dashboard/primitiveDefs';

export type PrimitiveValue = { visible: boolean; variant: string; content?: string };

function initialPrimitives(): Record<PrimitiveCode, PrimitiveValue> {
  const out = {} as Record<PrimitiveCode, PrimitiveValue>;
  for (const c of PRIMITIVE_CODES) {
    const content = defaultContentFor(c);
    out[c] = content === undefined
      ? { visible: defaultVisibleFor(c), variant: defaultVariantFor(c) }
      : { visible: defaultVisibleFor(c), variant: defaultVariantFor(c), content };
  }
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

export type ViewMode = 'full' | 'empty';

type Store = {
  comp: Composition;
  primitives: Record<PrimitiveCode, PrimitiveValue>;
  viewMode: ViewMode;
  sourcesPanelOpen: boolean;
  setSourcesPanelOpen: (open: boolean) => void;
  highlightMode: boolean;
  toggleHighlightMode: () => void;
  hoveredPrimitive: PrimitiveCode | null;
  setHoveredPrimitive: (code: PrimitiveCode | null) => void;

  setScenario: (id: ScenarioId) => void;
  setParam: <K extends keyof Params>(key: K, value: Params[K]) => void;
  resetToScenarioDefault: () => void;
  showEmptyState: () => void;
  showConversation: () => void;
  setViewMode: (m: ViewMode) => void;

  setPrimitiveVariant: (code: PrimitiveCode, id: string) => void;
  setPrimitiveVisible: (code: PrimitiveCode, visible: boolean) => void;
  setPrimitiveContent: (code: PrimitiveCode, id: string) => void;
  resetAllPrimitives: () => void;
};

export const useChatbot = create<Store>((set) => ({
  comp: initial(),
  primitives: initialPrimitives(),
  viewMode: 'full',
  sourcesPanelOpen: false,
  setSourcesPanelOpen: (open) => set({ sourcesPanelOpen: open }),
  highlightMode: true,
  toggleHighlightMode: () => set((s) => ({ highlightMode: !s.highlightMode, hoveredPrimitive: null })),
  hoveredPrimitive: null,
  setHoveredPrimitive: (code) => set({ hoveredPrimitive: code }),

  setViewMode: (m) =>
    set((s) => ({
      viewMode: m,
      comp: { ...s.comp, conversationVisible: m !== 'empty' },
    })),

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

  setPrimitiveVariant: (code, id) =>
    set((s) => ({ primitives: { ...s.primitives, [code]: { ...s.primitives[code], variant: id } } })),
  setPrimitiveVisible: (code, visible) =>
    set((s) => ({ primitives: { ...s.primitives, [code]: { ...s.primitives[code], visible } } })),
  setPrimitiveContent: (code, id) =>
    set((s) => ({ primitives: { ...s.primitives, [code]: { ...s.primitives[code], content: id } } })),

  resetAllPrimitives: () => set({ primitives: initialPrimitives() }),
}));
