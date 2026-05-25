import type { Role } from '../../../lab/types';
import { Icon } from '../../ui';

export function FullScreenOops({ variant, role }: { variant: string; role: Role }) {
  if (role === 'absent') return null;

  return (
    <div className="h-full bg-white flex items-center justify-center p-12">
      <div className="max-w-lg text-center">
        {variant === 'illustrated' && (
          <div className="mb-6 flex justify-center">
            <div className="size-24 rounded-full border-2 border-dashed border-zinc-300 flex items-center justify-center">
              <Icon name="alert" className="size-10 text-zinc-400" />
            </div>
          </div>
        )}
        {variant !== 'illustrated' && (
          <Icon name="alert" className="size-10 text-zinc-700 mx-auto mb-4" />
        )}
        <h2 className="t-title-2 text-zinc-900 mb-3">Une erreur inattendue s’est produite</h2>
        <p className="t-large-regular text-zinc-600 mb-6">
          L’Assistant a rencontré un problème. Vous pouvez réessayer ou recharger la page.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button className="px-4 py-2 t-small-medium rounded-md border border-zinc-200 text-zinc-900 hover:border-zinc-400">
            Recharger
          </button>
          <button className="px-4 py-2 t-small-medium rounded-md bg-zinc-900 text-white hover:bg-zinc-800">
            Réessayer
          </button>
        </div>
        {variant === 'with-debug' && (
          <pre className="mt-8 t-mono text-[11.5px] text-left bg-zinc-50 border border-zinc-200 rounded-md p-3 text-zinc-700">
{`Error: ScopedSearchFailed
  at sources.doctrine.search (doctrine:312)
  at composer.run (composer:88)
  at chat.handleSubmit (chat:142)

trace_id: 4b8-64fb-2026-05-25`}
          </pre>
        )}
      </div>
    </div>
  );
}
