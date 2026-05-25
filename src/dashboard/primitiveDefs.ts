/**
 * The full primitive catalog with 5 dimensions per primitive:
 *   Option (radio: Current + alternatives)
 *   Variant (sub-flavor within the selected Option)
 *   State (runtime state: empty / loading / filled / error / hover)
 *   Design (visual treatment: minimal / detailed / outlined / filled)
 *   Location (where it sits: inline / sidebar / modal / top / bottom)
 *
 * Codes follow the user's convention:
 *   A* = Assistant Response area
 *   C* = Composer (input) area
 *   H* = Header / chrome
 */

export type PrimitiveCode =
  | 'H1' | 'H2'
  | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7' | 'C8'
  | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7' | 'A8';

export type Dim = 'variant' | 'state' | 'design' | 'location';

export type Choice = { id: string; name: string };

export type OptionDef = {
  id: string;
  name: string;
  variants?: Choice[];
  states?: Choice[];
  designs?: Choice[];
  locations?: Choice[];
};

export type PrimitiveDef = {
  code: PrimitiveCode;
  name: string;
  blurb: string;
  group: 'A' | 'C' | 'H';
  options: OptionDef[];
  defaultOptionId: string;
};

/* Shared catalogs reused across primitives */
const STATES_DEFAULT: Choice[] = [
  { id: 'default', name: 'Default' },
  { id: 'hover',   name: 'Hover' },
];
const STATES_INPUT: Choice[] = [
  { id: 'empty',    name: 'Empty' },
  { id: 'focus',    name: 'Focus' },
  { id: 'typing',   name: 'Typing' },
  { id: 'filled',   name: 'Filled' },
  { id: 'disabled', name: 'Disabled' },
];
const STATES_MSG: Choice[] = [
  { id: 'thinking',  name: 'Thinking' },
  { id: 'streaming', name: 'Streaming' },
  { id: 'done',      name: 'Done' },
  { id: 'error',     name: 'Error' },
];
const DESIGNS_BASIC: Choice[] = [
  { id: 'minimal',  name: 'Minimal' },
  { id: 'outlined', name: 'Outlined' },
  { id: 'filled',   name: 'Filled' },
];
const LOCATIONS_INPUT: Choice[] = [
  { id: 'in-composer', name: 'In composer' },
  { id: 'above-input', name: 'Above input' },
  { id: 'header',      name: 'Header' },
];
const LOCATIONS_MSG: Choice[] = [
  { id: 'inline',       name: 'Inline (in answer)' },
  { id: 'below-answer', name: 'Below answer' },
  { id: 'sidebar',      name: 'Sidebar' },
];

