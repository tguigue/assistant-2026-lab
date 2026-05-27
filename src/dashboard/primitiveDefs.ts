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
  | 'E2' | 'E3' | 'E4'
  | 'C2' | 'C5' | 'C6' | 'C7'
  | 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A7' | 'A8';

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
      defaultIds: ['research', 'draft', 'extract', 'counsel'],
      variants: [
        { id: 'research', name: 'Research' },
        { id: 'draft',    name: 'Draft' },
        { id: 'extract',  name: 'Extract' },
        { id: 'counsel',  name: 'Counsel' },
      ],
    },
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
    code: 'C2', name: 'Mode Selector', group: 'C',
    blurb: 'Pick between Research / Draft / Analyze / Extract.',
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
    code: 'C6', name: 'Context', group: 'C',
    blurb: 'Active context, shown as chips inline inside the composer.',
    defaultVariantId: 'outlined',
    defaultVisible: true,
    variants: [
      { id: 'outlined', name: 'Chip — Outlined' },
    ],
    content: {
      multiSelect: true,
      defaultIds: [],
      variants: [
        // Context = the user's own materials (not Doctrine's institutional sources).
        { id: 'kb',         name: 'Knowledge base' },
        { id: 'sharepoint', name: 'SharePoint' },
        { id: 'matter',     name: 'Matter (Leroy v. Merlin)' },
        { id: 'file',       name: 'File (Conclusions_def.pdf)' },
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

  // ============ Response ============
  {
    code: 'A0', name: 'Ask user question', group: 'A',
    blurb: 'Source pre-check: validate or exclude the most relevant documents retrieved from each silo (SharePoint, OneDrive, Drive…) before reasoning.',
    defaultVariantId: 'grouped-list',
    defaultVisible: false,
    variants: [
      { id: 'grouped-list',    name: 'Stacked sections per silo' },
      { id: 'silo-tabs',       name: 'Tabs per silo' },
      { id: 'compact-chips',   name: 'Compact chips per silo' },
      { id: 'sticky-composer', name: 'Sticky above composer' },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['sharepoint', 'onedrive', 'gdrive', 'doctrine-kb'],
      variants: [
        { id: 'sharepoint',  name: 'SharePoint' },
        { id: 'onedrive',    name: 'OneDrive' },
        { id: 'gdrive',      name: 'Google Drive' },
        { id: 'dropbox',     name: 'Dropbox' },
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
    code: 'A2', name: 'Quote style', group: 'A',
    blurb: 'How decision / statute excerpts are rendered inside the body.',
    defaultVariantId: 'inline-highlight',
    defaultVisible: true,
    variants: [
      { id: 'inline-highlight', name: 'Blue highlight' },
      { id: 'card',             name: 'Framed card' },
    ],
  },
  {
    code: 'A3', name: 'Source link', group: 'A',
    blurb: 'Inline citation in the body.',
    defaultVariantId: 'pill',
    defaultVisible: true,
    variants: [
      { id: 'pill',        name: 'Filled pill (gray / black)' },
      { id: 'numbered',    name: 'Numbered footnotes [1] [2]' },
      { id: 'bracketed',   name: 'Bracketed mono [Cass. soc.]' },
      { id: 'superscript', name: 'Superscript marker' },
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
        { id: 'draft',     name: 'Draft' },
        { id: 'extract',   name: 'Extract' },
        { id: 'counsel',   name: 'Counsel' },
        { id: 'documents', name: 'Documents' },
        { id: 'tableau',   name: 'Table' },
      ],
    },
  },
  {
    code: 'A7', name: 'Answer Actions', group: 'A',
    blurb: 'Action bar under the answer — export (Word, PDF), copy, feedback.',
    defaultVariantId: 'labeled',
    defaultVisible: true,
    variants: [
      { id: 'labeled', name: 'Labeled (Copy + icons)' },
      { id: 'icons',   name: 'Icons only' },
    ],
  },
  {
    code: 'A8', name: 'Suggested Follow-ups', group: 'A',
    blurb: 'Follow-up suggestions under the answer — full-width rows, subtle dividers.',
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
