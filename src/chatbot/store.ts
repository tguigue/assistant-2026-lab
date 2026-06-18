import { create } from 'zustand';
import type { Composition, Params, ScenarioId } from './types';
import { SCENARIO_DEFAULTS, isAtScenarioDefault } from './presets';
import { USE_CASES } from './useCases';
import {
  PRIMITIVE_CODES,
  defaultVariantFor,
  defaultVisibleFor,
  defaultContentFor,
  defaultAxesFor,
  type PrimitiveCode,
} from '../dashboard/primitiveDefs';

export type PrimitiveValue = { visible: boolean; variant: string; content?: string | string[]; axisVariants?: Record<string, string> };
type PrimitiveOverlay = Partial<Record<PrimitiveCode, Partial<PrimitiveValue>>>;

function withOverlay(overlay: PrimitiveOverlay): Record<PrimitiveCode, PrimitiveValue> {
  const base = initialPrimitives();
  for (const code in overlay) {
    const o = overlay[code as PrimitiveCode];
    if (!o) continue;
    const prev = base[code as PrimitiveCode];
    // Deep-merge axisVariants so a partial overlay (e.g. just { set: 'ndas' })
    // keeps the other axis defaults instead of dropping them.
    const axisVariants = o.axisVariants ? { ...prev.axisVariants, ...o.axisVariants } : prev.axisVariants;
    base[code as PrimitiveCode] = { ...prev, ...o, ...(axisVariants ? { axisVariants } : {}) };
  }
  return base;
}

