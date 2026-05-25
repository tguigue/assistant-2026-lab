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
  | 'E2' | 'E3'
  | 'C2' | 'C3' | 'C5' | 'C6' | 'C7'
  | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A8';

export type Variant = { id: string; name: string };

export type PrimitiveDef = {
  code: PrimitiveCode;
  name: string;
  blurb: string;
  group: 'E' | 'C' | 'A';
  variants: Variant[];
  defaultVariantId: string;
  defaultVisible: boolean;
  /** When false, no "Masquer" option is shown — primitive is always visible. */
  canHide?: boolean;
  /** Optional secondary content-axis variants. */
  content?: { defaultId: string; variants: Variant[] };
};

export const PRIMITIVES: PrimitiveDef[] = [
  // ============ Empty State ============
  {
    code: 'E2', name: 'Suggested Prompts', group: 'E',
    blurb: 'Exemples de prompts proposés en état vide.',
    defaultVariantId: 'chips',
    defaultVisible: false,
    variants: [
      { id: 'chips',   name: 'Chip row (4 suggestions)' },
      { id: 'cards',   name: 'Card grid 2×2' },
      { id: 'list',    name: 'Liste numérotée' },
      { id: 'recent',  name: 'Conversations récentes' },
    ],
  },
  {
    code: 'E3', name: 'Quick Actions', group: 'E',
    blurb: "Boutons d'action rapide (Recherche / Rédaction / Extract / Counsel).",
    defaultVariantId: 'labeled',
    defaultVisible: false,
    variants: [
      { id: 'icons',    name: "Rangée d'icônes" },
      { id: 'labeled',  name: 'Pills étiquetées' },
      { id: 'verbose',  name: 'Cards avec descriptions' },
    ],
  },

  // ============ Composer ============
  {
    code: 'C2', name: 'Mode Selector', group: 'C',
    blurb: 'Sélection parmi Rechercher / Rédiger / Analyser / Extraire.',
    defaultVariantId: 'pill',
    defaultVisible: false,
    variants: [
      { id: 'pill',    name: 'Pill segment above input' },
      { id: 'slash',   name: 'Slash commands (/research…)' },
      { id: 'tabs',    name: 'Top-bar tabs' },
    ],
  },
  {
    code: 'C3', name: 'Sources', group: 'C',
    blurb: 'Bouton « Sources » du composer. Toujours présent.',
    defaultVariantId: 'side-panel',
    defaultVisible: true,
    canHide: false,
    variants: [
      { id: 'dropdown',   name: 'Dropdown popover' },
      { id: 'side-panel', name: 'Side panel' },
    ],
  },
  {
    code: 'C5', name: 'Imported files', group: 'C',
    blurb: 'Aperçu des fichiers attachés au prompt courant.',
    defaultVariantId: 'cards',
    defaultVisible: false,
    variants: [
      { id: 'cards',   name: 'Cards (name + format tag)' },
      { id: 'chips',   name: 'Compact chips with paperclip' },
      { id: 'list',    name: 'Vertical list with metadata' },
    ],
  },
  {
    code: 'C6', name: 'Context Chip', group: 'C',
    blurb: 'Chip dismissible affichant le contexte attaché.',
    defaultVariantId: 'dossier',
    defaultVisible: true,
    variants: [
      { id: 'dossier',    name: 'Dossier (Leroy c/ Merlin)' },
      { id: 'fichier',    name: 'Fichier (Conclusions_def.pdf)' },
      { id: 'base',       name: 'Base de connaissance' },
      { id: 'sharepoint', name: 'Sharepoint' },
    ],
  },
  {
    code: 'C7', name: 'Inferred Scope Hint', group: 'C',
    blurb: "Ligne qui rend visible l'intention + sources déduites.",
    defaultVariantId: 'doctrine-memo',
    defaultVisible: false,
    variants: [
      { id: 'doctrine-memo', name: 'Doctrine + mémo' },
      { id: 'doctrine-only', name: 'Doctrine seul' },
      { id: 'kb-only',       name: 'KB interne' },
      { id: 'matter',        name: 'Dossier (Matter)' },
    ],
  },

  // ============ Response ============
  {
    code: 'A1', name: 'Reasoning', group: 'A',
    blurb: "Ce que l'Assistant fait avant de répondre. Design = visuel ; Content = ce qu'on raconte.",
    defaultVariantId: 'box',
    defaultVisible: true,
    variants: [
      { id: 'box',       name: 'Gray box with sparkle' },
      { id: 'inline',    name: 'Inline italic' },
      { id: 'streaming', name: 'Streaming thought trace' },
      { id: 'collapsed', name: 'Collapsed summary' },
    ],
    content: {
      defaultId: 'agentic',
      variants: [
        { id: 'agentic',  name: 'Agentic multi-step trace' },
        { id: 'preamble', name: 'Plain preamble' },
      ],
    },
  },
  {
    code: 'A2', name: 'Quote style', group: 'A',
    blurb: 'Mise en forme des extraits de décision / texte de loi cités dans le corps.',
    defaultVariantId: 'inline-highlight',
    defaultVisible: true,
    variants: [
      { id: 'inline-highlight', name: 'Inline · blue highlight' },
      { id: 'blockquote',       name: 'Italic with left border' },
      { id: 'card',             name: 'Framed card with quote marks' },
      { id: 'minimal',          name: 'Minimal italic, no border' },
    ],
  },
  {
    code: 'A3', name: 'Inline Citation', group: 'A',
    blurb: 'Pilule de citation dans le corps.',
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
    code: 'A4', name: 'Tool CTA', group: 'A',
    blurb: 'Bouton CTA vers un outil intégré. Design = forme ; Content = quel outil.',
    defaultVariantId: 'card',
    defaultVisible: false,
    variants: [
      { id: 'card',   name: 'Card' },
      { id: 'link',   name: 'Link' },
      { id: 'banner', name: 'Banner' },
    ],
    content: {
      defaultId: 'draft',
      variants: [
        { id: 'draft',   name: 'Draft' },
        { id: 'extract', name: 'Extract' },
        { id: 'counsel', name: 'Counsel' },
      ],
    },
  },
  {
    code: 'A5', name: 'Citations Panel', group: 'A',
    blurb: 'Panneau groupé sous la réponse.',
    defaultVariantId: 'accordion',
    defaultVisible: true,
    variants: [
      { id: 'accordion', name: 'Collapsible accordion' },
      { id: 'list',      name: 'Inline list' },
      { id: 'cards',     name: 'Expanded cards' },
    ],
  },
  {
    code: 'A6', name: 'Attach To Matter', group: 'A',
    blurb: 'Pill sous la réponse pour rattacher au dossier.',
    defaultVariantId: 'initial',
    defaultVisible: false,
    variants: [
      { id: 'initial',   name: 'Initial — « Attacher à un dossier »' },
      { id: 'attached',  name: 'Rattaché — confirmation' },
      { id: 'toast',     name: 'Toast notification' },
    ],
  },
  {
    code: 'A8', name: 'Suggested Follow-ups', group: 'A',
    blurb: 'Suggestions de relance sous la réponse.',
    defaultVariantId: 'chips',
    defaultVisible: true,
    variants: [
      { id: 'chips',   name: 'Chip row below answer' },
      { id: 'list',    name: 'Numbered list' },
      { id: 'cards',   name: 'Grid of action cards' },
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
export function defaultContentFor(code: PrimitiveCode): string | undefined {
  return PRIMITIVES_BY_CODE[code].content?.defaultId;
}
