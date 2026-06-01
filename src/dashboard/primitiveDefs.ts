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
  | 'E2' | 'E3' | 'E4' | 'E5'
  | 'C2' | 'C5' | 'C6' | 'C7' | 'C8'
  | 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7' | 'A8';

export type Variant = { id: string; name: string };

export type ContentDef =
  | { multiSelect?: false; toggleable?: false; defaultId: string; defaultIds?: never; variants: Variant[] }
  | { multiSelect?: false; toggleable: true;  defaultId: string; defaultIds?: never; variants: Variant[] }
  | { multiSelect: true;  toggleable?: false; defaultIds: string[]; defaultId?: never; variants: Variant[] };

export type PrimitiveDef = {
  code: PrimitiveCode;
  name: string;
  blurb: string;
  group: 'E' | 'C' | 'A';
  variants: Variant[];
  defaultVariantId: string;
  defaultVisible: boolean;
  /** When false, no "Hide" option is shown — primitive is always visible. */
  canHide?: boolean;
  /** Optional secondary content-axis variants. */
  content?: ContentDef;
};

export const PRIMITIVES: PrimitiveDef[] = [
  // ============ Empty State ============
  {
    code: 'E3', name: 'Suggested Tools', group: 'C',
    blurb: 'Quick-action buttons (Research / Draft / Extract / Counsel).',
    defaultVariantId: 'labeled',
    defaultVisible: false,
    variants: [
      { id: 'labeled',  name: 'Labeled pills' },
      { id: 'verbose',  name: 'Cards with descriptions' },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['exemples', 'extraire', 'traduire', 'analyser', 'comparer'],
      variants: [
        { id: 'exemples', name: 'Exemples de prompt' },
        { id: 'extraire', name: 'Extraire' },
        { id: 'traduire', name: 'Traduire' },
        { id: 'analyser', name: 'Analyser' },
        { id: 'comparer', name: 'Comparer' },
      ],
    },
  },
  {
    code: 'E5', name: 'Suggested Matters', group: 'C',
    blurb: 'Recent / pinned matters shown in the empty state as colored avatars. Click to scope the conversation to a matter.',
    defaultVariantId: 'avatars',
    defaultVisible: false,
    variants: [
      { id: 'avatars', name: 'Colored avatar grid' },
      { id: 'rows',    name: 'List rows with meta' },
    ],
  },
  {
    code: 'E2', name: 'Suggested Prompts', group: 'C',
    blurb: 'Example prompts shown in the empty state.',
    defaultVariantId: 'rows',
    defaultVisible: false,
    variants: [
      { id: 'rows',  name: 'Bordered list' },
      { id: 'cards', name: 'Card grid 2×2' },
    ],
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

  // ============ Composer ============
  {
    code: 'C8', name: 'Conversation Header', group: 'C',
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
    code: 'C2', name: 'Mode', group: 'C',
    blurb: 'Conversation mode — Rechercher / Rédiger / Analyser / Extraire.',
    defaultVariantId: 'pill',
    defaultVisible: false,
    variants: [
      { id: 'pill',    name: 'Pill segment above input' },
      { id: 'slash',   name: 'Slash commands (/research…)' },
      { id: 'tabs',    name: 'Top-bar tabs' },
    ],
  },
  {
    code: 'C5', name: 'Imported files', group: 'C',
    blurb: 'Preview of files attached to the current prompt.',
    defaultVariantId: 'cards',
    defaultVisible: false,
    variants: [
      { id: 'cards',   name: 'Cards (name + format tag)' },
    ],
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
    blurb: 'Active context, shown as chips inline inside the composer.',
    defaultVariantId: 'outlined',
    defaultVisible: true,
    variants: [
      { id: 'outlined',         name: 'Chip — Outlined' },
      { id: 'outlined-verbose', name: 'Chip — Outlined (with hints)' },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['sharepoint'],
      variants: [
        // Mixed model:
        //   - Whole-source toggles (SharePoint is on/off as a source).
        //   - Specific picks (a matter, a KB, a file) that the user would cherry-pick
        //     through the + popover. Listed here as canonical demo items.
        { id: 'sharepoint',     name: 'SharePoint (source)' },
        { id: 'matter-moreau',  name: 'Matter — Moreau c/ SAS Aurelia' },
        { id: 'kb-mises',       name: 'Base — Mises en demeure' },
        { id: 'clausier',       name: 'Clausier (bibliothèque de clauses)' },
        { id: 'file',           name: 'File — Conclusions_def.pdf' },
      ],
    },
  },

  // ============ Response ============
  {
    code: 'A0', name: 'Ask user question', group: 'A',
    blurb: 'Clarifying question docked above the composer before reasoning starts. Source pre-check or multiple-choice question.',
    defaultVariantId: 'sticky-sources',
    defaultVisible: false,
    variants: [
      { id: 'sticky-sources', name: 'Sticky — sources pre-check' },
      { id: 'sticky-choice',  name: 'Sticky — numbered options' },
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
    blurb: 'Agentic trace shown before the answer.',
    defaultVariantId: 'agentic',
    defaultVisible: true,
    variants: [
      { id: 'agentic', name: 'Agentic trace' },
    ],
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
    code: 'A2', name: 'Excerpt', group: 'A',
    blurb: 'A verbatim chunk of legal text (decision, statute, clause) quoted block-level inside the answer body.',
    defaultVariantId: 'inline-highlight',
    defaultVisible: true,
    variants: [
      { id: 'inline-highlight', name: 'Blue highlight' },
      { id: 'card',             name: 'Framed card' },
    ],
  },
  {
    code: 'A3', name: 'Source citation', group: 'A',
    blurb: 'Inline citation to a public source — décisions, lois, codes, BOI. Anything from the Doctrine corpus.',
    defaultVariantId: 'pill',
    defaultVisible: true,
    variants: [
      { id: 'pill',      name: 'Filled pill (gray / black)' },
      { id: 'bracketed', name: 'Bracketed mono [Cass. soc.]' },
    ],
  },
  {
    code: 'A6', name: 'Document citation', group: 'A',
    blurb: 'Inline citation to a private document — uploaded file, doc inside a matter, KB memo. Anonymized to a number so the doc name stays private.',
    defaultVariantId: 'numbered-footnote',
    defaultVisible: true,
    variants: [
      { id: 'numbered-footnote', name: 'Numbered footnotes [1] [2]' },
      { id: 'superscript',       name: 'Superscript marker' },
    ],
  },
  {
    code: 'A4', name: 'Tools', group: 'A',
    blurb: 'CTA to a connected tool, shown below the answer.',
    defaultVariantId: 'card',
    defaultVisible: false,
    variants: [
      { id: 'card',    name: 'Card' },
      { id: 'preview', name: 'Preview' },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['draft'],
      variants: [
        { id: 'draft',            name: 'Draft' },
        { id: 'extract',          name: 'Extract' },
        { id: 'counsel',          name: 'Counsel' },
        { id: 'documents',        name: 'Documents' },
        { id: 'tableau',          name: 'Table' },
        { id: 'clausier',         name: 'Clausier — Modèles partagés' },
        { id: 'counter-argument', name: 'Counter-Argument' },
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
