import { PageShell, PageSection } from '../components/sandbox/PageShell';
import { FlowRunner } from '../components/sandbox/FlowRunner';
import { Link } from 'react-router-dom';

export default function GettingStarted() {
  return (
    <PageShell
      eyebrow="Sandbox"
      title="Getting Started"
      lede="Comprendre l’Assistant 2026 en quelques minutes : 6 primitives UI, 4 scénarios canoniques, des adaptateurs vers les sources internes et externes. Cette sandbox sert à explorer chaque cellule avant de l’implémenter."
    >
      <PageSection eyebrow="Step 1" title="Lancer un scénario" hint="Le Flow Runner ci-dessous simule un appel à l’Assistant. Sélectionnez une variante et cliquez sur Run.">
        <FlowRunner scenario="research" />
      </PageSection>

      <PageSection eyebrow="Step 2" title="Explorer les primitives" hint="Chaque réponse de l’Assistant est composée à partir de 6 briques. Voir comment chacune se comporte en isolation.">
        <div className="grid grid-cols-2 gap-3">
          <StartCard label="P1 — Intent chip" to="/primitives#intent" hint="Détection automatique d’intention." />
          <StartCard label="P2 — Source row" to="/primitives#sources" hint="Périmètre des sources." />
          <StartCard label="P3 — Provenance" to="/primitives#provenance" hint="Citations groupées par source." />
          <StartCard label="P4 — Artifact panel" to="/primitives#artifact" hint="Surface secondaire (Draft / Extract)." />
          <StartCard label="P5 — Matter scope" to="/primitives#matter" hint="Contexte de l’affaire active." />
          <StartCard label="P6 — Plan preamble" to="/primitives#preamble" hint="Annonce du raisonnement." />
        </div>
      </PageSection>

      <PageSection eyebrow="Step 3" title="Comparer les scénarios" hint="Les 4 scénarios du document Notion exécutés dans des variantes différentes.">
        <ul className="space-y-1.5 t-base-regular">
          <li><Link className="underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-900 text-zinc-900" to="/scenarios/research">S1 · Recherche juridique</Link></li>
          <li><Link className="underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-900 text-zinc-900" to="/scenarios/draft">S2 · Rédaction depuis zéro</Link></li>
          <li><Link className="underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-900 text-zinc-900" to="/scenarios/analyse">S3 · Analyse de document</Link></li>
          <li><Link className="underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-900 text-zinc-900" to="/scenarios/internal">S4 · Connaissance interne</Link></li>
        </ul>
      </PageSection>

      <PageSection eyebrow="Note" title="Hors périmètre">
        <p className="t-base-regular text-zinc-600 max-w-prose">
          Cette sandbox utilise des fixtures scriptées — aucun appel LLM réel, aucune télémétrie, aucun backend. Les sections <Link to="/policy" className="underline">Policy</Link> et <Link to="/tools" className="underline">Tools</Link> sont des placeholders.
        </p>
      </PageSection>
    </PageShell>
  );
}

function StartCard({ label, to, hint }: { label: string; to: string; hint: string }) {
  return (
    <Link
      to={to}
      className="block border border-zinc-200 rounded-md p-4 hover:border-zinc-400 transition-colors"
    >
      <div className="t-base-medium text-zinc-900 mb-1">{label}</div>
      <div className="t-small-regular text-zinc-500">{hint}</div>
    </Link>
  );
}
