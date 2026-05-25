/**
 * Flat variant list per primitive — one choice per row.
 * No more Option/Variant/State/Design/Location matrix.
 *
 * Codes follow the user's convention:
 *   A* = Assistant Response area
 *   C* = Composer (input) area
 *   H* = Header / chrome
 */

export type PrimitiveCode =
  | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7' | 'C8'
  | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7' | 'A8';

export type Variant = { id: string; name: string };

export type PrimitiveDef = {
  code: PrimitiveCode;
  name: string;
  blurb: string;
  group: 'C' | 'A';
  variants: Variant[];
  defaultVariantId: string;
};

export const PRIMITIVES: PrimitiveDef[] = [
  // ============ Composer ============
  {
    code: 'C1', name: 'Input Field', group: 'C',
    blurb: 'Champ de saisie avec placeholder + @mention.',
    defaultVariantId: 'multiline-2',
    variants: [
      { id: 'single',      name: 'Single line' },
      { id: 'multiline-2', name: 'Multiline 2 rows (Doctrine)' },
      { id: 'multiline-3', name: 'Multiline 3 rows' },
      { id: 'search-bar',  name: 'Search-bar style' },
    ],
  },
  {
    code: 'C2', name: 'Mode Selector', group: 'C',
    blurb: 'Sélection parmi Rechercher / Rédiger / Analyser / Extraire.',
    defaultVariantId: 'hidden',
    variants: [
      { id: 'hidden',  name: 'Hidden (auto-detect)' },
      { id: 'pill',    name: 'Pill segment above input' },
      { id: 'slash',   name: 'Slash commands (/research…)' },
      { id: 'tabs',    name: 'Top-bar tabs' },
    ],
  },
  {
    code: 'C3', name: 'Source Toggle', group: 'C',
    blurb: 'Bascule binaire par source (Doctrine, KB, Clausier).',
    defaultVariantId: 'in-dropdown',
    variants: [
      { id: 'in-dropdown', name: 'iOS-style switch in dropdown (Doctrine)' },
      { id: 'chips',       name: 'Persistent chips in composer' },
      { id: 'rail',        name: 'Side rail toggle list' },
      { id: 'hidden',      name: 'Hidden (only via settings)' },
    ],
  },
  {
    code: 'C4', name: 'Source Picker Tree', group: 'C',
    blurb: 'Drawer avec arbre Décisions / Codes / Fiscal / Entreprise.',
    defaultVariantId: 'drawer',
    variants: [
      { id: 'drawer',  name: 'Lateral drawer (Doctrine)' },
      { id: 'search',  name: 'Search-first picker' },
      { id: 'flat',    name: 'Flat list' },
      { id: 'hidden',  name: 'Hidden' },
    ],
  },
  {
    code: 'C5', name: 'File Attach', group: 'C',
    blurb: 'Bouton + avec popover Importer.',
    defaultVariantId: 'plus-popover',
    variants: [
      { id: 'plus-popover', name: '+ button with popover (Doctrine)' },
      { id: 'drag-drop',    name: 'Drag-drop zone' },
      { id: 'sidebar',      name: 'Sidebar file picker' },
      { id: 'hidden',       name: 'Hidden' },
    ],
  },
  {
    code: 'C6', name: 'Matter / File Chip', group: 'C',
    blurb: 'Chip dismissible affichant le contexte attaché.',
    defaultVariantId: 'dossier',
    variants: [
      { id: 'dossier',    name: 'Dossier (Leroy c/ Merlin)' },
      { id: 'fichier',    name: 'Fichier (Conclusions_def.pdf)' },
      { id: 'base',       name: 'Base de connaissance' },
      { id: 'sharepoint', name: 'Sharepoint' },
      { id: 'hidden',     name: 'Hidden' },
    ],
  },
  {
    code: 'C7', name: 'Inferred Scope Hint', group: 'C',
    blurb: 'Ligne qui rend visible l\'intention + sources déduites.',
    defaultVariantId: 'hidden',
    variants: [
      { id: 'doctrine-memo', name: 'Doctrine + mémo' },
      { id: 'doctrine-only', name: 'Doctrine seul' },
      { id: 'kb-only',       name: 'KB interne' },
      { id: 'matter',        name: 'Dossier (Matter)' },
      { id: 'hidden',        name: 'Hidden' },
    ],
  },
  {
    code: 'C8', name: 'Send Button', group: 'C',
    blurb: 'Bouton d\'envoi.',
    defaultVariantId: 'outlined',
    variants: [
      { id: 'outlined', name: 'Outlined ↑ arrow (Doctrine)' },
      { id: 'filled',   name: 'Filled black arrow' },
      { id: 'labeled',  name: 'Labeled « Envoyer »' },
    ],
  },

  // ============ Response ============
  {
    code: 'A1', name: 'Plan Preamble', group: 'A',
    blurb: 'Phrase qui annonce ce que l\'Assistant va faire.',
    defaultVariantId: 'box',
    variants: [
      { id: 'box',      name: 'Gray box with sparkle' },
      { id: 'inline',   name: 'Single italic line' },
      { id: 'thought',  name: 'Streaming thought trace' },
      { id: 'collapsed', name: 'Collapsed summary' },
      { id: 'hidden',   name: 'Hidden' },
    ],
  },
  {
    code: 'A2', name: 'Answer Structure', group: 'A',
    blurb: 'Mise en forme du corps de la réponse.',
    defaultVariantId: 'sections',
    variants: [
      { id: 'sections', name: 'Numbered sections + serif body (recommended)' },
      { id: 'serif',    name: 'Continuous serif paragraphs' },
      { id: 'sans',     name: 'Sans-serif on light background' },
      { id: 'bubble',   name: 'Bubble (mirrors user message)' },
    ],
  },
  {
    code: 'A3', name: 'Inline Citation', group: 'A',
    blurb: 'Pilule de citation dans le corps.',
    defaultVariantId: 'pill',
    variants: [
      { id: 'pill',       name: 'Filled pill (gray / black)' },
      { id: 'numbered',   name: 'Numbered footnotes [1] [2]' },
      { id: 'bracketed',  name: 'Bracketed mono [Cass. soc.]' },
      { id: 'superscript', name: 'Superscript marker' },
    ],
  },
  {
    code: 'A4', name: 'Tool CTA', group: 'A',
    blurb: 'Bouton CTA vers Draft / Extract / Counsel.',
    defaultVariantId: 'hidden',
    variants: [
      { id: 'hidden',    name: 'Hidden' },
      { id: 'card',      name: 'Inline card with arrow' },
      { id: 'link',      name: 'Plain text link' },
      { id: 'banner',    name: 'Full-width banner' },
    ],
  },
  {
    code: 'A5', name: 'Citations Panel', group: 'A',
    blurb: 'Panneau groupé sous la réponse.',
    defaultVariantId: 'accordion',
    variants: [
      { id: 'accordion', name: 'Collapsible accordion' },
      { id: 'list',      name: 'Inline list' },
      { id: 'cards',     name: 'Expanded cards' },
      { id: 'hidden',    name: 'Hidden' },
    ],
  },
  {
    code: 'A6', name: 'Attach To Matter', group: 'A',
    blurb: 'Pill sous la réponse pour rattacher au dossier.',
    defaultVariantId: 'hidden',
    variants: [
      { id: 'hidden',    name: 'Hidden' },
      { id: 'initial',   name: 'Initial — « Attacher à un dossier »' },
      { id: 'attached',  name: 'Rattaché — confirmation' },
      { id: 'toast',     name: 'Toast notification' },
    ],
  },
  {
    code: 'A7', name: 'Cross-references', group: 'A',
    blurb: 'Section « Voir également » sous la réponse — décisions et articles connexes.',
    defaultVariantId: 'list',
    variants: [
      { id: 'list',     name: 'Inline list (Voir également)' },
      { id: 'cards',    name: 'Compact card row' },
      { id: 'inline',   name: 'Single line (« 3 références liées »)' },
      { id: 'hidden',   name: 'Hidden' },
    ],
  },
  {
    code: 'A8', name: 'Suggested Follow-ups', group: 'A',
    blurb: 'Suggestions de relance sous la réponse.',
    defaultVariantId: 'chips',
    variants: [
      { id: 'chips',   name: 'Chip row below answer' },
      { id: 'list',    name: 'Numbered list' },
      { id: 'cards',   name: 'Grid of action cards' },
      { id: 'hidden',  name: 'Hidden' },
    ],
  },
];

export const PRIMITIVES_BY_CODE: Record<PrimitiveCode, PrimitiveDef> =
  Object.fromEntries(PRIMITIVES.map((p) => [p.code, p])) as Record<PrimitiveCode, PrimitiveDef>;

export const PRIMITIVE_CODES: PrimitiveCode[] = PRIMITIVES.map((p) => p.code);

export function defaultVariantFor(code: PrimitiveCode): string {
  return PRIMITIVES_BY_CODE[code].defaultVariantId;
}
