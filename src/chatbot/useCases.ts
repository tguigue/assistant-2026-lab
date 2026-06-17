import type { ScenarioId } from './types';
import type { PrimitiveCode } from '../dashboard/primitiveDefs';
import type { Surface } from './store';

/* ----------------------------------------------------------------------
   Use cases — the lab gallery, grouped by family: research, drafting
   (one Assistant→Éditeur experience), document analysis, multi-document.

   A use case = one scenario (prompt + answer content, reused from S1–S6)
   + a primitive preset (which composer/answer primitives are configured)
   + a set of config chips that mirror the Notion columns and stay flippable
   live in the demo. This is what the demo gallery loads via applyUseCase().
   ---------------------------------------------------------------------- */

/** A primitive override applied on top of the registry defaults. */
type PrimitiveOverride = { visible?: boolean; variant?: string; content?: string | string[]; axisVariants?: Record<string, string> };

/** A chip mirroring a Notion config column. Most are flippable live in the
    demo bar; `static` ones are baseline/display-only (e.g. Doctrine, Output). */
export type ConfigChip =
  | { kind: 'static'; label: string }
  | { kind: 'matter'; matterId: string; label: string }
  | { kind: 'source'; sourceId: string; label: string }
  | { kind: 'file';   label: string }
  | { kind: 'mode';   modeId: string; label: string }
  | { kind: 'tool';   toolId: string; label: string };

export type UseCaseFamily = 'research' | 'draft' | 'doc-analysis' | 'multi-doc' | 'upload';

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
  /** Optional surface this use case opens in (e.g. drafting/editing → the Éditeur). */
  surface?: Surface;
  /** Upload presets can land straight in the "Vos documents" manager modal. */
  openFiles?: boolean;
};

export const FAMILY_META: Record<UseCaseFamily, { label: string; blurb: string }> = {
  research:      { label: 'Legal Research',          blurb: 'Legal question → sourced answer' },
  draft:         { label: 'Drafting',                blurb: 'Draft or edit a document in the Éditeur' },
  'doc-analysis':{ label: 'Document legal analysis', blurb: 'Analyze a document → sourced answer' },
  'multi-doc':   { label: 'Multi-document analysis', blurb: 'Multiple documents → Extract widget' },
  upload:        { label: 'Upload & detect',         blurb: 'Upload documents → content-aware tools' },
};

export const OUTPUT_META: Record<UseCase['output'], string> = {
  text:    'Text answer + citations',
  draft:   'Draft widget + CTA',
  extract: 'Extract widget + CTA',
};

