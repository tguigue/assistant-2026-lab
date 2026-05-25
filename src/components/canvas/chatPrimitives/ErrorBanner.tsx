import type { Role } from '../../../lab/types';
import { Icon } from '../../ui';

export function ErrorBanner({ variant, role }: { variant: string; role: Role }) {
  if (role === 'absent') return null;

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-40 bg-zinc-900/30 flex items-center justify-center p-8">
        <div className="bg-white border border-zinc-200 rounded-lg shadow-xl p-6 max-w-md">
          <div className="flex items-start gap-3 mb-3">
            <Icon name="alert" className="size-5 text-amber-700 mt-0.5" />
            <div>
              <div className="t-base-semibold text-zinc-900">Une erreur s’est produite</div>
              <p className="t-small-regular text-zinc-600 mt-1">
                L’Assistant n’a pas pu traiter votre requête. Vérifiez votre connexion et réessayez.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button className="px-3 py-1.5 t-small-medium rounded-md border border-zinc-200">Annuler</button>
            <button className="px-3 py-1.5 t-small-medium rounded-md bg-zinc-900 text-white">Réessayer</button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline' || role === 'secondary') {
    return (
      <div className="inline-flex items-start gap-2 t-small-regular text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
        <Icon name="alert" className="size-3.5 mt-0.5 shrink-0" />
        <span>Erreur lors du traitement. Vérifiez les sources actives.</span>
      </div>
    );
  }

  // top-strip (default)
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2">
      <Icon name="alert" className="size-3.5 text-amber-700" />
      <span className="t-small-medium text-amber-800">Une erreur s’est produite.</span>
      <span className="t-small-regular text-amber-700">
        Veuillez réessayer ou contacter le support.
      </span>
      <button className="ml-auto t-small-medium text-amber-800 underline underline-offset-2 hover:no-underline">
        Détails
      </button>
    </div>
  );
}
