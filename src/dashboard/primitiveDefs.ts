/**
 * Primitive definitions.
 *
 * Each primitive has:
 *   - one flat list of variants (visual + content combined where applicable)
 *   - a default variant id
 *   - a default visibility (a primitive that's `defaultVisible: false`
 *     starts unchecked in the dashboard)
 *
 * Visibility is a separate axis from variant. No `hidden` option inside the
 * variant list — the checkbox in the dashboard turns the primitive on/off.
 */

export type PrimitiveCode =
  | 'E3' | 'E4' | 'E6'
  | 'C2' | 'C5' | 'C6' | 'C7' | 'C8' | 'C9' | 'C12' | 'C13' | 'C14'
  | 'A0' | 'A1' | 'A2' | 'A4' | 'A5' | 'A7' | 'A8' | 'A9'
  | 'D2' | 'D3' | 'D4';

export type Variant = { id: string; name: string };

export type ContentDef =
  | { multiSelect?: false; toggleable?: false; defaultId: string; defaultIds?: never; variants: Variant[] }
  | { multiSelect?: false; toggleable: true;  defaultId: string; defaultIds?: never; variants: Variant[] }
  // `previewIds` lists content toggles that are LAB/preview affordances (e.g.
  // "pin the menu open"), not real product states — rendered in a separate
  // "Aperçu" subgroup so they don't read as product behaviour.
  | { multiSelect: true;  toggleable?: false; defaultIds: string[]; defaultId?: never; variants: Variant[]; previewIds?: string[] };

export type PrimitiveDef = {
  code: PrimitiveCode;
  name: string;
  blurb: string;
  group: 'E' | 'C' | 'A' | 'D';
  variants: Variant[];
  defaultVariantId: string;
  defaultVisible: boolean;
  /** When false, no "Hide" option is shown — primitive is always visible. */
  canHide?: boolean;
  /** Superseded primitives sink to a quiet "Archived" tail in the panel. */
  legacy?: boolean;
  /** Always-on chrome (not a configurable primitive) — hidden from the design panel. */
  chrome?: boolean;
  /** Optional secondary content-axis variants. */
  content?: ContentDef;
  /** Optional EXTRA visual variant axes (radio), beyond the primary `variants`.
   *  Each renders as its own "design variant" block in the sidebar. Used when a
   *  primitive has several independent design choices (e.g. A1: running
   *  indicator + reasoning-finished marker). Keyed so the store can hold one
   *  selection per axis. */
  axes?: { key: string; label: string; defaultVariantId: string; variants: Variant[] }[];
};

