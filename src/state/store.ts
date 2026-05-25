import { create } from 'zustand';
import type { Composition, PrimitiveId, Role, ScenarioId, SourceId, PresetId } from './types';
import { DEFAULT_COMPOSITION, PRESETS } from './presets';

type Store = {
  composition: Composition;
  setRole: (id: PrimitiveId, role: Role) => void;
  setScenario: (id: ScenarioId) => void;
  toggleSource: (id: SourceId) => void;
  loadPreset: (id: PresetId) => void;
  reset: () => void;
};

/** Comparing a composition against a preset to know if user has diverged */
function matchesPreset(comp: Composition, preset: Composition): boolean {
  if (comp.scenario !== preset.scenario) return false;
  for (const k of Object.keys(comp.primitives) as PrimitiveId[]) {
    if (comp.primitives[k] !== preset.primitives[k]) return false;
  }
  for (const k of Object.keys(comp.sources) as SourceId[]) {
    if (comp.sources[k] !== preset.sources[k]) return false;
  }
  return true;
}

function reconcilePreset(comp: Composition): Composition {
  for (const id of ['A', 'B', 'C'] as const) {
    if (matchesPreset(comp, PRESETS[id])) {
      return { ...comp, preset: id };
    }
  }
  return { ...comp, preset: 'custom' };
}

export const useComposition = create<Store>((set) => ({
  composition: { ...DEFAULT_COMPOSITION },

  setRole: (id, role) =>
    set((s) => ({
      composition: reconcilePreset({
        ...s.composition,
        primitives: { ...s.composition.primitives, [id]: role },
      }),
    })),

  setScenario: (id) =>
    set((s) => ({
      composition: reconcilePreset({ ...s.composition, scenario: id }),
    })),

  toggleSource: (id) =>
    set((s) => ({
      composition: reconcilePreset({
        ...s.composition,
        sources: { ...s.composition.sources, [id]: !s.composition.sources[id] },
      }),
    })),

  loadPreset: (id) =>
    set(() => ({
      composition: id === 'custom' ? { ...DEFAULT_COMPOSITION } : { ...PRESETS[id] },
    })),

  reset: () => set(() => ({ composition: { ...DEFAULT_COMPOSITION } })),
}));
