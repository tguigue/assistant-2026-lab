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
  | 'C2' | 'C5' | 'C6' | 'C7' | 'C8' | 'C9' | 'C12' | 'C13' | 'C14' | 'C15'
  | 'A0' | 'A1' | 'A2' | 'A4' | 'A7' | 'A8' | 'A9'
  | 'D2' | 'D3' | 'D4';

export type Variant = { id: string; name: string };

export type ContentDef =
  | { multiSelect?: false; toggleable?: false; defaultId: string; defaultIds?: never; variants: Variant[] }
  | { multiSelect?: false; toggleable: true;  defaultId: string; defaultIds?: never; variants: Variant[] }
  // In React terms these boolean toggles are all `props` (caller config) by
  // default. Two escape hatches move an item into the `state` group instead:
  //   - `stateIds`   — genuine RUNTIME state (e.g. "running") the component owns.
  //   - `previewIds` — LAB/preview affordances (e.g. "pin the menu open"): a
  //                    state forced for design, not real product behaviour.
  //                    Rendered under `state` with an `@lab` sub-label.
  | { multiSelect: true;  toggleable?: false; defaultIds: string[]; defaultId?: never; variants: Variant[]; previewIds?: string[]; stateIds?: string[] };

export type PrimitiveDef = {
  code: PrimitiveCode;
  /** Plain-language label — the name designers & PMs read on the canvas/panel. */
  name: string;
  /** The design-system (Astryx / Meta) component this maps to, in React
   *  PascalCase (e.g. `FileInput`). Code-level metadata only — NOT rendered in
   *  the UI (the panel shows the plain `name`). Kept as documentation of the
   *  DS mapping; several primitives can share one component (e.g. `ChatToolCalls`). */
  component?: string;
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
  axes?: {
    key: string;
    label: string;
    /** `prop` (default) = caller config → grouped under `props`.
     *  `state` = genuine runtime state (e.g. usage/modal status) → under `state`. */
    kind?: 'prop' | 'state';
    defaultVariantId: string;
    variants: Variant[];
  }[];
};

