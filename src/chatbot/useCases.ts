/**
 * Use Cases — the 9 P0/P1 flows from the "Assistant — 2026 EoY Vision prototype" Notion brief.
 *
 * Each entry maps a use case to the composition the canvas should land in:
 *   - which scenario (prompt / answer body / citations)
 *   - which view mode (Composer vs Answer)
 *   - which Params override (matter / kb / clausier / tool)
 *   - which primitives should be visible, and with which variant + content
 *
 * Presets are applied *on top of* `initialPrimitives()` so any primitive not
 * explicitly overridden falls back to its `primitiveDefs.ts` default.
 */
import type { ScenarioId, Params } from './types';
import type { PrimitiveCode } from '../dashboard/primitiveDefs';
import type { ViewMode } from './store';

export type UseCaseId = 'UC1' | 'UC2' | 'UC3' | 'UC4' | 'UC5' | 'UC6' | 'UC7' | 'UC8' | 'UC9';

export type PrimitiveOverride = Partial<{
  visible: boolean;
  variant: string;
  content: string | string[];
}>;

export type UseCase = {
  id: UseCaseId;
  status: 'P0' | 'P1';
  /** Short category label, e.g. "Legal Research". */
  title: string;
  /** Context modifier, e.g. "+ matter + Clausier". */
  subtitle: string;
  /** The user prompt verbatim from the brief. */
  prompt: string;
  scenario: ScenarioId;
  viewMode: ViewMode;
  /** Subset of Params that the use case forces (others inherit SCENARIO_DEFAULTS). */
  params: Partial<Params>;
  /** Primitive overrides to apply on top of defaults. */
  primitives: Partial<Record<PrimitiveCode, PrimitiveOverride>>;
};

/* ----------------------------------------------------------------------
   The 9 use cases, in the brief's order.
   ---------------------------------------------------------------------- */

