import type { ScenarioId } from '../state/types';

/**
 * Scripted output for the Flow Runner.
 * One scenario has multiple variants; each variant has a list of
 * "terminal lines" + a final rendered quote block (the assistant's
 * actual answer, in legal-serif).
 */

export type LineKind = 'cmd' | 'ok' | 'info' | 'arrow' | 'warn' | 'err' | 'space' | 'plain';

export type FlowLine = {
  kind: LineKind;
  text: string;
  /** Right-aligned meta (latency, count, etc.) */
  meta?: string;
};

export type FlowVariant = {
  id: string;
  label: string;
  /** Mock working directory shown at the top of the terminal */
  path: string;
  /** Scripted log lines */
  lines: FlowLine[];
  /** Final answer block displayed below the log */
  quote?: string;
  /** Optional citation labels shown after the quote */
  citations?: string[];
};

const RESEARCH_VARIANTS: FlowVariant[] = [
  {
    id: 'first-run',
    label: 'First run',
    path: '~/assistant/leroy-c-merlin/research',
    lines: [
      { kind: 'cmd', text: '$ assistant research "harcèlement points hebdo"' },
      { kind: 'ok', text: '✓ intent: research', meta: 'auto-detected · conf 0.94' },
      { kind: 'ok', text: '✓ scope: Doctrine, KB', meta: '12M + 1 240 docs' },
      { kind: 'arrow', text: '→ search: Doctrine', meta: '312ms · 4 hits' },
      { kind: 'arrow', text: '→ search: KB', meta: '87ms · 2 hits' },
      { kind: 'ok', text: '✓ provenance: 6 sources cited' },
      { kind: 'info', text: '• policy: passed' },
    ],
    quote:
      'L’organisation de points hebdomadaires ne caractérise pas en elle-même un harcèlement moral. La Cour de cassation rappelle constamment que la qualification suppose la réunion de trois critères : répétition, dégradation, portée objective.',
    citations: ['Cass. soc. · 10 nov. 2009', 'Cass. soc. · 15 mars 2023', 'Mémo RH · 2024-03'],
  },
  {
    id: 'kb-hit',
    label: 'KB hit',
    path: '~/assistant/leroy-c-merlin/research',
    lines: [
      { kind: 'cmd', text: '$ assistant research "harcèlement points hebdo" --kb-first' },
      { kind: 'ok', text: '✓ intent: research', meta: 'auto-detected · conf 0.94' },
      { kind: 'ok', text: '✓ scope: KB, Doctrine', meta: 'KB prioritized' },
      { kind: 'arrow', text: '→ search: KB', meta: '54ms · 2 hits' },
      { kind: 'info', text: '• match found, skipping external search' },
      { kind: 'ok', text: '✓ provenance: 2 internal sources cited' },
    ],
    quote:
      'D’après votre mémo interne 2024 sur l’encadrement managérial, l’organisation de points hebdomadaires relève du suivi régulier et n’est pas problématique en soi, sauf basculement vers un contrôle excessif.',
    citations: ['Mémo RH · 2024-03', 'Note Sénior · 2023-11'],
  },
  {
    id: 'conflict',
    label: 'Source conflict',
    path: '~/assistant/leroy-c-merlin/research',
    lines: [
      { kind: 'cmd', text: '$ assistant research "harcèlement points hebdo"' },
      { kind: 'ok', text: '✓ intent: research' },
      { kind: 'ok', text: '✓ scope: Doctrine, KB' },
      { kind: 'arrow', text: '→ search: Doctrine', meta: '312ms · 4 hits' },
      { kind: 'arrow', text: '→ search: KB', meta: '87ms · 2 hits' },
      { kind: 'warn', text: '⚠ divergence detected', meta: 'critère de répétition' },
      { kind: 'info', text: '• Doctrine: strict (3+ agissements)' },
      { kind: 'info', text: '• KB: large (2 suffisent dans contexte de contrôle)' },
      { kind: 'info', text: '• awaiting user resolution…' },
    ],
    quote: 'Conflict resolved interactively — see Compare view in the rendered surface.',
  },
  {
    id: 'oos',
    label: 'Out of scope',
    path: '~/assistant',
    lines: [
      { kind: 'cmd', text: '$ assistant research "météo demain à Paris"' },
      { kind: 'ok', text: '✓ intent: research', meta: 'conf 0.41' },
      { kind: 'warn', text: '⚠ low confidence', meta: 'non-juridique' },
      { kind: 'err', text: '✗ refused', meta: 'out of legal scope' },
    ],
  },
];

