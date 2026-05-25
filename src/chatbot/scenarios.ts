import type { ScenarioFixture, ScenarioId } from './types';

/**
 * The 4 scenarios from the Notion EoY Vision doc.
 * Prompts kept verbatim. Citations are real French jurisprudence (Cass. soc., CA Paris, etc.).
 */

export const SCENARIOS: Record<ScenarioId, ScenarioFixture> = {
  S1: {
    id: 'S1',
    code: 'S1',
    title: 'Recherche juridique',
    intent: { icon: 'search', label: 'Recherche juridique' },
    prompt: "Le fait d'organiser des points hebdomadaires peut-il être qualifié de harcèlement ?",
    preamble:
      "Je vais chercher dans <strong>Doctrine</strong> (jurisprudence sociale) et dans votre <strong>Knowledge Base</strong>, puis rapprocher les jurisprudences pertinentes de vos notes internes.",
    answer: [
      {
        kind: 'p',
        html:
          "L'organisation de points hebdomadaires ne caractérise pas en elle-même un harcèlement moral. La Cour de cassation rappelle constamment que la qualification suppose la réunion de trois critères [[c1]] : la <em>répétition</em> des agissements, la <em>dégradation</em> des conditions de travail et la <em>portée objective</em> sur la santé ou la dignité du salarié.",
      },
      {
        kind: 'p',
        html:
          "Ces points peuvent contribuer à un harcèlement lorsqu'ils s'inscrivent dans un contexte de micro-management abusif [[c2]] ou de reproches systématiques [[c3]]. Votre mémo interne [[k1]] distingue le « suivi régulier » (légitime) du « contrôle excessif » (à risque), et propose une grille d'évaluation que votre note RH [[k2]] opérationnalise.",
      },
    ],
    citations: {
      c1: { label: 'Cass. soc. · 10 nov. 2009',  full: "Cass. soc., 10 nov. 2009, n° 07-45.321 — éléments constitutifs du harcèlement moral", kind: 'external', source: 'doctrine' },
      c2: { label: 'Cass. soc. · 15 mars 2023',  full: "Cass. soc., 15 mars 2023, n° 21-22.124 — micro-management et conditions de travail",   kind: 'external', source: 'doctrine' },
      c3: { label: 'CA Paris · 8 févr. 2024',    full: "CA Paris, 8 févr. 2024, n° 22/04891 — reproches systématiques en réunion",              kind: 'external', source: 'doctrine' },
      k1: { label: 'Mémo · Encadrement 2024',    full: "Mémo interne « Encadrement managérial — suivi vs. contrôle » (2024)",                  kind: 'internal', source: 'kb' },
      k2: { label: 'Note RH · 2024-03',          full: "Note RH 2024-03 — grille d'évaluation des pratiques managériales à risque",            kind: 'internal', source: 'kb' },
    },
    followups: [
      "Critères de répétition en pratique",
      "Sanctions encourues par l'employeur",
      "Modèles de défense pour l'entreprise",
    ],
  },

  S2: {
    id: 'S2',
    code: 'S2',
    title: 'Rédaction',
    intent: { icon: 'pen', label: 'Rédaction' },
    prompt: "Rédige un contrat de prestation d'architecte avec clauses spécifiques",
    preamble:
      "Je vais composer le contrat à partir de <strong>3 clauses de votre Clausier</strong> (mission MOP, honoraires, responsabilité décennale) et de <strong>2 contrats similaires</strong> trouvés dans votre Knowledge Base.",
    answer: [
      {
        kind: 'p',
        html:
          "J'ai préparé un brouillon de 8 articles. Les clauses « mission MOP », « honoraires » et « responsabilité décennale » sont alignées sur le Clausier [[cl1]] [[cl2]] [[cl3]]. La trame générale reprend deux modèles de contrat de votre Knowledge Base [[k1]].",
      },
      {
        kind: 'p',
        html: "Le brouillon est disponible dans Draft — vous pouvez l'affiner ici ou l'ouvrir en plein écran pour la finalisation.",
      },
    ],
    citations: {
      cl1: { label: 'Clausier · Mission MOP',       full: 'Clausier — clause type « Mission MOP » (architecte)',           kind: 'internal', source: 'clausier' },
      cl2: { label: 'Clausier · Honoraires',        full: 'Clausier — clause type « Honoraires en pourcentage HT »',       kind: 'internal', source: 'clausier' },
      cl3: { label: 'Clausier · RC décennale',      full: 'Clausier — clause type « Responsabilité civile décennale »',    kind: 'internal', source: 'clausier' },
      k1:  { label: 'Modèle · Contrat archi. 2023', full: 'Knowledge Base — Contrat architecte de référence (déc. 2023)', kind: 'internal', source: 'kb' },
    },
    followups: [
      "Ajouter des pénalités de retard (0,5%/jour)",
      "Changer la fourchette d'honoraires",
      "Voir la version anglaise",
    ],
    artifact: {
      title: "Contrat de prestation d'architecte — v1",
      body: [
        { kind: 'h', text: 'Article 1 — Objet' },
        { kind: 'p', html: "Le présent contrat a pour objet de définir les conditions dans lesquelles l'architecte, mandataire de maîtrise d'œuvre, assurera la conception et le suivi des travaux relatifs au projet décrit en annexe." },
        { kind: 'h', text: 'Article 2 — Mission' },
        { kind: 'p', html: "La mission comprend les phases ESQ, APS, APD, PRO, ACT, DET et AOR au sens de la loi MOP. Les délais d'exécution sont fixés à l'article 6." },
        { kind: 'h', text: 'Article 4 — Honoraires' },
        { kind: 'p', html: "Honoraires calculés en pourcentage du montant HT des travaux, fourchette de 8 à 12 % réparties par phase conformément aux usages de la profession." },
        { kind: 'h', text: 'Article 8 — Responsabilité décennale' },
        { kind: 'p', html: "L'architecte est tenu, en application des articles 1792 et suivants du Code civil, à une garantie décennale couvrant les dommages compromettant la solidité de l'ouvrage." },
      ],
      footer: '3 clauses du Clausier · 2 modèles KB',
    },
  },

  S3: {
    id: 'S3',
    code: 'S3',
    title: 'Analyse de document',
    intent: { icon: 'file-text', label: 'Analyse de document' },
    prompt: "Trouve-moi des jurisprudences confirmant le rejet de la demande",
    attached: { name: 'Conclusions_defendeur.pdf', meta: '12 p · 287 Ko' },
    preamble:
      "J'ai identifié <strong>3 moyens principaux</strong> dans les conclusions du défendeur (irrecevabilité, prescription, défaut de qualité à agir). Je cherche dans <strong>Doctrine</strong> les décisions confirmant chacun.",
    answer: [
      { kind: 'h', text: "1. Irrecevabilité — défaut d'intérêt à agir" },
      {
        kind: 'p',
        html: "La position du défendeur s'appuie sur une jurisprudence stable [[c1]]. La décision récente de la 1ʳᵉ chambre civile [[c2]] conforte cette analyse en rappelant l'irrecevabilité d'office.",
      },
      { kind: 'h', text: '2. Prescription quinquennale' },
      {
        kind: 'p',
        html: "Trois décisions récentes confirment le point de départ retenu par le défendeur [[c3]] [[c4]]. La Cour de cassation reste constante sur la nature glissante du point de départ.",
      },
      { kind: 'h', text: "3. Défaut de qualité à agir" },
      {
        kind: 'p',
        html: "Le moyen est conforté par la jurisprudence commerciale récente [[c5]].",
      },
    ],
    citations: {
      c1: { label: 'Cass. 2ᵉ civ. · 14 sept. 2023', full: 'Cass. 2ᵉ civ., 14 sept. 2023, n° 21-25.789 — exigence d\'un intérêt direct et personnel', kind: 'external', source: 'doctrine' },
      c2: { label: 'Cass. 1ʳᵉ civ. · 22 mars 2024', full: 'Cass. 1ʳᵉ civ., 22 mars 2024, n° 22-14.501 — irrecevabilité d\'office',                    kind: 'external', source: 'doctrine' },
      c3: { label: 'Cass. com. · 8 juin 2023',      full: 'Cass. com., 8 juin 2023, n° 21-19.882 — point de départ glissant',                       kind: 'external', source: 'doctrine' },
      c4: { label: 'Cass. soc. · 17 janv. 2024',    full: 'Cass. soc., 17 janv. 2024, n° 22-21.443',                                                kind: 'external', source: 'doctrine' },
      c5: { label: 'Cass. com. · 19 avr. 2024',     full: 'Cass. com., 19 avr. 2024, n° 23-10.092 — défaut de qualité à agir',                      kind: 'external', source: 'doctrine' },
    },
    followups: [
      "Voir les 7 décisions citées",
      "Générer un plan de plaidoirie",
      "Exporter sous forme de mémo",
    ],
  },

  S4: {
    id: 'S4',
    code: 'S4',
    title: 'Connaissance interne',
    intent: { icon: 'folder', label: 'Connaissance interne' },
    prompt: "Quelles sont les obligations communes dans les contrats de l'affaire Leroy contre Merlin ?",
    preamble:
      "Je vais comparer les <strong>5 contrats</strong> de l'affaire Leroy c/ Merlin et extraire les obligations qui apparaissent dans au moins 3 d'entre eux.",
    answer: [
      { kind: 'p', html: "Cinq obligations apparaissent dans au moins 3 des 5 contrats de l'affaire :" },
      {
        kind: 'p',
        html:
          "<strong>1. Confidentialité</strong> — présente dans les 5 contrats [[m1]] [[m2]] [[m5]], durée de 5 à 10 ans selon le contrat.<br/>" +
          "<strong>2. Non-concurrence</strong> — 4 contrats sur 5, périmètre France métropolitaine [[m3]].<br/>" +
          "<strong>3. Exclusivité</strong> — 3 contrats, formulations divergentes.<br/>" +
          "<strong>4. Reporting trimestriel</strong> — 4 contrats, format Excel imposé dans 2.<br/>" +
          "<strong>5. Audit annuel</strong> — 3 contrats, avec préavis de 15 à 60 jours [[m4]].",
      },
    ],
    citations: {
      m1: { label: 'Contrat 001 · art. 14', full: 'Contrat 001 (distribution) — article 14 (confidentialité)', kind: 'internal', source: 'matter' },
      m2: { label: 'Contrat 002 · art. 12', full: 'Contrat 002 (franchise) — article 12 (confidentialité)',    kind: 'internal', source: 'matter' },
      m3: { label: 'Contrat 003 · art. 11', full: 'Contrat 003 (partenariat) — article 11 (non-concurrence)', kind: 'internal', source: 'matter' },
      m4: { label: 'Contrat 004 · art. 18', full: 'Contrat 004 (exclusif) — article 18 (audit)',              kind: 'internal', source: 'matter' },
      m5: { label: 'Contrat 005 · art. 9',  full: 'Contrat 005 (sous-traitance) — article 9 (confidentialité)', kind: 'internal', source: 'matter' },
    },
    followups: [
      "Voir le tableau croisé des 5 contrats",
      "Comparer avec l'affaire Dupuis",
      "Générer une note interne",
    ],
  },
};

export const MATTER_LEROY = {
  name: 'Leroy c/ Merlin',
  subtitle: 'Contentieux commercial · 21 j avant échéance',
  docs: [
    'Contrat_001_distribution',
    'Contrat_002_franchise',
    'Contrat_003_partenariat',
    'Contrat_004_exclusif',
    'Contrat_005_sous_traitance',
    'Conclusions_defendeur',
    'Echanges_emails',
  ],
};