function initialPrimitives(): Record<PrimitiveCode, PrimitiveValue> {
  const out = {} as Record<PrimitiveCode, PrimitiveValue>;
  for (const c of PRIMITIVE_CODES) {
    const content = defaultContentFor(c);
    const axes = defaultAxesFor(c);
    const base: PrimitiveValue = { visible: defaultVisibleFor(c), variant: defaultVariantFor(c) };
    if (content !== undefined) base.content = content;
    if (axes !== undefined) base.axisVariants = axes;
    out[c] = base;
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

/** Where the chatbot lives. The same primitives render on every surface; only
 *  the container changes — and the composer applies its compact rule off
 *  full-screen. Lab-only preview control (radio: one surface at a time). */
export type Surface = 'fullscreen' | 'doc' | 'mobile';

type Store = {
  /** Which use-case preset is loaded from the sidebar (null = none). */
  activeUseCase: string | null;
  applyUseCase: (id: string) => void;
  clearUseCase: () => void;
  /** Bulk primitive setter: defaults + overlay, in one call. */
  applyPrimitives: (overlay: PrimitiveOverlay) => void;
  /** When set, the composer + user bubble show this instead of the scenario prompt. */
  promptOverride: string | null;

  comp: Composition;
  primitives: Record<PrimitiveCode, PrimitiveValue>;
  viewMode: ViewMode;
  surface: Surface;
  setSurface: (s: Surface) => void;
  contextPicker: 'sources' | 'kb' | 'matters' | 'sharepoint' | null;
  setContextPicker: (p: 'sources' | 'kb' | 'matters' | 'sharepoint' | null) => void;
  actionPickerOpen: boolean;
  setActionPickerOpen: (open: boolean) => void;
  filesModalOpen: boolean;
  setFilesModalOpen: (open: boolean) => void;
  highlightMode: boolean;
  toggleHighlightMode: () => void;
  hoveredPrimitive: PrimitiveCode | null;
  setHoveredPrimitive: (code: PrimitiveCode | null) => void;
  /** Design mode: the primitive whose settings are open in the panel —
   *  set by clicking it on the canvas or its row in the list. */
  inspectedPrimitive: PrimitiveCode | null;
  setInspectedPrimitive: (code: PrimitiveCode | null) => void;
  /** Sources side panel (D3) — opened from an edits-review change's "Sources". */
  sourcesPanel: { open: boolean; changeIndex: number | null };
  openSourcesPanel: (changeIndex: number) => void;
  closeSourcesPanel: () => void;

  setScenario: (id: ScenarioId) => void;
  setParam: <K extends keyof Params>(key: K, value: Params[K]) => void;
  resetToScenarioDefault: () => void;
  showEmptyState: () => void;
  showConversation: () => void;
  setViewMode: (m: ViewMode) => void;

  setPrimitiveVariant: (code: PrimitiveCode, id: string) => void;
  setPrimitiveAxisVariant: (code: PrimitiveCode, axisKey: string, id: string) => void;
  setPrimitiveVisible: (code: PrimitiveCode, visible: boolean) => void;
  setPrimitiveContent: (code: PrimitiveCode, id: string) => void;
  togglePrimitiveContent: (code: PrimitiveCode, id: string) => void;
  resetAllPrimitives: () => void;
};

export const useChatbot = create<Store>((set) => ({
  activeUseCase: null,
  promptOverride: null,
  applyPrimitives: (overlay) => set({ primitives: withOverlay(overlay) }),
  applyUseCase: (id) =>
    set((s) => {
      const uc = USE_CASES.find((u) => u.id === id);
      if (!uc) return {};
      // Respect the current view: loading a scenario while on Answer shows
      // that scenario's answer — it doesn't yank you back to the composer.
      return {
        comp: {
          scenario: uc.scenario,
          params: { ...SCENARIO_DEFAULTS[uc.scenario] },
          conversationVisible: s.viewMode === 'full',
          modified: false,
        },
        primitives: withOverlay(uc.primitives),
        promptOverride: uc.prompt,
        activeUseCase: id,
        // Doc-panel-mandatory use cases (uc.surface === 'doc') open the Éditeur.
        // Others must NOT stay stuck in the Éditeur: pop back to fullscreen — but
        // preserve a manual 'mobile' preview if that's where the user was.
        surface: uc.surface ?? (s.surface === 'doc' ? 'fullscreen' : s.surface),
        // Upload presets can land straight in the "Vos documents" manager.
        filesModalOpen: uc.openFiles ?? false,
      };
    }),
  clearUseCase: () => set({ activeUseCase: null, promptOverride: null }),

  comp: initial(),
  primitives: initialPrimitives(),
  viewMode: 'empty',
  surface: 'fullscreen',
  setSurface: (sf) => set({ surface: sf }),
  contextPicker: null,
  setContextPicker: (p) => set({ contextPicker: p }),
  actionPickerOpen: false,
  setActionPickerOpen: (open) => set({ actionPickerOpen: open }),
  filesModalOpen: false,
  setFilesModalOpen: (open) => set({ filesModalOpen: open }),
  highlightMode: true,
  toggleHighlightMode: () => set((s) => ({ highlightMode: !s.highlightMode, hoveredPrimitive: null, inspectedPrimitive: null })),
  hoveredPrimitive: null,
  setHoveredPrimitive: (code) => set({ hoveredPrimitive: code }),
  inspectedPrimitive: null,
  setInspectedPrimitive: (code) => set({ inspectedPrimitive: code }),
  sourcesPanel: { open: false, changeIndex: null },
  openSourcesPanel: (changeIndex) => set({ sourcesPanel: { open: true, changeIndex } }),
  closeSourcesPanel: () => set({ sourcesPanel: { open: false, changeIndex: null } }),

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
    set((s) => {
      const next = { ...s.primitives, [code]: { ...s.primitives[code], variant: id } };
      // Discoverability coupling (mirror of C5→detected): scoping a folder via
      // the Conversation Header (C8) reveals folder-aware Suggested actions (E3).
      // Detaching the folder falls back to the default curated tools.
      if (code === 'C8') {
        const e3 = s.primitives.E3;
        if (id !== 'idle') {
          next.E3 = { ...e3, visible: true, axisVariants: { ...e3.axisVariants, source: 'folder' } };
        } else if (e3.axisVariants?.source === 'folder') {
          next.E3 = { ...e3, visible: true, axisVariants: { ...e3.axisVariants, source: 'curated' } };
        }
      }
      return { primitives: next };
    }),
  setPrimitiveAxisVariant: (code, axisKey, id) =>
    set((s) => ({
      primitives: {
        ...s.primitives,
        [code]: {
          ...s.primitives[code],
          axisVariants: { ...(s.primitives[code].axisVariants ?? {}), [axisKey]: id },
        },
      },
    })),
  setPrimitiveVisible: (code, visible) =>
    set((s) => {
      const next = { ...s.primitives, [code]: { ...s.primitives[code], visible } };
      // Discoverability coupling: "Imported files" (C5) is the upload, and the
      // upload is what triggers the intelligence. Turning C5 on reveals the
      // detected Suggested actions (E3) — sparkle + "D'après vos documents" —
      // so a designer finds the smart primitive without digging into an axis.
      // Turning C5 off only retracts the detection WE surfaced (a curated E3
      // the designer set themselves is left untouched).
      if (code === 'C5') {
        const e3 = s.primitives.E3;
        if (visible) {
          next.E3 = { ...e3, visible: true, axisVariants: { ...e3.axisVariants, source: 'detected' } };
        } else if (e3.axisVariants?.source === 'detected') {
          // Upload removed → fall back to the default curated tools (stay visible).
          next.E3 = { ...e3, visible: true, axisVariants: { ...e3.axisVariants, source: 'curated' } };
        }
      }
      return { primitives: next };
    }),
  setPrimitiveContent: (code, id) =>
    set((s) => ({ primitives: { ...s.primitives, [code]: { ...s.primitives[code], content: id } } })),
  togglePrimitiveContent: (code, id) =>
    set((s) => {
      const current = s.primitives[code].content;
      const arr = Array.isArray(current) ? current : [];
      const next = arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
      return { primitives: { ...s.primitives, [code]: { ...s.primitives[code], content: next } } };
    }),

  resetAllPrimitives: () => set({ primitives: initialPrimitives(), activeUseCase: null, promptOverride: null }),
}));
