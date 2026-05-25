import { create } from 'zustand';
import { ALL_PRIMITIVES, type Composition, type PrimitiveId, type Role, type ScenarioId } from './types';
import { PRIMITIVE_DEFS } from './primitiveDefs';

function initialComposition(): Composition {
  const primitives = {} as Composition['primitives'];
  for (const id of ALL_PRIMITIVES) {
    const def = PRIMITIVE_DEFS[id];
    primitives[id] = {
      enabled: false, // minimal initial state
      variant: def.defaultVariant,
      role: def.defaultRole === 'absent' ? 'dominant' : def.defaultRole,
    };
  }
  return {
    scenario: 'research',
    primitives,
    runtime: {
      mockStreaming: true,
      mockLatency: false,
      injectError: false,
    },
  };
}

type Store = {
  comp: Composition;
  togglePrimitive: (id: PrimitiveId) => void;
  setVariant: (id: PrimitiveId, variant: string) => void;
  setRole: (id: PrimitiveId, role: Role) => void;
  setScenario: (id: ScenarioId) => void;
  toggleRuntime: (key: keyof Composition['runtime']) => void;
  resetAll: () => void;
  enableAll: () => void;
};

export const useLab = create<Store>((set) => ({
  comp: initialComposition(),

  togglePrimitive: (id) =>
    set((s) => ({
      comp: {
        ...s.comp,
        primitives: {
          ...s.comp.primitives,
          [id]: { ...s.comp.primitives[id], enabled: !s.comp.primitives[id].enabled },
        },
      },
    })),

  setVariant: (id, variant) =>
    set((s) => ({
      comp: {
        ...s.comp,
        primitives: {
          ...s.comp.primitives,
          [id]: { ...s.comp.primitives[id], variant, enabled: true },
        },
      },
    })),

  setRole: (id, role) =>
    set((s) => ({
      comp: {
        ...s.comp,
        primitives: {
          ...s.comp.primitives,
          [id]: { ...s.comp.primitives[id], role, enabled: role !== 'absent' ? true : s.comp.primitives[id].enabled },
        },
      },
    })),

  setScenario: (id) =>
    set((s) => ({ comp: { ...s.comp, scenario: id } })),

  toggleRuntime: (key) =>
    set((s) => ({
      comp: {
        ...s.comp,
        runtime: { ...s.comp.runtime, [key]: !s.comp.runtime[key] },
      },
    })),

  resetAll: () => set(() => ({ comp: initialComposition() })),

  enableAll: () =>
    set((s) => {
      const primitives = { ...s.comp.primitives };
      for (const id of ALL_PRIMITIVES) {
        primitives[id] = { ...primitives[id], enabled: true, role: 'dominant' };
      }
      return { comp: { ...s.comp, primitives } };
    }),
}));
