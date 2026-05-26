import type { ScenarioFixture, ScenarioId } from './types';

/**
 * The 4 scenarios from the Notion EoY Vision doc — richer legal content.
 * Real French jurisprudence, structured answers with H4 sections, direct
 * caselaw quotes as blockquotes, « Voir également » cross-references.
 */

export const SCENARIOS: Record<ScenarioId, ScenarioFixture> = {
  /* ============================================================
     S1 — Recherche juridique
     ============================================================ */
  S1: {
    id: 'S1',
    code: 'S1',
    title: 'Recherche juridique',
    intent: { icon: 'search', label: 'Recherche juridique' },
    prompt: "Le fait d'organiser des points hebdomadaires peut-il être qualifié de harcèlement ?",
    preamble:
      "Je vais chercher dans <strong>Doctrine</strong> (jurisprudence sociale) et dans votre <strong>Knowledge Base</strong>, puis rapprocher les jurisprudences pertinentes de vos notes internes sur l'encadrement managérial.",
    answer: [
      {
        kind: 'p',
        html:
          "<strong>L'organisation de points hebdomadaires ne caractérise pas en elle-même un harcèlement moral.</strong> Elle peut toutefois y participer lorsqu'elle s'inscrit dans un ensemble plus large d'agissements répétés.",
      },
      { kind: 'h', text: '1 — Trois critères cumulatifs' },
      {
        kind: 'p',
        html:
          "La Cour de cassation rappelle constamment que la qualification de harcèlement moral suppose la réunion de trois critères [[c1]] : (i) la <em>répétition</em> des agissements, (ii) la <em>dégradation</em> des conditions de travail du salarié, et (iii) la <em>portée objective</em> sur sa santé physique ou mentale, sa dignité, son avenir professionnel ou son équilibre psychique.",
      },
      {
        kind: 'quote',
        html:
          "« Les agissements ne caractérisent un harcèlement moral que s'ils se répètent et ont pour objet ou pour effet une dégradation des conditions de travail susceptible de porter atteinte aux droits du salarié, à sa dignité ou à sa santé. »",
        attribution: 'Cass. soc., 10 nov. 2009, n° 07-45.321',
      },
      { kind: 'h', text: '2 — Quand le point hebdomadaire devient problématique' },
      {
        kind: 'p',
        html:
          "Les points hebdomadaires peuvent contribuer à un harcèlement lorsqu'ils s'inscrivent dans un <em>micro-management abusif</em> [[c2]], sont assortis de <em>reproches systématiques</em> en réunion [[c3]], ou <em>ciblent</em> un salarié sans justification objective [[c4]]. L'intensité, la fréquence et le contexte managérial pèsent dans l'appréciation des juges.",
      },
      { kind: 'h', text: '3 — Position interne du cabinet' },
      {
        kind: 'p',
        html:
          "Votre mémo interne « Encadrement managérial » [[k1]] distingue le <em>suivi régulier</em> (réunions courtes, ordre du jour partagé, traces écrites) du <em>contrôle excessif</em> (reproches non écrits, pression constante, absence de feedback constructif). La note RH [[k2]] opérationnalise cette distinction par une grille d'évaluation que je peux vous transmettre.",
      },
    ],
    citations: {
      c1: { label: 'Cass. soc. · 10 nov. 2009',  full: "Cass. soc., 10 nov. 2009, n° 07-45.321 — éléments constitutifs du harcèlement moral", kind: 'external', source: 'doctrine' },
      c2: { label: 'Cass. soc. · 15 mars 2023',  full: "Cass. soc., 15 mars 2023, n° 21-22.124 — micro-management et conditions de travail",   kind: 'external', source: 'doctrine' },
      c3: { label: 'CA Paris · 8 févr. 2024',    full: "CA Paris, 8 févr. 2024, n° 22/04891 — reproches systématiques en réunion d'équipe",      kind: 'external', source: 'doctrine' },
      c4: { label: 'Cass. soc. · 27 sept. 2023', full: "Cass. soc., 27 sept. 2023, n° 22-18.142 — ciblage individuel sans motif objectif",       kind: 'external', source: 'doctrine' },
      k1: { label: 'Mémo · Encadrement 2024',    full: "Mémo interne « Encadrement managérial — suivi vs. contrôle » (2024)",                   kind: 'internal', source: 'kb' },
      k2: { label: 'Note RH · 2024-03',          full: "Note RH 2024-03 — grille d'évaluation des pratiques managériales à risque",             kind: 'internal', source: 'kb' },
    },
    crossRefs: [
      { label: "Cass. soc., 1er juin 2022, n° 21-12.488",  full: "Définition large du harcèlement moral et obligation de prévention" },
      { label: "Cass. soc., 13 sept. 2017, n° 16-12.078",  full: "Critères objectifs du harcèlement managérial" },
      { label: "Article L1152-1 du Code du travail",        full: "Définition légale du harcèlement moral" },
    ],
    conclusion:
      "En résumé : la répétition seule de points hebdomadaires n'est pas constitutive d'un harcèlement. C'est le faisceau d'indices (intensité, contexte, ciblage) qui pèse devant le juge.",
    followups: [
      "Trouve-moi plus de jurisprudence",
      "Trouve-moi plus de jurisprudence récente",
      "Quels sont les critères de répétition retenus en pratique par la chambre sociale ces cinq dernières années ?",
      "Comment les juges qualifient-ils les pratiques managériales comme le micro-management ou les points hebdomadaires ?",
    ],
  },

  /* ============================================================
     S2 — Rédaction
     ============================================================ */
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
          "<strong>Brouillon prêt — 8 articles, 1 240 mots.</strong> Les clauses standards de la profession sont alignées sur votre Clausier ; la trame générale reprend deux modèles récents.",
      },
      { kind: 'h', text: 'Structure du contrat' },
      {
        kind: 'p',
        html:
          "<strong>Article 1 — Objet</strong> : définition du périmètre de la mission, projet en annexe.<br/>" +
          "<strong>Article 2 — Mission</strong> : phases ESQ, APS, APD, PRO, ACT, DET et AOR au sens de la loi MOP [[cl1]].<br/>" +
          "<strong>Article 4 — Honoraires</strong> : pourcentage du montant HT des travaux, fourchette 8 à 12 % [[cl2]].<br/>" +
          "<strong>Article 8 — Responsabilité décennale</strong> : garantie en application des art. 1792 et suivants du Code civil [[cl3]].",
      },
      { kind: 'h', text: 'Clauses sourcées' },
      {
        kind: 'p',
        html:
          "Les clauses mission, honoraires et RC décennale viennent directement de votre Clausier — version la plus récente validée par votre cabinet. La structure générale s'inspire de deux contrats similaires [[k1]] que vous avez utilisés en 2023.",
      },
      {
        kind: 'quote',
        html:
          "« L'architecte est tenu, en application des articles 1792 et suivants du Code civil, à une garantie décennale couvrant les dommages compromettant la solidité de l'ouvrage ou affectant un élément d'équipement indissociable. »",
        attribution: 'Clausier — clause type RC décennale',
      },
    ],
    citations: {
      cl1: { label: 'Clausier · Mission MOP',       full: 'Clausier — clause type « Mission MOP » (architecte)',           kind: 'internal', source: 'clausier' },
      cl2: { label: 'Clausier · Honoraires',        full: 'Clausier — clause type « Honoraires en pourcentage HT »',       kind: 'internal', source: 'clausier' },
      cl3: { label: 'Clausier · RC décennale',      full: 'Clausier — clause type « Responsabilité civile décennale »',    kind: 'internal', source: 'clausier' },
      k1:  { label: 'Modèle · Contrat archi. 2023', full: 'Knowledge Base — Contrat architecte de référence (déc. 2023)', kind: 'internal', source: 'kb' },
    },
    crossRefs: [
      { label: "Articles 1792 et s. du Code civil",      full: "Garantie décennale — fondement légal" },
      { label: "Loi MOP n° 85-704 du 12 juillet 1985",    full: "Maîtrise d'ouvrage publique — phases ESQ à AOR" },
      { label: "Norme NF P 03-001",                       full: "Marchés privés — clauses applicables aux travaux" },
    ],
    conclusion:
      "Le brouillon est éditable dans Draft. Ajoutez une clause de pénalités de retard si nécessaire (suggérée plus bas).",
    followups: [
      "Trouve-moi plus de clauses-types",
      "Trouve-moi plus de clauses récentes",
      "Quelles clauses doit-on ajouter pour un marché privé d'architecte selon la jurisprudence récente ?",
      "Comment formuler une clause de résiliation conforme aux pratiques du secteur de la construction ?",
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

  /* ============================================================
     S3 — Analyse de document
     ============================================================ */
  S3: {
    id: 'S3',
    code: 'S3',
    title: 'Analyse de document',
    intent: { icon: 'file-text', label: 'Analyse de document' },
    prompt: "Trouve-moi des jurisprudences confirmant le rejet de la demande",
    attached: { name: 'Conclusions_defendeur.pdf', meta: '12 p · 287 Ko' },
    preamble:
      "J'ai identifié <strong>3 moyens principaux</strong> dans les conclusions du défendeur (irrecevabilité, prescription, défaut de qualité à agir). Je cherche dans <strong>Doctrine</strong> les décisions qui confirment chacun.",
    answer: [
      {
        kind: 'p',
        html: "<strong>Les trois moyens articulés par le défendeur sont juridiquement solides.</strong> Voici les décisions qui les confirment, classées par moyen.",
      },
      { kind: 'h', text: "Moyen 1 — Irrecevabilité (défaut d'intérêt à agir)" },
      {
        kind: 'p',
        html:
          "La Cour de cassation rejette régulièrement les demandes formées par des tiers dépourvus d'intérêt direct et personnel [[c1]]. La décision récente de la 1ʳᵉ chambre civile [[c2]] conforte cette analyse en rappelant que l'irrecevabilité peut être soulevée d'office.",
      },
      {
        kind: 'quote',
        html:
          "« L'intérêt à agir doit être direct, personnel, né et actuel ; l'absence d'un seul de ces caractères suffit à fonder l'irrecevabilité de la demande, peu important que celle-ci soit ou non fondée au fond. »",
        attribution: 'Cass. 2ᵉ civ., 14 sept. 2023, n° 21-25.789',
      },
      { kind: 'h', text: 'Moyen 2 — Prescription quinquennale' },
      {
        kind: 'p',
        html:
          "Trois décisions récentes confirment le point de départ glissant retenu par le défendeur [[c3]] [[c4]]. La Cour de cassation reste constante sur cette interprétation, y compris depuis la réforme de la prescription de 2008.",
      },
      { kind: 'h', text: "Moyen 3 — Défaut de qualité à agir" },
      {
        kind: 'p',
        html: "Le moyen est conforté par la jurisprudence commerciale récente [[c5]].",
      },
    ],
    citations: {
      c1: { label: 'Cass. 2ᵉ civ. · 14 sept. 2023', full: "Cass. 2ᵉ civ., 14 sept. 2023, n° 21-25.789 — exigence d'un intérêt direct et personnel", kind: 'external', source: 'doctrine' },
      c2: { label: 'Cass. 1ʳᵉ civ. · 22 mars 2024', full: "Cass. 1ʳᵉ civ., 22 mars 2024, n° 22-14.501 — irrecevabilité d'office",                    kind: 'external', source: 'doctrine' },
      c3: { label: 'Cass. com. · 8 juin 2023',      full: "Cass. com., 8 juin 2023, n° 21-19.882 — point de départ glissant",                       kind: 'external', source: 'doctrine' },
      c4: { label: 'Cass. soc. · 17 janv. 2024',    full: "Cass. soc., 17 janv. 2024, n° 22-21.443 — confirmation du point de départ",              kind: 'external', source: 'doctrine' },
      c5: { label: 'Cass. com. · 19 avr. 2024',     full: "Cass. com., 19 avr. 2024, n° 23-10.092 — défaut de qualité à agir",                      kind: 'external', source: 'doctrine' },
    },
    crossRefs: [
      { label: "Cass. ch. mixte, 24 nov. 2023, n° 21-22.156", full: "Articulation des fins de non-recevoir" },
      { label: "Article 31 du Code de procédure civile",       full: "Conditions d'exercice de l'action en justice" },
      { label: "Article 122 du Code de procédure civile",      full: "Fins de non-recevoir" },
    ],
    conclusion:
      "Les trois moyens de défense sont solides et bénéficient d'une jurisprudence constante. Je recommande de structurer la plaidoirie autour du moyen 1 (le plus difficile à contredire).",
    followups: [
      "Trouve-moi plus de jurisprudence",
      "Trouve-moi plus de jurisprudence récente",
      "Quels arguments la Cour de cassation a-t-elle récemment retenus sur les fins de non-recevoir en matière de responsabilité notariale ?",
      "Comment structurer l'argumentation autour de l'article 122 du Code de procédure civile dans ce type d'affaire ?",
    ],
  },

  /* ============================================================
     S4 — Connaissance interne
     ============================================================ */
  S4: {
    id: 'S4',
    code: 'S4',
    title: 'Connaissance interne',
    intent: { icon: 'folder', label: 'Connaissance interne' },
    prompt: "Quelles sont les obligations communes dans les contrats de l'affaire Leroy contre Merlin ?",
    preamble:
      "Je vais comparer les <strong>5 contrats</strong> de l'affaire Leroy c/ Merlin et extraire les obligations qui apparaissent dans au moins 3 d'entre eux.",
    answer: [
      {
        kind: 'p',
        html: "<strong>Cinq obligations apparaissent dans au moins 3 des 5 contrats</strong> de l'affaire. Récapitulatif :",
      },
      { kind: 'h', text: 'Confidentialité' },
      {
        kind: 'p',
        html:
          "Présente dans les <em>5 contrats</em> [[m1]] [[m2]] [[m5]], avec une durée de <strong>5 à 10 ans</strong> selon le contrat. Le périmètre est large (informations techniques, commerciales, stratégiques).",
      },
      {
        kind: 'quote',
        html: "« Chacune des Parties s'engage à conserver strictement confidentielles toutes informations dont elle aurait connaissance dans le cadre du présent contrat, pour une durée de dix (10) années à compter de sa résiliation. »",
        attribution: 'Contrat 001 (distribution) — article 14',
      },
      { kind: 'h', text: 'Non-concurrence' },
      {
        kind: 'p',
        html:
          "Présente dans <em>4 contrats sur 5</em>, périmètre géographique <strong>France métropolitaine</strong> [[m3]]. Contrepartie financière prévue dans 3 des 4.",
      },
      { kind: 'h', text: 'Autres obligations récurrentes' },
      {
        kind: 'p',
        html:
          "<strong>Exclusivité</strong> — 3 contrats, formulations divergentes (pouvant créer des conflits d'interprétation).<br/>" +
          "<strong>Reporting trimestriel</strong> — 4 contrats, format Excel imposé dans 2.<br/>" +
          "<strong>Audit annuel</strong> — 3 contrats, avec préavis variable de 15 à 60 jours [[m4]].",
      },
    ],
    citations: {
      m1: { label: 'Contrat 001 · art. 14', full: "Contrat 001 (distribution) — article 14 (confidentialité, durée 10 ans)", kind: 'internal', source: 'matter' },
      m2: { label: 'Contrat 002 · art. 12', full: "Contrat 002 (franchise) — article 12 (confidentialité, durée 5 ans)",    kind: 'internal', source: 'matter' },
      m3: { label: 'Contrat 003 · art. 11', full: "Contrat 003 (partenariat) — article 11 (non-concurrence métropolitaine)", kind: 'internal', source: 'matter' },
      m4: { label: 'Contrat 004 · art. 18', full: "Contrat 004 (exclusif) — article 18 (audit annuel, préavis 30 j)",       kind: 'internal', source: 'matter' },
      m5: { label: 'Contrat 005 · art. 9',  full: "Contrat 005 (sous-traitance) — article 9 (confidentialité, durée 5 ans)", kind: 'internal', source: 'matter' },
    },
    crossRefs: [
      { label: "Tableau croisé · 5 contrats × 12 obligations", full: "Disponible dans Extract — vue complète" },
      { label: "Affaire Dupuis · note de synthèse 2024",        full: "Cas d'école sur les divergences de formulation" },
    ],
    conclusion:
      "Les divergences sur l'exclusivité et la durée de confidentialité créent un risque d'interprétation. Je recommande une note de synthèse pour aligner ces clauses lors de la prochaine renégociation.",
    followups: [
      "Trouve-moi plus de cas similaires",
      "Trouve-moi plus de cas récents",
      "Quels sont les risques d'interprétation des clauses d'exclusivité dans les contrats commerciaux pluri-parties ?",
      "Comment harmoniser les durées de confidentialité entre cinq contrats sans rouvrir une renégociation intégrale ?",
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
