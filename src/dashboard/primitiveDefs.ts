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
  | 'C2' | 'C5' | 'C6'
  | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A8';

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
  /** When false, no "Masquer" option is shown — primitive is always visible. */
  canHide?: boolean;
  /** Optional secondary content-axis variants. */
  content?: ContentDef;
};

export const PRIMITIVES: PrimitiveDef[] = [
  // ============ Empty State ============
  {
    code: 'E2', name: 'Suggested Prompts', group: 'C',
    blurb: 'Exemples de prompts proposés en état vide.',
    defaultVariantId: 'cards',
    defaultVisible: false,
    variants: [
      { id: 'cards', name: 'Card grid 2×2' },
    ],
  },
  {
    code: 'E4', name: 'History', group: 'C',
    blurb: 'Accès rapide aux éléments récents (conversations, documents ou dossiers).',
    defaultVariantId: 'list',
    defaultVisible: false,
    variants: [
      { id: 'list', name: 'Liste compacte' },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['conversations'],
      variants: [
        { id: 'conversations', name: 'Conversations récentes' },
        { id: 'documents',     name: 'Documents récents' },
        { id: 'matters',       name: 'Dossiers récents' },
      ],
    },
  },
  {
    code: 'E3', name: 'Quick Actions', group: 'C',
    blurb: "Boutons d'action rapide (Recherche / Rédaction / Extract / Counsel).",
    defaultVariantId: 'labeled',
    defaultVisible: false,
    variants: [
      { id: 'icons',    name: "Rangée d'icônes" },
      { id: 'labeled',  name: 'Pills étiquetées' },
      { id: 'verbose',  name: 'Cards avec descriptions' },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['research', 'draft', 'extract', 'counsel'],
      variants: [
        { id: 'research', name: 'Recherche' },
        { id: 'draft',    name: 'Rédaction' },
        { id: 'extract',  name: 'Extraction' },
        { id: 'counsel',  name: 'Counsel' },
      ],
    },
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
    code: 'C6', name: 'Context', group: 'C',
    blurb: 'Affiche le contexte actif. Chip variants (outlined/tonal/ghost) = inline dans le composer ; Hint variants (subtle/banner/pill) = au-dessus.',
    defaultVariantId: 'outlined',
    defaultVisible: true,
    variants: [
      { id: 'outlined', name: 'Chip — Outlined' },
      { id: 'subtle',   name: 'Hint — Subtle' },
      { id: 'banner',   name: 'Hint — Banner' },
      { id: 'pill',     name: 'Hint — Pill' },
    ],
    content: {
      multiSelect: true,
      defaultIds: [],
      variants: [
        { id: 'dossier',       name: 'Dossier (Leroy c/ Merlin)' },
        { id: 'fichier',       name: 'Fichier (Conclusions_def.pdf)' },
        { id: 'base',          name: 'Base de connaissance' },
        { id: 'sharepoint',    name: 'Sharepoint' },
        { id: 'doctrine-memo', name: 'Doctrine + mémos' },
        { id: 'doctrine-only', name: 'Doctrine seul' },
        { id: 'kb-only',       name: 'KB interne' },
        { id: 'matter',        name: 'Dossier (Matter)' },
      ],
    },
  },

  // ============ Response ============
  {
    code: 'A1', name: 'Reasoning', group: 'A',
    blurb: "Trace agentique affichée avant la réponse.",
    defaultVariantId: 'agentic',
    defaultVisible: true,
    variants: [
      { id: 'agentic', name: 'Agentic trace' },
    ],
  },
  {
    code: 'A2', name: 'Quote style', group: 'A',
    blurb: 'Mise en forme des extraits de décision / texte de loi cités dans le corps.',
    defaultVariantId: 'inline-highlight',
    defaultVisible: true,
    variants: [
      { id: 'inline-highlight', name: 'Blue highlight' },
      { id: 'card',             name: 'Framed card' },
    ],
  },
  {
    code: 'A3', name: 'Source link', group: 'A',
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
    blurb: 'Forme = surface ; fond = état (proposition vs confirmation).',
    defaultVariantId: 'pill',
    defaultVisible: false,
    variants: [
      { id: 'pill',  name: 'Inline pill' },
      { id: 'toast', name: 'Toast notification' },
    ],
    content: {
      defaultId: 'initial',
      variants: [
        { id: 'initial',  name: 'Initial — « Attacher à un dossier »' },
        { id: 'attached', name: 'Rattaché — confirmation' },
      ],
    },
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
export function defaultContentFor(code: PrimitiveCode): string | string[] | undefined {
  const c = PRIMITIVES_BY_CODE[code].content;
  if (!c) return undefined;
  if (c.multiSelect) return c.defaultIds;
  return c.defaultId;
}
