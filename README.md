# Assistant 2026 — Lab

Internal sandbox for the Doctrine Assistant 2026 feature.
Sibling repo of [`assistant-2026-prototypes`](https://github.com/tguigue/assistant-2026-prototypes) —
same subject, different audience. The prototypes repo *presents* three fixed architectures
to leadership; this repo *explores* the feature's full surface through a Ceros-inspired
admin console.

> Visual reference: [Ceros Sandbox](https://www.ceros.com). We took the IA and interaction
> patterns (sidebar + topbar + sandbox flyout + terminal-styled Flow Runner), not the colors —
> the app stays in light monochrome to align with `assistant-2026-prototypes`.

## What it does

Eleven sections behind a single sidebar. Three are content-heavy, the rest range from medium
to deliberately light placeholders — matching the uneven density of a real internal tool.

```
Getting Started        — orientation, embedded Flow Runner
Dashboard              — 4 scenario tiles + sample activity feed
Primitives             — P1–P6 docs with interactive state demos
Scenarios              — S1–S4 with the Flow Runner (the keystone widget)
Sources                — Doctrine / KB / Clausier / Matters adapter cards
Matters                — sample Matters (Leroy c/ Merlin, Dupuis, Moreau)
Conversations          — past threads (the scenario fixtures as chat)
Activity               — log-styled event feed
Tools                  — Draft / Extract / Counsel connector cards
Policy                 — placeholder (coming soon)
Settings               — env, build info, sandbox toggles
```

A right-aligned **sandbox flyout** (top-right avatar) exposes `Mock streaming` /
`Mock latency` / `Inject error` toggles plus a `Render as` picker
(Admin / End user / Empty / Loading), mirroring the Ceros pattern.

The keystone widget is the **Flow Runner** on the Scenarios pages. Pick a variant, click Run,
watch a scripted terminal trace stream in followed by the actual assistant answer in legal serif:

```
~/assistant/leroy-c-merlin/research
$ assistant research "harcèlement points hebdo"
✓ intent: research              (auto-detected · conf 0.94)
✓ scope: Doctrine, KB           (12M + 1 240 docs)
→ search: Doctrine              (312ms · 4 hits)
→ search: KB                    (87ms · 2 hits)
✓ provenance: 6 sources cited
• policy: passed

« L'organisation de points hebdomadaires ne caractérise pas en
  elle-même un harcèlement moral. La Cour de cassation rappelle… »
   [Cass. soc. · 10 nov. 2009]  [Cass. soc. · 15 mars 2023]
```

## Run locally

```bash
pnpm install
pnpm dev           # http://localhost:5173
pnpm build         # tsc + vite build → dist/
pnpm preview       # serve dist
```

## Stack

- **Vite 8** + **React 19** + **TypeScript 6**
- **Zustand 5** — two stores: `useComposition` (primitive roles, sources, scenario) and `useSandbox` (flyout flags + render mode)
- **react-router-dom 7** — 11 routes under a single `<Shell />`
- **Tailwind 3** + Inter (via rsms) + Tiempos Text (for legal body) + system mono
- Hand-rolled UI atoms (`Button`, `Segmented`, `Toggle`, `Select`, `Tabs`, `Separator`) — no shadcn CLI install

## Architecture

```
src/
├── App.tsx                          BrowserRouter + 11 routes under Shell
├── main.tsx
├── index.css                        tailwind + tokens + .cite-pill + .term-* + .sidebar-link
├── state/
│   ├── types.ts                     Composition, PrimitiveId, Role, ScenarioId, SandboxFlags
│   └── store.ts                     useComposition + useSandbox
├── sandbox/
│   ├── nav.ts                       sidebar definition (11 items)
│   └── flowVariants.ts              scripted variants per scenario for the Flow Runner
├── scenarios/
│   └── data.ts                      S1–S4 prompts + answer fixtures + citations
├── components/
│   ├── primitives/                  P1–P6 React components (reused from v0.1)
│   ├── ui/                          minimal shadcn-style atoms
│   └── sandbox/
│       ├── Shell.tsx                top bar + sidebar + content slot + flyout
│       ├── TopBar.tsx
│       ├── Sidebar.tsx              NavLink list
│       ├── SandboxFlyout.tsx        right-aligned dropdown panel
│       ├── PageShell.tsx            consistent page header + section primitive
│       ├── FlowRunner.tsx           the keystone widget
│       └── TerminalBlock.tsx        the styled output pane
└── pages/                           11 routes, one file each
```

## Visual language

To make "internal tool" land without a dark canvas:

- Heavy use of `.t-mono` for file paths, commands, log lines, latency counters.
- 1px zinc-200 borders, `rounded-md` max — minimal soft curves.
- Status glyphs (`✓` `→` `•` `⚠` `✗`) carry meaning; color limited to zinc-900 / zinc-500 / zinc-400 with `amber-700` reserved for warnings.
- Terminal blocks: zinc-50 background, mono, dense line height (1.55), thin pathline strip at the top.
- Sidebar items: left 2px accent on the active row (zinc-900). Lucide-style monoline icons at 14px, never colored.

## What changed from v0.1

v0.1 was a 3-pane composition tool (`ControlsPanel | LivePreview | InspectorPanel`) framed
around A/B/C bundle presets. v0.2 drops the bundle concept entirely and replaces the
3-pane shell with a sidebar-driven sandbox. **What we kept**: the Zustand store, the
6 primitive components (`IntentChip`, `SourceRow`, `Provenance`, `ArtifactPanel`,
`MatterScope`, `PlanPreamble`), the typography scale, the `.cite-pill` styles, and the
S1–S4 answer fixtures. **What we dropped**: `presets.ts`, the v0.1 Shell/ControlsPanel/
LivePreview/InspectorPanel/StatusBar, and the `preset` field on `Composition`.

## Out of scope (v0.2)

- Real LLM or backend — all output is scripted in `sandbox/flowVariants.ts`.
- Keyboard shortcuts.
- Mobile responsiveness.
- URL-encoded composition state.
- Tests.
- `Policy` and most of `Tools` are deliberate placeholders.
