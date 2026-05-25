import type { PrimitiveDef, PrimitiveId } from './types';

/**
 * The 32 primitives of the Doctrine Chatbot, grouped by zone.
 * Each primitive has: Options (Current + alternatives) — each option may declare its own
 * variants/states/locations. `defaultOptionId` is my "preferred" choice for the canvas;
 * `current` is the real-product replica visible in the user's screenshots.
 */

const VS_DEFAULT = [{ id: 'default', name: 'Default' }];
const STATE_BASIC = [
  { id: 'default', name: 'Default' },
  { id: 'hover',   name: 'Hover' },
];
const STATE_FORM = [
  { id: 'empty',    name: 'Empty' },
  { id: 'focused',  name: 'Focused' },
  { id: 'filled',   name: 'Filled' },
  { id: 'disabled', name: 'Disabled' },
];
const STATE_MSG = [
  { id: 'thinking', name: 'Thinking' },
  { id: 'streaming', name: 'Streaming' },
  { id: 'done',     name: 'Done' },
  { id: 'error',    name: 'Error' },
];

export const PRIMITIVES: PrimitiveDef[] = [
  // ===================== A — Page chrome =====================
  {
    id: 'A1', code: 'A1', name: 'Page header', zone: 'A',
    blurb: '"Assistant" + tagline "Votre copilote juridique intelligent."',
    defaultOptionId: 'current',
    options: [
      { id: 'current', name: 'Current — centered hero', variants: [
        { id: '1a', name: '1a — bold sans + light tagline' },
        { id: '1b', name: '1b — serif title + sans tagline' },
      ] },
      { id: '2', name: 'Inline above conversation', variants: VS_DEFAULT },
      { id: '3', name: 'Hidden (no title)', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'A2', code: 'A2', name: 'Top-bar actions', zone: 'A',
    blurb: 'New conversation, history toggle, profile menu.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: 'Minimal — new chat + history toggle', variants: VS_DEFAULT, locations: [
        { id: 'top-left',  name: 'Top left' },
        { id: 'top-right', name: 'Top right' },
      ] },
      { id: '2', name: 'Full — new chat + history + profile + settings', variants: VS_DEFAULT },
    ],
  },

  // ===================== B — Empty state =====================
  {
    id: 'B1', code: 'B1', name: 'Welcome block', zone: 'B',
    blurb: '"Assistant — Votre copilote juridique intelligent. Voir les conseils"',
    defaultOptionId: 'current',
    options: [
      { id: 'current', name: 'Current — centered + "Voir les conseils" link', variants: VS_DEFAULT },
      { id: '2', name: 'Personalized — "Bonjour Maître, sur quoi travaillons-nous ?"', variants: VS_DEFAULT },
      { id: '3', name: 'Minimalist — title only, no tagline', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'B2', code: 'B2', name: 'Suggested prompts', zone: 'B',
    blurb: 'Starter prompt cards visible in empty state.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: '4 example prompts as cards (legal-themed)', variants: [
        { id: '1a', name: '1a — grid 2×2' },
        { id: '1b', name: '1b — vertical list' },
      ] },
      { id: '2', name: '3 buttons inline above input', variants: VS_DEFAULT },
    ],
  },

  // ===================== C — Input composer =====================
  {
    id: 'C1', code: 'C1', name: 'Input field', zone: 'C',
    blurb: 'Placeholder + multiline + @ mention.',
    defaultOptionId: 'current',
    options: [
      { id: 'current', name: 'Current — "Poser une question à l\'IA, tapez @…"', variants: [
        { id: '1a', name: '1a — single line' },
        { id: '1b', name: '1b — multiline (2 rows)' },
      ], states: STATE_FORM },
      { id: '2', name: 'Compact — short placeholder, slash hint', variants: VS_DEFAULT },
      { id: '3', name: 'Verbose — multi-row with explicit example', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'C2', code: 'C2', name: '"+" action button', zone: 'C',
    blurb: 'Adds attachments, slash commands, or extra actions.',
    defaultOptionId: 'current',
    options: [
      { id: 'current', name: 'Current — opens Sources dropdown directly', variants: VS_DEFAULT, states: STATE_BASIC },
      { id: '2', name: 'Menu — Sources / Slash / Voice / Attach', variants: VS_DEFAULT },
      { id: '3', name: 'Removed', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'C3', code: 'C3', name: 'Sources button', zone: 'C',
    blurb: 'Pill button "🏛 Sources" opening the Sources dropdown.',
    defaultOptionId: 'current',
    options: [
      { id: 'current', name: 'Current — icon + "Sources" label', variants: VS_DEFAULT, states: STATE_BASIC },
      { id: '2', name: 'Icon only', variants: VS_DEFAULT },
      { id: '3', name: 'With active count badge ("Sources · 2")', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'C4', code: 'C4', name: 'Sources dropdown', zone: 'C',
    blurb: '"Sélectionner des fichiers" + "Cibler une source" sections with toggles.',
    defaultOptionId: 'current',
    options: [
      { id: 'current', name: 'Current — file picker + source toggles', variants: [
        { id: '1a', name: '1a — Sharepoint + KB toggles' },
        { id: '1b', name: '1b — Sharepoint + KB + Clausier toggles' },
      ] },
      { id: '2', name: 'Flat list — all connectors as toggles, no nesting', variants: VS_DEFAULT },
      { id: '3', name: 'Search-first — type to filter sources', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'C5', code: 'C5', name: 'Sources sub-dropdown', zone: 'C',
    blurb: '"Importer des fichiers" submenu: Vos dossiers / KB / Ordinateur / Sharepoint / Google Drive.',
    defaultOptionId: 'current',
    options: [
      { id: 'current', name: 'Current — fly-out submenu', variants: VS_DEFAULT },
      { id: '2', name: 'Tabs — connectors as tabs at the top', variants: VS_DEFAULT },
      { id: '3', name: 'Cards — each connector as a card with description', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'C6', code: 'C6', name: 'Source chips', zone: 'C',
    blurb: 'Selected sources displayed inline (e.g. "Sharepoint ×").',
    defaultOptionId: 'current',
    options: [
      { id: 'current', name: 'Current — chip with logo + "×"', variants: VS_DEFAULT },
      { id: '2', name: 'Avatar stack — overlapping logos, count', variants: VS_DEFAULT },
      { id: '3', name: 'Single line — "2 sources actives" (no individual chips)', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'C7', code: 'C7', name: 'Voice / mic button', zone: 'C',
    blurb: 'Voice input affordance in the input toolbar.',
    defaultOptionId: 'current',
    options: [
      { id: 'current', name: 'Current — outlined mic icon', variants: VS_DEFAULT, states: STATE_BASIC },
      { id: '2', name: 'Recording state — pulsing red', variants: VS_DEFAULT },
      { id: '3', name: 'Removed', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'C8', code: 'C8', name: 'Send button', zone: 'C',
    blurb: 'Submit button (↑ arrow) at the right of the input.',
    defaultOptionId: 'current',
    options: [
      { id: 'current', name: 'Current — outlined ↑ arrow', variants: VS_DEFAULT, states: [
        { id: 'idle',     name: 'Idle' },
        { id: 'active',   name: 'Active' },
        { id: 'sending',  name: 'Sending' },
      ] },
      { id: '2', name: 'Filled black arrow', variants: VS_DEFAULT },
      { id: '3', name: '"Envoyer" labeled button', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'C9', code: 'C9', name: 'Disclaimer', zone: 'C',
    blurb: '"L\'assistant peut faire des erreurs. Vérifiez les informations importantes."',
    defaultOptionId: 'current',
    options: [
      { id: 'current', name: 'Current — small gray text below input', variants: VS_DEFAULT },
      { id: '2', name: 'Compact — "ℹ︎ Peut faire des erreurs"', variants: VS_DEFAULT },
      { id: '3', name: 'Removed', variants: VS_DEFAULT },
    ],
  },

  // ===================== D — Conversation messages =====================
  {
    id: 'D1', code: 'D1', name: 'User message bubble', zone: 'D',
    blurb: 'Right-aligned dark bubble showing the user\'s prompt.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — implicit (no specific styling shown)', variants: VS_DEFAULT },
      { id: '1', name: 'Dark filled bubble, rounded', variants: VS_DEFAULT },
      { id: '2', name: 'Outlined bubble, no fill', variants: VS_DEFAULT },
      { id: '3', name: 'Plain right-aligned text, no bubble', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'D2', code: 'D2', name: 'Attachment in user message', zone: 'D',
    blurb: 'How an attached document appears above the user\'s prompt.',
    defaultOptionId: '2',
    options: [
      { id: 'current', name: 'Current — small file chip with name', variants: VS_DEFAULT },
      { id: '1', name: 'File chip with name + size', variants: VS_DEFAULT },
      { id: '2', name: 'Preview card with icon + name + size', variants: VS_DEFAULT },
      { id: '3', name: 'Drag-drop zone (during upload)', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'D3', code: 'D3', name: '@mention chip', zone: 'D',
    blurb: 'Inline reference to a document or matter (e.g. "@Contrat_001").',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: 'Mono pill — "@Contrat_001"', variants: VS_DEFAULT },
      { id: '2', name: 'Avatar + name', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'D4', code: 'D4', name: 'Assistant message body', zone: 'D',
    blurb: 'The actual assistant response text.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — implicit', variants: VS_DEFAULT },
      { id: '1', name: 'Legal serif (Tiempos), no bubble', variants: VS_DEFAULT, states: STATE_MSG },
      { id: '2', name: 'Sans serif, slight gray background', variants: VS_DEFAULT },
      { id: '3', name: 'Bubble (mirrors user)', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'D5', code: 'D5', name: 'Plan preamble', zone: 'D',
    blurb: 'Announces what the Assistant is about to do (e.g. "Je vais chercher dans Doctrine + KB…").',
    defaultOptionId: '2',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: 'Single-line italic with sparkle', variants: VS_DEFAULT },
      { id: '2', name: 'Gray inline box with sparkle icon', variants: VS_DEFAULT },
      { id: '3', name: 'Streaming thought trace (lines appear)', variants: VS_DEFAULT },
      { id: '4', name: 'Collapsed summary ("Searching · 3 sources")', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'D6', code: 'D6', name: 'Inline citation', zone: 'D',
    blurb: 'Citation pill embedded in the answer body (e.g. "Cass. soc. · 10 nov. 2009").',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — none / plain text', variants: VS_DEFAULT },
      { id: '1', name: 'Filled pill — gray for Doctrine, black for internal', variants: VS_DEFAULT },
      { id: '2', name: 'Numbered footnotes [1] [2]', variants: VS_DEFAULT },
      { id: '3', name: 'Bracketed mono — [Cass. soc.]', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'D7', code: 'D7', name: 'Grouped citations panel', zone: 'D',
    blurb: 'Sources panel below the answer.',
    defaultOptionId: '2',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: 'Inline list grouped by source type', variants: VS_DEFAULT },
      { id: '2', name: 'Collapsible accordion (one per source group)', variants: VS_DEFAULT },
      { id: '3', name: 'Expanded cards (one card per citation)', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'D8', code: 'D8', name: 'Streaming cursor / typing indicator', zone: 'D',
    blurb: 'What the user sees during generation.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — implicit', variants: VS_DEFAULT },
      { id: '1', name: '3-dot bounce → blinking bar cursor', variants: VS_DEFAULT },
      { id: '2', name: 'Labeled — "Doctrine réfléchit…"', variants: VS_DEFAULT },
      { id: '3', name: 'Shimmer bar', variants: VS_DEFAULT },
      { id: '4', name: 'Removed (instant render)', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'D9', code: 'D9', name: 'Loading skeleton', zone: 'D',
    blurb: 'Shown before content arrives.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: 'Text-line skeleton', variants: VS_DEFAULT },
      { id: '2', name: 'Card skeleton', variants: VS_DEFAULT },
      { id: '3', name: 'Inline pulse only', variants: VS_DEFAULT },
    ],
  },

  // ===================== E — Modes & intent =====================
  {
    id: 'E1', code: 'E1', name: 'Intent chip (auto-detected)', zone: 'E',
    blurb: 'Detected intent shown above the input ("Recherche", "Rédaction"…).',
    defaultOptionId: 'current',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: 'Confident chip with "changer" link', variants: VS_DEFAULT, states: [
        { id: 'detecting',      name: 'Detecting' },
        { id: 'confident',      name: 'Confident' },
        { id: 'low-confidence', name: 'Low confidence' },
      ] },
      { id: '2', name: 'Small icon-only badge', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'E2', code: 'E2', name: 'Manual mode toggle', zone: 'E',
    blurb: 'Pill switching between Research / Draft / Extract.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: 'Pill segment above input', variants: VS_DEFAULT, locations: [
        { id: 'above-input', name: 'Above input' },
        { id: 'top-right',   name: 'Top right' },
      ] },
      { id: '2', name: 'Slash command — /research, /draft, /extract', variants: VS_DEFAULT },
    ],
  },

  // ===================== F — Matter integration =====================
  {
    id: 'F1', code: 'F1', name: 'Matter banner', zone: 'F',
    blurb: 'Header band when a Matter is active.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: 'Subtle band above conversation', variants: VS_DEFAULT },
      { id: '2', name: 'Dark prominent band with matter avatar', variants: VS_DEFAULT },
      { id: '3', name: 'Pill near input (compact)', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'F2', code: 'F2', name: 'Matter picker', zone: 'F',
    blurb: 'Selector to switch the active matter.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: 'Searchable dropdown', variants: VS_DEFAULT },
      { id: '2', name: 'Modal with matter cards + urgency badges', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'F3', code: 'F3', name: '@matter mention', zone: 'F',
    blurb: 'Typing "@" surfaces a matter list inline.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: 'Inline autocomplete on @', variants: VS_DEFAULT },
      { id: '2', name: 'Slash command — /matter Leroy', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'F4', code: 'F4', name: 'Matter workspace shell', zone: 'F',
    blurb: 'Optional left sidebar listing matter documents.',
    defaultOptionId: 'current',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: 'Collapsible 220px sidebar with documents', variants: VS_DEFAULT },
      { id: '2', name: 'Drawer (opens on demand from button)', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'F5', code: 'F5', name: 'Attach-to-matter (per-message)', zone: 'F',
    blurb: 'Pill action below assistant message to attach output to a matter.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: 'Small "Attacher à une affaire" pill', variants: VS_DEFAULT },
      { id: '2', name: 'Auto-attached confirmation', variants: VS_DEFAULT },
    ],
  },

  // ===================== G — Handoffs =====================
  {
    id: 'G1', code: 'G1', name: 'Artifact panel (Draft preview)', zone: 'G',
    blurb: 'How the Draft / Extract artifact is presented when generated.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: 'Side-pane split (50/50)', variants: VS_DEFAULT },
      { id: '2', name: 'Inline card in conversation', variants: VS_DEFAULT },
      { id: '3', name: 'Modal overlay', variants: VS_DEFAULT },
      { id: '4', name: 'CTA only (no preview)', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'G2', code: 'G2', name: 'CTA to open Draft', zone: 'G',
    blurb: '"Ouvrir dans Draft →" handoff button.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: 'Inline card with arrow CTA', variants: VS_DEFAULT },
      { id: '2', name: 'Plain text link', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'G3', code: 'G3', name: 'CTA to open Extract', zone: 'G',
    blurb: '"Ouvrir dans Extract →" handoff button.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: 'Inline card with arrow CTA', variants: VS_DEFAULT },
      { id: '2', name: 'Plain text link', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'G4', code: 'G4', name: 'CTA to open Counsel', zone: 'G',
    blurb: '"Ouvrir dans Counsel →" handoff button.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: 'Inline card with arrow CTA', variants: VS_DEFAULT },
    ],
  },

  // ===================== H — Continuation =====================
  {
    id: 'H1', code: 'H1', name: 'Suggested follow-ups', zone: 'H',
    blurb: 'Quick-reply chips below the assistant response.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: '3 chips below answer', variants: VS_DEFAULT },
      { id: '2', name: 'Numbered list', variants: VS_DEFAULT },
      { id: '3', name: 'Buttons inside a grouped card', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'H2', code: 'H2', name: 'Message actions', zone: 'H',
    blurb: 'Copy / regenerate / feedback buttons on hover.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: 'Icon row on hover', variants: VS_DEFAULT },
      { id: '2', name: 'Persistent always-visible icons', variants: VS_DEFAULT },
    ],
  },

  // ===================== I — Errors =====================
  {
    id: 'I1', code: 'I1', name: 'Error inline', zone: 'I',
    blurb: 'Error displayed inside a message bubble or below it.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: 'Amber inline banner', variants: VS_DEFAULT },
      { id: '2', name: 'Top-of-chat strip', variants: VS_DEFAULT },
      { id: '3', name: 'Modal overlay', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'I2', code: 'I2', name: 'Retry button', zone: 'I',
    blurb: 'Affordance to retry a failed request.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: '"Réessayer" button', variants: VS_DEFAULT },
      { id: '2', name: 'Text link', variants: VS_DEFAULT },
      { id: '3', name: 'Auto-retry with countdown', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'I3', code: 'I3', name: 'Fatal oops screen', zone: 'I',
    blurb: 'Full-screen error when the chatbot completely fails.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: 'Simple centered message + retry', variants: VS_DEFAULT },
      { id: '2', name: 'Illustrated with debug info', variants: VS_DEFAULT },
    ],
  },

  // ===================== J — Conversation management =====================
  {
    id: 'J1', code: 'J1', name: 'History sidebar', zone: 'J',
    blurb: 'List of past conversations.',
    defaultOptionId: 'current',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: 'Collapsible left rail with titles', variants: VS_DEFAULT },
      { id: '2', name: 'Drawer that overlays the canvas', variants: VS_DEFAULT },
    ],
  },
  {
    id: 'J2', code: 'J2', name: 'New conversation button', zone: 'J',
    blurb: 'Start a fresh conversation.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Current — none', variants: VS_DEFAULT },
      { id: '1', name: '"+" in top-bar', variants: VS_DEFAULT },
      { id: '2', name: 'Sidebar header button "Nouvelle conversation"', variants: VS_DEFAULT },
    ],
  },
];

export const PRIMITIVES_BY_ID: Record<PrimitiveId, PrimitiveDef> = Object.fromEntries(
  PRIMITIVES.map((p) => [p.id, p]),
) as Record<PrimitiveId, PrimitiveDef>;

export const ALL_PRIMITIVE_IDS: PrimitiveId[] = PRIMITIVES.map((p) => p.id);
