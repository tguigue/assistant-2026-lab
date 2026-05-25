import { useState } from 'react';
import { PageShell } from '../components/sandbox/PageShell';
import { IntentChip } from '../components/primitives/IntentChip';
import { SourceRow } from '../components/primitives/SourceRow';
import { ProvenanceBody, ProvenanceGroups } from '../components/primitives/Provenance';
import { PlanPreamble } from '../components/primitives/PlanPreamble';
import { MatterScopeHeader } from '../components/primitives/MatterScope';
import { Segmented, Icon } from '../components/ui';
import { SCENARIOS } from '../scenarios/data';
import type { Role, SourceId } from '../state/types';

export default function Primitives() {
  return (
    <PageShell
      eyebrow="Référence"
      title="Primitives"
      lede="Les 6 briques UI qui composent toute interaction avec l’Assistant. Chacune répond à un sous-problème distinct et peut être Dominante, Secondaire ou Absente dans une composition donnée."
    >
      <nav className="mb-8 inline-flex flex-wrap gap-3 t-small-medium">
        {[
          ['#intent', 'P1 · Intent chip'],
          ['#sources', 'P2 · Source row'],
          ['#provenance', 'P3 · Provenance'],
          ['#artifact', 'P4 · Artifact panel'],
          ['#matter', 'P5 · Matter scope'],
          ['#preamble', 'P6 · Plan preamble'],
        ].map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="text-zinc-500 hover:text-zinc-900 underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-900"
          >
            {label}
          </a>
        ))}
      </nav>

      <PrimitiveSection id="intent" code="P1" name="Intent chip" hint="Affiche l’intention détectée par le système (research, draft, analyse, internal). État principal dans les architectures qui privilégient l’auto-détection.">
        <PrimitiveDemo>
          {(role) => <IntentChip intent={{ icon: 'search', label: 'Recherche juridique' }} role={role} />}
        </PrimitiveDemo>
      </PrimitiveSection>

      <PrimitiveSection id="sources" code="P2" name="Source row" hint="Chips toggleables représentant le périmètre actif. Dominante dans le bundle Cockpit, cachée dans l’Invisible.">
        <PrimitiveDemo>
          {(role) => (
            <SourceRow
              role={role}
              sources={{ doctrine: true, kb: true, clausier: true, matter: true } as Record<SourceId, boolean>}
            />
          )}
        </PrimitiveDemo>
      </PrimitiveSection>

      <PrimitiveSection id="provenance" code="P3" name="Provenance" hint="Citations groupées par source. Forme empruntée à la Badge du chatbot Doctrine en production : pilule claire pour les sources externes (Doctrine), pilule noire pour les internes (KB, Clausier, Matter).">
        <PrimitiveDemo>
          {(role) => {
            const s = SCENARIOS.research;
            return (
              <div className="space-y-4">
                <ProvenanceBody blocks={s.answer.slice(0, 1)} citations={s.citations} role={role} />
                <ProvenanceGroups citations={s.citations} role={role} />
              </div>
            );
          }}
        </PrimitiveDemo>
      </PrimitiveSection>

      <PrimitiveSection id="artifact" code="P4" name="Artifact panel" hint="Surface secondaire qui s’ouvre quand la sortie appartient à Draft, Extract ou Counsel. Dominante dans Cockpit, remplacée par un CTA dans Invisible.">
        <p className="t-base-regular text-zinc-600 max-w-prose">
          Démo interactive de l’artifact panel dans la page <a className="underline text-zinc-900" href="/scenarios/draft">Scénarios → Rédaction</a>. Il est trop large pour s’afficher en isolation ici.
        </p>
      </PrimitiveSection>

      <PrimitiveSection id="matter" code="P5" name="Matter scope" hint="Indique l’affaire active. Header en bandeau quand dominante (style Cockpit) ; pill compact par message quand secondaire (style Invisible).">
        <PrimitiveDemo>
          {(role) =>
            role === 'dominant' ? (
              <div className="overflow-hidden rounded-md border border-zinc-200">
                <MatterScopeHeader role={role} />
              </div>
            ) : (
              <MatterScopeHeader role={role} />
            )
          }
        </PrimitiveDemo>
      </PrimitiveSection>

      <PrimitiveSection id="preamble" code="P6" name="Plan preamble" hint="Phrase courte qui précède la réponse et explique ce que l’Assistant s’apprête à faire. Toujours visible dans Invisible, omise dans Cockpit.">
        <PrimitiveDemo>
          {(role) => (
            <PlanPreamble
              role={role}
              html={SCENARIOS.research.preamble}
            />
          )}
        </PrimitiveDemo>
      </PrimitiveSection>
    </PageShell>
  );
}

function PrimitiveSection({
  id,
  code,
  name,
  hint,
  children,
}: {
  id: string;
  code: string;
  name: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-t border-zinc-200 pt-8 mt-10 scroll-mt-16">
      <header className="mb-5 flex items-baseline gap-3">
        <span className="t-mono t-small-medium text-zinc-400 tabular-nums">{code}</span>
        <h2 className="t-title-3 text-zinc-900">{name}</h2>
        <span className="t-mono t-small-regular text-zinc-400 ml-auto">
          <Icon name="folder" className="size-3 mr-1 inline" />
          src/components/primitives/
        </span>
      </header>
      <p className="t-base-regular text-zinc-600 max-w-prose mb-5">{hint}</p>
      {children}
    </section>
  );
}

function PrimitiveDemo({ children }: { children: (role: Role) => React.ReactNode }) {
  const [role, setRole] = useState<Role>('dominant');
  return (
    <div className="border border-zinc-200 rounded-md overflow-hidden">
      <div className="px-4 py-2.5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
        <span className="t-micro text-zinc-500">État</span>
        <Segmented<Role>
          value={role}
          onChange={setRole}
          options={[
            { value: 'dominant', label: 'Dominant' },
            { value: 'secondary', label: 'Secondary' },
            { value: 'absent', label: 'Absent' },
          ]}
        />
      </div>
      <div className="p-6 bg-white min-h-[80px] flex items-start">
        {role === 'absent' ? (
          <span className="t-small-regular text-zinc-400 italic">Non rendu.</span>
        ) : (
          children(role)
        )}
      </div>
    </div>
  );
}