export const USE_CASES: UseCase[] = [
  {
    id: 'UC1', n: 1, status: 'P0', family: 'research', scenario: 'S1', output: 'text',
    title: 'Legal research',
    prompt: "Le fait d'organiser des points hebdomadaires peut-il être qualifié de harcèlement ?",
    chips: [
      { kind: 'static', label: 'Doctrine sources' },
      { kind: 'source', sourceId: 'kb-mises', label: 'Knowledge base' },
    ],
    primitives: { C6: { visible: true, content: ['kb-mises'] } },
  },
  {
    id: 'UC2', n: 2, status: 'P1', family: 'research', scenario: 'S1', output: 'text',
    title: 'Legal research — on a matter',
    prompt: "Le fait d'organiser des points hebdomadaires peut-il être qualifié de harcèlement dans le cadre de l'affaire Leroy c/ Merlin ?",
    chips: [
      { kind: 'matter', matterId: 'leroy-merlin', label: 'Leroy c/ Merlin' },
      { kind: 'static', label: 'Doctrine sources' },
      { kind: 'source', sourceId: 'kb-mises', label: 'Knowledge base' },
    ],
    primitives: { C8: { variant: 'leroy-merlin' }, C6: { visible: true, content: ['kb-mises'] } },
  },
  {
    // Figma §1 "Nouveau document from scratch" — opens DIRECTLY in the Éditeur
    // (doc panel mandatory): a new untitled doc + the Galerie d'actions. No matter.
    // The answer is just the "Stratégie de modification" plan + the "Création de
    // document" card (A4 'document'); no follow-ups (A8 hidden).
    id: 'UC3', n: 3, status: 'P0', family: 'draft', scenario: 'S7', output: 'draft',
    title: 'Drafting — from scratch',
    prompt: "Rédige une conclusion aux petits oignons",
    surface: 'doc',
    chips: [
      { kind: 'static', label: 'New document' },
    ],
    primitives: {
      A4: { visible: true, content: ['document'] },
      A8: { visible: false },
    },
  },
  {
    // Figma §2 / flow 2 — open an existing doc, ask a targeted correction →
    // review the tracked changes (A5 'full', 3 changements) one by one. The
    // version dropdown is plain Éditeur header chrome. No matter, no follow-ups.
    id: 'UC4', n: 4, status: 'P0', family: 'draft', scenario: 'S8', output: 'draft',
    title: 'Drafting — edit a document',
    prompt: "Corrige la date de l'audience, c'était mardi 5 septembre 2023 à 10h",
    surface: 'doc',
    chips: [
      { kind: 'static', label: 'Existing document' },
      { kind: 'static', label: 'Tracked changes' },
    ],
    primitives: {
      A5: { visible: true, variant: 'full' },
      A8: { visible: false },
    },
  },
  {
    // Figma §5 "Modification depuis Assistant + transition vers Éditeur" —
    // a SINGLE doc generated from the Assistant. The Document-creation card
    // (A4 'document', count 1) shows it with an "Éditer" CTA → the Éditeur.
    id: 'UC5', n: 5, status: 'P0', family: 'draft', scenario: 'S2', output: 'draft',
    title: 'Drafting — from the Assistant',
    prompt: "Rédige un contrat de prestation d'architecte avec clauses spécifiques",
    chips: [
      { kind: 'source', sourceId: 'kb-mises', label: 'Knowledge base' },
      { kind: 'static', label: 'CTA → Éditeur' },
    ],
    primitives: {
      C6: { visible: true, content: ['kb-mises'] },
      A4: { visible: true, variant: 'preview', content: ['document'] },
      A8: { visible: false },
    },
  },
  {
    // Figma §6 "Multi génération depuis Assistant + transition vers Éditeur" —
    // MULTIPLE linked docs from a reference. Same Document-creation card
    // (A4 'document', count N) → "Création de documents Word" list, each with
    // an "Éditer" CTA → the Éditeur (multi-doc tab strip).
    id: 'UC6', n: 6, status: 'P1', family: 'draft', scenario: 'S6', output: 'draft',
    title: 'Drafting — multiple documents',
    prompt: "Génère les actes liés à partir de ce dossier (bail, état des lieux, caution).",
    chips: [
      { kind: 'matter', matterId: 'leroy-merlin', label: 'Leroy c/ Merlin' },
      { kind: 'static', label: 'Reference document' },
      { kind: 'tool',   toolId: 'document', label: 'Documents' },
    ],
    primitives: {
      C8: { variant: 'leroy-merlin' },
      D2: { visible: true },
      A4: { visible: true, content: ['document'] },
      A8: { visible: false },
    },
  },

  /* ---- Document analysis ---- */
  {
    id: 'UC7', n: 7, status: 'P0', family: 'doc-analysis', scenario: 'S3', output: 'text',
    title: 'Document analysis — imported',
    prompt: "Trouve-moi des jurisprudences confirmant le rejet de la demande",
    chips: [
      { kind: 'file',   label: 'Imported document' },
      { kind: 'static', label: 'Doctrine sources' },
      { kind: 'mode',   modeId: 'analyse', label: 'Analyze mode' },
    ],
    primitives: { C5: { visible: true }, C2: { visible: true, content: ['analyse'] } },
  },
  {
    id: 'UC8', n: 8, status: 'P1', family: 'doc-analysis', scenario: 'S3', output: 'text',
    title: 'Analysis — matter file',
    prompt: "Trouve-moi des jurisprudences confirmant le rejet de la demande dans le cadre de l'affaire Leroy c/ Merlin",
    chips: [
      { kind: 'matter', matterId: 'leroy-merlin', label: 'Leroy c/ Merlin' },
      { kind: 'file',   label: 'Matter file' },
      { kind: 'static', label: 'Doctrine sources' },
    ],
    primitives: { C8: { variant: 'leroy-merlin' }, C5: { visible: true }, C2: { visible: true, content: ['analyse'] } },
  },
  {
    id: 'UC9', n: 9, status: 'P1', family: 'doc-analysis', scenario: 'S3', output: 'text',
    title: 'Analysis — on a matter',
    prompt: "Trouve-moi des jurisprudences confirmant le rejet de la demande dans le cadre de l'affaire Leroy c/ Merlin",
    chips: [
      { kind: 'matter', matterId: 'leroy-merlin', label: 'Leroy c/ Merlin' },
      { kind: 'static', label: 'Doctrine sources' },
    ],
    primitives: { C8: { variant: 'leroy-merlin' }, C2: { visible: true, content: ['analyse'] } },
  },
  {
    id: 'UC10', n: 10, status: 'P1', family: 'multi-doc', scenario: 'S4', output: 'extract',
    title: 'Analysis — multiple documents',
    prompt: "Quelles sont les obligations communes dans les contrats de l'affaire Leroy contre Merlin ?",
    chips: [
      { kind: 'matter', matterId: 'leroy-merlin', label: 'Leroy c/ Merlin' },
      { kind: 'mode',   modeId: 'analyse', label: 'Analyze mode' },
      { kind: 'tool',   toolId: 'extract', label: 'Extract' },
    ],
    primitives: {
      C8: { variant: 'leroy-merlin' },
      C2: { visible: true, content: ['analyse'] },
      A4: { visible: true, content: ['extract'] },
      A0: { visible: true },
    },
  },

  /* ---- Upload & detect — one "uploaded set" knob (C5) drives bar + manager + detection ---- */
  {
    // A single foreign-language contract → detection surfaces Traduire + Flow Counsel.
    id: 'UC11', n: 11, status: 'P1', family: 'upload', scenario: 'S1', output: 'text',
    title: 'Upload — single contract',
    prompt: '',
    chips: [{ kind: 'file', label: '1 document' }],
    primitives: {
      C5: { visible: true, variant: 'cards', axisVariants: { set: 'contract' } },
      E3: { visible: true, variant: 'rows', axisVariants: { source: 'detected' } },
    },
  },
  {
    // Two of the same type → detection surfaces Comparer.
    id: 'UC12', n: 12, status: 'P1', family: 'upload', scenario: 'S1', output: 'text',
    title: 'Upload — 2 NDAs (compare)',
    prompt: '',
    chips: [{ kind: 'file', label: '2 documents' }],
    primitives: {
      C5: { visible: true, variant: 'cards', axisVariants: { set: 'ndas' } },
      E3: { visible: true, variant: 'rows', axisVariants: { source: 'detected' } },
    },
  },
  {
    // Hundreds of files → lands straight in the "Vos documents" manager.
    id: 'UC13', n: 13, status: 'P1', family: 'upload', scenario: 'S1', output: 'text',
    title: 'Upload — bulk & manage',
    prompt: '',
    openFiles: true,
    chips: [{ kind: 'file', label: '128 documents' }],
    primitives: {
      C5: { visible: true, variant: 'cards', axisVariants: { set: 'bulk' } },
      E3: { visible: true, variant: 'rows', axisVariants: { source: 'detected' } },
    },
  },
];

export const USE_CASES_BY_FAMILY: { family: UseCaseFamily; cases: UseCase[] }[] =
  (['research', 'draft', 'doc-analysis', 'multi-doc', 'upload'] as UseCaseFamily[]).map((family) => ({
    family,
    cases: USE_CASES.filter((u) => u.family === family),
  }));
