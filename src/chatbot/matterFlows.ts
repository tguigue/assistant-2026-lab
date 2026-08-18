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
  { id: 'risques',       flow: 'counsel', label: 'Analyser les risques',       desc: 'Risques juridiques du dossier' },
  { id: 'terminologies', flow: 'counsel', label: 'Vérifier les terminologies', desc: 'Cohérence des définitions' },
  { id: 'incoherences',  flow: 'counsel', label: 'Repérer les incohérences',   desc: 'Écarts et contradictions' },
  { id: 'structure',     flow: 'counsel', label: 'Vérifier la structure',      desc: 'Complétude du contrat' },
  { id: 'extract',       icon: 'table',    label: 'Extraire',                  desc: 'Données structurées' },
];

const GENERIC: DetAction[] = [
  { id: 'resume',   icon: 'scan', label: 'Résumer le dossier',  desc: 'Synthèse du dossier' },
  { id: 'rediger',  icon: 'pen',  label: 'Rédiger un document', desc: 'Note, courrier, mémo' },
  { id: 'extract',  icon: 'table', label: 'Extraire',           desc: 'Données structurées' },
];

const MATTERS: Record<string, Detection> = {
  'leroy-merlin': { title: 'Leroy c/ Merlin',        meta: 'Dossier contentieux · Flow Litigate', actions: LITIGATE },
  'moreau':       { title: 'Moreau c/ SAS Aurelia',  meta: 'Dossier conseil · Flow Counsel',      actions: COUNSEL },
  'acme-corp':    { title: 'Matter ACME Corp',       meta: 'Dossier contractuel · Flow Counsel',  actions: COUNSEL },
  'pernod':       { title: 'Pernod Ricard',          meta: 'Dossier contractuel · Flow Counsel',  actions: COUNSEL },
  'aurelia':      { title: 'Aurelia — Politique RH', meta: 'Dossier RH',                          actions: GENERIC },
};

export function matterSuggestion(id: string | undefined): Detection {
  return MATTERS[id ?? ''] ?? MATTERS['leroy-merlin'];
}

/* ----------------------------------------------------------------------
   Firm playbooks — actions the CABINET authored, not ones we inferred.
   Same Detection shape so E3 renders them through the one card path, but
   E3 treats `firm` as a curated source, never a "smart" one: there is no
   analysis to perform on a list a human wrote. `meta` carries the author
   and use count, which is what makes a playbook trustworthy to a colleague.
   This is where an answer saved via A7 "Enregistrer comme action" lands.
   ---------------------------------------------------------------------- */
const PLAYBOOKS: DetAction[] = [
  { id: 'pb-synthese', icon: 'file-text', label: 'Note de synthèse — trame du cabinet', desc: 'Créée par Audrey · utilisée 34 fois' },
  { id: 'pb-mise-dem', icon: 'pen',       label: 'Mise en demeure — modèle validé',     desc: 'Créée par Mehdi · utilisée 21 fois' },
  { id: 'pb-bail',     icon: 'scan',      label: 'Revue de bail — checklist Baux',      desc: 'Cabinet · utilisée 12 fois' },
  { id: 'pb-clauses',  icon: 'table',     label: 'Comparer aux clauses types',          desc: 'Cabinet · utilisée 9 fois' },
];

export function firmPlaybooks(): Detection {
  return { title: 'Actions du cabinet', meta: '12 playbooks', actions: PLAYBOOKS };
}