const DRAFT_VARIANTS: FlowVariant[] = [
  {
    id: 'clausier',
    label: 'From Clausier',
    path: '~/assistant/leroy-c-merlin/draft',
    lines: [
      { kind: 'cmd', text: '$ assistant draft "contrat prestation architecte"' },
      { kind: 'ok', text: '✓ intent: draft', meta: 'conf 0.97' },
      { kind: 'arrow', text: '→ Clausier match: Mission MOP', meta: 'clause #fr-arch-mop-01' },
      { kind: 'arrow', text: '→ Clausier match: Honoraires', meta: 'clause #fr-arch-hon-03' },
      { kind: 'arrow', text: '→ Clausier match: RC décennale', meta: 'clause #fr-arch-rc-02' },
      { kind: 'arrow', text: '→ KB match: 2 modèles similaires' },
      { kind: 'ok', text: '✓ draft generated', meta: '8 articles · 1 240 mots' },
      { kind: 'info', text: '• artifact: /artifacts/draft/4b864fb.md' },
    ],
    quote:
      'Le présent contrat a pour objet de définir les conditions dans lesquelles l’architecte, mandataire de maîtrise d’œuvre, assurera la conception et le suivi des travaux relatifs au projet décrit en annexe…',
  },
  {
    id: 'no-clausier',
    label: 'Without Clausier',
    path: '~/assistant/leroy-c-merlin/draft',
    lines: [
      { kind: 'cmd', text: '$ assistant draft "contrat prestation architecte"' },
      { kind: 'ok', text: '✓ intent: draft' },
      { kind: 'warn', text: '⚠ no Clausier match', meta: 'cabinet n’a pas configuré le Clausier' },
      { kind: 'arrow', text: '→ falling back to KB models', meta: '2 hits' },
      { kind: 'arrow', text: '→ falling back to Doctrine practice clauses', meta: '124 hits → top 3 used' },
      { kind: 'ok', text: '✓ draft generated', meta: '6 articles · 980 mots' },
    ],
    quote: 'Brouillon généré sans Clausier — qualité moindre, clauses standard de la pratique.',
  },
  {
    id: 'scratch',
    label: 'From scratch',
    path: '~/assistant/draft',
    lines: [
      { kind: 'cmd', text: '$ assistant draft "lettre de mise en demeure"' },
      { kind: 'ok', text: '✓ intent: draft' },
      { kind: 'info', text: '• no template found, generating from LLM only' },
      { kind: 'ok', text: '✓ draft generated', meta: '3 paragraphes · 220 mots' },
    ],
    quote: 'Madame, Monsieur, je suis chargé des intérêts de la société […] et vous mets en demeure de…',
  },
];

