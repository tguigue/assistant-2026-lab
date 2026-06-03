import type { ScenarioId } from './types';
import type { PrimitiveCode } from '../dashboard/primitiveDefs';

/* ----------------------------------------------------------------------
   Use cases — the 9 P0/P1 scenarios from the Notion "EoY Vision" table.

   A use case = one scenario (prompt + answer content, reused from S1–S4)
   + a primitive preset (which composer/answer primitives are configured)
   + a set of config chips that mirror the Notion columns and stay flippable
   live in the demo. This is what the demo gallery loads via applyUseCase().
   ---------------------------------------------------------------------- */

/** A primitive override applied on top of the registry defaults. */
type PrimitiveOverride = { visible?: boolean; variant?: string; content?: string | string[] };

/** A chip mirroring a Notion config column. Most are flippable live in the
    demo bar; `static` ones are baseline/display-only (e.g. Doctrine, Output). */
export type ConfigChip =
  | { kind: 'static'; label: string }
  | { kind: 'matter'; matterId: string; label: string }
  | { kind: 'source'; sourceId: string; label: string }
  | { kind: 'file';   label: string }
  | { kind: 'mode';   modeId: string; label: string }
  | { kind: 'tool';   toolId: string; label: string };

export type UseCaseFamily = 'research' | 'draft' | 'doc-analysis' | 'multi-doc';

export type UseCase = {
  id: string;
  n: number;
  status: 'P0' | 'P1';
  family: UseCaseFamily;
  title: string;
  scenario: ScenarioId;
  prompt: string;
  output: 'text' | 'draft' | 'extract';
  chips: ConfigChip[];
  primitives: Partial<Record<PrimitiveCode, PrimitiveOverride>>;
};

export const FAMILY_META: Record<UseCaseFamily, { label: string; blurb: string }> = {
  research:      { label: 'Legal Research',          blurb: 'Question juridique → réponse sourcée' },
  draft:         { label: 'Draft from scratch',      blurb: 'Rédaction d’un document → widget Draft' },
  'doc-analysis':{ label: 'Document legal analysis', blurb: 'Analyse d’un document → réponse sourcée' },
  'multi-doc':   { label: 'Multi-document analysis', blurb: 'Plusieurs documents → widget Extract' },
};

export const OUTPUT_META: Record<UseCase['output'], string> = {
  text:    'Réponse texte + citations',
  draft:   'Widget Draft + CTA',
  extract: 'Widget Extract + CTA',
};

