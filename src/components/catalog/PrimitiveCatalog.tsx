import { PrimitiveCard } from './PrimitiveCard';
import { Icon } from '../ui';

/**
 * Primitives — Assistant 2026
 * Inventaire des briques UI qui composent les bundles.
 * Each primitive isolated, with real Doctrine content + variant tabs.
 */
export function PrimitiveCatalog() {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-white">
      <div className="max-w-3xl mx-auto px-8 py-10 space-y-6">
        <header className="mb-2">
          <h1 className="t-title-1 text-zinc-900">Primitives — Assistant 2026</h1>
          <p className="t-base-regular text-zinc-500 mt-2 max-w-prose leading-relaxed">
            Inventaire des briques UI qui composent les bundles. Chaque primitive est isolée
            ici pour permettre une discussion focalisée : on en valide une, puis on passe à
            la suivante.
          </p>
        </header>

        {/* ============ COMPOSER (C*) ============ */}
        <SectionLabel>Composer · zone de saisie</SectionLabel>

        <PrimitiveCard
          code="C7"
          name="Inferred Scope Hint"
          description="Une ligne qui rend visible ce que l'Assistant a déduit (intention + sources). Le lien Modifier ouvre l'ajustement manuel."
          variants={[
            { id: 'doctrine-memo', label: 'Doctrine + mémo' },
            { id: 'doctrine-only', label: 'Doctrine seul' },
            { id: 'kb-only',       label: 'KB interne' },
            { id: 'matter',        label: 'Dossier' },
          ]}
          render={(v) => <C7_InferredScopeHint variant={v} />}
        />

        <PrimitiveCard
          code="C2"
          name="Mode Selector"
          description="Sélection exclusive parmi les 4 modes : Rechercher / Rédiger / Analyser / Extraire."
          render={() => <C2_ModeSelector />}
        />

        <PrimitiveCard
          code="C3"
          name="Source Toggle"
          description="Bascule binaire pour une source. Reste activée d'une requête à l'autre."
          render={() => <C3_SourceToggle />}
        />

        <PrimitiveCard
          code="C6"
          name="Matter / File Chip"
          description="Chip dismissible affichée sur le composeur pour montrer le contexte attaché."
          variants={[
            { id: 'dossier',    label: 'Dossier' },
            { id: 'fichier',    label: 'Fichier' },
            { id: 'base',       label: 'Base' },
            { id: 'sharepoint', label: 'Sharepoint' },
          ]}
          render={(v) => <C6_MatterChip variant={v} />}
        />

        <PrimitiveCard
          code="C5"
          name="File Attach"
          description="Bouton + avec popover : Importer des fichiers (Vos dossiers, Vos bases, Votre ordinateur, Sharepoint, Google Drive)."
          render={() => <C5_FileAttach />}
        />

        <PrimitiveCard
          code="C4"
          name="Source Picker Tree"
          description="Bouton Sources qui ouvre un drawer latéral : arbre Décisions / Codes / Le Fiscal / Entreprise."
          render={() => <C4_SourcePickerTree />}
        />

        <PrimitiveCard
          code="C1"
          name="Input Field"
          description="Champ de saisie principal avec placeholder et support @mention."
          variants={[
            { id: 'empty',   label: 'Vide' },
            { id: 'typing',  label: 'En cours' },
            { id: 'mention', label: 'Avec @mention' },
          ]}
          render={(v) => <C1_InputField variant={v} />}
        />

        <PrimitiveCard
          code="C8"
          name="Send Button"
          description="Bouton d'envoi (↑). Inactif tant que l'input est vide."
          variants={[
            { id: 'idle',    label: 'Inactif' },
            { id: 'active',  label: 'Actif' },
            { id: 'sending', label: 'Envoi en cours' },
          ]}
          render={(v) => <C8_SendButton variant={v} />}
        />

        {/* ============ ASSISTANT RESPONSE (A*) ============ */}
        <SectionLabel className="mt-12">Response · réponse de l'Assistant</SectionLabel>

        <PrimitiveCard
          code="A1"
          name="Plan Preamble"
          description="Phrase qui annonce ce que l'Assistant va faire avant de répondre. Affichée en mode Auto."
          variants={[
            { id: 'box',      label: 'Encadré gris' },
            { id: 'inline',   label: 'Ligne italique' },
            { id: 'thought',  label: 'Trace de pensée' },
          ]}
          render={(v) => <A1_PlanPreamble variant={v} />}
        />

        <PrimitiveCard
          code="A2"
          name="Assistant Message"
          description="Corps de la réponse en serif legal (Tiempos). Avec ou sans citations inline."
          render={() => <A2_AssistantMessage />}
        />

        <PrimitiveCard
          code="A3"
          name="Inline Citation"
          description="Pilule de citation dans le corps. Grise pour sources externes (Doctrine), noire pour sources internes."
          variants={[
            { id: 'external', label: 'Externe (Doctrine)' },
            { id: 'internal', label: 'Interne (KB/Clausier)' },
            { id: 'mixed',    label: 'Mixte' },
          ]}
          render={(v) => <A3_InlineCitation variant={v} />}
        />

        <PrimitiveCard
          code="A5"
          name="Citations Panel"
          description="Panneau groupé sous la réponse listant toutes les sources citées."
          render={() => <A5_CitationsPanel />}
        />

        <PrimitiveCard
          code="A4"
          name="Tool CTA"
          description="Bouton CTA rendu dans la réponse pour orienter vers le bon outil (Draft / Extract / …)."
          render={() => <A4_ToolCTA />}
        />

        <PrimitiveCard
          code="A6"
          name="Attach To Matter"
          description="Pill sous la réponse : un clic et la réponse est rattachée au dossier choisi."
          variants={[
            { id: 'initial',  label: 'Initial' },
            { id: 'attached', label: 'Rattaché' },
          ]}
          render={(v) => <A6_AttachToMatter variant={v} />}
        />

        <PrimitiveCard
          code="A8"
          name="Suggested Follow-ups"
          description="Trois suggestions de relance affichées sous la réponse."
          render={() => <A8_Followups />}
        />

        <PrimitiveCard
          code="A7"
          name="Reasoning Trace"
          description="Étapes de recherche de l'agent, dépliables par étape. Inspirée du raisonnement live du chatbot en production."
          render={() => <A7_ReasoningTrace />}
        />

        {/* ============ HEADER (H*) ============ */}
        <SectionLabel className="mt-12">Header · contexte global</SectionLabel>

        <PrimitiveCard
          code="H1"
          name="Empty State Hero"
          description="État vide centré : titre, tagline et lien « Voir les conseils »."
          render={() => <H1_EmptyHero />}
        />

        <PrimitiveCard
          code="H2"
          name="Matter Banner"
          description="Bandeau visible quand une affaire est active. Indique nom + échéance."
          render={() => <H2_MatterBanner />}
        />
      </div>
    </div>
  );
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={'pt-2 pb-1 t-micro text-zinc-400 ' + (className ?? '')}>
      {children}
    </div>
  );
}

