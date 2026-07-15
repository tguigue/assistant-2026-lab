import { create } from 'zustand';
import type { Composition } from './types';
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
  return { scenario: 'S1' };
}

export type ViewMode = 'full' | 'empty';

/** Where the chatbot lives. The same primitives render on every surface; only
 *  the container changes — and the composer applies its compact rule off
 *  full-screen. Lab-only preview control (radio: one surface at a time). */
export type Surface = 'fullscreen' | 'doc' | 'mobile';

type Store = {
  /** Bulk primitive setter: defaults + overlay, in one call. */
  applyPrimitives: (overlay: PrimitiveOverlay) => void;

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

  setViewMode: (m: ViewMode) => void;

  setPrimitiveVariant: (code: PrimitiveCode, id: string) => void;
  setPrimitiveAxisVariant: (code: PrimitiveCode, axisKey: string, id: string) => void;
  setPrimitiveVisible: (code: PrimitiveCode, visible: boolean) => void;
  setPrimitiveContent: (code: PrimitiveCode, id: string) => void;
  togglePrimitiveContent: (code: PrimitiveCode, id: string) => void;
  resetAllPrimitives: () => void;
};

export const useChatbot = create<Store>((set) => ({
  applyPrimitives: (overlay) => set({ primitives: withOverlay(overlay) }),

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

  setViewMode: (m) => set({ viewMode: m }),

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

  resetAllPrimitives: () => set({ primitives: initialPrimitives() }),
}));
