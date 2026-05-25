import { create } from 'zustand';
import type { Composition, PrimitiveId, ScenarioId } from './types';
import { ALL_PRIMITIVE_IDS, PRIMITIVES_BY_ID } from './primitiveDefs';

function initialComposition(): Composition {
  const primitives = {} as Composition['primitives'];
  for (const id of ALL_PRIMITIVE_IDS) {
    const def = PRIMITIVES_BY_ID[id];
    const opt = def.options.find((o) => o.id === def.defaultOptionId) ?? def.options[0];
    primitives[id] = {
      optionId: opt.id,
      variantId: opt.variants?.[0]?.id,
      stateId: opt.states?.[0]?.id,
      locationId: opt.locations?.[0]?.id,
    };
  }
  return {
    scenario: 'research',
    primitives,
    runtime: { mockStreaming: true, mockLatency: false, injectError: false },
  };
}

type Store = {
  comp: Composition;
  setOption:   (id: PrimitiveId, optionId: string) => void;
  setVariant:  (id: PrimitiveId, variantId: string) => void;
  setState:    (id: PrimitiveId, stateId: string) => void;
  setLocation: (id: PrimitiveId, locationId: string) => void;
  setScenario: (id: ScenarioId) => void;
  toggleRuntime: (key: keyof Composition['runtime']) => void;
  resetAll: () => void;
  setAllToCurrent: () => void;
};

export const useLab = create<Store>((set) => ({
  comp: initialComposition(),

  setOption: (id, optionId) =>
    set((s) => {
      const def = PRIMITIVES_BY_ID[id];
      const opt = def.options.find((o) => o.id === optionId);
      if (!opt) return s;
      return {
        comp: {
          ...s.comp,
          primitives: {
            ...s.comp.primitives,
            [id]: {
              optionId,
              variantId: opt.variants?.[0]?.id,
              stateId: opt.states?.[0]?.id,
              locationId: opt.locations?.[0]?.id,
            },
          },
        },
      };
    }),

  setVariant: (id, variantId) =>
    set((s) => ({
      comp: {
        ...s.comp,
        primitives: { ...s.comp.primitives, [id]: { ...s.comp.primitives[id], variantId } },
      },
    })),

  setState: (id, stateId) =>
    set((s) => ({
      comp: {
        ...s.comp,
        primitives: { ...s.comp.primitives, [id]: { ...s.comp.primitives[id], stateId } },
      },
    })),

  setLocation: (id, locationId) =>
    set((s) => ({
      comp: {
        ...s.comp,
        primitives: { ...s.comp.primitives, [id]: { ...s.comp.primitives[id], locationId } },
      },
    })),

  setScenario: (id) => set((s) => ({ comp: { ...s.comp, scenario: id } })),

  toggleRuntime: (key) =>
    set((s) => ({
      comp: { ...s.comp, runtime: { ...s.comp.runtime, [key]: !s.comp.runtime[key] } },
    })),

  resetAll: () => set(() => ({ comp: initialComposition() })),

  setAllToCurrent: () =>
    set((s) => {
      const primitives = { ...s.comp.primitives };
      for (const id of ALL_PRIMITIVE_IDS) {
        const def = PRIMITIVES_BY_ID[id];
        const current = def.options.find((o) => o.id === 'current') ?? def.options[0];
        primitives[id] = {
          optionId: current.id,
          variantId: current.variants?.[0]?.id,
          stateId: current.states?.[0]?.id,
          locationId: current.locations?.[0]?.id,
        };
      }
      return { comp: { ...s.comp, primitives } };
    }),
}));