export const USE_CASES: UseCase[] = [
  {
    id: 'UC1', n: 1, status: 'P0', family: 'research', scenario: 'S1', output: 'text',
    title: 'Recherche juridique',
    prompt: "Le fait d'organiser des points hebdomadaires peut-il être qualifié de harcèlement ?",
    chips: [
      { kind: 'static', label: 'Sources Doctrine' },
      { kind: 'source', sourceId: 'kb-mises', label: 'Base de connaissances' },
    ],
    primitives: { C6: { visible: true, content: ['kb-mises'] } },
  },
  {
    id: 'UC2', n: 2, status: 'P1', family: 'research', scenario: 'S1', output: 'text',
    title: 'Recherche juridique — sur un dossier',
    prompt: "Le fait d'organiser des points hebdomadaires peut-il être qualifié de harcèlement dans le cadre de l'affaire Leroy c/ Merlin ?",
    chips: [
      { kind: 'matter', matterId: 'leroy-merlin', label: 'Leroy c/ Merlin' },
      { kind: 'static', label: 'Sources Doctrine' },
      { kind: 'source', sourceId: 'kb-mises', label: 'Base de connaissances' },
    ],
    primitives: { C8: { variant: 'leroy-merlin' }, C6: { visible: true, content: ['kb-mises'] } },
  },
  {
    id: 'UC3', n: 3, status: 'P0', family: 'draft', scenario: 'S2', output: 'draft',
    title: 'Rédaction — from scratch',
    prompt: "Rédige un contrat de prestation d'architecte avec clauses spécifiques",
    chips: [
      { kind: 'source', sourceId: 'kb-mises', label: 'Base de connaissances' },
      { kind: 'mode',   modeId: 'edit', label: 'Mode Rédiger' },
      { kind: 'static', label: 'Sortie : Widget Draft' },
    ],
    primitives: {
      C6: { visible: true, content: ['kb-mises'] },
      C2: { visible: true, content: ['edit'] },
      A4: { visible: true, content: ['draft'] },
    },
  },
  {
    id: 'UC4', n: 4, status: 'P0', family: 'draft', scenario: 'S2', output: 'draft',
    title: 'Rédaction — sur un dossier',
    prompt: "Rédige un contrat de prestation d'architecte avec clauses spécifiques pour le dossier ACME Corp",
    chips: [
      { kind: 'matter', matterId: 'acme-corp', label: 'Matter ACME Corp' },
      { kind: 'source', sourceId: 'kb-mises', label: 'Base de connaissances' },
      { kind: 'mode',   modeId: 'edit', label: 'Mode Rédiger' },
    ],
    primitives: {
      C8: { variant: 'acme-corp' },
      C6: { visible: true, content: ['kb-mises'] },
      C2: { visible: true, content: ['edit'] },
      A4: { visible: true, content: ['draft'] },
    },
  },
  {
    id: 'UC5', n: 5, status: 'P0', family: 'draft', scenario: 'S2', output: 'draft',
    title: 'Rédaction — dossier + Clausier',
    prompt: "Rédige un contrat de prestation d'architecte avec clauses spécifiques pour le dossier ACME Corp",
    chips: [
      { kind: 'matter', matterId: 'acme-corp', label: 'Matter ACME Corp' },
      { kind: 'source', sourceId: 'kb-mises', label: 'Base de connaissances' },
      { kind: 'source', sourceId: 'clausier', label: 'Clausier' },
      { kind: 'mode',   modeId: 'edit', label: 'Mode Rédiger' },
    ],
    primitives: {
      C8: { variant: 'acme-corp' },
      C6: { visible: true, content: ['kb-mises', 'clausier'] },
      C2: { visible: true, content: ['edit'] },
      A4: { visible: true, content: ['draft'] },
    },
  },
  {
    id: 'UC6', n: 6, status: 'P0', family: 'doc-analysis', scenario: 'S3', output: 'text',
    title: 'Analyse de document — importé',
    prompt: "Trouve-moi des jurisprudences confirmant le rejet de la demande",
    chips: [
      { kind: 'file',   label: 'Document importé' },
      { kind: 'static', label: 'Sources Doctrine' },
      { kind: 'mode',   modeId: 'analyse', label: 'Mode Analyser' },
    ],
    primitives: { C5: { visible: true }, C2: { visible: true, content: ['analyse'] } },
  },
  {
    id: 'UC7', n: 7, status: 'P1', family: 'doc-analysis', scenario: 'S3', output: 'text',
    title: 'Analyse — fichier du dossier',
    prompt: "Trouve-moi des jurisprudences confirmant le rejet de la demande dans le cadre de l'affaire Leroy c/ Merlin",
    chips: [
      { kind: 'matter', matterId: 'leroy-merlin', label: 'Leroy c/ Merlin' },
      { kind: 'file',   label: 'Fichier du dossier' },
      { kind: 'static', label: 'Sources Doctrine' },
    ],
    primitives: { C8: { variant: 'leroy-merlin' }, C5: { visible: true }, C2: { visible: true, content: ['analyse'] } },
  },
  {
    id: 'UC8', n: 8, status: 'P1', family: 'doc-analysis', scenario: 'S3', output: 'text',
    title: 'Analyse — sur un dossier',
    prompt: "Trouve-moi des jurisprudences confirmant le rejet de la demande dans le cadre de l'affaire Leroy c/ Merlin",
    chips: [
      { kind: 'matter', matterId: 'leroy-merlin', label: 'Leroy c/ Merlin' },
      { kind: 'static', label: 'Sources Doctrine' },
    ],
    primitives: { C8: { variant: 'leroy-merlin' }, C2: { visible: true, content: ['analyse'] } },
  },
  {
    id: 'UC9', n: 9, status: 'P1', family: 'multi-doc', scenario: 'S4', output: 'extract',
    title: 'Analyse multi-documents — Extract',
    prompt: "Quelles sont les obligations communes dans les contrats de l'affaire Leroy contre Merlin ?",
    chips: [
      { kind: 'matter', matterId: 'leroy-merlin', label: 'Leroy c/ Merlin' },
      { kind: 'mode',   modeId: 'analyse', label: 'Mode Analyser' },
      { kind: 'tool',   toolId: 'extract', label: 'Extract' },
    ],
    primitives: {
      C8: { variant: 'leroy-merlin' },
      C2: { visible: true, content: ['analyse'] },
      A4: { visible: true, content: ['extract'] },
      A0: { visible: true },
    },
  },
];

export const USE_CASES_BY_FAMILY: { family: UseCaseFamily; cases: UseCase[] }[] =
  (['research', 'draft', 'doc-analysis', 'multi-doc'] as UseCaseFamily[]).map((family) => ({
    family,
    cases: USE_CASES.filter((u) => u.family === family),
  }));
