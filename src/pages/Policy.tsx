import { PageShell } from '../components/sandbox/PageShell';
import { Icon } from '../components/ui';

export default function Policy() {
  return (
    <PageShell
      eyebrow="Coming soon"
      title="Policy"
      lede="Règles d’éligibilité, périmètres autorisés par rôle utilisateur, garde-fous (filtres anti-PII, blacklist d’intentions). Implementation deferred."
    >
      <div className="border border-dashed border-zinc-300 rounded-md p-8 flex items-start gap-4">
        <Icon name="alert" className="size-5 text-zinc-400 mt-0.5 shrink-0" />
        <div>
          <p className="t-base-medium text-zinc-900 mb-1">Configuration non disponible</p>
          <p className="t-base-regular text-zinc-600 max-w-prose">
            Cette section traitera de la politique d’éligibilité (qui peut interroger quelles sources, sous quelles conditions). Elle s’appuiera sur les <em>flags</em> exposés dans l’encart sandbox du sommet droit.
          </p>
          <pre className="code-block mt-4">{`{
  "roles": {
    "associate":    { "scopes": ["doctrine", "matter"] },
    "partner":      { "scopes": ["doctrine", "matter", "kb"] },
    "paralegal":    { "scopes": ["matter"] }
  },
  "guards": ["no-pii", "no-out-of-scope"]
}`}</pre>
        </div>
      </div>
    </PageShell>
  );
}
