import type { ScenarioId } from './types';

export type Citation = {
  /** Pill label */ label: string;
  /** Full reference on hover */ full: string;
  /** external = light pill, internal = black pill */ kind: 'external' | 'internal';
};

/** A "[[citeKey]]" in the html string gets replaced with the cite-pill */
export type AnswerBlock = { kind: 'h'; text: string } | { kind: 'p'; html: string };

export type ScenarioFixture = {
  id: ScenarioId;
  code: string;            // S1, S2…
  title: string;
  intent: { icon: string; label: string };
  matter?: { name: string; subtitle?: string; docs?: string[] };
  /** User prompt */ prompt: string;
  /** Optional attached doc (S3, S4, S5) */
  attached?: { name: string; meta: string; kind: 'pdf' | 'docx' };
  /** What the plan-preamble says */ preamble: string;
  /** Assistant answer body, with [[citeKey]] placeholders */
  answer: AnswerBlock[];
  /** Citations referenced in the answer */
  citations: Record<string, Citation>;
  /** Suggested follow-ups (C5) */
  followups: string[];
  /** Optional artifact content (S2, drafting) */
  artifact?: {
    title: string;
    body: AnswerBlock[];
    footer: string;
  };
};

export const SCENARIOS: Record<ScenarioId, ScenarioFixture> = {
  research: {
    id: 'research',
    code: 'S1',
    title: 'Legal Research (No Documents)',
    intent: { icon: 'search', label: 'Recherche juridique' },
    prompt: 'Le fait d’organiser des points hebdomadaires peut-il être qualifié de harcèlement ?',
    preamble:
      'Je vais chercher dans <strong>Doctrine</strong> (jurisprudence sociale) et dans votre <strong>Knowledge Base</strong>, puis rapprocher les jurisprudences pertinentes des notes internes.',
    answer: [
      { kind: 'p', html: 'L’organisation de points hebdomadaires ne caractérise pas en elle-même un harcèlement moral. La Cour de cassation rappelle que la qualification suppose la réunion de trois critères [[c1]] : la <em>répétition</em> des agissements, la <em>dégradation</em> des conditions de travail, et la <em>portée objective</em> sur la santé du salarié.' },
      { kind: 'p', html: 'Ces points peuvent contribuer à un harcèlement dans un contexte de micro-management abusif [[c2]] ou de reproches systématiques [[c3]]. Votre mémo interne [[k1]] distingue le suivi régulier du contrôle excessif.' },
    ],
    citations: {
      c1: { label: 'Cass. soc. · 10 nov. 2009', full: 'Cass. soc., 10 nov. 2009, n° 07-45.321', kind: 'external' },
      c2: { label: 'Cass. soc. · 15 mars 2023', full: 'Cass. soc., 15 mars 2023, n° 21-22.124', kind: 'external' },
      c3: { label: 'CA Paris · 8 févr. 2024', full: 'CA Paris, 8 févr. 2024, n° 22/04891', kind: 'external' },
      k1: { label: 'Mémo · Encadrement 2024', full: 'Mémo interne « Encadrement managérial » (2024)', kind: 'internal' },
    },
    followups: ['Critères de répétition en pratique', 'Sanctions encourues', 'Modèles de défense'],
  },

  drafting: {
    id: 'drafting',
    code: 'S2',
    title: 'Drafting (With or without Doc)',
    intent: { icon: 'pen', label: 'Rédaction' },
    prompt: 'Rédige un contrat de prestation d’architecte avec clauses spécifiques (MOP, RC décennale).',
    preamble:
      'Je vais composer le contrat à partir de <strong>3 clauses de votre Clausier</strong> et de <strong>2 modèles</strong> trouvés dans votre Knowledge Base.',
    answer: [
      { kind: 'p', html: 'J’ai préparé un brouillon de 8 articles. Les clauses MOP, honoraires et responsabilité décennale sont alignées sur le Clausier [[k1]] [[k2]].' },
      { kind: 'p', html: 'Le brouillon est disponible dans le panneau Draft — vous pouvez l’affiner ici ou l’ouvrir en plein écran.' },
    ],
    citations: {
      k1: { label: 'Clausier · Mission MOP', full: 'Clausier — clause type Mission MOP', kind: 'internal' },
      k2: { label: 'Modèle · 2023-12', full: 'Knowledge Base — contrat architecte (déc. 2023)', kind: 'internal' },
    },
    followups: ['Ajouter pénalités de retard', 'Changer fourchette d’honoraires', 'Voir version anglaise'],
    artifact: {
      title: 'Contrat de prestation d’architecte — v1',
      body: [
        { kind: 'h', text: 'Article 1 — Objet' },
        { kind: 'p', html: 'Le présent contrat a pour objet de définir les conditions dans lesquelles l’architecte, mandataire de maîtrise d’œuvre, assurera la conception et le suivi des travaux relatifs au projet décrit en annexe.' },
        { kind: 'h', text: 'Article 2 — Mission' },
        { kind: 'p', html: 'La mission confiée comprend les phases ESQ, APS, APD, PRO, ACT, DET et AOR au sens de la loi MOP.' },
        { kind: 'h', text: 'Article 4 — Honoraires' },
        { kind: 'p', html: 'Honoraires calculés en pourcentage du montant HT des travaux, fourchette de 8 à 12 % réparties par phase.' },
      ],
      footer: 'Basé sur 3 clauses du Clausier + 2 modèles KB',
    },
  },

  'doc-legal': {
    id: 'doc-legal',
    code: 'S3',
    title: 'Document Legal Analysis (With Documents)',
    intent: { icon: 'scales', label: 'Analyse juridique' },
    prompt: 'Trouve-moi des jurisprudences confirmant le rejet de la demande.',
    attached: { name: 'Conclusions_defendeur.pdf', meta: '12 p · 287 Ko', kind: 'pdf' },
    preamble:
      'J’ai identifié <strong>3 moyens principaux</strong> dans les conclusions du défendeur. Je cherche dans Doctrine les décisions qui confirment chacun.',
    answer: [
      { kind: 'h', text: '1. Irrecevabilité — défaut d’intérêt à agir' },
      { kind: 'p', html: 'La position du défendeur s’appuie sur une jurisprudence stable [[c1]]. La décision récente de la 1ʳᵉ chambre [[c2]] conforte cette analyse.' },
      { kind: 'h', text: '2. Prescription quinquennale' },
      { kind: 'p', html: 'Trois décisions récentes confirment le point de départ retenu [[c3]] [[c4]].' },
    ],
    citations: {
      c1: { label: 'Cass. 2ᵉ civ. · 14 sept. 2023', full: 'Cass. 2ᵉ civ., 14 sept. 2023, n° 21-25.789', kind: 'external' },
      c2: { label: 'Cass. 1ʳᵉ civ. · 22 mars 2024', full: 'Cass. 1ʳᵉ civ., 22 mars 2024, n° 22-14.501', kind: 'external' },
      c3: { label: 'Cass. com. · 8 juin 2023', full: 'Cass. com., 8 juin 2023, n° 21-19.882', kind: 'external' },
      c4: { label: 'Cass. soc. · 17 janv. 2024', full: 'Cass. soc., 17 janv. 2024, n° 22-21.443', kind: 'external' },
    },
    followups: ['Voir les 7 décisions citées', 'Générer le plan de plaidoirie', 'Exporter en mémo'],
  },

  'doc-summary': {
    id: 'doc-summary',
    code: 'S4',
    title: 'Document Analysis (Summary)',
    intent: { icon: 'file-text', label: 'Analyse de document' },
    prompt: 'Fais-moi un résumé des points clés de ces conclusions.',
    attached: { name: 'Conclusions_defendeur.pdf', meta: '12 p · 287 Ko', kind: 'pdf' },
    preamble:
      'Je vais extraire les <strong>3 moyens articulés</strong>, les <strong>2 demandes principales</strong>, et la <strong>position chiffrée</strong> du défendeur.',
    answer: [
      { kind: 'p', html: 'Le défendeur articule trois moyens : irrecevabilité, prescription, défaut de qualité à agir. Il demande à titre principal le rejet pur et simple, à titre subsidiaire la réduction des dommages à 12 000 €.' },
      { kind: 'p', html: 'Les pièces visées sont les contrats 001, 003 et les emails échangés entre mars et septembre 2024 (pièces 12 à 27).' },
    ],
    citations: {},
    followups: ['Voir les pièces visées', 'Comparer aux conclusions de mars', 'Exporter le résumé'],
  },

  internal: {
    id: 'internal',
    code: 'S5',
    title: 'Internal Knowledge (With Documents)',
    intent: { icon: 'folder', label: 'Connaissance interne' },
    matter: {
      name: 'Leroy c/ Merlin',
      subtitle: 'Contentieux commercial · 21 j avant échéance',
      docs: ['Contrat_001_distribution', 'Contrat_002_franchise', 'Contrat_003_partenariat', 'Contrat_004_exclusif', 'Contrat_005_sous_traitance', 'Conclusions_defendeur', 'Echanges_emails'],
    },
    prompt: 'Quelles sont les obligations communes dans les contrats de cette affaire ?',
    preamble:
      'Je vais comparer les <strong>5 contrats</strong> de l’affaire et extraire les obligations qui apparaissent dans au moins 3 d’entre eux.',
    answer: [
      { kind: 'p', html: 'Cinq obligations apparaissent dans au moins 3 des 5 contrats :' },
      { kind: 'p', html: '<strong>Confidentialité</strong> — présente dans les 5 contrats [[m1]] [[m2]], durée 5 à 10 ans.<br/><strong>Non-concurrence</strong> — 4 contrats, France métropolitaine [[m3]].<br/><strong>Exclusivité</strong> — 3 contrats, formulations divergentes.<br/><strong>Reporting trimestriel</strong> — 4 contrats.<br/><strong>Audit annuel</strong> — 3 contrats.' },
    ],
    citations: {
      m1: { label: 'Contrat 001 · art. 14', full: 'Contrat 001 (distribution) — article 14', kind: 'internal' },
      m2: { label: 'Contrat 002 · art. 12', full: 'Contrat 002 (franchise) — article 12', kind: 'internal' },
      m3: { label: 'Contrat 003 · art. 11', full: 'Contrat 003 (partenariat) — article 11', kind: 'internal' },
    },
    followups: ['Tableau croisé', 'Comparer avec affaire Dupuis', 'Générer une note interne'],
  },
};
