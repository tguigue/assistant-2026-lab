/* ----------------------------------------------------------------------
   The single "uploaded set" — one source of truth that drives the whole
   upload triad. C5 (composer bar), C14 (manager modal) and E3 (Suggested
   Actions, source=detected) all read the SAME entry here, so they can never
   contradict.

   It is held on the C5 primitive as one axis:
     • `set` — what was uploaded (drives files, count, detection)
   C14 and E3 read C5's set; nothing has its own copy. (Runtime upload state —
   progress / errors / limits — is deliberately out of scope: this lab aligns
   on form + content, not transient states the real app owns.)
   ---------------------------------------------------------------------- */

export type UploadSet = 'contract' | 'ndas' | 'pack' | 'bulk' | 'conclusions';

export type DocFile = { name: string; format: string; size: string };
export type DetAction = { id: string; icon?: string; label: string; desc?: string; badge?: string; flow?: 'counsel' | 'litigate' };
export type Detection = { title: string; meta: string; actions: DetAction[] };
export type UploadDef = { label: string; files: DocFile[]; count: number; detection: Detection };

export const UPLOAD_SETS: Record<UploadSet, UploadDef> = {
  contract: {
    label: 'Single contract',
    files: [{ name: 'Lizenzvertrag-SaaS-Slack.pdf', format: 'pdf', size: '412 Ko' }],
    count: 1,
    detection: {
      title: 'Contrat SaaS détecté',
      meta: 'Acme Corp ↔ Slack Inc. · 14 pages · 15/03/2024 · Allemand',
      actions: [
        { id: 'extract',  icon: 'table',     label: 'Extraire en tableau' },
        { id: 'traduire', icon: 'languages', label: 'Traduire', badge: 'Allemand détecté' },
        { id: 'counsel',  label: 'Flow Counsel', flow: 'counsel' },
      ],
    },
  },
  ndas: {
    label: '2 NDAs (same type)',
    files: [
      { name: 'NDA-Acme-Corp-v1.pdf', format: 'pdf', size: '128 Ko' },
      { name: 'NDA-Acme-Corp-v2.pdf', format: 'pdf', size: '131 Ko' },
    ],
    count: 2,
    detection: {
      title: '2 NDAs détectés',
      meta: '2 documents du même type',
      actions: [
        { id: 'compare', icon: 'columns', label: 'Comparer' },
        { id: 'extract', icon: 'table',   label: 'Extraire en tableau' },
        { id: 'counsel', label: 'Flow Counsel', flow: 'counsel' },
      ],
    },
  },
  pack: {
    label: 'Mixed pack (5)',
    files: [
      { name: 'NDA-Acquisition-Target.pdf',   format: 'pdf',  size: '96 Ko' },
      { name: 'Contrat-SaaS-Licence-Ent.docx', format: 'docx', size: '241 Ko' },
      { name: 'Cession-Droits-PI-Brevet.pdf',  format: 'pdf',  size: '180 Ko' },
      { name: 'Contrat-travail-DG-Cible.docx', format: 'docx', size: '74 Ko' },
      { name: 'Pacte-Associes-2023.pdf',       format: 'pdf',  size: '312 Ko' },
    ],
    count: 5,
    detection: {
      title: "5 documents · NDA, Contrat SaaS, Cession de Droits, Contrat de Travail, Pacte d'Associés",
      meta: 'Pack multi-documents',
      actions: [
        { id: 'extract',  icon: 'table', label: 'Extraire en tableau' },
        { id: 'litigate', label: 'Flow Litigate', flow: 'litigate' },
      ],
    },
  },
  bulk: {
    label: 'Volume (128)',
    files: [
      { name: 'Screenshot 2026-06-17 at 09.09.37.png', format: 'png', size: '686 Ko' },
      { name: 'Screenshot 2026-06-17 at 09.09.44.png', format: 'png', size: '460 Ko' },
      { name: 'Screenshot 2026-06-17 at 10.25.16.png', format: 'png', size: '192 Ko' },
      { name: 'Screenshot 2026-06-17 at 10.25.38.png', format: 'png', size: '108 Ko' },
      { name: 'Screenshot 2026-06-17 at 10.28.16.png', format: 'png', size: '46 Ko' },
      { name: 'Screenshot 2026-06-17 at 10.55.07.png', format: 'png', size: '571 Ko' },
      { name: 'Screenshot 2026-06-17 at 10.55.20.png', format: 'png', size: '388 Ko' },
      { name: 'Statuts_société_2022.pdf',               format: 'pdf', size: '410 Ko' },
    ],
    count: 128,
    detection: {
      title: '128 documents importés',
      meta: 'Formats variés · pack volumineux',
      actions: [
        { id: 'extract', icon: 'table', label: 'Extraire en tableau' },
        { id: 'sources', icon: 'scan',  label: 'Détecter les sources' },
      ],
    },
  },
  conclusions: {
    label: 'Conclusions',
    files: [{ name: 'Conclusions_defendeur.pdf', format: 'pdf', size: '287 Ko' }],
    count: 1,
    detection: {
      title: 'Conclusions détectées',
      meta: 'Écritures adverses · 42 pages',
      actions: [
        { id: 'contre',   icon: 'columns', label: 'Contre-arguments' },
        { id: 'litigate', label: 'Flow Litigate', flow: 'litigate' },
      ],
    },
  },
};

export function uploadSet(id: string | undefined): UploadDef {
  return UPLOAD_SETS[(id as UploadSet)] ?? UPLOAD_SETS.pack;
}
