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
  | 'E2' | 'E3' | 'E4' | 'E6'
  | 'C2' | 'C5' | 'C6' | 'C7' | 'C8' | 'C9' | 'C11' | 'C12'
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
        { id: 'search',  name: 'Rechercher' },
        { id: 'edit',    name: 'Éditer' },
        { id: 'analyse', name: 'Analyser' },
      ],
    },
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
    code: 'C11', name: 'Reasoning level', group: 'C',
    blurb: 'Dropdown in the composer footer to pick the answer depth — Raisonnement avancé (Beta) / Détaillé / Concis. The level is the variant.',
    defaultVariantId: 'avance',
    defaultVisible: false,
    variants: [
      { id: 'avance',   name: 'Raisonnement avancé (Beta)' },
      { id: 'detaille', name: 'Détaillé' },
      { id: 'concis',   name: 'Concis' },
    ],
  },
  {
    code: 'C12', name: 'Token budget', group: 'C',
    blurb: 'Composer-footer dropdown to pick the agentic effort / token budget — Économe / Équilibré / Maximum. The tier is the variant. Toggle the "Limite atteinte" state to preview the inline limit treatment (the Maximum tier locks + an inline warning appears).',
    defaultVariantId: 'defaut',
    defaultVisible: true,
    variants: [
      { id: 'defaut',  name: 'Défaut (Recommandé)' },
      { id: 'econome', name: 'Économe' },
      { id: 'maximum', name: 'Maximum' },
    ],
    content: {
      multiSelect: true,
      defaultIds: [],
      variants: [
        { id: 'limit-reached', name: 'Limite atteinte — verrouille l’effort maximal' },
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
    blurb: 'Context attached to the prompt (matters, bases, files…). This primitive IS the + button: turning it off removes the + entry point, on shows it. Picked items render as chips. The variant sets whether each source shows a generous explanatory hint inside its submenu.',
    defaultVariantId: 'hints-submenu',
    defaultVisible: true,
    variants: [
      { id: 'plain',          name: 'No hints' },
      { id: 'hints-submenu',  name: 'Hints in the submenu (generous)' },
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
        { id: 'kb-mises',       name: 'Base — Mises en demeure' },
        { id: 'clausier',       name: 'Clausier (bibliothèque de clauses)' },
        { id: 'file',           name: 'File — Conclusions_def.pdf' },
      ],
    },
  },
  {
    code: 'C9', name: 'Matters', group: 'C',
    blurb: 'Banner of matter chips above the composer. Clicking one scopes the conversation to that matter (activates the Conversation Header matter scope). Experimental.',
    defaultVariantId: 'chips',
    defaultVisible: true,
    variants: [
      { id: 'chips', name: 'Colored chips row' },
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
    code: 'E3', name: 'Suggested Actions', group: 'C',
    blurb: 'Suggested action pills under the composer (Éditer / Extraire / Traduire…), ending with “Toutes les actions” which opens the action picker.',
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
    blurb: 'Agentic trace shown before the answer. Header is inline: "Raisonnement · N sources · durée". A final timeline row marks the state — a pulsing bullet with "Raisonnement en cours" while thinking, a steady bullet with "Raisonnement terminé" once done. Toggle Running to preview the live phase.',
    defaultVariantId: 'default',
    defaultVisible: true,
    variants: [
      { id: 'default', name: 'Inline — sources + durée' },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['running'],
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
    blurb: 'Inline citation to a public source — décisions, lois, codes, BOI. The chatbot controls the name, so it renders as readable blue underlined text.',
    defaultVariantId: 'link',
    defaultVisible: true,
    variants: [
      { id: 'link', name: 'Texte souligné bleu' },
    ],
  },
  {
    code: 'A6', name: 'Document citation', group: 'A',
    blurb: 'Inline citation to a private document — uploaded file, doc inside a matter, KB memo. Anonymized to a clickable number so the uncontrolled doc name stays out of the prose.',
    defaultVariantId: 'numbered',
    defaultVisible: true,
    variants: [
      { id: 'numbered', name: 'Numéro' },
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
export function defaultAxesFor(code: PrimitiveCode): Record<string, string> | undefined {
  const axes = PRIMITIVES_BY_CODE[code].axes;
  if (!axes || axes.length === 0) return undefined;
  const out: Record<string, string> = {};
  for (const a of axes) out[a.key] = a.defaultVariantId;
  return out;
}
