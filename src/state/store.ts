import { create } from 'zustand';
import type {
  Composition,
  PrimitiveId,
  Role,
  ScenarioId,
  SandboxFlags,
  SourceId,
  RenderAs,
} from './types';

/** A reasonable default composition for the Primitives demo + Scenarios detail. */
const DEFAULT_COMPOSITION: Composition = {
  scenario: 'research',
  primitives: {
    intent:     'dominant',
    sources:    'secondary',
    provenance: 'dominant',
    artifact:   'absent',
    matter:     'secondary',
    preamble:   'dominant',
  },
  sources: { doctrine: true, kb: true, clausier: false, matter: false },
};

type CompositionStore = {
  composition: Composition;
  setRole: (id: PrimitiveId, role: Role) => void;
  setScenario: (id: ScenarioId) => void;
  toggleSource: (id: SourceId) => void;
  reset: () => void;
};

export const useComposition = create<CompositionStore>((set) => ({
  composition: { ...DEFAULT_COMPOSITION },

  setRole: (id, role) =>
    set((s) => ({
      composition: {
        ...s.composition,
        primitives: { ...s.composition.primitives, [id]: role },
      },
    })),

  setScenario: (id) =>
    set((s) => ({ composition: { ...s.composition, scenario: id } })),

  toggleSource: (id) =>
    set((s) => ({
      composition: {
        ...s.composition,
        sources: { ...s.composition.sources, [id]: !s.composition.sources[id] },
      },
    })),

  reset: () => set(() => ({ composition: { ...DEFAULT_COMPOSITION } })),
}));

/* ----------------------------------------------------------------------
   Sandbox flyout store — top-right panel toggles, Ceros-style.
   ---------------------------------------------------------------------- */

type SandboxStore = {
  flags: SandboxFlags;
  flyoutOpen: boolean;
  toggleFlyout: () => void;
  closeFlyout: () => void;
  toggleFlag: (key: keyof Omit<SandboxFlags, 'renderAs'>) => void;
  setRenderAs: (v: RenderAs) => void;
};

const DEFAULT_FLAGS: SandboxFlags = {
  mockStreaming: true,
  mockLatency: false,
  injectError: false,
  renderAs: 'admin',
};

export const useSandbox = create<SandboxStore>((set) => ({
  flags: { ...DEFAULT_FLAGS },
  flyoutOpen: false,

  toggleFlyout: () => set((s) => ({ flyoutOpen: !s.flyoutOpen })),
  closeFlyout: () => set({ flyoutOpen: false }),

  toggleFlag: (key) =>
    set((s) => ({ flags: { ...s.flags, [key]: !s.flags[key] } })),

  setRenderAs: (v) => set((s) => ({ flags: { ...s.flags, renderAs: v } })),
}));