export const PRIMITIVES: PrimitiveDef[] = [

  // ============ Composer ============
  {
    code: 'C8', name: 'Conversation header', group: 'C',
    blurb: 'Conversation header above the composer — title + share + options menu (Renommer / Associer à un matter / Supprimer). Always visible. Matter scope is the variant.',
    defaultVariantId: 'idle',
    defaultVisible: true,
    canHide: false,
    variants: [
      { id: 'idle',         name: 'Conversation (no matter)' },
      { id: 'leroy-merlin', name: 'Scoped — Leroy c/ Merlin' },
      { id: 'moreau',       name: 'Scoped — Moreau c/ SAS Aurelia' },
      { id: 'aurelia',      name: 'Scoped — Aurelia — Politique RH' },
      { id: 'acme-corp',    name: 'Scoped — Matter ACME Corp' },
      { id: 'pernod',       name: 'Scoped — Pernod Ricard' },
    ],
  },
  {
    code: 'C2', name: 'Mode selector', group: 'C',
    blurb: 'Conversation mode inside the composer. Switch = fast Éditer on/off (default on). Segmented = the available modes as a control. The agent infers intent, so this is opt-in; the modes shown are the content states.',
    defaultVariantId: 'switch',
    defaultVisible: false,
    variants: [
      { id: 'switch',    name: 'Switch' },
      { id: 'segmented', name: 'Segmented' },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['edit'],
      variants: [
        { id: 'search',  name: 'Search' },
        { id: 'edit',    name: 'Edit' },
        { id: 'analyse', name: 'Analyze' },
      ],
    },
  },
  {
    code: 'C5', name: 'Imported files', group: 'C',
    blurb: 'THE uploaded-set knob. "set" = what the user uploaded (drives the composer cards, the Import manager list, AND the Document-actions detection — one source of truth). The bar always shows cards; overflow collapses into "Afficher tout".',
    defaultVariantId: 'cards',
    defaultVisible: false,
    variants: [
      { id: 'cards', name: 'Cards (name + format tag)' },
    ],
    axes: [
      {
        key: 'set',
        label: 'Uploaded set',
        defaultVariantId: 'pack',
        variants: [
          { id: 'contract',    name: 'Single contract' },
          { id: 'ndas',        name: '2 NDAs (same type)' },
          { id: 'pack',        name: 'Mixed pack (5)' },
          { id: 'bulk',        name: 'Volume (128)' },
          { id: 'conclusions', name: 'Conclusions' },
        ],
      },
    ],
  },
  {
    code: 'C14', name: 'Import manager', group: 'C',
    blurb: 'The "Vos documents" modal behind "Afficher tout" — manages the uploaded set: file list, count, Valider. It reads the SAME set from C5 (no own state). Opens via "Afficher tout", or toggle this primitive visible to preview it.',
    defaultVariantId: 'modal',
    defaultVisible: false,
    variants: [
      { id: 'modal', name: 'Modal' },
    ],
  },
  {
    code: 'C12', name: 'Reasoning level', group: 'C',
    blurb: 'Composer-footer effort/usage control (a dropdown). Combine features freely: Show usage % (adds the live consumption bar + reset time to the control), Full list (the model picker vs the simple Défaut/Maximum). Usage status (Normal / Near / Reached) is a radio since they\'re mutually exclusive. Usage is shown as a percentage with a reset time — no credits, tokens or price.',
    defaultVariantId: 'default',
    defaultVisible: true,
    variants: [
      { id: 'default', name: 'Dropdown' },
    ],
    axes: [
      {
        // Mutually exclusive — you can't be normal AND near AND over the limit.
        key: 'status',
        label: 'Usage status',
        defaultVariantId: 'normal',
        variants: [
          { id: 'normal',  name: 'Normal' },
          { id: 'near',    name: 'Near limit' },
          { id: 'reached', name: 'Limit reached' },
        ],
      },
    ],
    content: {
      multiSelect: true,
      defaultIds: [],
      previewIds: ['open'],
      variants: [
        { id: 'usage-meter', name: 'Show usage %' },
        { id: 'full-list',   name: 'Full model list' },
        { id: 'open',        name: 'Keep open' },
      ],
    },
  },
  {
    code: 'C13', name: 'Reasoning level (modal)', group: 'C',
    blurb: 'The next-step surface opened from the budget CTA. What it offers depends on WHO opened it (radio): a Solo lawyer self-serves a plan upgrade; a Firm member can\'t pay and requests more from their admin; an Admin / legal dept manages seat credits & billing. Usage anchors the top; the action below is role-specific. Modal status (Normal / Limit reached / Request sent) is the one-at-a-time radio. Default off; enabling it (or the C12 CTA) opens it over the canvas.',
    defaultVariantId: 'default',
    defaultVisible: false,
    variants: [
      { id: 'default', name: 'Modal' },
    ],
    axes: [
      {
        // WHO opened the modal decides what they can do — mutually exclusive.
        key: 'role',
        label: 'Who opened it',
        defaultVariantId: 'solo',
        variants: [
          { id: 'solo',   name: 'Solo lawyer (self-serve)' },
          { id: 'member', name: 'Firm member (asks admin)' },
          { id: 'admin',  name: 'Admin / legal dept (billing)' },
        ],
      },
      {
        // The modal is in exactly one status at a time — mutually exclusive.
        key: 'status',
        label: 'Modal status',
        defaultVariantId: 'normal',
        variants: [
          { id: 'normal',   name: 'Normal' },
          { id: 'blocking', name: 'Limit reached' },
          { id: 'sent',     name: 'Request sent' },
        ],
      },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['open'],
      previewIds: ['open'],
      variants: [
        { id: 'open', name: 'Keep open' },
      ],
    },
  },
  {
    code: 'C7', name: 'Snapshot', group: 'C',
    blurb: 'Excerpt selected from the left document to narrow context. Hint-banner style above the composer, with an "Améliorer" action.',
    defaultVariantId: 'banner',
    defaultVisible: false,
    variants: [
      { id: 'banner', name: 'Hint — Banner' },
    ],
  },
  {
    code: 'C6', name: 'Context', group: 'C',
    blurb: 'The "+" attach-file button (opens "Vos documents") + the chips for picked context. Always-on chrome — not a configurable/hideable primitive.',
    defaultVariantId: 'default',
    defaultVisible: true,
    canHide: false,
    chrome: true,
    variants: [
      { id: 'default', name: 'Default' },
    ],
    content: {
      multiSelect: true,
      // Nothing attached by default — context chips appear only for what the
      // user actually picks via the + popover (SharePoint included).
      defaultIds: [],
      variants: [
        // Mixed model:
        //   - Whole-source toggles (SharePoint is on/off as a source).
        //   - Specific picks (a matter, a KB, a file) that the user would cherry-pick
        //     through the + popover. Listed here as canonical demo items.
        { id: 'sharepoint',     name: 'SharePoint (source)' },
        { id: 'matter-moreau',  name: 'Matter — Moreau c/ SAS Aurelia' },
        { id: 'kb-mises',       name: 'KB — Mises en demeure' },
        { id: 'file',           name: 'File — Conclusions_def.pdf' },
      ],
    },
  },
  {
    code: 'C9', name: 'Matters', group: 'C',
    blurb: 'Folder (matter) scope above the composer. Picking one scopes the conversation (activates the Conversation Header matter scope). OPTIONAL — matterless research is a first-class flow. "picker" labels the affordance ("Choisir un dossier") + recent folders; "create" is the empty state for a user with no folders yet, nudging them to create one.',
    defaultVariantId: 'picker',
    defaultVisible: true,
    variants: [
      { id: 'picker', name: '“Choisir un dossier” + recents' },
      { id: 'create', name: 'No folder yet — “Créer un dossier”' },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['leroy-merlin', 'moreau', 'aurelia', 'acme-corp', 'pernod'],
      variants: [
        { id: 'leroy-merlin', name: 'Leroy c/ Merlin' },
        { id: 'moreau',       name: 'Moreau c/ SAS Aurelia' },
        { id: 'aurelia',      name: 'Aurelia — Politique RH' },
        { id: 'acme-corp',    name: 'Matter ACME Corp' },
        { id: 'pernod',       name: 'Pernod Ricard' },
      ],
    },
  },

  // ============ Empty State ============
  {
    code: 'E3', name: 'Suggested actions', group: 'C',
    blurb: 'Tool launchers in the empty composer — pick a tool BEFORE prompting. "source" = where the list comes from: curated (hand-picked, ends with “Toutes les actions”) or detected (derived from the C5 uploaded set — a compact summary + Flow Counsel/Litigate). Auto-activates in DETECTED mode when "Imported files" (C5) is turned on — the upload is what triggers the intelligence. Content = which curated tools show.',
    defaultVariantId: 'verbose',
    defaultVisible: true,
    variants: [
      { id: 'verbose', name: 'Cards with descriptions' },
    ],
    axes: [
      {
        key: 'source',
        label: 'Source',
        defaultVariantId: 'curated',
        variants: [
          { id: 'curated',  name: 'Curated (hand-picked)' },
          { id: 'detected', name: 'Detected (from C5 upload)' },
          { id: 'folder',   name: 'Folder (from selected dossier)' },
        ],
      },
    ],
    content: {
      multiSelect: true,
      // Defaults work from a blank slate (no document attached yet).
      defaultIds: ['nouveau-doc', 'modifier-doc', 'exemples', 'sources'],
      variants: [
        { id: 'nouveau-doc',  name: 'Nouveau document' },
        { id: 'modifier-doc', name: 'Modifier un document' },
        { id: 'exemples',     name: 'Exemples de prompt' },
        { id: 'sources',      name: 'Détecter les sources citées' },
        { id: 'extraire',     name: 'Extraire' },
        { id: 'traduire',     name: 'Traduire' },
        { id: 'analyser',     name: 'Analyser' },
        { id: 'comparer',     name: 'Comparer' },
      ],
    },
  },
  {
    code: 'E4', name: 'History', group: 'C',
    blurb: 'Quick access to recent items (conversations, documents, matters).',
    defaultVariantId: 'list',
    defaultVisible: false,
    variants: [
      { id: 'list', name: 'Compact list' },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['conversations'],
      variants: [
        { id: 'conversations', name: 'Recent conversations' },
        { id: 'documents',     name: 'Recent documents' },
        { id: 'matters',       name: 'Recent matters' },
      ],
    },
  },
  {
    code: 'E6', name: 'Activity', group: 'C',
    blurb: 'Activity feed for the matter — recent prompts/actions by the team, each with its artifact and date.',
    defaultVariantId: 'feed',
    defaultVisible: false,
    variants: [
      { id: 'feed', name: 'Feed' },
    ],
  },

  // ============ Response ============
  {
    code: 'A0', name: 'Ask user question', group: 'A',
    blurb: 'Human-in-the-loop question docked above the composer. ONE card design (generous, app-consistent: pagination, question, numbered options, Autre + Passer). The Example radio picks WHICH question is asked — document edit (Oui/Non), clarifying choice, or sources pre-check — content, not forme. Source checkboxes only affect the sources example.',
    defaultVariantId: 'card',
    defaultVisible: false,
    variants: [
      { id: 'card', name: 'Card' },
    ],
    axes: [
      {
        // One question at a time — the example is fond, mutually exclusive.
        key: 'example',
        label: 'Example',
        defaultVariantId: 'edit',
        variants: [
          { id: 'edit',    name: 'Document edit (Oui / Non)' },
          { id: 'choice',  name: 'Clarifying choice' },
          { id: 'sources', name: 'Sources pre-check' },
        ],
      },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['sharepoint', 'gdrive', 'matters', 'doctrine-kb'],
      variants: [
        { id: 'sharepoint',  name: 'SharePoint' },
        { id: 'gdrive',      name: 'Google Drive' },
        { id: 'matters',     name: 'Matters' },
        { id: 'doctrine-kb', name: 'Doctrine Knowledge Base' },
      ],
    },
  },
  {
    code: 'A1', name: 'Reasoning', group: 'A',
    blurb: 'Agentic trace shown before the answer. Header is inline: "Raisonnement · N sources · durée". A final timeline row marks the state — a pulsing bullet with "Raisonnement en cours" while thinking, a steady bullet with "Raisonnement terminé" once done. Toggle Running to preview the live phase.',
    defaultVariantId: 'default',
    defaultVisible: true,
    variants: [
      { id: 'default', name: 'Inline — sources + duration' },
    ],
    content: {
      multiSelect: true,
      // Default = finished reasoning, which collapses so the final answer is
      // visible. Toggle "Running" to preview the live, expanded phase.
      defaultIds: [],
      variants: [
        { id: 'running', name: 'Running — show "Raisonnement en cours"' },
      ],
    },
  },
  {
    code: 'A5', name: 'Edits review', group: 'A',
    blurb: "The assistant's proposed edits to a document — counter, Non traités / Traités tabs, \"Tout appliquer\" + per-change Ignorer / Appliquer. Clause Analysis variant uses the same chrome for clause-by-clause review.",
    defaultVariantId: 'full',
    defaultVisible: false,
    variants: [
      { id: 'full',            name: 'Full — inline diff with per-change actions' },
      { id: 'clause-analysis', name: 'Clause Analysis (per-clause review)' },
    ],
  },
  {
    code: 'A2', name: 'Text answer', group: 'A',
    blurb: "The chatbot's written answer. Toggle which elements appear: Excerpts (verbatim legal text quoted block-level), Source citations (public — décisions/lois/codes, blue underlined links), Document citations (private — uploaded files/matter docs, anonymised numbers).",
    defaultVariantId: 'default',
    defaultVisible: true,
    variants: [
      { id: 'default', name: 'Standard' },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['excerpt', 'sources', 'docs'],
      variants: [
        { id: 'excerpt', name: 'Excerpts' },
        { id: 'sources', name: 'Source citations' },
        { id: 'docs',    name: 'Document citations' },
      ],
    },
  },
  {
    code: 'A4', name: 'Tools suggestion', group: 'A',
    blurb: 'CTA(s) at the END of an answer to continue in a connected tool (Counsel, Extract, Clausier…). Distinct from "Tools preview", which is when the answer ITSELF is a tool output.',
    defaultVariantId: 'card',
    defaultVisible: false,
    variants: [
      { id: 'card',    name: 'Card' },
      { id: 'preview', name: 'Preview' },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['counsel'],
      variants: [
        { id: 'counsel',          name: 'Counsel' },
        { id: 'extract',          name: 'Extract' },
        { id: 'counter-argument', name: 'Counter-Argument' },
        { id: 'tableau',          name: 'Table' },
      ],
    },
  },
  {
    code: 'A9', name: 'Tools preview', group: 'A',
    blurb: 'When the answer IS a tool output — a generated/edited document rendered inline (the result of e.g. "Complète mon bail commercial…"). Independent of "Text answer" (toggle either); in the product they wouldn\'t show together. Distinct from "Tools suggestion" (end-of-answer handoff CTA).',
    defaultVariantId: 'preview',
    defaultVisible: false,
    variants: [
      { id: 'preview', name: 'Inline document preview' },
    ],
    content: {
      defaultId: 'document',
      variants: [
        { id: 'document',  name: 'Single document' },
        { id: 'documents', name: 'Multiple documents' },
        { id: 'extract',   name: 'Extract (table)' },
      ],
    },
  },
  {
    code: 'A7', name: 'Answer toolbar', group: 'A',
    blurb: 'Toolbar at the bottom of the answer — Copier, exports (Word, PDF), feedback (utile / pas utile).',
    defaultVariantId: 'labeled',
    defaultVisible: true,
    variants: [
      { id: 'labeled', name: 'Labeled (Copy + icons)' },
      { id: 'icons',   name: 'Icons only' },
    ],
  },
  {
    code: 'A8', name: 'Follow-ups', group: 'A',
    blurb: 'Suggested follow-up questions under the answer — full-width rows, subtle dividers.',
    defaultVariantId: 'rows',
    defaultVisible: true,
    variants: [
      { id: 'rows', name: 'Full-width rows' },
    ],
  },

  // ============ Éditeur (doc surface) ============
  {
    code: 'D2', name: 'Reference document', group: 'D',
    blurb: 'A "Document de référence : …" badge in the Éditeur header — the source document the draft/edit is based on. Reads scenario.referenceDoc.',
    defaultVariantId: 'badge',
    defaultVisible: false,
    variants: [
      { id: 'badge', name: 'Header badge' },
    ],
  },
  {
    code: 'D3', name: 'Sources panel', group: 'D',
    blurb: 'Right-side panel of reference-document excerpts + legal article cards (the "Sources — section" view). Opened from an edits-review change’s "Sources". Reads scenario.sourcesPanel.',
    defaultVariantId: 'panel',
    defaultVisible: false,
    variants: [
      { id: 'panel', name: 'Side panel' },
    ],
  },
  {
    code: 'D4', name: 'Legal article check', group: 'D',
    blurb: 'Inline status cards for cited articles (À jour ✓ / obsolète ⚠ / modifié). Drives the "replace outdated article" prompt. Reads scenario.sourcesPanel.articles.',
    defaultVariantId: 'cards',
    defaultVisible: false,
    variants: [
      { id: 'cards', name: 'Status cards' },
    ],
  },
];

export const PRIMITIVES_BY_CODE: Record<PrimitiveCode, PrimitiveDef> =
  Object.fromEntries(PRIMITIVES.map((p) => [p.code, p])) as Record<PrimitiveCode, PrimitiveDef>;

export const PRIMITIVE_CODES: PrimitiveCode[] = PRIMITIVES.map((p) => p.code);

export function defaultVariantFor(code: PrimitiveCode): string {
  return PRIMITIVES_BY_CODE[code].defaultVariantId;
}
export function defaultVisibleFor(code: PrimitiveCode): boolean {
  return PRIMITIVES_BY_CODE[code].defaultVisible;
}
export function defaultContentFor(code: PrimitiveCode): string | string[] | undefined {
  const c = PRIMITIVES_BY_CODE[code].content;
  if (!c) return undefined;
  if (c.multiSelect) return c.defaultIds;
  return c.defaultId;
}
export function defaultAxesFor(code: PrimitiveCode): Record<string, string> | undefined {
  const axes = PRIMITIVES_BY_CODE[code].axes;
  if (!axes || axes.length === 0) return undefined;
  const out: Record<string, string> = {};
  for (const a of axes) out[a.key] = a.defaultVariantId;
  return out;
}
