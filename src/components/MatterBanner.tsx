import { MATTER_LEROY } from '../chatbot/scenarios';
import { Icon } from './ui';

export function MatterBanner() {
  const m = MATTER_LEROY;
  return (
    <div className="px-5 py-2.5 border-b border-zinc-100 bg-zinc-50 flex items-center gap-3 t-small-regular">
      <span className="inline-flex items-center justify-center size-6 rounded bg-zinc-900 text-white t-small-semibold leading-none">
        {m.name[0]}
      </span>
      <div className="flex items-baseline gap-2 min-w-0">
        <span className="text-zinc-500">Affaire :</span>
        <span className="t-small-semibold text-zinc-900 truncate">{m.name}</span>
        <span className="text-zinc-300">·</span>
        <span className="text-zinc-500 truncate">{m.subtitle}</span>
      </div>
      <button className="ml-auto inline-flex items-center gap-1 t-small-medium text-zinc-500 hover:text-zinc-900">
        <Icon name="folder" className="size-3" />
        {m.docs.length} documents
      </button>
    </div>
  );
}
