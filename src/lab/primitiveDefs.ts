import type { PrimitiveId, ScenarioId } from './types';

export type Slot =
  | 'above-input'
  | 'inline-in-answer'
  | 'below-answer'
  | 'above-answer'
  | 'wraps-everything'
  | 'right-of-chat'
  | 'in-user-message'
  | 'end-of-stream'
  | 'pre-stream'
  | 'top-of-chat'
  | 'next-to-message'
  | 'replaces-canvas';

export type PrimitiveDef = {
  id: PrimitiveId;
  code: string; // 'P1', 'C3', etc.
  name: string;
  group: 'doctrine' | 'chat';
  slot: Slot;
  blurb: string;
  variants: Array<{ value: string; label: string }>;
  defaultVariant: string;
  defaultRole: 'dominant' | 'secondary' | 'absent';
};

export const PRIMITIVE_DEFS: Record<PrimitiveId, PrimitiveDef> = {
  /* ---------- Doctrine primitives ---------- */
  intent: {
    id: 'intent',
    code: 'P1',
    name: 'Intent chip',
    group: 'doctrine',
    slot: 'above-input',
    blurb: 'Détection automatique d’intention au-dessus du champ de saisie.',
    variants: [
      { value: 'detecting',      label: 'detecting' },
      { value: 'confident',      label: 'confident' },
      { value: 'low-confidence', label: 'low-confidence' },
      { value: 'manual',         label: 'manual-override' },
    ],
    defaultVariant: 'confident',
    defaultRole: 'dominant',
  },
  sources: {
    id: 'sources',
    code: 'P2',
    name: 'Source row',
    group: 'doctrine',
    slot: 'above-input',
    blurb: 'Chips toggleables pour le périmètre des sources.',
    variants: [
      { value: 'all-active', label: 'all-chips-active' },
      { value: 'selective',  label: 'selective' },
      { value: 'add-mode',   label: 'add-mode' },
      { value: 'collapsed',  label: 'collapsed' },
    ],
    defaultVariant: 'all-active',
    defaultRole: 'dominant',
  },
  provenance: {
    id: 'provenance',
    code: 'P3',
    name: 'Provenance',
    group: 'doctrine',
    slot: 'inline-in-answer',
    blurb: 'Citations groupées par source — pilule claire (externe) ou noire (interne).',
    variants: [
      { value: 'inline-pills',       label: 'inline-pills' },
      { value: 'numbered-footnotes', label: 'numbered-footnotes' },
      { value: 'grouped-below',      label: 'grouped-list-below' },
      { value: 'expanded-cards',     label: 'expanded-cards' },
    ],
    defaultVariant: 'inline-pills',
    defaultRole: 'dominant',
  },
  artifact: {
    id: 'artifact',
    code: 'P4',
    name: 'Artifact panel',
    group: 'doctrine',
    slot: 'right-of-chat',
    blurb: 'Surface secondaire pour Draft / Extract.',
    variants: [
      { value: 'side-pane',     label: 'side-pane' },
      { value: 'inline-card',   label: 'inline-card' },
      { value: 'modal-overlay', label: 'modal-overlay' },
      { value: 'link-out',      label: 'link-out (CTA only)' },
    ],
    defaultVariant: 'side-pane',
    defaultRole: 'dominant',
  },
  matter: {
    id: 'matter',
    code: 'P5',
    name: 'Matter scope',
    group: 'doctrine',
    slot: 'wraps-everything',
    blurb: 'Contexte de l’affaire active. Peut envelopper le canvas (workspace) ou simple bandeau.',
    variants: [
      { value: 'header-banner',    label: 'header-banner' },
      { value: 'pill-near-input',  label: 'pill-near-input' },
      { value: 'workspace-shell',  label: 'workspace-shell' },
      { value: 'per-message-tag',  label: 'per-message-tag' },
    ],
    defaultVariant: 'header-banner',
    defaultRole: 'dominant',
  },
  preamble: {
    id: 'preamble',
    code: 'P6',
    name: 'Plan preamble',
    group: 'doctrine',
    slot: 'above-answer',
    blurb: 'Phrase qui annonce ce que l’Assistant s’apprête à faire.',
    variants: [
      { value: 'inline-box',         label: 'inline-box' },
      { value: 'single-line',        label: 'single-line' },
      { value: 'streaming-thought',  label: 'streaming-thought' },
      { value: 'collapsed-summary',  label: 'collapsed-summary' },
    ],
    defaultVariant: 'inline-box',
    defaultRole: 'dominant',
  },

  /* ---------- Chat-UI primitives ---------- */
  typing: {
    id: 'typing',
    code: 'C1',
    name: 'Typing indicator',
    group: 'chat',
    slot: 'pre-stream',
    blurb: 'Ce que voit l’utilisateur pendant que l’Assistant prépare sa réponse.',
    variants: [
      { value: 'three-dot',  label: 'three-dot-bounce' },
      { value: 'labeled',    label: 'labeled' },
      { value: 'shimmer',    label: 'shimmer-bar' },
      { value: 'pulse-dot',  label: 'pulse-dot' },
    ],
    defaultVariant: 'three-dot',
    defaultRole: 'dominant',
  },
  streamCursor: {
    id: 'streamCursor',
    code: 'C2',
    name: 'Streaming cursor',
    group: 'chat',
    slot: 'end-of-stream',
    blurb: 'Curseur affiché en fin de texte pendant le streaming.',
    variants: [
      { value: 'bar',         label: 'blinking-bar (▍)' },
      { value: 'underscore',  label: 'blinking-underscore (_)' },
      { value: 'static-dot',  label: 'static-dot' },
    ],
    defaultVariant: 'bar',
    defaultRole: 'dominant',
  },
  skeleton: {
    id: 'skeleton',
    code: 'C3',
    name: 'Skeleton loader',
    group: 'chat',
    slot: 'pre-stream',
    blurb: 'Placeholder avant l’arrivée du contenu.',
    variants: [
      { value: 'text-lines',    label: 'text-lines' },
      { value: 'card',          label: 'card-skeleton' },
      { value: 'inline-pulse',  label: 'inline-pulse' },
    ],
    defaultVariant: 'text-lines',
    defaultRole: 'dominant',
  },
  attachment: {
    id: 'attachment',
    code: 'C4',
    name: 'Attachments',
    group: 'chat',
    slot: 'in-user-message',
    blurb: 'Document attaché à la requête de l’utilisateur.',
    variants: [
      { value: 'file-chip',      label: 'file-chip' },
      { value: 'preview-card',   label: 'preview-card' },
      { value: 'drag-drop',      label: 'drag-drop-zone' },
      { value: 'inline-mention', label: 'inline-mention (@file)' },
    ],
    defaultVariant: 'preview-card',
    defaultRole: 'dominant',
  },
  followups: {
    id: 'followups',
    code: 'C5',
    name: 'Suggested follow-ups',
    group: 'chat',
    slot: 'below-answer',
    blurb: 'Affordances pour relancer la conversation.',
    variants: [
      { value: 'chips-below',   label: 'chips-below-answer' },
      { value: 'list-above',    label: 'list-above-input' },
      { value: 'prompt-buttons', label: 'inline-prompt-buttons' },
    ],
    defaultVariant: 'chips-below',
    defaultRole: 'dominant',
  },
  errorBanner: {
    id: 'errorBanner',
    code: 'C6',
    name: 'Error banner',
    group: 'chat',
    slot: 'top-of-chat',
    blurb: 'Banner d’erreur. Activé par "Inject error".',
    variants: [
      { value: 'top-strip',  label: 'top-banner (red strip)' },
      { value: 'inline',     label: 'inline-in-message' },
      { value: 'modal',      label: 'full-screen-modal' },
    ],
    defaultVariant: 'top-strip',
    defaultRole: 'dominant',
  },
  inlineRetry: {
    id: 'inlineRetry',
    code: 'C7',
    name: 'Inline retry',
    group: 'chat',
    slot: 'next-to-message',
    blurb: 'Affordance de réessai. Activée par "Inject error".',
    variants: [
      { value: 'text-link',   label: 'text-link' },
      { value: 'button',      label: 'button' },
      { value: 'auto-retry',  label: 'auto-retry-with-countdown' },
    ],
    defaultVariant: 'button',
    defaultRole: 'dominant',
  },
  oops: {
    id: 'oops',
    code: 'C8',
    name: 'Full-screen oops',
    group: 'chat',
    slot: 'replaces-canvas',
    blurb: 'Page d’erreur qui remplace tout. Activée par "Inject error" + mode fatal.',
    variants: [
      { value: 'simple',         label: 'simple-message' },
      { value: 'illustrated',    label: 'with-illustration' },
      { value: 'with-debug',     label: 'with-debug-info' },
    ],
    defaultVariant: 'simple',
    defaultRole: 'absent', // off by default — only shown when error mode escalates
  },
};

/**
 * Some primitives are only relevant in some scenarios.
 * Not used to disable them (the user can still toggle), but used by the
 * canvas composer to decide whether to render placeholder content.
 */
export const SCENARIO_RELEVANCE: Record<ScenarioId, PrimitiveId[]> = {
  'research':    ['intent', 'sources', 'provenance', 'preamble', 'typing', 'streamCursor', 'followups'],
  'drafting':    ['intent', 'sources', 'artifact', 'preamble', 'typing', 'streamCursor', 'skeleton', 'attachment'],
  'doc-legal':   ['intent', 'provenance', 'preamble', 'attachment', 'typing', 'streamCursor', 'followups'],
  'doc-summary': ['intent', 'preamble', 'attachment', 'typing', 'streamCursor', 'skeleton'],
  'internal':    ['intent', 'matter', 'provenance', 'sources', 'attachment', 'typing', 'streamCursor', 'followups'],
};
