import type { Role } from '../../../lab/types';
import { Icon } from '../../ui';

const SOURCES = [
  { id: 'doctrine', name: 'Doctrine',       count: '12M' },
  { id: 'kb',       name: 'Knowledge Base', count: '1 240' },
  { id: 'clausier', name: 'Clausier',       count: '86' },
  { id: 'matter',   name: 'Affaire en cours', count: '7' },
];

export function SourceRow({ variant, role }: { variant: string; role: Role }) {
  if (role === 'absent') return null;

  if (role === 'secondary') {
    return (
      <div className="inline-flex items-center gap-1.5 t-small-regular text-zinc-500">
        <Icon name="folder" className="size-3" />
        4 sources actives
        <button className="underline underline-offset-2 hover:text-zinc-900 ml-1">voir</button>
      </div>
    );
  }

  if (variant === 'collapsed') {
    return (
      <div className="inline-flex items-center gap-1.5 t-small-regular text-zinc-600">
        <Icon name="folder" className="size-3.5" />
        Doctrine, KB, Clausier, Matter
        <button className="underline underline-offset-2 hover:text-zinc-900 ml-1">modifier</button>
      </div>
    );
  }

  if (variant === 'add-mode') {
    return (
      <div className="flex flex-wrap gap-1.5">
        <Chip name="Doctrine" count="12M" active />
        <Chip name="Knowledge Base" count="1 240" active />
        <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-dashed border-zinc-300 t-small-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-700">
          <Icon name="plus" className="size-3" />
          Source
        </button>
      </div>
    );
  }

  if (variant === 'selective') {
    return (
      <div className="flex flex-wrap gap-1.5">
        <Chip name="Doctrine" count="12M" active />
        <Chip name="Knowledge Base" count="1 240" active={false} />
        <Chip name="Clausier" count="86" active />
        <Chip name="Matter" count="7" active={false} />
      </div>
    );
  }

  // default: all-active
  return (
    <div className="flex flex-wrap gap-1.5">
      {SOURCES.map((s) => (
        <Chip key={s.id} name={s.name} count={s.count} active />
      ))}
    </div>
  );
}

function Chip({ name, count, active }: { name: string; count: string; active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 t-small-medium text-white">
        <Icon name="check" className="size-3" />
        {name}
        <span className="text-zinc-400 ml-1 tabular-nums">{count}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-200 bg-white t-small-medium text-zinc-500">
      {name}
    </span>
  );
}
