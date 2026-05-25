# Assistant 2026 — Lab (v0.4 · Chatbot Sandbox)

Live composition tool for designing the Doctrine Assistant chatbot.
**32 primitives** across 10 zones (Page chrome, Empty state, Input composer,
Conversation, Modes & intent, Matter integration, Handoffs, Continuation,
Errors, Conversation management) — each with multiple **design Options**
selectable from a Ceros-style settings panel. Switch between 5 scenarios,
see the result render instantly.

### v0.4 settings model

Per primitive, you pick:
- **Option** — radio choice between `Current` (real Doctrine product) and design alternatives `Option 1`, `Option 2`, …
- **Variant** — fine variation within the selected option (e.g. `1a`, `1b`)
- **State** — runtime state (Empty, Focused, Filled, Thinking, Streaming, Done, Error…)
- **Location** — slot placement where applicable

> Sibling repo: [`assistant-2026-prototypes`](https://github.com/tguigue/assistant-2026-prototypes)
> — the leadership-facing comparison artifact. This repo is the *building* tool;
> that one is the *presenting* artifact.

## Run locally

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # tsc + vite build → dist/
pnpm preview      # serve the production bundle
```

## Layout

```
┌─ Top bar ───────────────────────────────────────────────────────────┐
│ D Doctrine · Chatbot Sandbox / S1               GitHub      v0.3   │
├──────────────────┬──────────────────────────────────────────────────┤
│ Control rail     │   Chatbot canvas                                 │
│ (280px)          │                                                  │
│                  │   ┌─ Matter header (if P5 dominant) ─────────┐  │
│ Scenario  [▾]    │   │ Conversation                              │  │
│ [reset] [enable] │   │   user prompt + attachment                │  │
│                  │   │   typing indicator                        │  │
│ Doctrine         │   │   skeleton                                │  │
│  P1 Intent chip  │   │   plan preamble                           │  │
│  P2 Source row   │   │   assistant answer + cite pills           │  │
│  P3 Provenance   │   │   streaming cursor                        │  │
│  P4 Artifact     │   │   provenance groups                       │  │
│  P5 Matter scope │   │   artifact (inline / side / link-out)     │  │
│  P6 Plan preamble│   │   suggested follow-ups                    │  │
│                  │   │   source row + intent chip                │  │
│ Chat UI          │   │   input field                             │  │
│  C1 Typing       │   └────────────────────────────────────────────┘ │
│  C2 Stream cursor│                                                  │
│  C3 Skeleton     │                                                  │
│  C4 Attachments  │                                                  │
│  C5 Follow-ups   │                                                  │
│  C6 Error banner │                                                  │
│  C7 Inline retry │                                                  │
│  C8 Oops         │                                                  │
│                  │                                                  │
│ Runtime          │                                                  │
│  Mock streaming  │                                                  │
│  Mock latency    │                                                  │
│  Inject error    │                                                  │
└──────────────────┴──────────────────────────────────────────────────┘
                                                            (status bar)
```

## The 14 primitives

Each: on/off · variant · role (Dom / Sec / Off).

### Doctrine (6)
| | | Variants |
|---|---|---|
| P1 | Intent chip      | detecting · confident · low-confidence · manual |
| P2 | Source row       | all-active · selective · add-mode · collapsed |
| P3 | Provenance       | inline-pills · numbered-footnotes · grouped-below · expanded-cards |
| P4 | Artifact panel   | side-pane · inline-card · modal-overlay · link-out |
| P5 | Matter scope     | header-banner · pill-near-input · workspace-shell · per-message-tag |
| P6 | Plan preamble    | inline-box · single-line · streaming-thought · collapsed-summary |

### Chat UI (8)
| | | Variants |
|---|---|---|
| C1 | Typing indicator   | three-dot · labeled · shimmer · pulse-dot |
| C2 | Streaming cursor   | bar · underscore · static-dot |
| C3 | Skeleton loader    | text-lines · card · inline-pulse |
| C4 | Attachments        | file-chip · preview-card · drag-drop · inline-mention |
| C5 | Suggested follow-ups | chips-below · list-above · prompt-buttons |
| C6 | Error banner       | top-strip · inline · modal *(needs Inject error)* |
| C7 | Inline retry       | text-link · button · auto-retry *(needs Inject error)* |
| C8 | Full-screen oops   | simple · illustrated · with-debug *(needs Inject error)* |

## The 5 scenarios

| | | What it shows |
|---|---|---|
| S1 | Legal Research (No Documents)   | Pure prompt → answer with citations |
| S2 | Drafting (With or without Doc)  | Long-form draft + artifact panel |
| S3 | Document Legal Analysis (With Documents) | Attached doc + caselaw cross-ref |
| S4 | Document Analysis (Summary)     | Attached doc + summary (no caselaw) |
| S5 | Internal Knowledge (With Documents) | Matter-scoped extraction |

## Stack

- Vite 8 · React 19 · TypeScript 6 · Zustand 5 · Tailwind 3
- Inter (rsms) + Tiempos Text (legal body fallback to Charter/Georgia)
- No router (single page), no real LLM, no export — pure iteration tool

## Architecture

```
src/
├── App.tsx                                mounts <Shell />
├── lab/                                   the data layer
│   ├── types.ts
│   ├── primitiveDefs.ts                   the 14 primitives × variants catalog
│   ├── store.ts                           Zustand: composition + scenario + runtime
│   └── scenarios.ts                       5 fixtures with prompts, answers, citations
├── components/
│   ├── Shell.tsx                          top + rail + canvas + status
│   ├── TopBar.tsx
│   ├── ControlRail.tsx                    left 280px column
│   ├── PrimitiveRow.tsx                   one row per primitive
│   ├── StatusBar.tsx
│   ├── ui/index.tsx                       Button, Segmented, Toggle, Select, etc.
│   └── canvas/
│       ├── ChatbotCanvas.tsx              the live preview
│       ├── ChatShell layout primitives    MessageBubble, InputField
│       ├── doctrinePrimitives/            P1–P6 React components
│       └── chatPrimitives/                C1–C8 React components
└── index.css                              Tailwind + .t-* typography + .cite-pill
```

## Out of scope (v0.3)

- No real LLM / backend (scripted only)
- No JSON export, no copy-as-code
- No URL state persistence
- No mobile responsiveness
- No tests
