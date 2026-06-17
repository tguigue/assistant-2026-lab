/* ----------------------------------------------------------------------
   Folder (matter) → suggested tools. Selecting a dossier suggests tools
   relevant to its TYPE — a litigation folder surfaces Flow Litigate tools,
   a contract folder Flow Counsel, etc. Same shape as an upload Detection
   (title + meta + actions), so E3 can render it through one path.
   ---------------------------------------------------------------------- */
import type { Detection, DetAction } from './uploadSets';

const LITIGATE: DetAction[] = [
  { id: 'resume',   flow: 'litigate', label: 'Résumer les faits',     desc: 'Synthèse chronologique du dossier' },
  { id: 'rediger',  flow: 'litigate', label: 'Rédiger un document',   desc: 'Conclusions, assignation, courrier' },
  { id: 'contrer',  flow: 'litigate', label: 'Contrer les arguments', desc: 'Réfuter les écritures adverses' },
  { id: 'extract',  icon: 'table',     label: 'Extraire',             desc: 'Données structurées des pièces' },
  { id: 'traduire', icon: 'languages', label: 'Traduire',             desc: "Traduire une pièce du dossier" },
];

const COUNSEL: DetAction[] = [
  { id: 'risques',  flow: 'counsel', label: 'Analyser les risques', desc: 'Clauses sensibles du dossier' },
  { id: 'negocier', flow: 'counsel', label: 'Négocier',             desc: 'Points et marges de négociation' },
  { id: 'rediger',  flow: 'counsel', label: 'Rédiger un document',  desc: 'Contrat, avenant, courrier' },
  { id: 'extract',  icon: 'table',    label: 'Extraire',            desc: 'Données structurées' },
];

const GENERIC: DetAction[] = [
  { id: 'resume',   icon: 'scan', label: 'Résumer le dossier',  desc: 'Synthèse du dossier' },
  { id: 'rediger',  icon: 'pen',  label: 'Rédiger un document', desc: 'Note, courrier, mémo' },
  { id: 'extract',  icon: 'table', label: 'Extraire',           desc: 'Données structurées' },
];

const MATTERS: Record<string, Detection> = {
  'leroy-merlin': { title: 'Leroy c/ Merlin',        meta: 'Dossier contentieux · Flow Litigate', actions: LITIGATE },
  'moreau':       { title: 'Moreau c/ SAS Aurelia',  meta: 'Dossier contentieux · Flow Litigate', actions: LITIGATE },
  'acme-corp':    { title: 'Matter ACME Corp',       meta: 'Dossier contractuel · Flow Counsel',  actions: COUNSEL },
  'pernod':       { title: 'Pernod Ricard',          meta: 'Dossier contractuel · Flow Counsel',  actions: COUNSEL },
  'aurelia':      { title: 'Aurelia — Politique RH', meta: 'Dossier RH',                          actions: GENERIC },
};

export function matterSuggestion(id: string | undefined): Detection {
  return MATTERS[id ?? ''] ?? MATTERS['leroy-merlin'];
}