export const PRIMITIVES: PrimitiveDef[] = [

  // ============ Composer ============
  {
    code: 'C8', name: 'Conversation header', component: 'ChatLayout', group: 'C',
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
    code: 'C2', name: 'Mode selector', component: 'SegmentedControl', group: 'C',
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
    code: 'C5', name: 'Imported files', component: 'FileInput', group: 'C',
    blurb: 'THE uploaded-set knob. "set" = what the user uploaded (drives the composer cards, the Import manager list, AND the Document-actions detection — one source of truth). The bar always shows cards; overflow collapses into "Afficher tout".',
    defaultVariantId: 'cards',
    defaultVisible: false,
    variants: [
      { id: 'cards', name: 'Cards (name + format tag)' },
    ],
    axes: [
      {
        key: 'set',
        label: 'files',
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
    code: 'C14', name: 'Import manager', component: 'Dialog', group: 'C',
    blurb: 'The "Vos documents" modal behind "Afficher tout" — manages the uploaded set: file list, count, Valider. It reads the SAME set from C5 (no own state). Opens via "Afficher tout", or toggle this primitive visible to preview it.',
    defaultVariantId: 'modal',
    defaultVisible: false,
    variants: [
      { id: 'modal', name: 'Modal' },
    ],
  },
  {
    code: 'C15', name: 'Composer tool hint', component: 'ChatToolCalls', group: 'C',
    blurb: 'A single, quiet tool suggestion under the composer that surfaces WHILE the user is typing — as the draft reveals intent ("comparer ces deux contrats" → Flow Counsel). Reuses the ONE ToolSuggestion shell (banner / compact / inline forms — same as A4). Dismissible; never blocks send. Distinct from E3 (pre-prompt launcher grid) and A4 (post-answer handoff): this is the mid-composition nudge. Content = which tool is hinted.',
    defaultVariantId: 'banner',
    defaultVisible: false,
    variants: [
      { id: 'banner',  name: 'Banner — slim neutral strip' },
      { id: 'compact', name: 'Compact — one dense row' },
      { id: 'inline',  name: 'Inline — sentence + link' },
    ],
    content: {
      defaultId: 'negocier',
      variants: [
        { id: 'negocier',         name: 'Négocier (Flow Counsel)' },
        { id: 'counter-argument', name: 'Counter-Argument (Flow Litigate)' },
        { id: 'tableau',          name: 'Tableau' },
        { id: 'sources',          name: 'Knowledge base' },
      ],
    },
  },
  {
    code: 'C12', name: 'Reasoning level', component: 'DropdownMenu', group: 'C',
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
        label: 'status',
        kind: 'state',
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
      defaultIds: ['full-list'],
      previewIds: ['open'],
      variants: [
        { id: 'usage-meter', name: 'Show usage %' },
        { id: 'full-list',   name: 'Full model list' },
        { id: 'open',        name: 'Keep open' },
      ],
    },
  },
  {
    code: 'C13', name: 'Reasoning level (modal)', component: 'Dialog', group: 'C',
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
        label: 'role',
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
        label: 'status',
        kind: 'state',
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
    code: 'C7', name: 'Snapshot', component: 'Banner', group: 'C',
    blurb: 'Excerpt selected from the left document to narrow context. Hint-banner style above the composer, with an "Améliorer" action.',
    defaultVariantId: 'banner',
    defaultVisible: false,
    variants: [
      { id: 'banner', name: 'Hint — Banner' },
    ],
  },
  {
    code: 'C6', name: 'Context', component: 'Tokenizer', group: 'C',
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
    code: 'C9', name: 'Matters', component: 'Selector', group: 'C',
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
    code: 'E3', name: 'Suggested actions', component: 'ChatToolCalls', group: 'C',
    blurb: 'Tool launchers in the empty composer — pick a tool BEFORE prompting. "source" = where the list comes from: curated (hand-picked, ends with “Toutes les actions”) or detected (derived from the C5 uploaded set — a compact summary + Flow Counsel/Litigate). Auto-activates in DETECTED mode when "Imported files" (C5) is turned on — the upload is what triggers the intelligence. Content = which curated tools show.',
    defaultVariantId: 'verbose',
    defaultVisible: true,
    variants: [
      { id: 'verbose', name: 'Cards with descriptions' },
    ],
    axes: [
      {
        key: 'source',
        label: 'source',
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
    code: 'E4', name: 'History', component: 'List', group: 'C',
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
    code: 'E6', name: 'Activity', component: 'List', group: 'C',
    blurb: 'Activity feed for the matter — recent prompts/actions by the team, each with its artifact and date.',
    defaultVariantId: 'feed',
    defaultVisible: false,
    variants: [
      { id: 'feed', name: 'Feed' },
    ],
  },

  // ============ Response ============
  {
    code: 'A0', name: 'Ask user question', component: 'ChatSystemMessage', group: 'A',
    blurb: 'Human-in-the-loop question docked above the composer. ONE card design (generous, app-consistent: pagination, question, numbered options, Autre + Passer). The Example radio picks WHICH question is asked — content, not forme: document edit (Oui/Non), clarifying choice, sources pre-check, tool choice (the options ARE tools — the agent asks which approach to take instead of guessing or silently upselling), or output preview (a snippet of what a tool WOULD produce, confirmed before opening). Source checkboxes only affect the sources example.',
    defaultVariantId: 'card',
    defaultVisible: false,
    variants: [
      { id: 'card', name: 'Card' },
    ],
    axes: [
      {
        // One question at a time — the example is fond, mutually exclusive.
        key: 'example',
        label: 'example',
        defaultVariantId: 'edit',
        variants: [
          { id: 'edit',       name: 'Document edit (Oui / Non)' },
          { id: 'choice',     name: 'Clarifying choice' },
          { id: 'sources',    name: 'Sources pre-check' },
          { id: 'toolchoice', name: 'Tool choice (options are tools)' },
          { id: 'snippet',    name: 'Output preview (confirm before opening)' },
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
    code: 'A1', name: 'Reasoning', component: 'ChatToolCalls', group: 'A',
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
      // "running" is genuine runtime state (thinking → done), not caller config.
      stateIds: ['running'],
      variants: [
        { id: 'running', name: 'Running — show "Raisonnement en cours"' },
      ],
    },
  },
  {
    code: 'A2', name: 'Text answer', component: 'ChatMessage', group: 'A',
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
    code: 'A4', name: 'Suggested action', component: 'ChatToolCalls', group: 'A',
    blurb: 'A handoff CTA — "continue in this tool". `variant` = its form: Card (icon + title + CTA) or Inline (a sentence that EXPLAINS why it is suggested, with the action as a link). `slot` = TOP (before the answer — "better tool") or BOTTOM (after — "next step"). Tier lives in the tool catalog; paid tools show an Add-on / Actif chip via the global add-ons switch. Defaults on, card form, top slot, a paid tool — the presentation leads with the add-on.',
    defaultVariantId: 'card',
    defaultVisible: true,
    variants: [
      { id: 'card',    name: 'Card — icon + title + quiet link' },
      { id: 'banner',  name: 'Banner — slim neutral strip' },
      { id: 'compact', name: 'Compact — one dense row' },
      { id: 'inline',  name: 'Inline — sentence + link (explains why)' },
    ],
    axes: [
      {
        // WHERE the suggestion sits relative to the answer — two distinct intents.
        key: 'slot',
        label: 'slot',
        kind: 'prop',
        defaultVariantId: 'top',
        variants: [
          { id: 'top',    name: 'Top — before the answer (better tool)' },
          { id: 'bottom', name: 'Bottom — after the answer (next step)' },
        ],
      },
      {
        // Paid-tool entitlement. Single-select — a plan either owns the add-on or
        // it doesn't. Drives the eyebrow label: locked → "Add-on", owned → "Actif".
        key: 'owned',
        label: 'entitlement',
        kind: 'prop',
        defaultVariantId: 'locked',
        variants: [
          { id: 'locked', name: 'Locked — Add-on (upsell)' },
          { id: 'owned',  name: 'Owned — Actif' },
        ],
      },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['counter-argument'],
      variants: [
        { id: 'negocier',         name: 'Négocier (Flow Counsel)' },
        { id: 'counsel',          name: 'Counsel' },
        { id: 'counter-argument', name: 'Counter-Argument (Flow Litigate)' },
        { id: 'extract',          name: 'Extract' },
        { id: 'tableau',          name: 'Table' },
        { id: 'sources',          name: 'Knowledge base' },
      ],
    },
  },
  {
    code: 'A9', name: 'Snippet answer', component: 'ChatToolCalls', group: 'A',
    blurb: 'When the answer IS a tool\'s output, rendered inline in the body. `kind` picks which: a generated document (one or several, Éditeur), an Extract table, or an edits review — the proposed changes to a document, reviewed change-by-change (a diff tool\'s output). Separate from "Suggested action" (the handoff CTA).',
    defaultVariantId: 'preview',
    defaultVisible: false,
    variants: [
      { id: 'preview', name: 'Inline preview' },
    ],
    content: {
      defaultId: 'document',
      variants: [
        { id: 'document',        name: 'Single document' },
        { id: 'documents',       name: 'Multiple documents' },
        { id: 'extract',         name: 'Extract (table)' },
        { id: 'edits',           name: 'Edits review (diff)' },
        { id: 'clause-analysis', name: 'Clause analysis (per-clause)' },
      ],
    },
  },
  {
    code: 'A7', name: 'Actions bar', component: 'Toolbar', group: 'A',
    blurb: 'Action row at the bottom of the answer — Copier, exports (Word, PDF), feedback (utile / pas utile).',
    defaultVariantId: 'labeled',
    defaultVisible: true,
    variants: [
      { id: 'labeled', name: 'Labeled (Copy + icons)' },
      { id: 'icons',   name: 'Icons only' },
    ],
  },
  {
    code: 'A8', name: 'Follow-ups', component: 'List', group: 'A',
    blurb: 'Suggested follow-up questions under the answer — full-width rows, subtle dividers.',
    defaultVariantId: 'rows',
    defaultVisible: true,
    variants: [
      { id: 'rows', name: 'Full-width rows' },
    ],
  },

  // ============ Éditeur (doc surface) ============
  {
    code: 'D2', name: 'Reference document', component: 'Token', group: 'D',
    blurb: 'A "Document de référence : …" badge in the Éditeur header — the source document the draft/edit is based on. Reads scenario.referenceDoc.',
    defaultVariantId: 'badge',
    defaultVisible: false,
    variants: [
      { id: 'badge', name: 'Header badge' },
    ],
  },
  {
    code: 'D3', name: 'Sources panel', component: 'Citation', group: 'D',
    blurb: 'Right-side panel of reference-document excerpts + legal article cards (the "Sources — section" view). Opened from an edits-review change’s "Sources". Reads scenario.sourcesPanel.',
    defaultVariantId: 'panel',
    defaultVisible: false,
    variants: [
      { id: 'panel', name: 'Side panel' },
    ],
  },
  {
    code: 'D4', name: 'Legal article check', component: 'StatusDot', group: 'D',
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
