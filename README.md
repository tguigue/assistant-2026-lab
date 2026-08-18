# Assistant 2026 — Lab

Live composition tool for designing the Doctrine Assistant chatbot.
**30 primitives** — each with its own design variants, extra axes and content
toggles, all driven from a settings panel laid out as a *map of the page*. Flip
a knob, see the canvas re-render instantly.

The set covers the whole agent surface, not just the chat turn: what the agent
remembers, what it may do unattended, what actually entered its context, work
that outlives the turn, and things that arrive when nobody asked.

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
  *queued / running / done* is one axis, never three toggles.

Inside a multi-select `content`, two escape hatches move an item out of the
`props` bucket:

- **`stateIds`** — genuine runtime state the component owns (A1's `running`).
- **`previewIds`** — lab-only preview affordances (pin a menu open), rendered
  under `state` with an `@lab` sub-label. Not real product behaviour.

The panel groups every knob the way a React component API reads: **`props`**
(what the caller configures) first, then **`state`** (what the component owns
at runtime), each field tagged with its own API token (`variant`, `source`,
`status`, `@lab`…). A row opens only if it has real knobs.

Each primitive also carries a `blurb` — its spec and the reasoning behind it —
which is **never rendered**. The panel shows the design; it doesn't narrate it. The
blurbs exist for whoever reads [`primitiveDefs.ts`](src/dashboard/primitiveDefs.ts),
and for several primitives they're the only record of why a decision went the way
it did, so keep them current when you change a primitive.

### Where a primitive is listed

Two more fields, both **omitted meaning "everywhere"**:

| Field | Values | Effect |
|---|---|---|
| **`views`** | `'empty'` (Composer) · `'full'` (Answer) | Which *moments* the panel lists it in |
| **`surfaces`** | `'fullscreen'` · `'doc'` (Éditeur) | Which *surfaces* it's listed on |

The rule: **list a primitive in every moment where toggling it changes the canvas
for that moment's subject.** The composer bar is `views: ['empty']` even though
the bar is on screen during the Answer moment — in that moment the bar is chrome,
not the subject. C8's header omits `views` because its own form changes between
moments; the C13/C14/C15/C18 dialogs omit both because they overlay everything.
A13 declares `['empty', 'full']` and genuinely appears in both.

These replaced a single `group: 'E'|'C'|'A'|'D'` field that was doing double duty
as taxonomy *and* as the moment gate. That conflation is why the `E` group was
dead (all four E-coded primitives had to declare `group: 'C'` to appear in the
composer), and why C8 and D4 each rendered in a moment where no row existed to
turn them off. **The letter in a code is now just a stable id prefix** recording
where the primitive was born — `C14` is an app dialog, not a composer control.

Two flags round it out: `chrome: true` for always-on page furniture that isn't a
design choice (only C6), and `todo: true` for a primitive specced ahead of its
renderer — the row shows a quiet `todo` badge so an empty canvas reads as
intentional rather than broken.

## Layout

The panel is a **map of the page**: rows are grouped into the regions you
actually see on the canvas, in a fixed static order — so toggling a
primitive's visibility never moves anything in the list.

```
┌──────────────────────┬──────────────────────────────────────────────────┐
│ Doctrine [◫][Inspect]│   Chatbot canvas                                 │
│ (340px panel)        │                                                  │
│ ┌──────────────────┐ │   ┌─ Conversation header (C8) ───────────────┐  │
│ │ Composer │ Answer│ │   │                                           │  │
│ └──────────────────┘ │   │   COMPOSER moment                         │  │
│                      │   │     arrivals (E7)                         │  │
│ HEADER               │   │     snapshot · files                      │  │
│  C8 Conversation hdr │   │     mode · autonomy · memory · level      │  │
│ COMPOSER BAR         │   │     context used (A13) · matters          │  │
│  C9 Matters          │   │     suggested actions / history / activity│  │
│  C7 Snapshot         │   │                                           │  │
│  C5 Imported files   │   │   ANSWER moment                           │  │
│  C6 Context          │   │     reasoning trace (A1)                  │  │
│  C2 Mode selector    │   │       └ context used (A13) folds in       │  │
│  C18 Memory          │   │     task progress (A12)                   │  │
│  C17 Autonomy        │   │     suggested action (A4)                 │  │
│  C12 Reasoning level │   │     article check (D4)                    │  │
│ TRANSPARENCY         │   │     answer body + citations (A2)          │  │
│  A13 Context used    │   │     tool output (A9)                      │  │
│ BELOW THE COMPOSER   │   │     actions bar (A7) · watcher (A10)      │  │
│  E7 Arrivals         │   │     follow-ups (A8)                       │  │
│  E3 Suggested actions│   │     docked question (A0)                  │  │
│  E4 History          │   │                                           │  │
│  E6 Activity         │   └───────────────────────────────────────────┘  │
│ MODALS               │                                                  │
│  C14 · C15 · C13     │   (Éditeur surface adds D2 Reference document    │
│ PROMOTION            │    and D3 Sources panel)                        │
│  E5 Feature promotion│                                                  │
└──────────────────────┴──────────────────────────────────────────────────┘
```

Panel chrome, all quiet by design:

- **`Doctrine`** wordmark — click to reset every primitive to its defaults.
- **Composer / Answer** — the one prominent control: which *moment* of the
  chatbot is on the canvas. The panel lists that view's primitives.
- **Surface** — `Full screen` or `Éditeur`. Same primitives, different
  container; D2/D3 are listed only in the Éditeur.
- **Inspect** — outlines every component on the canvas; hover to identify,
  click to open its settings in the panel. Off = clean preview.

## The 30 primitives

Codes are grouped below by their letter prefix, which records where each
primitive was *born* — it is an id, not a taxonomy, and it no longer decides
where the primitive is listed (see [above](#where-a-primitive-is-listed)).

### E — born in the empty state (5)
| | | |
|---|---|---|
| E3 | Suggested actions  | Tool launchers in the empty composer. `source`: curated · detected (C5 upload) · folder · **firm** (playbooks the cabinet authored) |
| E4 | History            | Recent conversations / documents / matters |
| E5 | Feature promotion  | 10 forms of advertising what the Assistant can do — banner, video, tour, placeholder, headline, tips, checklist, badges, hover previews, what's-new |
| E6 | Activity           | Matter activity feed — recent prompts/actions by the team |
| **E7** | **Arrivals**   | **Agent-initiated, unprompted** — a veille fired, an échéance nears, a document landed. Never enters the thread. `source`: veille · échéance · document |

### C — born in the composer (12)
| | | |
|---|---|---|
| C2  | Mode selector          | Switch · Segmented. Content = which modes (search / edit / analyse) |
| C5  | Imported files         | THE uploaded-set knob. `set`: contract · 2 NDAs · mixed pack (5) · volume (128) · conclusions |
| C6  | Context                | The `+` attach button and the picked-context chips. Always-on chrome |
| C7  | Snapshot               | Excerpt picked from the left document to narrow context |
| C8  | Conversation header    | Title + share + options menu. Matter scope is the variant |
| C9  | Matters                | Folder scope above the composer. Picker + recents · "no folder yet" |
| C12 | Reasoning level        | Composer-footer effort/usage dropdown. `status`: normal · near · reached |
| C13 | Reasoning level (modal)| The budget next-step surface. `role`: solo · member · admin |
| C14 | Import manager         | The "Vos documents" modal behind "Afficher tout". Reads C5's set |
| C15 | Connecteurs            | App catalogue. `connection` state on the *connected* cards: ok · expirée · périmètre partiel · sync · installée par l'admin |
| **C17** | **Autonomy**       | **What it may do unattended.** `mandate`: lecture seule · proposer · agir avec validation · agir dans le périmètre. `wall` state: aucun · conflit · cloison |
| **C18** | **Memory**         | **"Ce que l'Assistant sait"** — review, correct, forget. `scope` (moi / mon cabinet / ce dossier) is the ethical wall, as a radio. Chip · modal |

### A — born in the answer (10)
| | | |
|---|---|---|
| A0  | Ask user question | The human-in-the-loop card. `example`: document edit · clarifying choice · sources pre-check · tool choice · output preview · watcher · **memory** · **write action** |
| A1  | Reasoning         | Agentic trace before the answer. `running` state · "Suivre" bells on searches |
| A2  | Text answer       | Excerpts · source citations · document citations · **verification** (per citation: obsolète / non vérifiable — a verified one is marked with nothing) |
| A4  | Suggested action  | Handoff CTA. Card · banner · compact · inline. `slot`: top/bottom · `entitlement`: locked/owned |
| A7  | Actions bar       | Copier, exports, feedback. Optional "Créer une veille" and **"Enregistrer comme action"** |
| A8  | Follow-ups        | Suggested follow-up questions under the answer |
| A9  | Snippet answer    | When the answer IS a tool's output — document(s) · extract table · edits review · clause analysis |
| A10 | Watcher creation  | Picker · card · strip · modal · **registry**. `kind`: requête · article · **dépôt** · **statut** · **échéance** |
| **A12** | **Task progress** | **A job that outlives the turn.** `status`: queued · running · paused · needs-input · done · stopped partway, with partial results kept |
| **A13** | **Context used**  | **What actually entered the window, and what didn't.** `moment`: before (the promise, on the composer band) · after (the receipt — folded *into* the A1 trace: the exclusion count joins its header, the breakdown becomes its closing row) |

### D — born in the Éditeur (3)
| | | |
|---|---|---|
| D2 | Reference document   | "Document de référence : …" badge in the Éditeur header |
| D3 | Sources panel        | Right-side panel of reference excerpts + legal article cards |
| D4 | Legal article check  | Status cards for the articles this answer cites. Reads the **same per-citation statuses as A2** — same data, same vocabulary, same `ArticleCheck` component, so an article can't be obsolète inline and absent from the check |

## How the primitives reach each other

Two **store couplings** — the store deliberately reaches across primitives so a
designer finds the smart behaviour without digging into an axis
([`store.ts`](src/chatbot/store.ts)):

- Turning **C5** (Imported files) on flips **E3** to `source: detected` — the
  upload is what triggers the intelligence. Turning it off retracts only the
  detection the lab surfaced.
- Scoping a folder on **C8** flips **E3** to `source: folder`; detaching falls
  back to `curated`.

And six **shared-fixture loops**, which are the point of the set — each exists so
two surfaces cannot tell the user different things:

| Loop | Why it's one fixture, not two |
|---|---|
| A1 trace → **A10** watcher | The queries a watcher runs are verbatim the ones the trace shows, never a paraphrase |
| A10 → **E7** arrival | An arrival cites the watcher that produced it, so it can't reference a veille nobody created |
| A7 "Enregistrer comme action" → **E3** `firm` | Saving a conversation as a playbook is only real if the playbook then shows up |
| C5 set → **A12** counts | A job can't claim a document count the upload doesn't have — 84 of *128* |
| A0 `write` → **A12** `done` | A0 asks "may I"; A12 reports what happened, from the same `WRITE_ACTIONS` entry |
| A0 `memory` → **C18** `scope` | The three scopes are one `MEMORY_SCOPES` list — a boundary that means two things is not a boundary |
| **A13** before ↔ after | One list in two tenses, so the promise can't drift from the receipt |
| **A13** after → **A1** trace | The accounting is folded into the trace, not parked beside it — the trace already answers "what did you look at", and two adjacent blocks answering it read as a duplicate |
| **A2** verification ↔ **D4** | Same status vocabulary and the same `ArticleCheck` component on both surfaces |

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
│   └── primitiveDefs.ts       the 30 primitives × variants × axes × content
├── components/
│   ├── CompactSettings.tsx    the panel — page map, regions, props/state grouping
│   ├── Chatbot.tsx            the canvas host (docks A0)
│   ├── SurfaceScope.tsx       responsive root (container queries + useNarrow)
│   ├── ComposerBar.tsx        C2 C5 C6 C7 C9 C12 C17 C18 — and opens C13 / C14
│   ├── Conversation.tsx       A0 A1 A2 A4 A7 A8 A9 · D4 · hosts A12 / A13
│   ├── EmptyState.tsx         E3 E4 E6 · hosts E7
│   ├── ConversationHeader.tsx C8 — and the ⋯ entry into A10
│   ├── FeaturePromotion.tsx   E5 (all 10 forms)
│   ├── WatcherCreation.tsx    A10 (+ event triggers, registry)
│   ├── TaskProgress.tsx       A12 — the job that outlives the turn
│   ├── ContextUsed.tsx        A13 — one component, both moments
│   ├── Arrivals.tsx           E7 — ArrivalsAbove / ArrivalsBelow
│   ├── MemoryModal.tsx        C18 — MemoryChip + the register
│   ├── ImportManager.tsx      C14 · ConnectorsBrowser.tsx C15 · UpgradeModal.tsx C13
│   ├── ContextPickers.tsx     the + popover sources · ActionPicker.tsx
│   ├── Surfaces.tsx           full-screen / Éditeur containers · D2 D3, A9 in the doc
│   ├── ToolCard.tsx           the ONE shell behind A9 previews and A4 suggestions
│   ├── PrimitiveSlot.tsx      Inspect outlines + hover-to-identify
│   └── ui/index.tsx           Button, Segmented, Toggle, Select, Icon,
│                               StatusBullet, ProgressBar, Sw…
└── index.css                  Tailwind + .t-* typography + .cite-pill
```

## Out of scope

- No real LLM / backend — scripted fixtures only
- No JSON export, no copy-as-code
- No URL state persistence (reset is the wordmark, not the address bar)
- No tests
- Upload mechanics (progress, errors, limits) — C5 is the *set*, not the flow
- No focus traps, `Escape` handlers or `role="dialog"` on the overlays; they are
  all deliberately consistent with each other and out of scope here

### Known gaps

- `t-h2-semibold` is used in three modal headers but is **undefined** in
  `index.css`, so those headings render at inherited size. C15's was fixed to
  `t-title-4`; `ImportManager`, `ActionPicker` and `ContextPickers` still have it.
- Click-to-inspect on the canvas isn't wired — `PrimitiveSlot` has no `onClick`,
  so `inspectedPrimitive` is only ever set from the panel.
- Two icons are drawn from in-set fallbacks pending real sprites: memory uses
  `sparkles`, échéance uses `alert`.
