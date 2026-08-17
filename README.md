# Assistant 2026 — Lab

Live composition tool for designing the Doctrine Assistant chatbot.
**26 primitives** across 4 groups — each with its own design variants, extra
axes and content toggles, all driven from a settings panel that is laid out as
a *map of the page*. Flip a knob, see the canvas re-render instantly.

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

## The settings model

Every primitive is one `PrimitiveDef` in [`src/dashboard/primitiveDefs.ts`](src/dashboard/primitiveDefs.ts).
Four independent knobs, deliberately kept apart:

| Knob | Control | What it means |
|---|---|---|
| **visibility** | checkbox | Is the primitive on the canvas at all. Separate axis — there is no `hidden` option inside the variant list. |
| **`variants`** | radio | The design variant — the *form* being compared. Rendered only when there are ≥2. |
| **`axes`** | radio, one block each | Extra independent design choices beyond the primary variant (e.g. A4's `slot` and `entitlement`). Each axis is keyed so the store holds one selection per axis. |
| **`content`** | radio *or* checkboxes | The *content* axis: single-select (`defaultId`) when the options are mutually exclusive, multi-select (`defaultIds`) when they compose. |

Two rules the model enforces:

- **Form vs content.** A primitive's `variants` carry the UX form; `content`
  carries what's inside it. Never conflate the two — a new example to show is
  content, a new way of showing it is a variant.
- **State vs variant.** Mutually-exclusive options are radios (an `axis`, or a
  single-select `content`). Genuine multi-select is checkboxes. A status like
  *Normal / Near limit / Limit reached* is an axis, never three toggles.

Inside a multi-select `content`, two escape hatches move an item out of the
`props` bucket:

- **`stateIds`** — genuine runtime state the component owns (A1's `running`).
- **`previewIds`** — lab-only preview affordances (pin a menu open), rendered
  under `state` with an `@lab` sub-label. Not real product behaviour.

The panel groups every knob the way a React component API reads: **`props`**
(what the caller configures) first, then **`state`** (what the component owns
at runtime), each field tagged with its own API token (`variant`, `source`,
`status`, `@lab`…).

Two flags round it out: `canHide: false` for always-on primitives (no Hide
option), `chrome: true` for always-on page furniture that isn't a design
choice at all (hidden from the panel), and `legacy: true` to sink a superseded
primitive into a quiet **Archived** tail.

## Layout

The panel is a **map of the page**: rows are grouped into the regions you
actually see on the canvas, in a fixed static order — so toggling a
primitive's visibility never moves anything in the list.

```
┌──────────────────────┬──────────────────────────────────────────────────┐
│ Doctrine  [◫] [Inspect]  │   Chatbot canvas                             │
│ (340px panel)        │                                                  │
│ ┌──────────────────┐ │   ┌─ Conversation header (C8) ───────────────┐  │
│ │ Composer │ Answer│ │   │                                           │  │
│ └──────────────────┘ │   │   COMPOSER view                           │  │
│                      │   │     matters · snapshot · files · context  │  │
│ HEADER               │   │     mode · reasoning level                │  │
│  C8 Conversation hdr │   │     suggested actions / history / activity│  │
│ COMPOSER BAR         │   │                                           │  │
│  C9 Matters          │   │   ANSWER view                             │  │
│  C7 Snapshot         │   │     reasoning trace (A1)                  │  │
│  C5 Imported files   │   │     suggested action (A4)                 │  │
│  C6 Context          │   │     answer body + citations (A2)          │  │
│  C2 Mode selector    │   │     tool output (A9)                      │  │
│  C12 Reasoning level │   │     actions bar (A7) · watcher (A10)      │  │
│ BELOW THE COMPOSER   │   │     follow-ups (A8)                       │  │
│  E3 Suggested actions│   │     docked question (A0)                  │  │
│  E4 History          │   │                                           │  │
│  E6 Activity         │   └───────────────────────────────────────────┘  │
│ MODALS               │                                                  │
│  C14 Import manager  │                                                  │
│  C15 Connecteurs     │                                                  │
│  C13 Reasoning modal │                                                  │
│ PROMOTION            │                                                  │
│  E5 Feature promotion│                                                  │
└──────────────────────┴──────────────────────────────────────────────────┘
```

Panel chrome, all quiet by design:

- **`Doctrine`** wordmark — click to reset every primitive to its defaults.
- **Composer / Answer** — the one prominent control: which *moment* of the
  chatbot is on the canvas. The panel lists that view's primitives.
- **Surface** — `Full screen` or `Éditeur`. Same primitives, different
  container; the `D` group appears only in the Éditeur.
- **Inspect** — outlines every component on the canvas; hover to identify,
  click to open its settings in the panel. Off = clean preview.

## The 26 primitives

### E — Empty state (4)
| | | |
|---|---|---|
| E3 | Suggested actions  | Tool launchers in the empty composer. `source`: curated · detected (from the C5 upload) · folder |
| E4 | History            | Recent conversations / documents / matters |
| E5 | Feature promotion  | 10 forms of advertising what the Assistant can do — banner, video, tour, placeholder, headline, tips, checklist, badges, hover previews, what's-new |
| E6 | Activity           | Matter activity feed — recent prompts/actions by the team |

### C — Composer (10)
| | | |
|---|---|---|
| C2  | Mode selector          | Switch · Segmented. Content = which modes (search / edit / analyse) |
| C5  | Imported files         | THE uploaded-set knob. `set`: contract · 2 NDAs · mixed pack (5) · volume (128) · conclusions |
| C6  | Context                | The `+` attach button and the picked-context chips. Always-on chrome |
| C7  | Snapshot               | Excerpt picked from the left document to narrow context |
| C8  | Conversation header    | Title + share + options menu. Matter scope is the variant. Always visible |
| C9  | Matters                | Folder scope above the composer. Picker + recents · "no folder yet" |
| C12 | Reasoning level        | Composer-footer effort/usage dropdown. `status`: normal · near · reached |
| C13 | Reasoning level (modal)| The budget next-step surface. `role`: solo · member · admin |
| C14 | Import manager         | The "Vos documents" modal behind "Afficher tout". Reads C5's set |
| C15 | Connecteurs            | Catalogue of apps to connect — GED, mail & calendar, legal sources, tools |

### A — Answer (8)
| | | |
|---|---|---|
| A0  | Ask user question | Human-in-the-loop card docked above the composer. `example` picks which question |
| A1  | Reasoning         | Agentic trace before the answer. `running` state · "Suivre" bells on searches |
| A2  | Text answer       | The written answer. Toggle excerpts · source citations · document citations |
| A4  | Suggested action  | Handoff CTA. Card · banner · compact · inline. `slot`: top/bottom · `entitlement`: locked/owned |
| A7  | Actions bar       | Copier, exports, feedback. Optional "Créer une veille" |
| A8  | Follow-ups        | Suggested follow-up questions under the answer |
| A9  | Snippet answer    | When the answer IS a tool's output — document(s) · extract table · edits review · clause analysis |
| A10 | Watcher creation  | Watchers on keywords or entities. Picker · card · strip · modal. `kind`: requête · article de loi |

### D — Éditeur (3)
| | | |
|---|---|---|
| D2 | Reference document   | "Document de référence : …" badge in the Éditeur header |
| D3 | Sources panel        | Right-side panel of reference excerpts + legal article cards |
| D4 | Legal article check  | Inline status cards for cited articles (à jour · obsolète · modifié) |

## Discoverability couplings

Two places where the store deliberately reaches across primitives, so a
designer finds the smart behaviour without digging into an axis
([`store.ts`](src/chatbot/store.ts)):

- Turning **C5** (Imported files) on flips **E3** to `source: detected` — the
  upload is what triggers the intelligence. Turning it off retracts only the
  detection the lab surfaced.
- Scoping a folder on **C8** flips **E3** to `source: folder`; detaching falls
  back to `curated`.

## Scenarios

Eight content fixtures live in [`scenarios.ts`](src/chatbot/scenarios.ts) —
real French legal prompts, jurisprudence, structured answers:

| | | |
|---|---|---|
| S1 | Recherche juridique        | Relire des conclusions face aux écritures adverses |
| S2 | Rédaction                  | Contrat de prestation d'architecte + artifact |
| S3 | Analyse de document        | Jurisprudences confirmant un rejet de demande |
| S4 | Connaissance interne       | Obligations communes dans les contrats d'un dossier |
| S5 | Édition de document        | Compléter depuis les documents joints |
| S6 | Génération multi-documents | Bail, état des lieux, caution |
| S7 | Création de document       | Rédiger une conclusion |
| S8 | Correction de document     | Corriger une date d'audience |

The scenario **switcher is gone** — the canvas is fixed to `S1`. The field
stays on `Composition` so the fixtures remain swappable in code.

## Responsive

There is no mobile fork. The same primitives render at every width, folded to
fit, keyed off the **container** rather than the viewport
([`SurfaceScope.tsx`](src/components/SurfaceScope.tsx)) — because the Éditeur
assistant panel (~400px) and the document column (900+) sit side by side on
one screen, where a viewport breakpoint would give them the same answer when
they need opposite ones.

- `@container/surface` — container queries for anything that's a style tweak.
- `useNarrow()` — the measured width, for the few places narrow needs a
  genuinely different component. **Narrow is < 42rem (672px)**.
- Below 768px the settings panel stops being a column and becomes an overlay
  drawer, closed by default — so "just resize the window" is a real way to
  preview the phone layout.

## Stack

- Vite 8 · React 19 · TypeScript 6 · Zustand 5 · Tailwind 3 (+ container queries)
- Inter (rsms) + Tiempos Text for legal body (fallback Charter / Source Serif / Georgia)
- Typography scale ported from the Doctrine design system's `_typography.scss`
- No router (single page), no real LLM, no export — pure iteration tool

## Architecture

```
src/
├── App.tsx                    panel + canvas + the modal layers
├── main.tsx
├── chatbot/                   the data layer
│   ├── types.ts               ScenarioFixture, Citation, AnswerBlock…
│   ├── scenarios.ts           the 8 content fixtures
│   ├── store.ts               Zustand: primitive values, view mode, surface, modals
│   ├── matterFlows.ts         Flow Counsel / Litigate action lists
│   └── uploadSets.ts          the C5 uploaded-set fixtures
├── dashboard/
│   └── primitiveDefs.ts       the 26 primitives × variants × axes × content
├── components/
│   ├── CompactSettings.tsx    the panel — page map, regions, props/state grouping
│   ├── Chatbot.tsx            the canvas host (docks A0)
│   ├── SurfaceScope.tsx       responsive root (container queries + useNarrow)
│   ├── ComposerBar.tsx        C2 C5 C6 C7 C9 C12 — and opens C13 / C14
│   ├── Conversation.tsx       A0 A1 A2 A4 A7 A8 A9 · D4
│   ├── EmptyState.tsx         E3 E4 E6
│   ├── ConversationHeader.tsx C8 — and the ⋯ entry into A10
│   ├── FeaturePromotion.tsx   E5 (all 10 forms)
│   ├── WatcherCreation.tsx    A10
│   ├── ImportManager.tsx      C14 · ConnectorsBrowser.tsx C15 · UpgradeModal.tsx C13
│   ├── ContextPickers.tsx     the + popover sources · ActionPicker.tsx
│   ├── Surfaces.tsx           full-screen / Éditeur containers · D2 D3, A9 in the doc
│   ├── ToolCard.tsx           the ONE shell behind A9 previews and A4 suggestions
│   ├── PrimitiveSlot.tsx      Inspect outlines + hover-to-identify
│   └── ui/index.tsx           Button, Segmented, Toggle, Select, Icon…
└── index.css                  Tailwind + .t-* typography + .cite-pill
```

## Out of scope

- No real LLM / backend — scripted fixtures only
- No JSON export, no copy-as-code
- No URL state persistence (reset is the wordmark, not the address bar)
- No tests
- Upload mechanics (progress, errors, limits) — C5 is the *set*, not the flow