const ANALYSE_VARIANTS: FlowVariant[] = [
  {
    id: 'upload-local',
    label: 'Upload local',
    path: '~/assistant/analyse',
    lines: [
      { kind: 'cmd', text: '$ assistant analyse Conclusions_defendeur.pdf' },
      { kind: 'arrow', text: '→ parsing PDF', meta: '12 pages · 287 Ko' },
      { kind: 'ok', text: '✓ OCR not required', meta: 'document texte natif' },
      { kind: 'ok', text: '✓ intent: analyse', meta: 'déduit du fichier joint' },
      { kind: 'arrow', text: '→ identified 3 moyens principaux' },
      { kind: 'arrow', text: '→ Doctrine cross-ref', meta: '847ms · 7 décisions' },
      { kind: 'ok', text: '✓ analysis ready' },
    ],
    quote:
      'Le défendeur articule trois moyens : irrecevabilité pour défaut d’intérêt à agir, prescription quinquennale, et défaut de qualité à agir. Les jurisprudences confirmant chacun figurent ci-dessous.',
    citations: ['Cass. 2ᵉ civ. · 14 sept. 2023', 'Cass. com. · 8 juin 2023', 'Cass. 1ʳᵉ civ. · 22 mars 2024'],
  },
  {
    id: 'from-matter',
    label: 'From Matter doc',
    path: '~/assistant/leroy-c-merlin/analyse',
    lines: [
      { kind: 'cmd', text: '$ assistant analyse @matter:leroy/Conclusions_def.pdf' },
      { kind: 'ok', text: '✓ Matter context: Leroy c/ Merlin', meta: '7 docs disponibles' },
      { kind: 'ok', text: '✓ document already indexed', meta: 'no re-parse needed' },
      { kind: 'arrow', text: '→ cross-ref with 6 autres docs du Matter' },
      { kind: 'ok', text: '✓ analysis ready', meta: '34ms (cache hit)' },
    ],
    quote:
      'Les conclusions du défendeur s’appuient sur les mêmes points faibles déjà identifiés dans les emails versés en pièce 4 — voir la note de cross-référencement attachée.',
  },
  {
    id: 'multi-doc',
    label: 'Multi-doc',
    path: '~/assistant/leroy-c-merlin/analyse',
    lines: [
      { kind: 'cmd', text: '$ assistant analyse @matter:leroy/* --kind contracts' },
      { kind: 'ok', text: '✓ 5 contrats sélectionnés' },
      { kind: 'arrow', text: '→ extracting clauses', meta: '5 × 12 catégories' },
      { kind: 'ok', text: '✓ tableau croisé prêt', meta: '22 cellules · 5 obligations' },
    ],
    quote: 'Cinq obligations communes identifiées dans les contrats de l’affaire — voir tableau.',
  },
];

const INTERNAL_VARIANTS: FlowVariant[] = [
  {
    id: 'auto-matter',
    label: 'Auto-detect Matter',
    path: '~/assistant',
    lines: [
      { kind: 'cmd', text: '$ assistant "obligations communes contrats Leroy"' },
      { kind: 'ok', text: '✓ intent: internal', meta: 'conf 0.91' },
      { kind: 'ok', text: '✓ Matter detected: Leroy c/ Merlin', meta: 'from prompt entities' },
      { kind: 'arrow', text: '→ scope: 5 contrats du Matter' },
      { kind: 'ok', text: '✓ analysis ready', meta: '156ms' },
    ],
    quote:
      'Cinq obligations apparaissent dans au moins 3 des 5 contrats : confidentialité, non-concurrence, exclusivité, reporting trimestriel, audit annuel.',
    citations: ['Contrat 001 · art. 14', 'Contrat 002 · art. 12', 'Contrat 003 · art. 11'],
  },
  {
    id: 'explicit',
    label: 'Explicit @mention',
    path: '~/assistant',
    lines: [
      { kind: 'cmd', text: '$ assistant @Leroy "obligations communes des contrats"' },
      { kind: 'ok', text: '✓ Matter set explicitly', meta: 'Leroy c/ Merlin' },
      { kind: 'ok', text: '✓ intent: internal' },
      { kind: 'arrow', text: '→ scope: 5 contrats du Matter' },
      { kind: 'ok', text: '✓ analysis ready', meta: '142ms' },
    ],
    quote: 'Tableau croisé prêt pour les 5 contrats de l’affaire — identique à la variante auto-détectée.',
  },
  {
    id: 'ambiguous',
    label: 'Ambiguous match',
    path: '~/assistant',
    lines: [
      { kind: 'cmd', text: '$ assistant "obligations dans les contrats Leroy"' },
      { kind: 'ok', text: '✓ intent: internal', meta: 'conf 0.88' },
      { kind: 'warn', text: '⚠ 2 affaires correspondent à "Leroy"' },
      { kind: 'info', text: '• Leroy c/ Merlin (7 docs · 14 mars 2026)' },
      { kind: 'info', text: '• Leroy / Dupuis (12 docs · 2 oct. 2025)' },
      { kind: 'info', text: '• awaiting user disambiguation…' },
    ],
    quote: 'Désambiguïsation requise. Un picker à un clic est présenté à l’utilisateur.',
  },
];

export const FLOW_VARIANTS: Record<ScenarioId, FlowVariant[]> = {
  research: RESEARCH_VARIANTS,
  draft:    DRAFT_VARIANTS,
  analyse:  ANALYSE_VARIANTS,
  internal: INTERNAL_VARIANTS,
};