export const PRIMITIVES: PrimitiveDef[] = [
  // ============ Header / chrome ============
  {
    code: 'H1', name: 'Empty State Hero', group: 'H',
    blurb: 'Titre + tagline + lien « Voir les conseils ».',
    defaultOptionId: 'current',
    options: [
      {
        id: 'current', name: 'Centered hero',
        variants: [
          { id: '1a', name: 'Bold sans + light tagline' },
          { id: '1b', name: 'Serif title + sans tagline' },
        ],
        designs: [
          { id: 'classic',     name: 'Classic' },
          { id: 'minimalist',  name: 'Minimalist' },
        ],
      },
      { id: '2', name: 'Inline above input', variants: [{ id: '2a', name: 'Compact line' }], designs: DESIGNS_BASIC },
      { id: '3', name: 'Hidden' },
    ],
  },
  {
    code: 'H2', name: 'Matter Banner', group: 'H',
    blurb: 'Bandeau de contexte quand une affaire est active.',
    defaultOptionId: 'current',
    options: [
      { id: 'current', name: 'Subtle gray band',  variants: [{ id: '1a', name: 'Avatar + name' }, { id: '1b', name: 'Avatar + name + countdown' }], designs: DESIGNS_BASIC, locations: [{ id: 'top', name: 'Top of canvas' }, { id: 'inline', name: 'Inline above messages' }] },
      { id: '2',       name: 'Dark prominent banner', designs: DESIGNS_BASIC },
      { id: '3',       name: 'Compact pill near input', designs: DESIGNS_BASIC },
      { id: '4',       name: 'Hidden' },
    ],
  },

  // ============ Composer (C*) ============
  {
    code: 'C1', name: 'Input Field', group: 'C',
    blurb: 'Champ de saisie principal avec placeholder + @mention.',
    defaultOptionId: 'current',
    options: [
      {
        id: 'current', name: 'Real Doctrine input',
        variants: [
          { id: '1a', name: 'Single line' },
          { id: '1b', name: 'Multiline 2 rows' },
          { id: '1c', name: 'Multiline 3 rows' },
        ],
        states: STATES_INPUT,
        designs: DESIGNS_BASIC,
      },
      { id: '2', name: 'Search-bar style', states: STATES_INPUT, designs: DESIGNS_BASIC },
      { id: '3', name: 'Multi-block (prompt + context)', states: STATES_INPUT },
    ],
  },
  {
    code: 'C2', name: 'Mode Selector', group: 'C',
    blurb: 'Sélection exclusive parmi les 4 modes : Rechercher / Rédiger / Analyser / Extraire.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Hidden (auto only)' },
      {
        id: '1', name: 'Pill segment',
        variants: [{ id: '1a', name: 'With icons' }, { id: '1b', name: 'Text only' }],
        states: STATES_DEFAULT,
        designs: DESIGNS_BASIC,
        locations: LOCATIONS_INPUT,
      },
      { id: '2', name: 'Slash commands', variants: [{ id: '2a', name: '/research, /draft…' }], states: STATES_DEFAULT },
      { id: '3', name: 'Top-bar tabs', designs: DESIGNS_BASIC },
    ],
  },
  {
    code: 'C3', name: 'Source Toggle', group: 'C',
    blurb: 'Bascule binaire par source. Reste active d\'une requête à l\'autre.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'iOS-style switch in dropdown' },
      {
        id: '1', name: 'Persistent chips in composer',
        variants: [{ id: '1a', name: 'With counts' }, { id: '1b', name: 'No counts' }],
        states: STATES_DEFAULT,
        designs: DESIGNS_BASIC,
      },
      { id: '2', name: 'Side rail toggle list', designs: DESIGNS_BASIC },
      { id: '3', name: 'Hidden (only via settings)' },
    ],
  },
  {
    code: 'C4', name: 'Source Picker Tree', group: 'C',
    blurb: 'Bouton Sources qui ouvre un drawer latéral : arbre Décisions / Codes / Fiscal / Entreprise.',
    defaultOptionId: 'current',
    options: [
      {
        id: 'current', name: 'Lateral drawer with tree',
        variants: [{ id: '1a', name: 'Categories collapsible' }, { id: '1b', name: 'All expanded' }],
        states: STATES_DEFAULT,
      },
      { id: '2', name: 'Search-first picker', designs: DESIGNS_BASIC },
      { id: '3', name: 'Flat list', designs: DESIGNS_BASIC },
    ],
  },
  {
    code: 'C5', name: 'File Attach', group: 'C',
    blurb: 'Bouton + avec popover : Importer (Vos dossiers / Bases / Ordinateur / Sharepoint / Google Drive).',
    defaultOptionId: 'current',
    options: [
      {
        id: 'current', name: 'Plus button with nested popover',
        variants: [{ id: '1a', name: 'Nested submenu' }, { id: '1b', name: 'Tabs' }],
        states: STATES_DEFAULT,
      },
      { id: '2', name: 'Drag-drop zone', designs: DESIGNS_BASIC },
      { id: '3', name: 'Sidebar file picker', designs: DESIGNS_BASIC },
    ],
  },
  {
    code: 'C6', name: 'Matter / File Chip', group: 'C',
    blurb: 'Chip dismissible montrant le contexte attaché (Matter, fichier, base, Sharepoint).',
    defaultOptionId: 'current',
    options: [
      {
        id: 'current', name: 'Inline dismissible chip',
        variants: [
          { id: 'dossier',    name: 'Dossier' },
          { id: 'fichier',    name: 'Fichier' },
          { id: 'base',       name: 'Base de connaissance' },
          { id: 'sharepoint', name: 'Sharepoint' },
        ],
        states: STATES_DEFAULT,
        designs: DESIGNS_BASIC,
      },
      { id: '2', name: 'Avatar stack', designs: DESIGNS_BASIC },
      { id: '3', name: 'Single-line summary ("3 sources")' },
    ],
  },
  {
    code: 'C7', name: 'Inferred Scope Hint', group: 'C',
    blurb: 'Ligne qui rend visible l\'intention + sources déduites par l\'Assistant. Lien Modifier.',
    defaultOptionId: 'current',
    options: [
      {
        id: 'current', name: 'One-line summary with Modifier link',
        variants: [
          { id: 'doctrine-memo', name: 'Doctrine + mémo' },
          { id: 'doctrine-only', name: 'Doctrine seul' },
          { id: 'kb-only',       name: 'KB interne' },
          { id: 'matter',        name: 'Dossier (Matter)' },
        ],
        states: STATES_DEFAULT,
        designs: DESIGNS_BASIC,
      },
      { id: '2', name: 'Banner above input', designs: DESIGNS_BASIC },
      { id: '3', name: 'Tooltip on intent chip' },
      { id: '4', name: 'Hidden (no scope display)' },
    ],
  },
  {
    code: 'C8', name: 'Send Button', group: 'C',
    blurb: 'Bouton d\'envoi de la requête.',
    defaultOptionId: 'current',
    options: [
      {
        id: 'current', name: 'Outlined arrow',
        variants: [{ id: '1a', name: '↑ arrow' }, { id: '1b', name: '→ arrow' }],
        states: [
          { id: 'idle',    name: 'Idle' },
          { id: 'active',  name: 'Active' },
          { id: 'sending', name: 'Sending' },
        ],
        designs: DESIGNS_BASIC,
      },
      { id: '2', name: 'Filled black arrow', states: [{ id: 'idle', name: 'Idle' }, { id: 'active', name: 'Active' }] },
      { id: '3', name: 'Labeled "Envoyer"', designs: DESIGNS_BASIC },
    ],
  },

  // ============ Assistant Response (A*) ============
  {
    code: 'A1', name: 'Plan Preamble', group: 'A',
    blurb: 'Phrase qui annonce ce que l\'Assistant va faire avant de répondre.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Hidden' },
      {
        id: '1', name: 'Gray inline box with sparkle',
        variants: [{ id: '1a', name: 'Single paragraph' }, { id: '1b', name: 'With bullet plan' }],
        states: [{ id: 'streaming', name: 'Streaming' }, { id: 'done', name: 'Done' }],
        designs: DESIGNS_BASIC,
        locations: LOCATIONS_MSG,
      },
      { id: '2', name: 'Single italic line', designs: DESIGNS_BASIC },
      { id: '3', name: 'Streaming thought trace' },
      { id: '4', name: 'Collapsed summary ("Searching · 3 sources")' },
    ],
  },
  {
    code: 'A2', name: 'Assistant Message', group: 'A',
    blurb: 'Corps de la réponse en serif legal (Tiempos).',
    defaultOptionId: 'current',
    options: [
      {
        id: 'current', name: 'Legal serif, no bubble',
        variants: [{ id: '1a', name: 'Tiempos Text' }, { id: '1b', name: 'Charter fallback' }],
        states: STATES_MSG,
        designs: DESIGNS_BASIC,
      },
      { id: '2', name: 'Sans serif with light bg', designs: DESIGNS_BASIC },
      { id: '3', name: 'Bubble (mirrors user)', designs: DESIGNS_BASIC },
    ],
  },
  {
    code: 'A3', name: 'Inline Citation', group: 'A',
    blurb: 'Pilule de citation dans le corps. Filled gris (Doctrine) ou noir (interne).',
    defaultOptionId: 'current',
    options: [
      {
        id: 'current', name: 'Filled pill (gray/black)',
        variants: [{ id: '1a', name: 'Full reference' }, { id: '1b', name: 'Short label' }],
        states: STATES_DEFAULT,
        designs: DESIGNS_BASIC,
      },
      { id: '2', name: 'Numbered footnotes [1] [2]', designs: DESIGNS_BASIC },
      { id: '3', name: 'Bracketed mono [Cass. soc.]', designs: DESIGNS_BASIC },
      { id: '4', name: 'Superscript marker' },
    ],
  },
  {
    code: 'A4', name: 'Tool CTA', group: 'A',
    blurb: 'CTA pour ouvrir Draft / Extract / Counsel après la réponse.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Hidden' },
      {
        id: '1', name: 'Inline card with arrow',
        variants: [
          { id: 'draft',   name: 'Ouvrir dans Draft' },
          { id: 'extract', name: 'Voir le tableau Extract' },
          { id: 'counsel', name: 'Ouvrir dans Counsel' },
        ],
        states: STATES_DEFAULT,
        designs: DESIGNS_BASIC,
        locations: LOCATIONS_MSG,
      },
      { id: '2', name: 'Plain text link', designs: DESIGNS_BASIC },
      { id: '3', name: 'Full-width banner', designs: DESIGNS_BASIC },
    ],
  },
  {
    code: 'A5', name: 'Citations Panel', group: 'A',
    blurb: 'Panneau groupé sous la réponse listant toutes les sources citées.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Hidden' },
      {
        id: '1', name: 'Collapsible accordion (Doctrine + Internes)',
        variants: [{ id: '1a', name: 'Both expanded' }, { id: '1b', name: 'Both collapsed' }],
        designs: DESIGNS_BASIC,
        locations: LOCATIONS_MSG,
      },
      { id: '2', name: 'Inline list', designs: DESIGNS_BASIC },
      { id: '3', name: 'Expanded cards (one per citation)' },
    ],
  },
  {
    code: 'A6', name: 'Attach To Matter', group: 'A',
    blurb: 'Pill sous la réponse pour rattacher au dossier.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Hidden' },
      {
        id: '1', name: 'Blue pill button',
        variants: [
          { id: 'initial',  name: 'Initial (Attacher à un dossier)' },
          { id: 'attached', name: 'Rattaché à Leroy c/ Merlin' },
        ],
        states: STATES_DEFAULT,
        designs: DESIGNS_BASIC,
      },
      { id: '2', name: 'Inline confirmation text', designs: DESIGNS_BASIC },
      { id: '3', name: 'Toast notification' },
    ],
  },
  {
    code: 'A7', name: 'Reasoning Trace', group: 'A',
    blurb: 'Étapes de recherche dépliables avec leurs requêtes et résultats catégorisés.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Hidden' },
      {
        id: '1', name: 'Expandable steps with categorized results',
        variants: [{ id: '1a', name: 'All collapsed' }, { id: '1b', name: 'All expanded' }],
        designs: DESIGNS_BASIC,
        locations: [{ id: 'inline', name: 'Inline above answer' }, { id: 'sidebar', name: 'Right sidebar' }],
      },
      { id: '2', name: 'Single condensed line ("3 steps · 87 results")' },
      { id: '3', name: 'Timeline view' },
    ],
  },
  {
    code: 'A8', name: 'Suggested Follow-ups', group: 'A',
    blurb: 'Trois suggestions de relance affichées sous la réponse.',
    defaultOptionId: '1',
    options: [
      { id: 'current', name: 'Hidden' },
      {
        id: '1', name: 'Chip row below answer',
        variants: [{ id: '1a', name: 'Pill chips' }, { id: '1b', name: 'Outlined chips' }],
        designs: DESIGNS_BASIC,
        locations: LOCATIONS_MSG,
      },
      { id: '2', name: 'Numbered list', designs: DESIGNS_BASIC },
      { id: '3', name: 'Grid of action cards' },
    ],
  },
];

export const PRIMITIVES_BY_CODE: Record<PrimitiveCode, PrimitiveDef> =
  Object.fromEntries(PRIMITIVES.map((p) => [p.code, p])) as Record<PrimitiveCode, PrimitiveDef>;

export const PRIMITIVE_CODES: PrimitiveCode[] = PRIMITIVES.map((p) => p.code);

export type PrimitiveSelection = {
  optionId: string;
  variantId?: string;
  stateId?: string;
  designId?: string;
  locationId?: string;
};

export function defaultSelectionFor(code: PrimitiveCode): PrimitiveSelection {
  const def = PRIMITIVES_BY_CODE[code];
  const opt = def.options.find((o) => o.id === def.defaultOptionId) ?? def.options[0];
  return {
    optionId: opt.id,
    variantId: opt.variants?.[0]?.id,
    stateId: opt.states?.[0]?.id,
    designId: opt.designs?.[0]?.id,
    locationId: opt.locations?.[0]?.id,
  };
}
