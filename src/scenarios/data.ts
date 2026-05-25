import type { ScenarioId } from '../state/types';

export type Citation = {
  /** Label shown in the pill, e.g. "Cass. soc. · 10 nov. 2009" */
  label: string;
  /** Full reference revealed on hover */
  full: string;
  /** 'external' (Doctrine) → gray pill; 'internal' (KB/Clausier/Matter) → black pill */
  kind: 'external' | 'internal';
};

export type ScenarioBlock =
  | { kind: 'p'; html: string }
  | { kind: 'h'; text: string };

export type ScenarioData = {
  id: ScenarioId;
  intent: { icon: string; label: string }; // P1 — which auto-detected intent
  prompt: string; // user message
  attached?: { name: string; meta: string }; // optional attached doc (S3)
  preamble: string; // P6 — plan announcement
  answer: ScenarioBlock[]; // P3 body — text with [[citeKey]] placeholders resolved via citations
  citations: Record<string, Citation>;
  artifactTitle?: string; // P4 — artifact panel title (S2)
  artifactBody?: ScenarioBlock[];
  artifactFooter?: string;
};

export const SCENARIOS: Record<ScenarioId, ScenarioData> = {
  research: {
    id: 'research',
    intent: { icon: 'search', label: 'Recherche juridique' },
    prompt: 'Le fait d’organiser des points hebdomadaires peut-il être qualifié de harcèlement ?',
    preamble:
      'Je vais chercher dans <strong>Doctrine</strong> (jurisprudence sociale) et dans votre <strong>Knowledge Base</strong> (mémos RH), puis rapprocher les jurisprudences pertinentes des notes internes.',
    answer: [
      {
        kind: 'p',
        html:
          'L’organisation de points hebdomadaires ne caractérise pas en elle-même un harcèlement moral. La Cour de cassation rappelle constamment que la qualification suppose la réunion de trois critères [[c1]] : la <em>répétition</em> des agissements, la <em>dégradation</em> des conditions de travail, et la <em>portée objective</em> sur la santé ou la dignité du salarié.',
      },
      {
        kind: 'p',
        html:
          'Ces points peuvent <em>contribuer</em> à un harcèlement lorsqu’ils s’inscrivent dans un contexte de micro-management abusif [[c2]], sont assortis de reproches systématiques [[c3]], ou ciblent un salarié sans justification objective [[c4]].',
      },
      {
        kind: 'p',
        html:
          'Votre mémo interne sur l’encadrement managérial [[k1]] rejoint cette analyse en distinguant le « suivi régulier » du « contrôle excessif », et propose une grille d’évaluation que la note RH [[k2]] opérationnalise.',
      },
    ],
    citations: {
      c1: { label: 'Cass. soc. · 10 nov. 2009', full: 'Cass. soc., 10 nov. 2009, n° 07-45.321 — éléments constitutifs du harcèlement moral', kind: 'external' },
      c2: { label: 'Cass. soc. · 15 mars 2023', full: 'Cass. soc., 15 mars 2023, n° 21-22.124 — micro-management et conditions de travail', kind: 'external' },
      c3: { label: 'CA Paris · 8 févr. 2024', full: 'CA Paris, 8 févr. 2024, n° 22/04891 — reproches systématiques en réunion', kind: 'external' },
      c4: { label: 'Cass. soc. · 27 sept. 2023', full: 'Cass. soc., 27 sept. 2023, n° 22-18.142 — ciblage individuel', kind: 'external' },
      k1: { label: 'Mémo · Encadrement 2024', full: 'Mémo « Encadrement managérial — suivi vs. contrôle » (2024)', kind: 'internal' },
      k2: { label: 'Note RH · 2024-03', full: 'Note RH 2024-03 — grille d’évaluation des pratiques managériales à risque', kind: 'internal' },
    },
  },

  draft: {
    id: 'draft',
    intent: { icon: 'pen', label: 'Rédaction' },
    prompt: 'Rédige un contrat de prestation d’architecte avec clauses spécifiques',
    preamble:
      'Je vais composer le contrat à partir de <strong>3 clauses de votre Clausier</strong> (mission MOP, honoraires, responsabilité décennale) et de <strong>2 contrats similaires</strong> trouvés dans votre Knowledge Base.',
    answer: [
      {
        kind: 'p',
        html:
          'J’ai préparé un brouillon de 8 articles. Les clauses MOP, honoraires et responsabilité décennale sont alignées sur le Clausier ; la trame générale reprend deux contrats similaires de la Knowledge Base [[k1]] [[k2]].',
      },
      {
        kind: 'p',
        html:
          'Le brouillon est disponible dans Draft — vous pouvez l’affiner ici ou l’ouvrir en plein écran pour la finalisation.',
      },
    ],
    citations: {
      k1: { label: 'Clausier · Mission MOP', full: 'Clausier — clause type Mission MOP (architecte)', kind: 'internal' },
      k2: { label: 'Modèle · Contrat 2023-12', full: 'Knowledge Base — Contrat architecte de référence (déc. 2023)', kind: 'internal' },
    },
    artifactTitle: 'Contrat de prestation d’architecte — v1',
    artifactBody: [
      { kind: 'h', text: 'Article 1 — Objet' },
      { kind: 'p', html: 'Le présent contrat a pour objet de définir les conditions dans lesquelles l’architecte, mandataire de maîtrise d’œuvre, assurera la conception et le suivi des travaux relatifs au projet décrit en annexe.' },
      { kind: 'h', text: 'Article 2 — Mission' },
      { kind: 'p', html: 'La mission confiée à l’architecte comprend les phases ESQ, APS, APD, PRO, ACT, DET et AOR au sens de la loi MOP. Les délais d’exécution sont fixés à l’article 6.' },
      { kind: 'h', text: 'Article 4 — Honoraires' },
      { kind: 'p', html: 'Les honoraires sont calculés en pourcentage du montant HT des travaux, selon une fourchette de 8 à 12 % réparties par phase conformément aux usages.' },
    ],
    artifactFooter: 'Basé sur 3 clauses du Clausier + 2 modèles KB',
  },

  analyse: {
    id: 'analyse',
    intent: { icon: 'file-text', label: 'Analyse de document' },
    prompt: 'Trouve-moi des jurisprudences confirmant le rejet de la demande',
    attached: { name: 'Conclusions_defendeur.pdf', meta: '12 p · 287 Ko' },
    preamble:
      'J’ai identifié <strong>3 moyens principaux</strong> dans les conclusions du défendeur (irrecevabilité, prescription, défaut de qualité à agir). Je vais chercher dans <strong>Doctrine</strong> les décisions confirmant chacun de ces moyens.',
    answer: [
      { kind: 'h', text: '1. Sur l’irrecevabilité tirée du défaut d’intérêt à agir' },
      {
        kind: 'p',
        html:
          'La position du défendeur s’appuie sur une jurisprudence stable : la Cour de cassation rejette régulièrement les demandes formées par des tiers dépourvus d’intérêt direct et personnel [[c1]]. La décision récente de la 1ʳᵉ chambre civile [[c2]] conforte cette analyse.',
      },
      { kind: 'h', text: '2. Sur la prescription quinquennale' },
      {
        kind: 'p',
        html:
          'Trois décisions récentes confirment le point de départ retenu par le défendeur [[c3]] [[c4]].',
      },
    ],
    citations: {
      c1: { label: 'Cass. 2ᵉ civ. · 14 sept. 2023', full: 'Cass. 2ᵉ civ., 14 sept. 2023, n° 21-25.789 — exigence d’un intérêt direct et personnel', kind: 'external' },
      c2: { label: 'Cass. 1ʳᵉ civ. · 22 mars 2024', full: 'Cass. 1ʳᵉ civ., 22 mars 2024, n° 22-14.501 — irrecevabilité d’office', kind: 'external' },
      c3: { label: 'Cass. com. · 8 juin 2023', full: 'Cass. com., 8 juin 2023, n° 21-19.882 — point de départ glissant', kind: 'external' },
      c4: { label: 'Cass. soc. · 17 janv. 2024', full: 'Cass. soc., 17 janv. 2024, n° 22-21.443', kind: 'external' },
    },
  },

  internal: {
    id: 'internal',
    intent: { icon: 'folder', label: 'Connaissance interne' },
    prompt: 'Quelles sont les obligations communes dans les contrats de l’affaire Leroy contre Merlin ?',
    preamble:
      'Je vais comparer les <strong>5 contrats</strong> de l’affaire Leroy c/ Merlin et extraire les obligations qui apparaissent dans au moins 3 d’entre eux.',
    answer: [
      {
        kind: 'p',
        html: 'Cinq obligations apparaissent de façon récurrente dans les contrats de l’affaire :',
      },
      {
        kind: 'p',
        html:
          '<strong>1. Confidentialité</strong> — présente dans les 5 contrats [[m1]] [[m2]], durée 5 à 10 ans.<br/>' +
          '<strong>2. Non-concurrence</strong> — 4 contrats sur 5, périmètre France métropolitaine [[m3]].<br/>' +
          '<strong>3. Exclusivité</strong> — 3 contrats, formulations divergentes.<br/>' +
          '<strong>4. Reporting trimestriel</strong> — 4 contrats, format Excel imposé dans 2.<br/>' +
          '<strong>5. Audit annuel</strong> — 3 contrats, préavis de 15 à 60 jours.',
      },
    ],
    citations: {
      m1: { label: 'Contrat 001 · art. 14', full: 'Contrat 001 (distribution) — article 14 (confidentialité)', kind: 'internal' },
      m2: { label: 'Contrat 002 · art. 12', full: 'Contrat 002 (franchise) — article 12 (confidentialité)', kind: 'internal' },
      m3: { label: 'Contrat 003 · art. 11', full: 'Contrat 003 (partenariat) — article 11 (non-concurrence)', kind: 'internal' },
    },
  },
};
