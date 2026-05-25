# Assistant 2026 — Lab

Designer composition dashboard for the Doctrine Assistant 2026.
Sibling repo of [`assistant-2026-prototypes`](https://github.com/tguigue/assistant-2026-prototypes) —
same subject, opposite approach. Where the prototypes repo *presents* three fixed
architectures, this repo lets you *compose* your own.

## What it does

Three-pane dashboard:

```
┌─ Controls (240px) ─┬─ Live preview ─┬─ Inspector (320px) ─┐
│ Preset (A/B/C/⋯)    │ rendered       │ Config JSON         │
│ 6 primitives ×      │ Assistant UI   │ Primitive status    │
│   Dom / Sec / Off   │ updated in     │ Diagnostics         │
│ 4 scenarios         │ real time      │                     │
│ 4 source toggles    │                │                     │
└─────────────────────┴────────────────┴─────────────────────┘
       Status bar — preset name, dirty flag, active counts
```

Toggle a primitive's role (Dominant / Secondary / Off), the preview re-renders
instantly. Switch scenario, the same composition runs against a different prompt
and answer. Load A/B/C as starting points and diverge — the status bar shows
`custom` as soon as you do.

## Run locally

```bash
cd assistant-2026-lab
pnpm install
pnpm dev          # http://localhost:5173
```

```bash
pnpm build        # tsc + vite build → dist/
pnpm preview      # serve the built bundle
```

## Stack

- **Vite 8** + **React 19** + **TypeScript 6** — fast dev loop, strict types
- **Zustand 5** — single composition store, no Provider
- **Tailwind 3** + a small set of `.t-*` typography classes ported from the Doctrine production design system
- Hand-rolled UI atoms in `src/components/ui/` — no shadcn CLI install, ~250 LOC total

## Architecture

```
src/
├── App.tsx                     mounts <Shell />
├── main.tsx
├── index.css                   tailwind + tokens + .cite-pill
├── state/
│   ├── types.ts                Composition, PrimitiveId, Role, ScenarioId
│   ├── store.ts                Zustand store (reconcilePreset detects "custom")
│   └── presets.ts              A, B, C as Composition literals
├── scenarios/
│   └── data.ts                 S1–S4 prompts + answer fixtures + citations
└── components/
    ├── Shell.tsx               3-pane layout + header + status bar
    ├── ControlsPanel.tsx       left — preset, primitives, scenario, sources
    ├── LivePreview.tsx         center — composes primitives by Role
    ├── InspectorPanel.tsx      right — config JSON + diagnostics
    ├── StatusBar.tsx           bottom strip
    ├── primitives/
    │   ├── IntentChip.tsx      P1
    │   ├── SourceRow.tsx       P2
    │   ├── Provenance.tsx      P3 — cite-pill body + group headers
    │   ├── ArtifactPanel.tsx   P4 — inline card OR split right pane
    │   ├── MatterScope.tsx     P5 — header band + workspace shell
    │   └── PlanPreamble.tsx    P6
    └── ui/
        └── index.tsx           Button, Segmented, Toggle, Select, Tabs, Separator
```

## Composition model

```ts
type Composition = {
  primitives: Record<PrimitiveId, 'dominant' | 'secondary' | 'absent'>;
  scenario:   'research' | 'draft' | 'analyse' | 'internal';
  sources:    Record<'doctrine' | 'kb' | 'clausier' | 'matter', boolean>;
  preset:     'custom' | 'A' | 'B' | 'C';
};
```

Each primitive Role drives both *visibility* and *intensity* in the preview:
- `dominant` → rendered at full canonical size in its canonical position.
- `secondary` → rendered compact (inline pill, collapsed group, etc.).
- `absent` → not rendered, related state stripped.

Layout switches are derived from Role:
- `primitives.artifact === 'dominant'` AND the scenario has an artifact body → split layout (chat | panel).
- `primitives.matter === 'dominant'` → wrap the surface in the Matter workspace shell (sidebar + main).

## Out of scope (v1)

- URL hash export / shareable composition links
- User-saved presets (only the 3 built-in A/B/C)
- Drag-and-drop region reordering
- Side-by-side comparison of two compositions
- Mobile responsive
- Keyboard shortcuts
- Tests
- Real LLM / streaming — fixtures only

## Why a separate repo

The prototypes repo's audience is leadership: it asks "which architecture do we pick?".
This repo's audience is designers and PMs: it asks "what happens if I move P4 to
secondary and P5 to dominant on scenario S3?". Different audience, different tech
stack, different interaction model — clean separation is honest.