/* ======================================================================
   Primitive renderers — real Doctrine content, high fidelity
   ====================================================================== */

/* ---------- C7 — Inferred Scope Hint ---------- */
function C7_InferredScopeHint({ variant }: { variant: string }) {
  const intent = (variant === 'matter') ? 'Connaissance interne' : 'Recherche juridique';
  const sources = {
    'doctrine-memo': 'Doctrine, Vos mémos internes',
    'doctrine-only': 'Doctrine',
    'kb-only':       'Vos mémos internes',
    'matter':        "Affaire Leroy c/ Merlin · 7 docs",
  }[variant] ?? 'Doctrine';

  return (
    <div className="inline-flex items-center gap-2 t-small-regular text-zinc-700">
      <span className="t-small-medium text-zinc-900">{intent}</span>
      <span className="text-zinc-400">·</span>
      <span>{sources}</span>
      <button className="t-small-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-900 ml-1">
        Modifier
      </button>
    </div>
  );
}

/* ---------- C2 — Mode Selector ---------- */
function C2_ModeSelector() {
  const modes = [
    { id: 'search',  label: 'Rechercher', icon: 'search' },
    { id: 'draft',   label: 'Rédiger',    icon: 'pen' },
    { id: 'analyse', label: 'Analyser',   icon: 'file-text' },
    { id: 'extract', label: 'Extraire',   icon: 'list' },
  ];
  return (
    <div className="inline-flex items-center gap-1 px-1 py-1 rounded-md bg-zinc-50 border border-zinc-200">
      {modes.map((m, i) => (
        <button
          key={m.id}
          className={
            'inline-flex items-center gap-1.5 h-7 px-2.5 rounded t-small-medium ' +
            (i === 0
              ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200'
              : 'text-zinc-600 hover:text-zinc-900')
          }
        >
          <Icon name={m.icon} className="size-3.5" />
          {m.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- C3 — Source Toggle ---------- */
function C3_SourceToggle() {
  const sources = [
    { name: 'Doctrine',  icon: 'scales',    on: true  },
    { name: 'Mes mémos', icon: 'file-text', on: false },
    { name: 'Clausier',  icon: 'list',      on: false },
  ];
  return (
    <div className="w-full max-w-sm space-y-1">
      {sources.map((s) => (
        <div key={s.name} className="flex items-center justify-between px-4 py-2 rounded">
          <div className="flex items-center gap-2 t-base-regular text-zinc-700">
            <Icon name={s.icon} className="size-4 text-zinc-500" />
            {s.name}
          </div>
          <span
            className={
              'inline-flex w-9 h-5 rounded-full p-0.5 transition-colors ' +
              (s.on ? 'bg-blue-600 justify-end' : 'bg-zinc-200 justify-start')
            }
          >
            <span className="size-4 rounded-full bg-white" />
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------- C6 — Matter / File Chip ---------- */
function C6_MatterChip({ variant }: { variant: string }) {
  const data = {
    dossier:    { icon: 'folder',    label: 'Leroy c/ Merlin' },
    fichier:    { icon: 'file-text', label: 'Conclusions_def.pdf' },
    base:       { icon: 'list',      label: 'Base RH 2024' },
    sharepoint: { icon: 'folder',    label: 'Sharepoint · Contrats' },
  }[variant] ?? { icon: 'folder', label: 'Leroy c/ Merlin' };

  return (
    <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-zinc-200 bg-white t-small-regular text-zinc-800">
      <Icon name={data.icon} className="size-3.5 text-zinc-500" />
      {data.label}
      <button className="text-zinc-400 hover:text-zinc-700 ml-0.5">×</button>
    </span>
  );
}

/* ---------- C5 — File Attach (+ button) ---------- */
function C5_FileAttach() {
  return (
    <div className="w-full max-w-md flex flex-col items-center gap-3">
      <button className="inline-flex items-center justify-center size-10 rounded-md border border-zinc-200 text-zinc-700 hover:border-zinc-400 transition-colors">
        <Icon name="plus" className="size-5" />
      </button>
      <p className="t-small-regular text-zinc-400 italic">Dernier choix : Rien sélectionné</p>
    </div>
  );
}

/* ---------- C4 — Source Picker Tree ---------- */
function C4_SourcePickerTree() {
  return (
    <div className="w-full max-w-md flex flex-col items-center gap-4">
      <button className="inline-flex items-center gap-2 h-8 px-3 rounded-md border border-zinc-200 bg-white t-small-medium text-zinc-800 hover:border-zinc-400">
        <Icon name="scales" className="size-3.5 text-zinc-500" />
        Sources
      </button>
      <div className="t-small-regular text-zinc-500">
        Cochez : Décisions · Codes · Fiscal · Entreprise
      </div>
    </div>
  );
}

/* ---------- C1 — Input Field ---------- */
function C1_InputField({ variant }: { variant: string }) {
  const placeholder = "Poser une question à l'IA, tapez @ pour référencer un document ou faire une action";
  const value =
    variant === 'typing'  ? "Le fait d'organiser des points hebdomadaires…" :
    variant === 'mention' ? "Analyse les obligations de @Contrat_001"        :
    '';
  return (
    <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white px-4 py-3">
      {value ? (
        <p className="t-large-regular text-zinc-900">{value}<span className="ml-0.5 animate-pulse text-zinc-400">▍</span></p>
      ) : (
        <p className="t-large-regular text-zinc-400">{placeholder}</p>
      )}
    </div>
  );
}

/* ---------- C8 — Send Button ---------- */
function C8_SendButton({ variant }: { variant: string }) {
  const idle = variant === 'idle';
  const sending = variant === 'sending';
  return (
    <button
      className={
        'inline-flex items-center justify-center size-9 rounded-md border transition-colors ' +
        (idle
          ? 'border-zinc-200 text-zinc-300'
          : 'border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800')
      }
    >
      {sending ? <span className="size-3 rounded-full bg-white animate-pulse" /> : <Icon name="arrow-up" className="size-4" />}
    </button>
  );
}

/* ---------- A1 — Plan Preamble ---------- */
function A1_PlanPreamble({ variant }: { variant: string }) {
  const html = "Je vais chercher dans <strong>Doctrine</strong> et dans votre <strong>Knowledge Base</strong>, puis rapprocher les jurisprudences pertinentes de vos notes internes.";
  if (variant === 'inline') {
    return (
      <p className="t-small-regular text-zinc-500 italic inline-flex items-baseline gap-1.5">
        <Icon name="sparkles" className="size-3 text-zinc-400" />
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </p>
    );
  }
  if (variant === 'thought') {
    return (
      <div className="w-full max-w-xl space-y-1 t-small-regular text-zinc-600">
        <div className="flex items-center gap-1.5">
          <Icon name="sparkles" className="size-3 text-zinc-400" />
          <span className="t-small-medium text-zinc-700">Plan</span>
        </div>
        <div className="pl-4 border-l border-zinc-200 space-y-0.5 t-mono">
          <div>→ chercher dans Doctrine</div>
          <div>→ chercher dans la KB</div>
          <div>→ rapprocher et trancher</div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full max-w-xl flex items-start gap-3 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-md">
      <Icon name="sparkles" className="size-4 text-zinc-500 mt-0.5 shrink-0" />
      <p className="t-base-regular text-zinc-900" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

/* ---------- A2 — Assistant Message ---------- */
function A2_AssistantMessage() {
  return (
    <div className="w-full max-w-xl">
      <p className="t-legal-large text-zinc-900">
        L'organisation de points hebdomadaires ne caractérise pas en elle-même un harcèlement moral.
        La Cour de cassation rappelle que la qualification suppose la réunion de trois critères :
        la <em>répétition</em> des agissements, la <em>dégradation</em> des conditions de travail
        et la <em>portée objective</em> sur la santé du salarié.
      </p>
    </div>
  );
}

/* ---------- A3 — Inline Citation ---------- */
function A3_InlineCitation({ variant }: { variant: string }) {
  if (variant === 'internal') {
    return (
      <div className="w-full max-w-xl t-legal-large text-zinc-900">
        Votre mémo interne <a className="cite-pill cite-pill--internal">Mémo · Encadrement 2024</a> rejoint
        cette analyse, et la note RH <a className="cite-pill cite-pill--internal">Note RH · 2024-03</a> opérationnalise
        une grille d'évaluation.
      </div>
    );
  }
  if (variant === 'mixed') {
    return (
      <div className="w-full max-w-xl t-legal-large text-zinc-900">
        La jurisprudence retient trois critères <a className="cite-pill">Cass. soc. · 10 nov. 2009</a>.
        Votre note interne <a className="cite-pill cite-pill--internal">Mémo · Encadrement 2024</a> distingue
        le suivi régulier du contrôle excessif.
      </div>
    );
  }
  return (
    <div className="w-full max-w-xl t-legal-large text-zinc-900">
      La Cour de cassation rappelle ce principe <a className="cite-pill">Cass. soc. · 10 nov. 2009</a>,
      confirmé par une décision récente <a className="cite-pill">CA Paris · 8 févr. 2024</a>.
    </div>
  );
}

/* ---------- A5 — Citations Panel ---------- */
function A5_CitationsPanel() {
  return (
    <div className="w-full max-w-xl space-y-2">
      <details open className="rounded-md border border-zinc-200 bg-zinc-50">
        <summary className="flex items-center gap-3 px-4 py-2.5 cursor-pointer list-none">
          <span className="size-2 rounded-full bg-zinc-300 border border-zinc-400" />
          <span className="t-micro text-zinc-700">Sources Doctrine</span>
          <span className="ml-auto t-small-regular text-zinc-400">3</span>
        </summary>
        <ul className="px-4 pb-3 space-y-1 t-small-regular text-zinc-600">
          <li>· Cass. soc., 10 nov. 2009, n° 07-45.321</li>
          <li>· Cass. soc., 15 mars 2023, n° 21-22.124</li>
          <li>· CA Paris, 8 févr. 2024, n° 22/04891</li>
        </ul>
      </details>
      <details open className="rounded-md border border-zinc-200 bg-zinc-50">
        <summary className="flex items-center gap-3 px-4 py-2.5 cursor-pointer list-none">
          <span className="size-2 rounded-full bg-zinc-900" />
          <span className="t-micro text-zinc-700">Sources internes</span>
          <span className="ml-auto t-small-regular text-zinc-400">2</span>
        </summary>
        <ul className="px-4 pb-3 space-y-1 t-small-regular text-zinc-600">
          <li>· Mémo « Encadrement managérial » (2024)</li>
          <li>· Note RH 2024-03 — grille d'évaluation</li>
        </ul>
      </details>
    </div>
  );
}

/* ---------- A4 — Tool CTA ---------- */
function A4_ToolCTA() {
  return (
    <div className="flex flex-col gap-2 items-center">
      <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-zinc-900 text-white t-small-medium hover:bg-zinc-800">
        <Icon name="pen" className="size-3.5" />
        Ouvrir dans Draft <Icon name="arrow-right" className="size-3" />
      </button>
      <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-zinc-900 text-white t-small-medium hover:bg-zinc-800">
        <Icon name="list" className="size-3.5" />
        Voir le tableau Extract <Icon name="arrow-right" className="size-3" />
      </button>
    </div>
  );
}

/* ---------- A6 — Attach To Matter ---------- */
function A6_AttachToMatter({ variant }: { variant: string }) {
  if (variant === 'attached') {
    return (
      <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 t-small-medium">
        <Icon name="check" className="size-3.5" />
        Rattaché à Leroy c/ Merlin
      </span>
    );
  }
  return (
    <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-blue-200 text-blue-700 bg-blue-50 t-small-medium hover:border-blue-300">
      <Icon name="folder" className="size-3.5" />
      Attacher à un dossier
    </button>
  );
}

/* ---------- A8 — Suggested Follow-ups ---------- */
function A8_Followups() {
  const followups = [
    "Critères de répétition en pratique",
    "Sanctions encourues",
    "Modèles de défense",
  ];
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {followups.map((f) => (
        <button key={f} className="px-3 py-1.5 rounded-full border border-zinc-200 bg-white t-small-medium text-zinc-700 hover:border-zinc-400">
          {f}
        </button>
      ))}
    </div>
  );
}

/* ---------- A7 — Reasoning Trace ---------- */
function A7_ReasoningTrace() {
  return (
    <div className="w-full max-w-2xl space-y-3">
      <ReasoningStep
        title="Je vais également rechercher des précisions sur la notion de préjudice réparable et la compétence juridictionnelle."
        count={43}
        rows={[
          { icon: 'search', text: 'préjudice rupture relations commerciales délai préavis évaluation',  group: 'Décisions' },
          { icon: 'search', text: '"rupture abusive" "relations commerciales" dommages intérêts quantum', group: 'Décisions' },
          { icon: 'search', text: 'responsabilité rupture contrat relations commerciales durée préavis raisonnable', group: 'Lois et règlements' },
          { icon: 'scales', text: 'Article L146-4 du Code de commerce',                                   group: 'Lois et règlements' },
          { icon: 'scales', text: 'Article 1112 du Code civil',                                            group: 'Lois et règlements' },
        ]}
      />
      <ReasoningStep
        title="Je consulte maintenant les règles de compétence spécifiques applicables au contentieux ainsi que les causes d'exonération."
        count={40}
        rows={[
          { icon: 'search', text: '"rupture brutale" relations commerciales "tribunal de commerce"', group: 'Décisions' },
          { icon: 'search', text: 'article L442-1 code commerce rupture sans préavis',               group: 'Lois et règlements' },
          { icon: 'scales', text: 'Article L721-3 du Code de commerce',                              group: 'Lois et règlements' },
          { icon: 'scales', text: 'Article L721-5 du Code de commerce',                              group: 'Lois et règlements' },
        ]}
      />
    </div>
  );
}

function ReasoningStep({
  title, count, rows,
}: {
  title: string;
  count: number;
  rows: Array<{ icon: string; text: string; group: string }>;
}) {
  return (
    <details open className="rounded-md border border-zinc-200 bg-white">
      <summary className="flex items-baseline gap-3 px-4 py-2.5 cursor-pointer list-none">
        <span className="text-zinc-400">✱</span>
        <span className="flex-1 t-small-regular text-zinc-700">{title}</span>
        <span className="t-small-regular text-zinc-400 shrink-0">{count} résultats</span>
        <svg className="size-3 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <ul className="px-4 pb-2 border-t border-zinc-100 pt-2">
        {rows.map((r, i) => (
          <li key={i} className="flex items-center gap-2 py-1 t-small-regular text-zinc-700">
            <Icon name={r.icon} className="size-3 text-zinc-400 shrink-0" />
            <span className="flex-1 truncate">{r.text}</span>
            <span className="t-small-regular text-zinc-400 shrink-0">{r.group}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

/* ---------- H1 — Empty State Hero ---------- */
function H1_EmptyHero() {
  return (
    <div className="text-center">
      <h2 className="t-title-1 text-zinc-900">Assistant</h2>
      <p className="t-large-regular text-zinc-600 mt-2">Votre copilote juridique intelligent.</p>
      <a href="#" className="t-large-regular text-zinc-800 underline underline-offset-2 mt-1 inline-block">Voir les conseils</a>
    </div>
  );
}

/* ---------- H2 — Matter Banner ---------- */
function H2_MatterBanner() {
  return (
    <div className="w-full max-w-xl px-4 py-2.5 rounded-md border border-zinc-200 bg-zinc-50 flex items-center gap-3">
      <span className="inline-flex items-center justify-center size-6 rounded bg-zinc-900 text-white t-small-semibold">L</span>
      <div className="flex items-baseline gap-2 t-small-regular flex-1 min-w-0">
        <span className="text-zinc-500">Affaire :</span>
        <span className="t-small-semibold text-zinc-900">Leroy c/ Merlin</span>
        <span className="text-zinc-300">·</span>
        <span className="text-zinc-500">21 j avant échéance</span>
      </div>
    </div>
  );
}