export const USE_CASES: UseCase[] = [
  {
    id: 'UC1',
    status: 'P0',
    title: 'Legal Research',
    subtitle: 'sans dossier',
    prompt: "Le fait d'organiser des points hebdomadaires peut-il être qualifié de harcèlement ?",
    scenario: 'S1',
    viewMode: 'full',
    params: { matter: 'none', kb: true,  clausier: false, tool: 'none' },
    primitives: {
      C6: { visible: true, variant: 'outlined', content: ['sharepoint', 'kb-mises'] },
      A1: { visible: true },
      A3: { visible: true, variant: 'pill' },
      A4: { visible: false },
      A8: { visible: true },
    },
  },
  {
    id: 'UC2',
    status: 'P1',
    title: 'Legal Research',
    subtitle: 'avec dossier scopé',
    prompt: "Le fait d'organiser des points hebdomadaires peut-il être qualifié de harcèlement dans le cadre de l'affaire Leroy c/ Merlin ?",
    scenario: 'S1',
    viewMode: 'full',
    params: { matter: 'leroy', kb: true,  clausier: false, tool: 'none' },
    primitives: {
      C6: { visible: true, variant: 'outlined', content: ['matter-moreau', 'sharepoint', 'kb-mises'] },
      A1: { visible: true },
      A3: { visible: true, variant: 'pill' },
      A4: { visible: false },
      A8: { visible: true },
    },
  },
  {
    id: 'UC3',
    status: 'P0',
    title: 'Draft from scratch',
    subtitle: 'sans dossier',
    prompt: "Rédige un contrat de prestation d'architecte avec clauses spécifiques",
    scenario: 'S2',
    viewMode: 'full',
    params: { matter: 'none', kb: true,  clausier: false, tool: 'draft' },
    primitives: {
      C6: { visible: true, variant: 'outlined', content: ['sharepoint', 'kb-mises'] },
      A1: { visible: true },
      A4: { visible: true, variant: 'card', content: ['draft'] },
      A8: { visible: true },
    },
  },
  {
    id: 'UC4',
    status: 'P0',
    title: 'Draft from scratch',
    subtitle: 'avec dossier',
    prompt: "Rédige un contrat de prestation d'architecte avec clauses spécifiques pour le dossier ACME Corp",
    scenario: 'S2',
    viewMode: 'full',
    params: { matter: 'leroy', kb: true,  clausier: false, tool: 'draft' },
    primitives: {
      C6: { visible: true, variant: 'outlined', content: ['matter-moreau', 'sharepoint', 'kb-mises'] },
      A1: { visible: true },
      A4: { visible: true, variant: 'card', content: ['draft'] },
      A8: { visible: true },
    },
  },
  {
    id: 'UC5',
    status: 'P0',
    title: 'Draft from scratch',
    subtitle: 'avec dossier + Clausier',
    prompt: "Rédige un contrat de prestation d'architecte avec clauses spécifiques pour le dossier ACME Corp",
    scenario: 'S2',
    viewMode: 'full',
    params: { matter: 'leroy', kb: true,  clausier: true, tool: 'draft' },
    primitives: {
      C6: { visible: true, variant: 'outlined', content: ['matter-moreau', 'clausier', 'kb-mises'] },
      A1: { visible: true },
      A4: { visible: true, variant: 'card', content: ['draft'] },
      A8: { visible: true },
    },
  },
  {
    id: 'UC6',
    status: 'P0',
    title: 'Document legal analysis',
    subtitle: 'fichier importé',
    prompt: "Trouve-moi des jurisprudences confirmant le rejet de la demande",
    scenario: 'S3',
    viewMode: 'full',
    params: { matter: 'none', kb: false, clausier: false, tool: 'none', attach: 'auto' },
    primitives: {
      C5: { visible: true, variant: 'cards' },
      C6: { visible: true, variant: 'outlined', content: ['file'] },
      A1: { visible: true },
      A3: { visible: true, variant: 'numbered' },
      A4: { visible: false },
      A8: { visible: true },
    },
  },
  {
    id: 'UC7',
    status: 'P1',
    title: 'Document legal analysis',
    subtitle: 'fichier depuis un dossier',
    prompt: "Trouve-moi des jurisprudences confirmant le rejet de la demande dans le cadre de l'affaire Leroy c/ Merlin",
    scenario: 'S3',
    viewMode: 'full',
    params: { matter: 'leroy', kb: false, clausier: false, tool: 'none', attach: 'auto' },
    primitives: {
      C5: { visible: true, variant: 'cards' },
      C6: { visible: true, variant: 'outlined', content: ['matter-moreau', 'file'] },
      A1: { visible: true },
      A3: { visible: true, variant: 'numbered' },
      A4: { visible: false },
      A8: { visible: true },
    },
  },
  {
    id: 'UC8',
    status: 'P1',
    title: 'Document legal analysis',
    subtitle: 'contexte dossier seul',
    prompt: "Trouve-moi des jurisprudences confirmant le rejet de la demande dans le cadre de l'affaire Leroy c/ Merlin",
    scenario: 'S3',
    viewMode: 'full',
    params: { matter: 'leroy', kb: false, clausier: false, tool: 'none', attach: 'off' },
    primitives: {
      C5: { visible: false },
      C6: { visible: true, variant: 'outlined', content: ['matter-moreau'] },
      A1: { visible: true },
      A3: { visible: true, variant: 'pill' },
      A4: { visible: false },
      A8: { visible: true },
    },
  },
  {
    id: 'UC9',
    status: 'P1',
    title: 'Multi-Document legal analysis',
    subtitle: 'Extract sur dossier',
    prompt: "Quelles sont les obligations communes dans les contrats de l'affaire Leroy contre Merlin ?",
    scenario: 'S4',
    viewMode: 'full',
    params: { matter: 'leroy', kb: true,  clausier: false, tool: 'extract' },
    primitives: {
      C6: { visible: true, variant: 'outlined', content: ['matter-moreau'] },
      A1: { visible: true },
      A4: { visible: true, variant: 'preview', content: ['extract'] },
      A8: { visible: true },
    },
  },
];

export const USE_CASES_BY_ID: Record<UseCaseId, UseCase> =
  USE_CASES.reduce((acc, uc) => ({ ...acc, [uc.id]: uc }), {} as Record<UseCaseId, UseCase>);
